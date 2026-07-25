import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { UpsertSettingDto } from '../dto/upsert-setting.dto';
import { SettingEntity } from '../entities/setting.entity';

/**
 * Keys that ship with sensible defaults so the storefront and checkout
 * always work even before an admin visits the Settings screen.
 */
const DEFAULTS: Record<string, unknown> = {
  'delivery.flatCharge': 30,
  'delivery.freeDeliveryThreshold': 199,
  'app.supportEmail': 'support@nimadkirana.com',
  'app.supportPhone': '18001234567',
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SettingEntity[]> {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async findOne(key: string): Promise<SettingEntity> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  async upsert(dto: UpsertSettingDto): Promise<SettingEntity> {
    return this.prisma.setting.upsert({
      where: { key: dto.key },
      update: { value: dto.value as any, description: dto.description },
      create: { key: dto.key, value: dto.value as any, description: dto.description },
    });
  }

  async remove(key: string): Promise<void> {
    await this.findOne(key);
    await this.prisma.setting.delete({ where: { key } });
  }

  /**
   * Reads a setting's value, falling back to the built-in DEFAULTS map
   * (and then to `fallback`) if it hasn't been configured in the
   * database yet. Used by other modules (e.g. Orders for delivery
   * pricing) so business rules stay admin-configurable.
   */
  async getValue<T>(key: string, fallback?: T): Promise<T> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (setting) return setting.value as T;
    if (key in DEFAULTS) return DEFAULTS[key] as T;
    return fallback as T;
  }
}
