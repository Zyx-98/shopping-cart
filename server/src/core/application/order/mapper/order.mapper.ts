import { Injectable } from '@nestjs/common';
import { OrderDetailDto } from '../dto/order-detail.dto';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';

@Injectable()
export class OrderMapper {
  toDto(
    orderAggregate: OrderAggregate,
    productAggregates: ProductAggregate[],
  ): OrderDetailDto {
    const orderDetailDto = new OrderDetailDto();

    orderDetailDto.id = orderAggregate.id.toString();
    orderDetailDto.state = orderAggregate.state;
    orderDetailDto.customerId = orderAggregate.customerId.toString();
    orderDetailDto.totalPrice = orderAggregate.getTotalPrice().amount;
    orderDetailDto.canceledAt = orderAggregate.canceledAt;
    orderDetailDto.completedAt = orderAggregate.completedAt;
    orderDetailDto.createdAt = orderAggregate.createdAt;

    orderDetailDto.orderLines = orderAggregate.orderLines.map((orderLine) => {
      const product = productAggregates.find((product) =>
        product.id.equals(orderLine.productId),
      );

      return {
        id: orderLine.id.toString(),
        description: orderLine.description,
        quantity: orderLine.quantity.value,
        product: product
          ? {
              id: product.id.toString(),
              name: product.name,
              price: product.itemPrice.amount,
            }
          : null,
      };
    });

    return orderDetailDto;
  }
}
