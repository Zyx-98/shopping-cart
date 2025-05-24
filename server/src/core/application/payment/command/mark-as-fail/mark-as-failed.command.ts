import { PaymentId } from 'src/core/domain/payment/value-object/payment-id.vo';

export class MarkAsFailedCommand {
  constructor(public readonly paymentId: PaymentId) {}
}
