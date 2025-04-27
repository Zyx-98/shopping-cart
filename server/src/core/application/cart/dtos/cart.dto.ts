import { CartItemDto } from './cart-item.dto';

export class CartDto {
  id: string;
  customerId: string;
  cartItems: CartItemDto[];
}
