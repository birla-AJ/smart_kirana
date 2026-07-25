import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { SmsModule } from '../../sms/sms.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), SmsModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, OtpService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
