import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { SettingsService } from '../services/settings.service';
import { UpsertSettingDto } from '../dto/upsert-setting.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Settings')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.SUPER_ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all app settings (SUPER_ADMIN only)' })
  async findAll() {
    const data = await this.settingsService.findAll();
    return { message: 'Settings fetched successfully', data };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single setting by key' })
  async findOne(@Param('key') key: string) {
    const data = await this.settingsService.findOne(key);
    return { message: 'Setting fetched successfully', data };
  }

  @Put(':key')
  @ApiOperation({ summary: 'Create or update a setting (upsert)' })
  async upsert(@Param('key') key: string, @Body() dto: UpsertSettingDto) {
    const data = await this.settingsService.upsert({ ...dto, key });
    return { message: 'Setting saved successfully', data };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a setting (reverts to its built-in default, if any)' })
  async remove(@Param('key') key: string) {
    await this.settingsService.remove(key);
    return { message: 'Setting deleted successfully', data: null };
  }
}
