import { ProductId } from '../../product/value-object/product-id.vo';
import { InventoryId } from '../value-object/inventory-id.vo';
import { Quantity } from '../../shared/domain/value-object/quantity.vo';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';

export interface InventoryProps {
  id: InventoryId;
  productId: ProductId;
  quantity: Quantity;
}

export class InventoryAggregate extends BaseAggregateRoot<InventoryId> {
  private _productId: ProductId;
  private _quantity: Quantity;

  constructor(props: InventoryProps) {
    super(props.id);
    this._productId = props.productId;
    this._quantity = props.quantity;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): Quantity {
    return this._quantity;
  }
}
