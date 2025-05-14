import { ProductId } from '../value-object/product-id.vo';
import { Price } from '../../shared/domain/value-object/price.vo';
import { BaseAggregateRoot } from '../../shared/domain/aggregate/base-aggregate-root';

export interface ProductProps {
  id: ProductId;
  name: string;
  price: Price;
}

export class ProductAggregate extends BaseAggregateRoot<ProductId> {
  private _name: string;
  private _itemPrice: Price;

  constructor(props: ProductProps) {
    super(props.id);
    this._name = props.name;
    this._itemPrice = props.price;
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
}
