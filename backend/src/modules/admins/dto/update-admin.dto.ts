import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminDto {
  @ApiProperty({ example: 'Priya', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ example: 'Verma', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'priya.verma@nimadkirana.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Regional Manager', required: false })
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
