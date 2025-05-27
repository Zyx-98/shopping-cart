import { InjectRepository } from '@nestjs/typeorm';
import { PaymentAggregate } from 'src/core/domain/payment/aggregate/payment.aggregate';
import { IPaymentRepository } from 'src/core/domain/payment/repository/payment.repository';
import { PaymentId } from 'src/core/domain/payment/value-object/payment-id.vo';
import { PaymentSchema } from '../entities/payment.schema';
import { Repository } from 'typeorm';
import { PersistencePaymentMapper } from '../mappers/persistence-payment.mapper';
import { OrderId } from 'src/core/domain/order/value-object/order-id.vo';

export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentSchema)
    private readonly paymentRepository: Repository<PaymentSchema>,
    private readonly mapper: PersistencePaymentMapper,
  ) {}

  findAll(): Promise<PaymentAggregate[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: PaymentId): Promise<PaymentAggregate | null> {
    const payment = await this.paymentRepository.findOne({
      where: {
        uuid: id.toString(),
      },
    });

    if (!payment) {
      return null;
    }

    return this.mapper.toDomain(payment);
  }

  async findByOrderId(orderId: OrderId): Promise<PaymentAggregate | null> {
    const payment = await this.paymentRepository.findOne({
      where: {
        orderId: orderId.toString(),
      },
    });

    if (!payment) {
      return null;
    }

    return this.mapper.toDomain(payment);
  }

  findByUniqueId(): Promise<PaymentAggregate | null> {
    throw new Error('Method not implemented.');
  }

  async persist(entity: PaymentAggregate): Promise<PaymentAggregate> {
    const persistence = this.mapper.toPersistence(entity);

    const payment = await this.paymentRepository.save(persistence);

    return this.mapper.toDomain(payment);
  }
}
