import { Module } from '@nestjs/common';
import { ProductMapper } from './mapper/product.mapper';
import { GetProductListHandler } from './query/get-product-list/get-product-list.handler';

@Module({
  providers: [ProductMapper, GetProductListHandler],
  exports: [ProductMapper, GetProductListHandler],
})
export class ApplicationProductModule {}
