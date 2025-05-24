import { Injectable } from '@nestjs/common';
import { PaymentSchema } from '../entities/payment.schema';
import { PaymentAggregate } from 'src/core/domain/payment/aggregate/payment.aggregate';
import { PaymentId } from 'src/core/domain/payment/value-object/payment-id.vo';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';
import { PaymentStateMapper } from 'src/core/domain/payment/mapper/payment-state.mapper';
import { DeepPartial } from 'typeorm';

@Injectable()
export class PersistencePaymentMapper {
  toDomain(schema: PaymentSchema): PaymentAggregate {
    return PaymentAggregate.reconstitute({
      id: PaymentId.create(schema.uuid),
      orderId: OrderId.create(schema.orderId),
      totalItemPrice: Price.create(schema.totalItemPrice),
      state: PaymentStateMapper.mapToState(schema.state),
      failedAt: schema.failedAt,
      paidAt: schema.paidAt,
    });
  }

  toPersistence(aggregate: PaymentAggregate): DeepPartial<PaymentSchema> {
    return {
      uuid: aggregate.id.toString(),
      orderId: aggregate.orderId.toString(),
      totalItemPrice: aggregate.totalItemPrice.amount,
      state: aggregate.state,
      failedAt: aggregate.failedAt,
      paidAt: aggregate.paidAt,
    };
  }
}
