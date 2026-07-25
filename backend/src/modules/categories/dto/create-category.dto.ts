import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fruits & Vegetables' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'https://cdn.nimadkirana.com/categories/fruits.png', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'Fresh fruits and vegetables', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}
