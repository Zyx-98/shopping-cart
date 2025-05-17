import { Module } from '@nestjs/common';
import { ProductController } from './controller/product.controller';
import { GetProductListHandler } from 'src/core/application/product/query/get-product-list.handler';
import { ProductMapper } from 'src/core/application/product/mapper/product.mapper';

@Module({
  providers: [ProductMapper, GetProductListHandler],
  controllers: [ProductController],
})
export class ProductModule {}
