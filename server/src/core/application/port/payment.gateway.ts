import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { PaymentState } from 'src/core/domain/payment/enum/payment-state.enum';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';

export interface PaymentInitiationResult {
  paymentId: string;
  status: PaymentState;
}

export const PAYMENT_GATEWAY = Symbol('IPaymentGateway');
export interface IPaymentGateway {
  initiatePayment(
    orderId: OrderId,
    amount: Price,
  ): Promise<PaymentInitiationResult>;
  processPayment(orderId: OrderId, amount: Price): Promise<boolean>;
}
