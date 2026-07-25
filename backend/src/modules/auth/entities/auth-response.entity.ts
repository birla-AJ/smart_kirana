import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty()
  mobile: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  mobileVerified: boolean;

  @ApiProperty()
  emailVerified: boolean;
}

export class AuthTokensEntity {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: '15m' })
  accessTokenExpiresIn: string;

  @ApiProperty({ example: '30d' })
  refreshTokenExpiresIn: string;
}

export class AuthResponseEntity {
  @ApiProperty({ type: UserSummaryEntity })
  user: UserSummaryEntity;

  @ApiProperty({ type: AuthTokensEntity })
  tokens: AuthTokensEntity;
}

export class OtpSentResponseEntity {
  @ApiProperty()
  mobile: string;

  @ApiProperty({ example: 300 })
  expiresInSeconds: number;

  @ApiProperty({ example: 30 })
  resendAfterSeconds: number;
}
