import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { MarkAsFailedCommand } from './mark-as-failed.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from 'src/core/domain/payment/repository/payment.repository';

@CommandHandler(MarkAsFailedCommand)
export class MarkAsFailedHandler
  implements ICommandHandler<MarkAsFailedCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: MarkAsFailedCommand): Promise<any> {
    const { paymentId } = command;

    let payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment = this.publisher.mergeObjectContext(payment);

    payment.markAsFailed();

    await this.paymentRepository.persist(payment);

    payment.commit();
  }
}
