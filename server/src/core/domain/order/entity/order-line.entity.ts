import { ProductId } from '../../product/value-object/product-id.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { Quantity } from '../../shared/domain/value-object/quantity.vo';
import { OrderId } from '../value-object/order-id.vo';
import { OrderLineId } from '../value-object/order-line-ids.vo';

export interface OrderLineProps {
  id: OrderLineId;
  orderId: OrderId;
  productId: ProductId;
  quantity: Quantity;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  itemPrice?: Price;
}

export class OrderLine {
  private readonly _id: OrderLineId;
  private _orderId: OrderId;
  private _productId: ProductId;
  private _quantity: Quantity;
  private _description?: string | null;
  private _createdAt?: Date;
  private _updatedAt?: Date;
  private _itemPrice?: Price;

  constructor(props: OrderLineProps) {
    this._id = props.id;
    this._orderId = props.orderId;
    this._productId = props.productId;
    this._quantity = props.quantity;
    this._description = props.description;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._itemPrice = props.itemPrice;
  }

  get id(): OrderLineId {
    return this._id;
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

  get description(): string | null | undefined {
    return this._description;
  }

  get createdAt(): Date | null | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | null | undefined {
    return this._updatedAt;
  }

  get itemPrice(): Price | null | undefined {
    return this._itemPrice;
  }

  public static create(
    orderId: OrderId,
    productId: ProductId,
    description: string,
    quantity: number,
    itemPrice: number,
  ): OrderLine {
    return new OrderLine({
      id: OrderLineId.create(),
      orderId,
      productId,
      description,
      quantity: Quantity.create(quantity),
      itemPrice: Price.create(itemPrice),
    });
  }

  public static reconstitute(props: OrderLineProps): OrderLine {
    return new OrderLine(props);
  }
}
