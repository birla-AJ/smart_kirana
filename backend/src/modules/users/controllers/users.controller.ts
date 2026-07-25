import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { UsersService } from '../services/users.service';
import { QueryUserDto } from '../dto/query-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usersService.findOne(user.id);
    return { message: 'Profile fetched successfully', data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the currently authenticated user\'s profile' })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const data = await this.usersService.updateProfile(user.id, dto);
    return { message: 'Profile updated successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all users with pagination, search, role and status filters' })
  async findAll(@Query() query: QueryUserDto) {
    const data = await this.usersService.findAll(query);
    return { message: 'Users fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { message: 'User fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate, deactivate or block a user' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    const data = await this.usersService.updateStatus(id, dto);
    return { message: 'User status updated successfully', data };
  }

  @Roles(UserRoleType.SUPER_ADMIN)
  @Patch(':id/role')
  @ApiOperation({ summary: "Change a user's role (SUPER_ADMIN only)" })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    const data = await this.usersService.updateRole(id, dto);
    return { message: 'User role updated successfully', data };
  }

  @Roles(UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete a user (SUPER_ADMIN only)' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully', data: null };
  }
}
