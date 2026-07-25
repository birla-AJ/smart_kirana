import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export type RevenueChartRange = 'week' | 'month' | 'year';

export class RevenueChartQueryDto {
  @ApiPropertyOptional({ enum: ['week', 'month', 'year'], default: 'week' })
  @IsOptional()
  @IsIn(['week', 'month', 'year'])
  range?: RevenueChartRange = 'week';
}
