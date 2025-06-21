import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { MarkAsPaidCommand } from './mark-as-paid.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';
import { Inject, Logger, NotFoundException } from '@nestjs/common';

@CommandHandler(MarkAsPaidCommand)
export class MarkAsPaidHandler implements ICommandHandler<MarkAsPaidCommand> {
  private readonly logger = new Logger(MarkAsPaidHandler.name);
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: MarkAsPaidCommand): Promise<void> {
    const { paymentId } = command;

    let payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment = this.publisher.mergeObjectContext(payment);

    payment.markAsPaid();

    await this.paymentRepository.persist(payment);

    payment.commit();
    this.logger.log(`Payment with ID ${paymentId.toString()} marked as paid`);
  }
}
