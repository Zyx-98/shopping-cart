import { Injectable, NotFoundException } from '@nestjs/common';
import { CartSchema } from '../entities/cart.schema';
import { CartItem } from 'src/core/domain/cart/entity/cart-item.entity';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { CartItemId } from 'src/core/domain/cart/value-object/cart-item-id.vo';
import { CartId } from 'src/core/domain/cart/value-object/cart-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';
import { CartAggregate } from 'src/core/domain/cart/aggregate/cart.aggregate';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerSchema } from '../entities/customer.schema';
import { DeepPartial, In, Repository } from 'typeorm';
import { ProductSchema } from '../entities/product.schema';
import { CartItemSchema } from '../entities/cart-item.schema';

@Injectable()
export class PersistenceCartMapper {
  constructor(
    @InjectRepository(CustomerSchema)
    private readonly customerRepository: Repository<CustomerSchema>,
    @InjectRepository(ProductSchema)
    private readonly productRepository: Repository<ProductSchema>,
  ) {}

  toDomain(schema: CartSchema): CartAggregate {
    const cartItems = schema.cartItems.map((cartItem) =>
      CartItem.reconstitute({
        id: CartItemId.create(cartItem.uuid),
        cartId: CartId.create(schema.uuid),
        productId: ProductId.create(schema.uuid),
        quantity: Quantity.create(cartItem.quantity),
        price: Price.create(cartItem.price),
      }),
    );

    return CartAggregate.reconstitute({
      id: CartId.create(schema.uuid),
      cartItems,
      customerId: CustomerId.create(schema.customer.uuid),
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
  async toPersistence(
    aggregate: CartAggregate,
  ): Promise<DeepPartial<CartSchema>> {
    const customer = await this.customerRepository.findOne({
      where: {
        uuid: aggregate.customerId.toString(),
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer is not found');
    }

    const productIds = aggregate.cartItems.map((cartItem) =>
      cartItem.productId.toString(),
    );

    const products = await this.productRepository.find({
      where: {
        uuid: In(productIds),
      },
    });

    if (productIds.length !== products.length) {
      throw new NotFoundException(
        'One or more products in the cart could not be found',
      );
    }

    const cartItems = aggregate.cartItems.reduce((acc, cartItem) => {
      const productId = products.find(
        ({ uuid }) => uuid === cartItem.productId.toString(),
      )?.id;

      if (!productId) return acc;

      acc.push({
        uuid: cartItem.cartItemId.toString(),
        quantity: cartItem.quantity.toNumber(),
        price: cartItem.priceAtAddition.amount,
        productId,
      });

      return acc;
    }, [] as DeepPartial<CartItemSchema>[]);

    return {
      uuid: aggregate.id.toString(),
      customer,
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt,
      cartItems,
    };
  }
}
