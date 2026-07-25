import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryPermissionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by module name, e.g. "products"' })
  @IsOptional()
  @IsString()
  module?: string;
}
