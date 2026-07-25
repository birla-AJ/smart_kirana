import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertSettingDto {
  @ApiProperty({ example: 'delivery.flatCharge', description: 'Unique setting key' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 30,
    description: 'Any JSON-serializable value (number, string, boolean, object, array)',
  })
  value: unknown;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
