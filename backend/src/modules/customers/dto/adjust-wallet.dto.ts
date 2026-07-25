import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { WalletTransactionType } from '@prisma/client';

export class AdjustWalletDto {
  @ApiProperty({ enum: WalletTransactionType, example: WalletTransactionType.CREDIT })
  @IsEnum(WalletTransactionType)
  type: WalletTransactionType;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Cashback for order #NK10234' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
