import { SagaPayload } from './saga-payload.interface';

export interface OrderProcessingSagaPayload extends SagaPayload {
  customerId: string;
  orderLines: { productId: string; quantity: number }[];
  totalPrice: number;
  orderId: string;
  paymentId?: string;
}
