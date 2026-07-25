import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CustomerEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  mobile: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty({ nullable: true })
  referralCode: string | null;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  loyaltyPoints: number;

  @ApiProperty()
  walletBalance: number;

  @ApiProperty()
  createdAt: Date;
}

export class WalletTransactionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  reason: string;

  @ApiProperty({ nullable: true })
  referenceType: string | null;

  @ApiProperty({ nullable: true })
  referenceId: string | null;

  @ApiProperty()
  createdAt: Date;
}
