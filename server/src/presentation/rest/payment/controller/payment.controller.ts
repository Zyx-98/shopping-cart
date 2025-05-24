import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsCustomerGuard } from 'src/infrastructure/auth/guards/is-customer.guard';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { PayRequestDto } from '../dto/pay-request.dto';
import { PayForOrderCommand } from 'src/core/application/payment/command/pay-for-order/pay-for-order.command';
import { Price } from 'src/core/domain/shared/domain/value-object/price.vo';
import { PaymentId } from 'src/core/domain/payment/value-object/payment-id.vo';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('Payment')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, IsCustomerGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':paymentId/pay')
  @ApiOperation({ summary: '' })
  @ApiParam({
    name: 'paymentId',
    type: 'string',
    format: 'uuid',
    description: 'UUID of the payment to pay',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully or failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async pay(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() payDto: PayRequestDto,
  ): Promise<{ message: string }> {
    const command = new PayForOrderCommand(
      PaymentId.create(paymentId),
      Price.create(payDto.amount),
    );

    const { failed } = await this.commandBus.execute(command);

    return {
      message: failed
        ? 'Payment processed successfully'
        : 'Payment processed failed',
    };
  }
}
