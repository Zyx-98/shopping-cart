import { AggregateRoot } from '@nestjs/cqrs';
import { ProductId } from '../value-objects/product-id.vo';
import { Price } from '../../shared/domain/value-objects/price.vo';

interface ProductProps {
  id: ProductId;
  name: string;
  price: Price;
}

export class ProductAggregate extends AggregateRoot {
  private _productId: ProductId;
  private _name: string;
  private _itemPrice: Price;

  constructor(productId: ProductId, name: string, itemPrice: Price) {
    super();
    this._productId = productId;
    this._name = name;
    this._itemPrice = itemPrice;
  }

  public static reconstitute(props: ProductProps): ProductAggregate {
    return new ProductAggregate(props.id, props.name, props.price);
  }

  get productId(): ProductId {
    return this._productId;
  }

  get name(): string {
    return this._name;
  }

  get itemPrice(): Price {
    return this._itemPrice;
  }
}
