import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Patch,
  Post,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OtpPurpose } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { LoginDto } from '../dto/login.dto';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { SendOtpDto } from '../dto/send-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtRefreshGuard } from '../../../common/guards/jwt-refresh.guard';
import { AuthResponseEntity, OtpSentResponseEntity } from '../entities/auth-response.entity';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { DeviceMeta } from '../services/token.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractDevice(ip: string, userAgent?: string, deviceId?: string): DeviceMeta {
    return { ipAddress: ip, userAgent, deviceId };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account and trigger mobile OTP' })
  @ApiResponse({ status: 201, type: OtpSentResponseEntity })
  async register(@Body() dto: RegisterCustomerDto) {
    const result = await this.authService.registerCustomer(dto);
    return { message: 'OTP sent to your mobile number', data: result };
  }

  @Public()
  @Post('register/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify registration OTP and activate account' })
  @ApiResponse({ status: 200, type: AuthResponseEntity })
  async verifyRegistrationOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.verifyRegistrationOtp(
      dto.mobile,
      dto.code,
      this.extractDevice(ip, userAgent, dto.deviceId),
    );
    return { message: 'Account verified successfully', data: result };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login with mobile + password' })
  @ApiResponse({ status: 200, type: AuthResponseEntity })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.loginCustomer(
      dto,
      this.extractDevice(ip, userAgent, dto.deviceId),
    );
    return { message: 'Login successful', data: result };
  }

  @Public()
  @Post('login/admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin / Super Admin login with email + password' })
  @ApiResponse({ status: 200, type: AuthResponseEntity })
  async loginAdmin(
    @Body() dto: AdminLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.loginAdmin(dto, this.extractDevice(ip, userAgent));
    return { message: 'Login successful', data: result };
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an OTP for login / verification / forgot-password' })
  @ApiResponse({ status: 200, type: OtpSentResponseEntity })
  async sendOtp(@Body() dto: SendOtpDto) {
    const result =
      dto.purpose === OtpPurpose.LOGIN
        ? await this.authService.requestLoginOtp(dto.mobile)
        : await this.authService.forgotPassword(dto.mobile);
    return { message: 'OTP sent successfully', data: { mobile: dto.mobile, ...result } };
  }

  @Public()
  @Post('otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Passwordless login using mobile OTP' })
  @ApiResponse({ status: 200, type: AuthResponseEntity })
  async loginWithOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.loginWithOtp(
      dto.mobile,
      dto.code,
      this.extractDevice(ip, userAgent, dto.deviceId),
    );
    return { message: 'Login successful', data: result };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate an access/refresh token pair' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.refreshTokens(
      dto.refreshToken,
      this.extractDevice(ip, userAgent),
    );
    return { message: 'Token refreshed successfully', data: result };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request an OTP to reset a forgotten password' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.identifier);
    return { message: 'OTP sent to reset your password', data: result };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a verified OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Patch('change-password')
  @ApiOperation({ summary: 'Change password while logged in' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Password changed successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all refresh tokens / sessions for the current user' })
  async logoutAll(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logoutAllDevices(user.id);
    return { message: 'Logged out from all devices successfully', data: null };
  }
}
