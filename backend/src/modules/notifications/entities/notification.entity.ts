import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus, NotificationType } from '@prisma/client';

export class NotificationEntity {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() message: string;
  @ApiProperty({ enum: NotificationType }) type: NotificationType;
  @ApiProperty({ enum: NotificationStatus }) status: NotificationStatus;
  @ApiProperty() createdAt: Date;
}
