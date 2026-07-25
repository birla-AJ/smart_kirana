import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  length: parseInt(process.env.OTP_LENGTH ?? '6', 10),
  expiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? '5', 10),
  resendSeconds: parseInt(process.env.OTP_RESEND_SECONDS ?? '30', 10),
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
}));
