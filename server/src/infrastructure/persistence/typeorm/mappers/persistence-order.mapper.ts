import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { OrderSchema } from '../entities/order.schema';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { OrderLine } from 'src/core/domain/order/entity/order-line.entity';
import { OrderLineId } from 'src/core/domain/order/value-object/order-line-ids.vo';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { OrderStateMapper } from 'src/core/domain/order/mapper/order-state.mapper';
import { OrderState } from 'src/core/domain/order/enum/order-state.enum';
import { DeepPartial } from 'typeorm';

export class PersistenceOrderMapper {
  toDomain(schema: OrderSchema): OrderAggregate {
    return OrderAggregate.reconstitute({
      id: OrderId.create(schema.uuid),
      customerId: CustomerId.create(schema.customerId),
      orderLines: schema.orderLines.map((orderLine) =>
        OrderLine.reconstitute({
          id: OrderLineId.create(orderLine.uuid),
          orderId: OrderId.create(schema.uuid),
          productId: ProductId.create(orderLine.productId),
          quantity: Quantity.create(orderLine.quantity),
          createdAt: orderLine.createdAt,
          updatedAt: orderLine.updatedAt,
          description: orderLine.description,
        }),
      ),
      state: OrderStateMapper.mapToOrderState(
        schema.state as unknown as OrderState,
      ),
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  toPersistence(aggregate: OrderAggregate): DeepPartial<OrderSchema> {
    return {
      uuid: aggregate.id.toValue(),
      customerId: aggregate.customerId.toValue(),
      orderLines: aggregate.orderLines.map((orderLine) => ({
        uuid: orderLine.id.toValue(),
        productId: orderLine.productId.toValue(),
        quantity: orderLine.quantity.value,
        description: orderLine.description,
      })),
      state: aggregate.state,
    };
  }
}
