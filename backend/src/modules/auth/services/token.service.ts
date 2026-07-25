import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../database/prisma/prisma.service';
import ms from 'ms';

export interface DeviceMeta {
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  signAccessToken(userId: string, mobile: string, roleId: string): string {
    return this.jwtService.sign(
      { sub: userId, mobile, roleId },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      },
    );
  }

  /**
   * Issues a new refresh token, persists it, and returns the signed JWT.
   * Each refresh token row tracks its own id so it can be individually
   * revoked/rotated without invalidating a user's other sessions.
   */
  async issueRefreshToken(userId: string, device: DeviceMeta = {}): Promise<string> {
    const tokenId = randomUUID();
    const expiresInStr = this.configService.get<string>('jwt.refreshExpiresIn') ?? '30d';
    const expiresAt = new Date(Date.now() + ms(expiresInStr));

    const signed = this.jwtService.sign(
      { sub: userId, tokenId },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: expiresInStr,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        token: signed,
        userId,
        deviceId: device.deviceId,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        expiresAt,
      },
    });

    return signed;
  }

  /**
   * Rotates a refresh token: verifies it is a live, non-revoked row,
   * marks it revoked, and issues a brand-new refresh + access token pair.
   */
  async rotateRefreshToken(
    presentedToken: string,
    device: DeviceMeta = {},
  ): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { token: presentedToken },
      include: { user: true },
    });

    if (!existing || existing.isRevoked || existing.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const newRefreshToken = await this.issueRefreshToken(existing.userId, device);

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { isRevoked: true, replacedByToken: newRefreshToken },
    });

    const accessToken = this.signAccessToken(
      existing.user.id,
      existing.user.mobile,
      existing.user.roleId,
    );

    return { accessToken, refreshToken: newRefreshToken, userId: existing.userId };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  getAccessExpiresIn(): string {
    return this.configService.get<string>('jwt.accessExpiresIn') ?? '15m';
  }

  getRefreshExpiresIn(): string {
    return this.configService.get<string>('jwt.refreshExpiresIn') ?? '30d';
  }
}
