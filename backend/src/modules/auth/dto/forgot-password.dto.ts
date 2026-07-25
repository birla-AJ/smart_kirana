import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Mobile number, email address, or User ID (referral code) of the account',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
