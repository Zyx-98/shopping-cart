import { ProductId } from '../value-object/product-id.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';

export interface ProductProps {
  id: ProductId;
  name: string;
  price: Price;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class ProductAggregate extends BaseAggregateRoot<ProductId> {
  private _name: string;
  private _itemPrice: Price;
  private _createdAt?: Date | null;
  private _updatedAt?: Date | null;

  constructor(props: ProductProps) {
    super(props.id);
    this._name = props.name;
    this._itemPrice = props.price;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public static create(name: string, price: number): ProductAggregate {
    return new ProductAggregate({
      id: ProductId.create(),
      name,
      price: Price.create(price),
    });
  }

  public static reconstitute(props: ProductProps): ProductAggregate {
    return new ProductAggregate(props);
  }

  get name(): string {
    return this._name;
  }

  get itemPrice(): Price {
    return this._itemPrice;
  }

  get createdAt(): Date | null | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | null | undefined {
    return this._updatedAt;
  }
}
