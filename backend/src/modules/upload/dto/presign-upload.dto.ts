import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const ALLOWED_FOLDERS = ['products', 'categories', 'brands', 'banners', 'offers', 'avatars'] as const;

export class PresignUploadDto {
  @ApiProperty({ example: 'milk-1.png' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ enum: ALLOWED_FOLDERS, example: 'products' })
  @IsIn(ALLOWED_FOLDERS)
  folder: (typeof ALLOWED_FOLDERS)[number];
}
