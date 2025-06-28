import { ProductAggregate } from 'src/core/domain/product/aggregate/product.aggregate';
import { ProductDto } from '../dto/product.dto';
import { InventoryAggregate } from 'src/core/domain/inventory/aggregate/inventory.aggregate';

export class ProductMapper {
  toDto(
    aggregate: ProductAggregate,
    inventory?: InventoryAggregate,
  ): ProductDto {
    const dto = new ProductDto();

    dto.id = aggregate.id.toValue();
    dto.name = aggregate.name;
    dto.price = aggregate.price.toString();
    dto.inventoryCount = inventory ? inventory.quantity.value : 0;

    return dto;
  }
}
