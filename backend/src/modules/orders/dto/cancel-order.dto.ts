import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({ example: 'Ordered by mistake', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
