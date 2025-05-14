import { ProductId } from '../../product/value-object/product-id.vo';
import { Quantity } from '../../shared/domain/value-object/quantity.vo';
import { OrderId } from '../value-object/order-id.vo';
import { OrderLineId } from '../value-object/order-line-ids.vo';

export class OrderLine {
  constructor(
    private _orderLineId: OrderLineId,
    private _orderId: OrderId,
    private _productId: ProductId,
    private _quantity: Quantity,
    private _description: string,
  ) {}

  get orderLineId(): OrderLineId {
    return this._orderLineId;
  }

  get orderId(): OrderId {
    return this._orderId;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get description(): string {
    return this._description;
  }
}
