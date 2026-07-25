import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  LoginStatus,
  OtpPurpose,
  UserRoleType,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { TokenService, DeviceMeta } from './token.service';
import { OtpService } from './otp.service';
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { LoginDto } from '../dto/login.dto';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

interface AuthResult {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    mobile: string;
    userId: string | null;
    role: UserRoleType;
    mobileVerified: boolean;
    emailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
  ) {}

  private async hashPassword(plain: string): Promise<string> {
    const rounds = this.configService.get<number>('app.bcryptSaltRounds') ?? 10;
    return bcrypt.hash(plain, rounds);
  }

  private buildAuthResult(user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    mobile: string;
    roleId: string;
    mobileVerified: boolean;
    emailVerified: boolean;
    role: { name: UserRoleType };
    customer?: { referralCode: string } | null;
  }, accessToken: string, refreshToken: string): AuthResult {
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        userId: user.customer?.referralCode ?? null,
        role: user.role.name,
        mobileVerified: user.mobileVerified,
        emailVerified: user.emailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpiresIn: this.tokenService.getAccessExpiresIn(),
        refreshTokenExpiresIn: this.tokenService.getRefreshExpiresIn(),
      },
    };
  }

  private async recordLoginHistory(
    userId: string,
    status: LoginStatus,
    device: DeviceMeta,
    failureReason?: string,
  ): Promise<void> {
    await this.prisma.loginHistory.create({
      data: {
        userId,
        status,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        failureReason,
      },
    });
  }

  private async upsertSession(userId: string, device: DeviceMeta, fcmToken?: string): Promise<void> {
    if (!device.deviceId) return;
    await this.prisma.session.upsert({
      where: { userId_deviceId: { userId, deviceId: device.deviceId } },
      update: {
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        fcmToken,
        isActive: true,
        lastActiveAt: new Date(),
      },
      create: {
        userId,
        deviceId: device.deviceId,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        fcmToken,
      },
    });
  }

  /**
   * Step 1 of customer registration: creates the user in PENDING status
   * with an unverified mobile number, then sends an OTP. The account is
   * only activated once verifyRegistrationOtp succeeds.
   */
  async registerCustomer(dto: RegisterCustomerDto): Promise<{ mobile: string; expiresInSeconds: number; resendAfterSeconds: number }> {
    const existing = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
    if (existing) {
      throw new ConflictException('An account with this mobile number already exists');
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingEmail) {
        throw new ConflictException('An account with this email already exists');
      }
    }

    const customerRole = await this.prisma.role.findUnique({
      where: { name: UserRoleType.CUSTOMER },
    });
    if (!customerRole) {
      throw new BadRequestException('CUSTOMER role is not configured. Run the database seed first');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          mobile: dto.mobile,
          email: dto.email,
          password: hashedPassword,
          status: UserStatus.PENDING,
          roleId: customerRole.id,
        },
      });

      const referralCode = `NK${user.id.slice(-8).toUpperCase()}`;

      await tx.customer.create({
        data: {
          userId: user.id,
          referralCode,
        },
      });
    });

    const otpResult = await this.otpService.sendOtp(dto.mobile, OtpPurpose.REGISTER);
    return { mobile: dto.mobile, ...otpResult };
  }

  /**
   * Step 2 of registration: verifies the OTP, activates the user, and
   * returns an authenticated session (access + refresh tokens).
   */
  async verifyRegistrationOtp(
    mobile: string,
    code: string,
    device: DeviceMeta,
  ): Promise<AuthResult> {
    await this.otpService.verifyOtp(mobile, code, OtpPurpose.REGISTER);

    const user = await this.prisma.user.update({
      where: { mobile },
      data: { status: UserStatus.ACTIVE, mobileVerified: true, lastLoginAt: new Date() },
      include: { role: true, customer: true },
    });

    const accessToken = this.tokenService.signAccessToken(user.id, user.mobile, user.roleId);
    const refreshToken = await this.tokenService.issueRefreshToken(user.id, device);

    await this.recordLoginHistory(user.id, LoginStatus.SUCCESS, device);
    await this.upsertSession(user.id, device);

    return this.buildAuthResult(user, accessToken, refreshToken);
  }

  /**
   * Resolves a login identifier that may be a mobile number, an email
   * address, or a customer's auto-generated User ID (their referral
   * code, e.g. "NK1A2B3C4D") — supports the three login methods the
   * customer app offers: mobile+OTP, email+password, User ID+password.
   */
  private async findCustomerByIdentifier(identifier: string) {
    const byMobileOrEmail = await this.prisma.user.findFirst({
      where: {
        OR: [{ mobile: identifier }, { email: identifier }],
        role: { name: UserRoleType.CUSTOMER },
      },
      include: { role: true, customer: true },
    });
    if (byMobileOrEmail) return byMobileOrEmail;

    const customer = await this.prisma.customer.findUnique({
      where: { referralCode: identifier.toUpperCase() },
      include: { user: { include: { role: true } } },
    });
    if (!customer) return null;
    return { ...customer.user, customer: { referralCode: customer.referralCode } };
  }

  private maskMobile(mobile: string): string {
    return mobile.length >= 4 ? `${mobile.slice(0, 2)}${'*'.repeat(mobile.length - 4)}${mobile.slice(-2)}` : mobile;
  }

  /**
   * Login using mobile, email, or User ID + password. This is the
   * password-based counterpart to loginWithOtp — customers can use
   * whichever of the three methods they prefer.
   */
  async loginCustomer(dto: LoginDto, device: DeviceMeta): Promise<AuthResult> {
    const user = await this.findCustomerByIdentifier(dto.identifier);

    if (!user || user.role.name !== UserRoleType.CUSTOMER) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      await this.recordLoginHistory(user.id, LoginStatus.FAILED, device, 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account has been blocked. Please contact support');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Your account is inactive. Please contact support');
    }
    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('Please verify your mobile number to activate your account');
    }

    const accessToken = this.tokenService.signAccessToken(user.id, user.mobile, user.roleId);
    const refreshToken = await this.tokenService.issueRefreshToken(user.id, device);

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.recordLoginHistory(user.id, LoginStatus.SUCCESS, device);
    await this.upsertSession(user.id, device, dto.fcmToken);

    return this.buildAuthResult(user, accessToken, refreshToken);
  }

  /**
   * Finds an existing customer by mobile, or silently creates one.
   * Nimad Kirana's customer app is phone + OTP only — there is no
   * password step for shoppers (password auth is reserved for the
   * Admin / Super Admin back-office login).
   */
  private async findOrCreateCustomerByMobile(mobile: string) {
    const existing = await this.prisma.user.findUnique({
      where: { mobile },
      include: { role: true, customer: true },
    });
    if (existing) {
      if (existing.role.name !== UserRoleType.CUSTOMER) {
        // This mobile belongs to a staff (Admin/Super Admin) account —
        // OTP login must never authenticate a non-customer role.
        throw new UnauthorizedException(
          'This mobile number is registered to a staff account. Please use the Admin login instead.',
        );
      }
      return existing;
    }

    const customerRole = await this.prisma.role.findUnique({
      where: { name: UserRoleType.CUSTOMER },
    });
    if (!customerRole) {
      throw new BadRequestException('CUSTOMER role is not configured. Run the database seed first');
    }

    // Customers never log in with a password, so we store an unusable
    // random hash purely to satisfy the required column.
    const unusablePassword = await this.hashPassword(`otp-only:${mobile}:${Date.now()}`);

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: 'Guest',
          mobile,
          password: unusablePassword,
          status: UserStatus.ACTIVE,
          roleId: customerRole.id,
        },
        include: { role: true },
      });
      const referralCode = `NK${user.id.slice(-8).toUpperCase()}`;
      await tx.customer.create({ data: { userId: user.id, referralCode } });
      return { ...user, customer: { referralCode } };
    });

    return created;
  }

  /**
   * Sends a login OTP to any mobile number. New numbers are allowed —
   * the account is created on successful verification (see loginWithOtp).
   */
  async requestLoginOtp(mobile: string): Promise<{ expiresInSeconds: number; resendAfterSeconds: number }> {
    const user = await this.prisma.user.findUnique({ where: { mobile } });
    return this.otpService.sendOtp(mobile, OtpPurpose.LOGIN, user?.id);
  }

  async loginWithOtp(mobile: string, code: string, device: DeviceMeta): Promise<AuthResult> {
    await this.otpService.verifyOtp(mobile, code, OtpPurpose.LOGIN);

    const user = await this.findOrCreateCustomerByMobile(mobile);
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active. Please contact support');
    }

    const accessToken = this.tokenService.signAccessToken(user.id, user.mobile, user.roleId);
    const refreshToken = await this.tokenService.issueRefreshToken(user.id, device);

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), mobileVerified: true } });
    await this.recordLoginHistory(user.id, LoginStatus.SUCCESS, device);
    await this.upsertSession(user.id, device);

    return this.buildAuthResult(user, accessToken, refreshToken);
  }

  /**
   * Admin / Super Admin login using email + password only (no OTP).
   */
  async loginAdmin(dto: AdminLoginDto, device: DeviceMeta): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || (user.role.name !== UserRoleType.ADMIN && user.role.name !== UserRoleType.SUPER_ADMIN)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      await this.recordLoginHistory(user.id, LoginStatus.FAILED, device, 'Invalid password');
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active');
    }

    const accessToken = this.tokenService.signAccessToken(user.id, user.mobile, user.roleId);
    const refreshToken = await this.tokenService.issueRefreshToken(user.id, device);

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.recordLoginHistory(user.id, LoginStatus.SUCCESS, device);

    return this.buildAuthResult(user, accessToken, refreshToken);
  }

  async refreshTokens(refreshToken: string, device: DeviceMeta) {
    try {
      return await this.tokenService.rotateRefreshToken(refreshToken, device);
    } catch (error) {
      this.logger.warn(`Refresh token rotation failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
    await this.prisma.session.updateMany({ where: { userId }, data: { isActive: false } });
  }

  async forgotPassword(identifier: string) {
    const user = await this.findCustomerByIdentifier(identifier);
    if (!user) {
      throw new BadRequestException('No account found with this mobile, email or User ID');
    }
    const otpResult = await this.otpService.sendOtp(user.mobile, OtpPurpose.FORGOT_PASSWORD, user.id);
    return { ...otpResult, mobile: this.maskMobile(user.mobile) };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.findCustomerByIdentifier(dto.identifier);
    if (!user) {
      throw new BadRequestException('No account found with this mobile, email or User ID');
    }

    await this.otpService.verifyOtp(user.mobile, dto.otpCode, OtpPurpose.FORGOT_PASSWORD);

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.tokenService.revokeAllUserTokens(user.id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const matches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    await this.tokenService.revokeAllUserTokens(userId);
  }
}
