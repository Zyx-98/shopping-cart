import { ProductId } from '../../product/value-object/product-id.vo';
import { InventoryId } from '../value-object/inventory-id.vo';
import { Quantity } from '../../shared/domain/value-object/quantity.vo';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';
import { InsufficientInventoryAvailableException } from '../exception/insufficient-inventory-available.aggregate';
import { Version } from '../../shared/domain/value-object/version.vo';

export interface InventoryProps {
  id: InventoryId;
  productId: ProductId;
  quantity: Quantity;
  createAt?: Date | null;
  updatedAt?: Date | null;
  version?: Version;
}

export class InventoryAggregate extends BaseAggregateRoot<InventoryId> {
  private _productId: ProductId;
  private _quantity: Quantity;
  private _createdAt?: Date | null;
  private _updatedAt?: Date | null;
  private _version: Version;

  private _available: Quantity = Quantity.create(0);

  constructor(props: InventoryProps) {
    super(props.id);
    this._productId = props.productId;
    this._quantity = props.quantity;
    this._createdAt = props.createAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this._version = props.version || Version.create(1);
  }

  public static create(
    productId: string,
    quantity: number,
  ): InventoryAggregate {
    return new InventoryAggregate({
      id: InventoryId.create(),
      productId: ProductId.create(productId),
      quantity: Quantity.create(quantity),
    });
  }

  public static reconstitute(props: InventoryProps): InventoryAggregate {
    return new InventoryAggregate(props);
  }

  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get createdAt(): Date | null | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | null | undefined {
    return this._updatedAt;
  }

  get version(): Version {
    return this._version;
  }

  public nextVersion(): void {
    this._version = this._version.next();
  }

  public checkAvailability(quantity: Quantity): boolean {
    return this._quantity.subtract(quantity).isLessThan(this._available);
  }

  public addQuantity(quantity: Quantity): void {
    this._quantity = this._quantity.add(quantity);
  }

  public removeQuantity(quantity: Quantity): void {
    const newQuantity = this._quantity.subtract(quantity);
    if (newQuantity.isLessThan(this._available)) {
      throw new InsufficientInventoryAvailableException(
        this._productId.toValue(),
        this._quantity.toNumber(),
        quantity.toNumber(),
      );
    }

    this._quantity = newQuantity;
  }
}
