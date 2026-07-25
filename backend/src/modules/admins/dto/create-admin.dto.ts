import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Priya' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Verma', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'priya.verma@nimadkirana.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9876500000' })
  @IsMobilePhone('en-IN', {}, { message: 'mobile must be a valid Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number or special character',
  })
  password: string;

  @ApiProperty({ example: 'clx0000000000000000roleid', description: 'Must reference the ADMIN or SUPER_ADMIN role' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ example: 'Store Manager', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @ApiProperty({ example: 'NK-ADM-014', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  employeeCode?: string;
}
