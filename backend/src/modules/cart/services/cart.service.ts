import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartEntity } from '../entities/cart.entity';

const CART_INCLUDE = {
  items: {
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 }, inventory: true } },
      variant: true,
    },
  },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCartId(customerId: string): Promise<string> {
    const cart = await this.prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
    });
    return cart.id;
  }

  private toEntity(cart: {
    id: string;
    items: Array<{
      id: string;
      productId: string;
      variantId: string | null;
      quantity: number;
      price: unknown;
      product: {
        name: string;
        images: Array<{ imageUrl: string }>;
        inventory: { availableStock: number } | null;
      };
      variant: { name: string | null } | null;
    }>;
  }): CartEntity {
    const items = cart.items.map((item) => {
      const price = Number(item.price);
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0]?.imageUrl ?? null,
        variantId: item.variantId,
        variantName: item.variant?.name ?? null,
        quantity: item.quantity,
        price,
        lineTotal: price * item.quantity,
        availableStock: item.product.inventory?.availableStock ?? 0,
      };
    });

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    };
  }

  async getCart(customerId: string): Promise<CartEntity> {
    const cartId = await this.getOrCreateCartId(customerId);
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: CART_INCLUDE,
    });
    return this.toEntity(cart);
  }

  private async resolveVariant(productId: string, variantId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });
    if (!product) throw new BadRequestException(`Product with id "${productId}" not found`);

    const variant = variantId
      ? await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } })
      : await this.prisma.productVariant.findFirst({ where: { productId, isDefault: true } });

    if (!variant) throw new BadRequestException('No matching variant found for this product');

    return { product, variant };
  }

  async addItem(customerId: string, dto: AddCartItemDto): Promise<CartEntity> {
    const cartId = await this.getOrCreateCartId(customerId);
    const { product, variant } = await this.resolveVariant(dto.productId, dto.variantId);
    const quantity = dto.quantity ?? 1;

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId: dto.productId,
          variantId: variant.id,
        },
      },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if ((product.inventory?.availableStock ?? 0) < newQuantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId: dto.productId,
          variantId: variant.id,
        },
      },
      update: { quantity: newQuantity, price: variant.sellingPrice },
      create: {
        cartId,
        productId: dto.productId,
        variantId: variant.id,
        quantity: newQuantity,
        price: variant.sellingPrice,
      },
    });

    return this.getCart(customerId);
  }

  async updateItem(customerId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartEntity> {
    const cartId = await this.getOrCreateCartId(customerId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: { product: { include: { inventory: true } } },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return this.getCart(customerId);
    }

    if ((item.product.inventory?.availableStock ?? 0) < dto.quantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
    return this.getCart(customerId);
  }

  async removeItem(customerId: string, itemId: string): Promise<CartEntity> {
    const cartId = await this.getOrCreateCartId(customerId);
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId } });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(customerId);
  }

  async clearCart(customerId: string): Promise<CartEntity> {
    const cartId = await this.getOrCreateCartId(customerId);
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    return this.getCart(customerId);
  }
}
