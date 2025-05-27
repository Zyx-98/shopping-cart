import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentForCanceledOrderCommand } from './cancel-payment-for-canceled-order.command';
import { Inject } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';

@CommandHandler(CancelPaymentForCanceledOrderCommand)
export class CancelPaymentForCanceledOrderHandler
  implements ICommandHandler<CancelPaymentForCanceledOrderCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: CancelPaymentForCanceledOrderCommand): Promise<void> {
    const { orderId } = command;

    const payment = await this.paymentRepository.findByOrderId(orderId);

    if (!payment) {
      throw new Error(`Payment with OrderId ${orderId.toValue()} not found`);
    }

    payment.cancel();

    await this.paymentRepository.persist(payment);
  }
}
