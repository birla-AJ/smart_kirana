import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';

export class CouponEntity {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ enum: CouponType }) type: CouponType;
  @ApiProperty() value: number;
  @ApiProperty() minimumOrderAmount: number;
  @ApiProperty({ nullable: true }) maximumDiscount: number | null;
  @ApiProperty({ nullable: true }) usageLimit: number | null;
  @ApiProperty() usedCount: number;
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
  @ApiProperty() isActive: boolean;
}

export class CouponValidationResultEntity {
  @ApiProperty() valid: boolean;
  @ApiProperty() discountAmount: number;
  @ApiProperty({ type: CouponEntity }) coupon: CouponEntity;
}
