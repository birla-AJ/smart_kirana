import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Mobile number, email address, or User ID (referral code) — any of the three identifies the account',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'device-uuid-1234', required: false })
  @IsString()
  deviceId?: string;

  @ApiProperty({ example: 'fcm-token', required: false })
  @IsString()
  fcmToken?: string;
}
