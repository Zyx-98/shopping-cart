import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInventoriesByProductIdsQuery } from './get-inventories-by-product-ids.query';
import { InventoryAggregate } from 'src/core/domain/inventory/aggregate/inventory.aggregate';
import { Inject } from '@nestjs/common';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';

@QueryHandler(GetInventoriesByProductIdsQuery)
export class GetInventoriesByProductIdsHandler
  implements IQueryHandler<GetInventoriesByProductIdsQuery>
{
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(
    query: GetInventoriesByProductIdsQuery,
  ): Promise<InventoryAggregate[]> {
    const { productIds } = query;

    const inventories =
      await this.inventoryRepository.findAllByProductId(productIds);

    return inventories;
  }
}
