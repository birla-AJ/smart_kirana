import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty({ example: 'clx0000000000000000prodid' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
