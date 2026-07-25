import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AdjustWalletDto } from '../dto/adjust-wallet.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { WalletTransactionEntity } from '../entities/customer.entity';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(customerId: string): Promise<{ walletBalance: number }> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return { walletBalance: Number(customer.walletBalance) };
  }

  async getHistory(
    customerId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<WalletTransactionEntity>> {
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where: { customerId },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.count({ where: { customerId } }),
    ]);

    return buildPaginatedResponse(
      rows.map((r) => ({ ...r, amount: Number(r.amount), balanceAfter: Number(r.balanceAfter) })),
      totalItems,
      query.page ?? 1,
      query.take,
    );
  }

  /**
   * Credits or debits a customer's wallet atomically, writing an
   * immutable ledger row (WalletTransaction) alongside the balance
   * update so the running balance can always be reconciled.
   * Used both by the admin adjustment endpoint and internally by
   * Orders/Refunds/Coupons once those modules are built.
   */
  async adjustBalance(
    customerId: string,
    dto: AdjustWalletDto,
    referenceType?: string,
    referenceId?: string,
  ): Promise<{ walletBalance: number }> {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const currentBalance = Number(customer.walletBalance);
      const delta = dto.type === WalletTransactionType.CREDIT ? dto.amount : -dto.amount;
      const newBalance = currentBalance + delta;

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient wallet balance for this debit');
      }

      const updated = await tx.customer.update({
        where: { id: customerId },
        data: { walletBalance: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          customerId,
          type: dto.type,
          amount: dto.amount,
          balanceAfter: newBalance,
          reason: dto.reason,
          referenceType,
          referenceId,
        },
      });

      return { walletBalance: Number(updated.walletBalance) };
    });
  }
}
