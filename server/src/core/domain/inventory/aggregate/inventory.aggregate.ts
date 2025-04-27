import { AggregateRoot } from '@nestjs/cqrs';
import { ProductId } from '../../product/value-objects/product-id.vo';
import { InventoryId } from '../value-objects/inventory-id.vo';
import { Quantity } from '../../shared/domain/value-objects/quantity.vo';

export class InventoryAggregate extends AggregateRoot {
  private _inventoryId: InventoryId;
  private _productId: ProductId;
  private _quantity: Quantity;

  constructor(inventoryId: InventoryId, productId: ProductId) {
    super();
    this._inventoryId = inventoryId;
    this._productId = productId;
  }

  get inventoryId(): InventoryId {
    return this._inventoryId;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): Quantity {
    return this._quantity;
  }
}
