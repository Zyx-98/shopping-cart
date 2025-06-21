import { Injectable } from '@nestjs/common';
import { CartSchema } from '../entities/cart.schema';
import { CartItem } from 'src/core/domain/cart/entity/cart-item.entity';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { CartItemId } from 'src/core/domain/cart/value-object/cart-item-id.vo';
import { CartId } from 'src/core/domain/cart/value-object/cart-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';
import { CartAggregate } from 'src/core/domain/cart/aggregate/cart.aggregate';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { DeepPartial } from 'typeorm';

@Injectable()
export class PersistenceCartMapper {
  constructor() {}

  toDomain(schema: CartSchema): CartAggregate {
    const cartItems = schema.cartItems.map((cartItem) =>
      CartItem.reconstitute({
        id: CartItemId.create(cartItem.uuid),
        cartId: CartId.create(schema.uuid),
        productId: ProductId.create(cartItem.productId),
        quantity: Quantity.create(cartItem.quantity),
        price: Price.create(cartItem.price),
      }),
    );

    return CartAggregate.reconstitute({
      id: CartId.create(schema.uuid),
      cartItems,
      customerId: CustomerId.create(schema.customer?.uuid || schema.customerId),
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
  toPersistence(aggregate: CartAggregate): DeepPartial<CartSchema> {
    return {
      uuid: aggregate.id.toString(),
      customerId: aggregate.customerId.toString(),
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt,
      cartItems: aggregate.cartItems.map((carItem) => ({
        uuid: carItem.cartItemId.toString(),
        cartId: aggregate.id.toString(),
        quantity: carItem.quantity.toNumber(),
        price: carItem.priceAtAddition.amount,
        productId: carItem.productId.toString(),
      })),
    };
  }
}
