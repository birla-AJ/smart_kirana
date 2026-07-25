import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { NotificationsService } from '../services/notifications.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@ApiTags('Notification')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List the logged-in user's notifications" })
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    const data = await this.notificationsService.findAllForUser(user.id, query);
    return { message: 'Notifications fetched successfully', data };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  async markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const data = await this.notificationsService.markRead(user.id, id);
    return { message: 'Notification marked as read', data };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: AuthenticatedUser) {
    await this.notificationsService.markAllRead(user.id);
    return { message: 'All notifications marked as read', data: null };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post('send')
  @ApiOperation({ summary: 'Send a notification to specific users and/or an entire role (admin)' })
  async send(@Body() dto: SendNotificationDto) {
    const data = await this.notificationsService.sendToMany(dto);
    return { message: 'Notification dispatched successfully', data };
  }
}
