import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InitiatePaymentCommand } from './initiate-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';
import { Inject } from '@nestjs/common';
import { PaymentAggregate } from 'src/core/domain/payment/aggregate/payment.aggregate';

@CommandHandler(InitiatePaymentCommand)
export class InitiatePaymentHandler
  implements ICommandHandler<InitiatePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: InitiatePaymentCommand): Promise<any> {
    const { orderId, totalItemPrice } = command;

    const payment = PaymentAggregate.create(orderId, totalItemPrice);

    await this.paymentRepository.persist(payment);
  }
}
