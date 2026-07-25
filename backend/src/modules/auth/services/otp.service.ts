import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { OtpPurpose, OtpStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { SmsService } from '../../../sms/sms.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  private generateCode(): string {
    const length = this.configService.get<number>('otp.length') ?? 6;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return randomInt(min, max).toString();
  }

  /**
   * Generates and sends an OTP, enforcing the resend cool-down window
   * so a mobile number can't be spammed with requests.
   */
  async sendOtp(
    mobile: string,
    purpose: OtpPurpose,
    userId?: string,
  ): Promise<{ expiresInSeconds: number; resendAfterSeconds: number }> {
    const resendSeconds = this.configService.get<number>('otp.resendSeconds') ?? 30;
    const expiryMinutes = this.configService.get<number>('otp.expiresInMinutes') ?? 5;

    const lastOtp = await this.prisma.otp.findFirst({
      where: { mobile, purpose },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLast < resendSeconds) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(resendSeconds - secondsSinceLast)}s before requesting another OTP`,
        );
      }
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.prisma.otp.create({
      data: {
        userId,
        mobile,
        code,
        purpose,
        expiresAt,
        maxAttempts: this.configService.get<number>('otp.maxAttempts') ?? 5,
      },
    });

    await this.smsService.sendOtp(mobile, code);

    return { expiresInSeconds: expiryMinutes * 60, resendAfterSeconds: resendSeconds };
  }

  /**
   * Verifies an OTP code, enforcing max-attempt and expiry rules.
   * Returns the userId associated with the OTP row, if any.
   */
  async verifyOtp(
    mobile: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<{ userId: string | null }> {
    const otp = await this.prisma.otp.findFirst({
      where: { mobile, purpose, status: OtpStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('No pending OTP found for this mobile number');
    }

    if (otp.expiresAt < new Date()) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { status: OtpStatus.EXPIRED },
      });
      throw new BadRequestException('OTP has expired. Please request a new one');
    }

    if (otp.attempts >= otp.maxAttempts) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { status: OtpStatus.FAILED },
      });
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    if (otp.code !== code) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP code');
    }

    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { status: OtpStatus.VERIFIED, verifiedAt: new Date() },
    });

    return { userId: otp.userId };
  }
}
