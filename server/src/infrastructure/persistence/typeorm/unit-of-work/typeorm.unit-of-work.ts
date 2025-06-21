import { Injectable, Logger } from '@nestjs/common';
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
import { ISagaInstanceRepository } from 'src/core/domain/saga/repository/saga-instance.repository';
import { SagaInstanceRepository } from '../repositories/saga-instance.repository';
import { SagaInstanceSchema } from '../entities/saga-instance.schema';
import { PersistenceSagaInstanceMapper } from '../mappers/persistence-saga-instance.mapper';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  private readonly logger = new Logger(TypeOrmUnitOfWork.name);
  private entityManager: EntityManager | null = null;
  private queryRunnerInitialized = false;

  // Private fields to hold repository instances after they are initialized
  private _userRepository: IUserRepository | null = null;
  private _customerRepository: ICustomerRepository | null = null;
  private _cartRepository: ICartRepository | null = null;
  private _couponRepository: ICouponRepository | null = null;
  private _productRepository: IProductRepository | null = null;
  private _orderRepository: IOrderRepository | null = null;
  private _inventoryRepository: IInventoryRepository | null = null;
  private _paymentRepository: IPaymentRepository | null = null;
  private _sagaInstanceRepository: ISagaInstanceRepository | null = null;

  constructor(private readonly dataSource: DataSource) {}

  private getManager(): EntityManager {
    if (!this.entityManager) {
      this.logger.error(
        `Transaction not started. Call beginTransaction() first, or use execute().`,
      );
      throw new Error(
        `Transaction not started. Call beginTransaction() first, or use execute().`,
      );
    }
    return this.entityManager;
  }

  // Use getters for lazy initialization
  public get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(
        this.getManager().getRepository(UserSchema),
        new PersistenceUserMapper(),
      );
    }
    return this._userRepository;
  }

  public get customerRepository(): ICustomerRepository {
    if (!this._customerRepository) {
      this._customerRepository = new CustomerRepository(
        this.getManager().getRepository(CustomerSchema),
        new PersistenceCustomerMapper(),
      );
    }
    return this._customerRepository;
  }

  public get cartRepository(): ICartRepository {
    if (!this._cartRepository) {
      this._cartRepository = new CartRepository(
        this.getManager().getRepository(CartSchema),
        this.getManager().getRepository(CartItemSchema),
        new PersistenceCartMapper(),
        new TypeOrmQueryBuilderService(),
      );
    }

    return this._cartRepository;
  }

  public get couponRepository(): ICouponRepository {
    if (!this._couponRepository) {
      // TODO: Implement CouponRepository initialization when ready
      // this._couponRepository = new CouponRepository(
      //   this.getManager().getRepository(CouponSchema),
      //   new PersistenceCouponMapper(),
      // );
      throw new Error('CouponRepository not yet implemented.');
    }
    return this._couponRepository;
  }

  public get productRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new ProductRepository(
        this.getManager().getRepository(ProductSchema),
        new PersistenceProductMapper(),
        new TypeOrmQueryBuilderService(),
      );
    }
    return this._productRepository;
  }

  public get orderRepository(): IOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new OrderRepository(
        this.getManager().getRepository(OrderSchema),
        new PersistenceOrderMapper(),
      );
    }
    return this._orderRepository;
  }

  public get inventoryRepository(): IInventoryRepository {
    if (!this._inventoryRepository) {
      this._inventoryRepository = new InventoryRepository(
        this.getManager().getRepository(InventorySchema),
        new PersistenceInventoryMapper(),
      );
    }
    return this._inventoryRepository;
  }

  public get paymentRepository(): IPaymentRepository {
    if (!this._paymentRepository) {
      this._paymentRepository = new PaymentRepository(
        this.getManager().getRepository(PaymentSchema),
        new PersistencePaymentMapper(),
      );
    }
    return this._paymentRepository;
  }

  public get sagaInstanceRepository(): ISagaInstanceRepository {
    if (!this._sagaInstanceRepository) {
      this._sagaInstanceRepository = new SagaInstanceRepository(
        this.getManager().getRepository(SagaInstanceSchema),
        new PersistenceSagaInstanceMapper(),
      );
    }
    return this._sagaInstanceRepository;
  }

  private resetRepositories(): void {
    this._userRepository = null;
    this._customerRepository = null;
    this._cartRepository = null;
    this._couponRepository = null;
    this._productRepository = null;
    this._orderRepository = null;
    this._inventoryRepository = null;
    this._paymentRepository = null;
    this._sagaInstanceRepository = null;
  }

  async beginTransaction(): Promise<void> {
    if (this.queryRunnerInitialized) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.entityManager = queryRunner.manager;
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
      this.resetRepositories(); // Reset so new instances are created for next transaction
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
      this.resetRepositories();
    }
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    if (this.entityManager && this.queryRunnerInitialized) {
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
      this.logger.log('Transaction committed successfully');
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction failed, rolling back', error);
      throw error;
    } finally {
      await queryRunner.release();
      this.entityManager = null;
      this.queryRunnerInitialized = false;
      this.resetRepositories();
    }
  }
}
