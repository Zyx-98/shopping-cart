import { Inject, NotFoundException } from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from 'src/core/domain/cart/repository/cart.repository';
import { RemoveItemFromCartCommand } from './remove-item-from-cart.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(RemoveItemFromCartCommand)
export class RemoveItemFromCartHandler
  implements ICommandHandler<RemoveItemFromCartCommand>
{
  constructor(
    @Inject(CART_REPOSITORY) private readonly cartRepository: ICartRepository,
  ) {}

  async execute(command: RemoveItemFromCartCommand): Promise<void> {
    const { customerId, productId } = command;

    const cart = await this.cartRepository.findByUniqueId(customerId);

    if (!cart) {
      throw new NotFoundException('Active cart not found for this customer');
    }

    cart.removeCartItem(productId);

    await this.cartRepository.persist(cart);
  }
}
