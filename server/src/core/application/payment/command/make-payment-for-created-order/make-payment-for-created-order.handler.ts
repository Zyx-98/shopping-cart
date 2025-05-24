import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakePaymentForCreatedOrderCommand } from './make-payment-for-created-order.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';
import { Inject } from '@nestjs/common';
import { PaymentAggregate } from 'src/core/domain/payment/aggregate/payment.aggregate';

@CommandHandler(MakePaymentForCreatedOrderCommand)
export class MakePaymentForCreatedOrderHandler
  implements ICommandHandler<MakePaymentForCreatedOrderCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: MakePaymentForCreatedOrderCommand): Promise<any> {
    const { orderId, totalItemPrice } = command;

    const payment = PaymentAggregate.create(orderId, totalItemPrice);

    await this.paymentRepository.persist(payment);
  }
}
