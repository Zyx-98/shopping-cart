import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsCustomerGuard } from 'src/infrastructure/auth/guards/is-customer.guard';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/shared/request/request-with-user.request';
import { GetOrderDetailQuery } from 'src/core/application/order/query/get-order-detail/get-order-detail.query';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { PlaceOrderDto } from '../dto/place-order.dto';
import { PlaceOrderCommand } from 'src/core/application/order/command/place-order/place-order.command';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { PlaceOrderResponseDto } from '../dto/place-order-response.dto';
import { CancelOrderCommand } from 'src/core/application/order/command/cancel-order/cancel-order.command';
import { OrderDetailDto } from 'src/core/application/order/dto/order-detail.dto';
import {
  IdempotencyOptions,
  Idempotent,
} from 'src/infrastructure/idempotency/idempotent.decorator';

const placeOrderIdempotencyOptions: IdempotencyOptions = {
  retentionPeriodMs: 48 * 60 * 60 * 1000, // 48 hours
  processingTimeoutMs: 60 * 1000, // 1 minute
};

@ApiTags('Order')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, IsCustomerGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order details by order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
    type: OrderDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  getOrderDetail(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Req() req: RequestWithUser,
  ): Promise<OrderDetailDto> {
    const query = new GetOrderDetailQuery(
      OrderId.create(orderId),
      CustomerId.create(req.user.customerId || ''),
    );

    return this.queryBus.execute(query);
  }

  @Post()
  @Idempotent(placeOrderIdempotencyOptions)
  @ApiOperation({ summary: 'Place a new order' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description:
      'A unique UUID v4 recommended for idempotent operations. ' +
      'Required for this operation',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: PlaceOrderDto,
    description: 'Data required to place a new order',
  })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
    type: PlaceOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order data',
  })
  async placeOrder(
    @Body() placeOrderDto: PlaceOrderDto,
    @Req() req: RequestWithUser,
  ): Promise<PlaceOrderResponseDto> {
    const command = new PlaceOrderCommand(
      CustomerId.create(req.user.customerId || ''),
      placeOrderDto.selectedProducts.map((selectedProduct) => ({
        productId: ProductId.create(selectedProduct.productId),
        quantity: Quantity.create(selectedProduct.quantity),
      })),
    );

    return this.commandBus.execute(command);
  }

  @Post(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async cancelOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<void> {
    const command = new CancelOrderCommand(OrderId.create(orderId));

    return this.commandBus.execute(command);
  }
}
