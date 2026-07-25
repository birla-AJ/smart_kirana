import { ApiProperty } from '@nestjs/swagger';

export class SettingEntity {
  @ApiProperty() id: string;
  @ApiProperty() key: string;
  @ApiProperty() value: unknown;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() updatedAt: Date;
}
