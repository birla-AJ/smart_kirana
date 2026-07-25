import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType, UserRoleType } from '@prisma/client';

export class SendNotificationDto {
  @ApiProperty({ type: [String], required: false, description: 'Specific user ids to notify' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiProperty({ enum: UserRoleType, required: false, description: 'Or broadcast to an entire role, e.g. CUSTOMER' })
  @IsOptional()
  @IsEnum(UserRoleType)
  role?: UserRoleType;

  @ApiProperty({ example: 'Order Delivered' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your order #NK1234 has been delivered. Enjoy!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.PUSH })
  @IsEnum(NotificationType)
  type: NotificationType;
}
