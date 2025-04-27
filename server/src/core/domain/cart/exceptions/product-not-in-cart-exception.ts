import { ProductId } from '../../product/value-objects/product-id.vo';
import { CartOperationException } from './cart-operation.exception';

export class ProductNotInCartException extends CartOperationException {
  constructor(productId: ProductId) {
    super(`Product with ID ${productId.toString()} not found in cart.`);
    this.name = 'ProductNotInCartException';
  }
}
