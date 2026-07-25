import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMobilePhone } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN', {}, { message: 'mobile must be a valid Indian mobile number' })
  mobile: string;

  @ApiProperty({ enum: OtpPurpose, example: OtpPurpose.LOGIN })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
