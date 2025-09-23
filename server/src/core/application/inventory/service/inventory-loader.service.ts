import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from 'src/core/domain/inventory/repository/inventory.repository';
import { CACHE_SERVICE, ICacheService } from '../../port/cache.interface';

@Injectable()
export class InventoryLoaderService implements OnApplicationBootstrap {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}
  async onApplicationBootstrap() {
    const inventories = await this.inventoryRepository.findAll({});

    for (const inventory of inventories) {
      await this.cacheService.set(
        `inventory:product:${inventory.productId.toValue()}`,
        inventory.quantity.value,
      );
    }
  }
}
