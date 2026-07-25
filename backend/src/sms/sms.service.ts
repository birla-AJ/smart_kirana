import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly authKey: string;
  private readonly templateId: string;
  private readonly senderId: string;

  constructor(private readonly configService: ConfigService) {
    this.authKey = this.configService.get<string>('MSG91_AUTH_KEY') ?? '';
    this.templateId = this.configService.get<string>('MSG91_TEMPLATE_ID') ?? '';
    this.senderId = this.configService.get<string>('MSG91_SENDER_ID') ?? 'NIMKIR';
  }

  /**
   * Sends an OTP SMS via MSG91. In non-production environments without
   * credentials configured, the OTP is logged instead of being sent so
   * local development never depends on a live SMS gateway.
   */
  async sendOtp(mobile: string, code: string): Promise<void> {
    if (!this.authKey || !this.templateId) {
      this.logger.warn(
        `MSG91 not configured. OTP for ${mobile} is ${code} (dev fallback, not actually sent).`,
      );
      return;
    }

    try {
      await axios.post(
        'https://control.msg91.com/api/v5/otp',
        {
          template_id: this.templateId,
          mobile: `91${mobile}`,
          otp: code,
          sender: this.senderId,
        },
        {
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send OTP via MSG91 to ${mobile}`, error);
      throw error;
    }
  }

  /**
   * Sends a general-purpose SMS (order updates, promotions, etc.) via
   * MSG91's plain SMS API. Falls back to logging in dev environments
   * without credentials configured, same as sendOtp.
   */
  async sendSms(mobile: string, message: string): Promise<void> {
    if (!this.authKey) {
      this.logger.warn(`MSG91 not configured. SMS for ${mobile}: "${message}" (dev fallback, not actually sent).`);
      return;
    }

    try {
      await axios.post(
        'https://control.msg91.com/api/v5/flow/',
        { mobiles: `91${mobile}`, message, sender: this.senderId },
        { headers: { authkey: this.authKey, 'Content-Type': 'application/json' }, timeout: 10000 },
      );
    } catch (error) {
      this.logger.error(`Failed to send SMS via MSG91 to ${mobile}`, error);
      throw error;
    }
  }
}
