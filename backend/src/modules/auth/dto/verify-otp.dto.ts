import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMobilePhone, IsString, Length } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN', {}, { message: 'mobile must be a valid Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: '482913' })
  @IsString()
  @Length(4, 6)
  code: string;

  @ApiProperty({ enum: OtpPurpose, example: OtpPurpose.LOGIN })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  @ApiProperty({ example: 'device-uuid-1234', required: false })
  @IsString()
  deviceId?: string;
}
