import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderAggregate } from 'src/core/domain/order/aggregate/order.aggregate';
import { IOrderRepository } from 'src/core/domain/order/repository/order.repository';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';
import { UniqueEntityId } from 'src/core/domain/shared/domain/value-object/unique-entity-id.vo';
import { QueryCriteria } from 'src/core/domain/shared/types/pagination.type';
import { OrderSchema } from '../entities/order.schema';
import { Repository } from 'typeorm';
import { PersistenceOrderMapper } from '../mappers/persistence-order.mapper';
import { CustomerId } from 'src/core/domain/customer/value-object/customer-id.vo';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderSchema)
    private readonly ormRepository: Repository<OrderSchema>,
    private readonly mapper: PersistenceOrderMapper,
  ) {}
  async findBelongToCustomerById(
    orderId: OrderId,
    customerId: CustomerId,
  ): Promise<OrderAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: orderId.toValue(),
        customerId: customerId.toValue(),
      },
      relations: {
        orderLines: true,
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }

  findAll(_criteria: QueryCriteria): Promise<OrderAggregate[]> {
    throw new Error('Method not implemented.');
  }
  async findById(id: OrderId): Promise<OrderAggregate | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: id.toValue(),
      },
      relations: {
        customer: true,
        orderLines: {
          product: true,
        },
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }
  findByUniqueId<UId extends UniqueEntityId>(
    _uniqueId: UId,
  ): Promise<OrderAggregate | null> {
    throw new Error('Method not implemented.');
  }
  async persist(entity: OrderAggregate): Promise<OrderAggregate> {
    const schema = this.mapper.toPersistence(entity);

    const order = await this.ormRepository.save(schema);

    return this.mapper.toDomain(order);
  }
}
