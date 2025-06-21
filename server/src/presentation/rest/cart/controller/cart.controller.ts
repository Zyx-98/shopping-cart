import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/shared/request/request-with-user.request';
import {
  CartDto,
  CartDtoWithCursorPagination,
} from 'src/core/application/cart/dto/cart.dto';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';
import { IsCustomerGuard } from 'src/infrastructure/auth/guards/is-customer.guard';
import { GetCartByCustomerIdQuery } from 'src/core/application/cart/query/get-cart-by-customer-id/get-cart-by-customer-id.query';
import { AddCartItemRequestDto } from '../dto/add-cart-item-request.dto';
import { AddItemToCartCommand } from 'src/core/application/cart/command/add-item-to-cart/add-item-to-cart.command';
import { ProductId } from 'src/core/domain/product/value-object/product-id.vo';
import { Quantity } from 'src/core/domain/shared/domain/value-object/quantity.vo';
import { RemoveItemFromCartCommand } from 'src/core/application/cart/command/remove-item-from-cart/remove-item-from-cart.command';
import { UpdateItemQuantityRequestDto } from '../dto/update-item-quantity-request.dto';
import { UpdateItemQuantityCommand } from 'src/core/application/cart/command/update-item-quantity/update-item-quantity.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CartQueryDto } from '../dto/cart-query.dto';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, IsCustomerGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get the current customer's active shopping cart" })
  @ApiResponse({
    status: 200,
    description: 'Shopping cart details',
    type: CartDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Active cart not found for customer',
  })
  async getCart(
    @Req() req: RequestWithUser,
    @Query() queryCriteria: CartQueryDto,
  ): Promise<CartDtoWithCursorPagination | null> {
    const customerId = CustomerId.create(req.user.customerId || '');
    const query = new GetCartByCustomerIdQuery(customerId, {
      limit: queryCriteria.limit,
      nextCursor: queryCriteria.nextCursor,
      previousCursor: queryCriteria.previousCursor,
    });

    const cartDto = await this.queryBus.execute(query);

    return cartDto;
  }

  @Post('items')
  @ApiOperation({ summary: "Add an item to the customer's cart" })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully (return updated cart)',
    type: CartDtoWithCursorPagination,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  async addCartItem(
    @Body() addCartItemDto: AddCartItemRequestDto,
    @Req() req: RequestWithUser,
  ): Promise<CartDtoWithCursorPagination | null> {
    const command = new AddItemToCartCommand(
      CustomerId.create(req.user.customerId || ''),
      ProductId.create(addCartItemDto.productId),
      Quantity.create(addCartItemDto.quantity),
    );

    await this.commandBus.execute(command);

    return this.getCart(req, { limit: 10 });
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove an item from the customer's cart " })
  @ApiParam({
    name: 'productId',
    type: 'string',
    format: 'uuid',
    description: 'UUID of the product to remove',
  })
  @ApiResponse({ status: 200, description: 'Item remove successfully' })
  @ApiResponse({
    status: 404,
    description: 'Product not found in cart or cart not found',
  })
  async removeItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: RequestWithUser,
  ) {
    const command = new RemoveItemFromCartCommand(
      CustomerId.create(req.user.customerId || ''),
      ProductId.create(productId),
    );

    await this.commandBus.execute(command);
  }

  @Put('items/:productId')
  @ApiOperation({
    summary: 'Update the quantity of an item in the shopping cart',
  })
  @ApiParam({
    name: 'productId',
    type: 'string',
    format: 'uuid',
    description: 'UUID of the product to update',
  })
  async updateItemQuantity(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateDto: UpdateItemQuantityRequestDto,
    @Req() req: RequestWithUser,
  ): Promise<CartDtoWithCursorPagination | null> {
    const command = new UpdateItemQuantityCommand(
      CustomerId.create(req.user.customerId || ''),
      ProductId.create(productId),
      Quantity.create(updateDto.quantity),
    );

    await this.commandBus.execute(command);

    return this.getCart(req, { limit: 10 });
  }
}
