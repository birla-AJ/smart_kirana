import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '9876543210',
    description: 'Mobile number, email address, or User ID (referral code) of the account',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: '482913' })
  @IsString()
  @Length(4, 6)
  otpCode: string;

  @ApiProperty({ example: 'NewStrongP@ss1' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number or special character',
  })
  newPassword: string;
}
