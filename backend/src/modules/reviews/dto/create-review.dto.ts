import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'clx0000000000000000prodid' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great quality!', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Fresh and delivered on time.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
