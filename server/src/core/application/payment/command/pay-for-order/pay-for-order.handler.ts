import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { PayForOrderCommand } from './pay-for-order.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';
import { Inject, NotFoundException } from '@nestjs/common';

@CommandHandler(PayForOrderCommand)
export class PayForOrderHandler implements ICommandHandler<PayForOrderCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly publisher: EventPublisher,
  ) {}
  async execute(
    command: PayForOrderCommand,
  ): Promise<{ success: boolean; failed: boolean }> {
    const { paymentId, amount } = command;

    let payment = await this.paymentRepository.findById(paymentId);

    const result = {
      success: false,
      failed: false,
    };

    if (!payment) {
      throw new NotFoundException(
        `Payment not found with id ${paymentId.toString()}`,
      );
    }

    payment = this.publisher.mergeObjectContext(payment);

    // This condition is assumed to indicate a failed payment
    if (payment.totalItemPrice.equals(amount)) {
      payment.markAsPaid();
      result.success = true;
    } else {
      payment.markAsFailed();
      result.failed = true;
    }

    payment.commit();

    return result;
  }
}
