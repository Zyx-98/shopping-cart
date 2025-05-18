import { Inject, NotFoundException } from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from 'src/core/domain/cart/repository/cart.repository';
import { UpdateItemQuantityCommand } from './update-item-quantity.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UpdateItemQuantityCommand)
export class UpdateItemQuantityHandler
  implements ICommandHandler<UpdateItemQuantityCommand>
{
  constructor(
    @Inject(CART_REPOSITORY) private readonly cartRepository: ICartRepository,
  ) {}

  async execute(command: UpdateItemQuantityCommand): Promise<void> {
    const { customerId, productId, quantity } = command;

    const cart = await this.cartRepository.findByUniqueId(customerId);

    if (!cart) {
      throw new NotFoundException('Active cart not found for this customer');
    }

    cart.updateItemQuantity(productId, quantity);

    await this.cartRepository.persist(cart);
  }
}
