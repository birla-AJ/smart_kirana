import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CartService } from '../../cart/services/cart.service';
import { WishlistItemEntity } from '../entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async findAll(customerId: string): Promise<WishlistItemEntity[]> {
    const items = await this.prisma.wishlist.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            variants: { where: { isDefault: true }, take: 1 },
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0]?.imageUrl ?? null,
      price: Number(item.product.variants[0]?.sellingPrice ?? 0),
      inStock: (item.product.inventory?.availableStock ?? 0) > 0,
      createdAt: item.createdAt,
    }));
  }

  async add(customerId: string, productId: string): Promise<WishlistItemEntity[]> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with id "${productId}" not found`);

    const existing = await this.prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (existing) throw new ConflictException('Product is already in the wishlist');

    await this.prisma.wishlist.create({ data: { customerId, productId } });
    return this.findAll(customerId);
  }

  async remove(customerId: string, productId: string): Promise<WishlistItemEntity[]> {
    const existing = await this.prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (!existing) throw new NotFoundException('Product is not in the wishlist');

    await this.prisma.wishlist.delete({ where: { id: existing.id } });
    return this.findAll(customerId);
  }

  /** Moves a wishlist item into the cart and removes it from the wishlist. */
  async moveToCart(customerId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (!existing) throw new NotFoundException('Product is not in the wishlist');

    const cart = await this.cartService.addItem(customerId, { productId, quantity: 1 });
    await this.prisma.wishlist.delete({ where: { id: existing.id } });
    return cart;
  }
}
