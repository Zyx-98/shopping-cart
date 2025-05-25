import { Injectable } from '@nestjs/common';
import { ICartRepository } from 'src/core/domain/cart/repository/cart.repository';
import { ICouponRepository } from 'src/core/domain/coupon/repositories/coupon.repository';
import { ICustomerRepository } from 'src/core/domain/customer/repository/customer.repository';
import { IInventoryRepository } from 'src/core/domain/inventory/repository/inventory.repository';
import { IOrderRepository } from 'src/core/domain/order/repository/order.repository';
import { IPaymentRepository } from 'src/core/domain/payment/repository/payment.repository';
import { IUnitOfWork } from 'src/core/domain/port/unit-of-work.interface';
import { IProductRepository } from 'src/core/domain/product/repository/product.repository';
import { IUserRepository } from 'src/core/domain/user/repository/user.repository';
import { DataSource, EntityManager } from 'typeorm';
import { UserRepository } from '../repositories/user.repository';
import { UserSchema } from '../entities/user.schema';
import { PersistenceUserMapper } from '../mappers/persistence-user.mapper';
import { CustomerRepository } from '../repositories/customer.repository';
import { CustomerSchema } from '../entities/customer.schema';
import { PersistenceCustomerMapper } from '../mappers/persistence-customer.mapper';
import { CartRepository } from '../repositories/cart.repository';
import { CartSchema } from '../entities/cart.schema';
import { CartItemSchema } from '../entities/cart-item.schema';
import { PersistenceCartMapper } from '../mappers/persistence-cart.mapper';
import { ProductRepository } from '../repositories/product.repository';
import { ProductSchema } from '../entities/product.schema';
import { PersistenceProductMapper } from '../mappers/persistence-product.mapper';
import { TypeOrmQueryBuilderService } from '../query-builder/typeorm-query-builder.service';
import { OrderRepository } from '../repositories/order.repository';
import { OrderSchema } from '../entities/order.schema';
import { PersistenceOrderMapper } from '../mappers/persistence-order.mapper';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventorySchema } from '../entities/inventory.schema';
import { PersistenceInventoryMapper } from '../mappers/persistence-inventory.mapper';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentSchema } from '../entities/payment.schema';
import { PersistencePaymentMapper } from '../mappers/persistence-payment.mapper';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  private entityManager: EntityManager | null = null;
  private queryRunnerInitialized = false;

  public userRepository: IUserRepository;
  public customerRepository: ICustomerRepository;
  public cartRepository: ICartRepository;
  public couponRepository: ICouponRepository;
  public productRepository: IProductRepository;
  public orderRepository: IOrderRepository;
  public inventoryRepository: IInventoryRepository;
  public paymentRepository: IPaymentRepository;

  constructor(private readonly dataSource: DataSource) {}

  private getManager(): EntityManager {
    if (!this.entityManager) {
      throw new Error(
        `Transaction not started. Call beginTransaction() first.`,
      );
    }

    return this.entityManager;
  }

  private initializeRepositories(manager: EntityManager): void {
    this.userRepository = new UserRepository(
      manager.getRepository(UserSchema),
      new PersistenceUserMapper(),
    );
    this.customerRepository = new CustomerRepository(
      manager.getRepository(CustomerSchema),
      new PersistenceCustomerMapper(),
    );
    this.cartRepository = new CartRepository(
      manager.getRepository(CartSchema),
      manager.getRepository(CartItemSchema),
      new PersistenceCartMapper(),
    );
    // TODO initialize coupon repository
    this.productRepository = new ProductRepository(
      manager.getRepository(ProductSchema),
      new PersistenceProductMapper(),
      new TypeOrmQueryBuilderService(),
    );
    this.orderRepository = new OrderRepository(
      manager.getRepository(OrderSchema),
      new PersistenceOrderMapper(),
    );
    this.inventoryRepository = new InventoryRepository(
      manager.getRepository(InventorySchema),
      new PersistenceInventoryMapper(),
    );
    this.paymentRepository = new PaymentRepository(
      manager.getRepository(PaymentSchema),
      new PersistencePaymentMapper(),
    );
  }

  async beginTransaction(): Promise<void> {
    if (this.queryRunnerInitialized) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.entityManager = queryRunner.manager;
    this.initializeRepositories(this.entityManager);
    this.queryRunnerInitialized = true;
  }

  async commitTransaction(): Promise<void> {
    if (!this.entityManager || !this.entityManager.queryRunner) {
      throw new Error('Transaction not started or already completed.');
    }

    try {
      await this.entityManager.queryRunner.commitTransaction();
    } finally {
      await this.entityManager.queryRunner.release();
      this.entityManager = null;
      this.queryRunnerInitialized = false;
    }
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.entityManager || !this.entityManager.queryRunner) {
      return;
    }

    try {
      await this.entityManager.queryRunner.rollbackTransaction();
    } finally {
      await this.entityManager.queryRunner.release();
      this.entityManager = null;
      this.queryRunnerInitialized = false;
    }
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    if (this.entityManager && this.queryRunnerInitialized) {
      this.initializeRepositories(this.entityManager);
      return work();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.entityManager = queryRunner.manager;
    this.queryRunnerInitialized = true;

    try {
      const result = await work();
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      this.entityManager = null;
      this.queryRunnerInitialized = false;
    }
  }
}
