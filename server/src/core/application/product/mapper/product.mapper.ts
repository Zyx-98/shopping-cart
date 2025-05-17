import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';
import { ProductDto } from '../dto/product.dto';

export class ProductMapper {
  toDto(aggregate: ProductAggregate): ProductDto {
    const dto = new ProductDto();

    dto.id = aggregate.id.toValue();
    dto.name = aggregate.name;
    dto.price = aggregate.itemPrice.toString();

    return dto;
  }
}
