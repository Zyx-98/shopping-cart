import { InjectRepository } from '@nestjs/typeorm';
import { CartAggregate } from 'src/core/domain/cart/aggregate/cart.aggregate';
import { ICartRepository } from 'src/core/domain/cart/repository/cart.repository';
import { UniqueEntityId } from 'src/core/domain/shared/domain/value-object/unique-entity-id.vo';
import { Repository } from 'typeorm';
import { PersistenceCartMapper } from '../mappers/persistence-cart.mapper';
import { CartSchema } from '../entities/cart.schema';
import { Injectable } from '@nestjs/common';
import { CartItemSchema } from '../entities/cart-item.schema';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartSchema)
    private readonly ormRepository: Repository<CartSchema>,
    @InjectRepository(CartItemSchema)
    private readonly cartItemRepository: Repository<CartItemSchema>,
    private readonly mapper: PersistenceCartMapper,
  ) {}

  async findByUniqueId(customerId: CustomerId): Promise<CartAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        customer: {
          uuid: customerId.toString(),
        },
      },
      relations: {
        cartItems: true,
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }
  findAll(): Promise<CartAggregate[]> {
    throw new Error('Method not implemented.');
  }
  findById(_id: UniqueEntityId): Promise<CartAggregate | null> {
    throw new Error('Method not implemented.');
  }
  store(_entity: CartAggregate): Promise<CartAggregate> {
    throw new Error('Method not implemented.');
  }
  update(_entity: CartAggregate): Promise<CartAggregate> {
    throw new Error('Method not implemented.');
  }
  async persist(entity: CartAggregate): Promise<CartAggregate> {
    const persistence = await this.mapper.toPersistence(entity);

    let cart = await this.ormRepository.findOne({
      where: { uuid: entity.id.toString() },
      relations: {
        cartItems: true,
      },
    });

    if (!cart) {
      cart = this.ormRepository.create(persistence);
    }

    const existingCartItems = cart.cartItems || [];
    const updatedCartItems: CartItemSchema[] = [];

    const existingCartItemMap = new Map(
      existingCartItems.map((item) => [item.productId, item]),
    );

    const incomingItems = persistence.cartItems || ([] as CartItemSchema[]);

    for (const incomingItem of incomingItems) {
      const existingItem = existingCartItemMap.get(incomingItem.productId || 0);

      if (existingItem) {
        if (
          existingItem.quantity !== incomingItem.quantity ||
          existingItem.price !== incomingItem.price
        ) {
          existingItem.quantity = incomingItem.quantity || 1;
          existingItem.price = incomingItem.price || 0;
          updatedCartItems.push(existingItem);
        }
      } else if ((incomingItem.quantity ?? 0) > 0) {
        const newItem = this.cartItemRepository.create({
          ...incomingItem,
          cart,
        });
        updatedCartItems.push(newItem);
      }
    }

    const itemsToRemove = Array.from(existingCartItems.values());

    if (itemsToRemove.length > 0) {
      await this.cartItemRepository.remove(itemsToRemove);
    }

    cart.cartItems = updatedCartItems;

    const result = await this.cartItemRepository.save(cart);

    return this.mapper.toDomain(result);
  }
}
