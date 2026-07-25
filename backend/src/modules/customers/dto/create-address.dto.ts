import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { AddressType } from '@prisma/client';

export class CreateAddressDto {
  @ApiProperty({ enum: AddressType, default: AddressType.HOME })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType = AddressType.HOME;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN', {}, { message: 'mobile must be a valid Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: '221B, Green Park Colony' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ example: 'Near City Hospital', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Opposite Bus Stand', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: 'Indore' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Madhya Pradesh' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string = 'India';

  @ApiProperty({ example: '452001' })
  @IsString()
  @Length(6, 6)
  pincode: string;

  @ApiProperty({ example: 22.7196, required: false })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ example: 75.8577, required: false })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
