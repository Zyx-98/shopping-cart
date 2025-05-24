import { Command } from '@nestjs/cqrs';
import { PaymentId } from 'src/core/domain/payment/value-object/payment-id.vo';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';

export class PayForOrderCommand extends Command<{
  success: boolean;
  failed: boolean;
}> {
  constructor(
    public readonly paymentId: PaymentId,
    public readonly amount: Price,
  ) {
    super();
  }
}
