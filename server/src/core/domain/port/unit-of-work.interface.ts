import { ICartRepository } from '../cart/repository/cart.repository';
import { ICouponRepository } from '../coupon/repositories/coupon.repository';
import { ICustomerRepository } from '../customer/repository/customer.repository';
import { IInventoryRepository } from '../inventory/repository/inventory.repository';
import { IOrderRepository } from '../order/repository/order.repository';
import { IPaymentRepository } from '../payment/repository/payment.repository';
import { IProductRepository } from '../product/repository/product.repository';
import { IUserRepository } from '../user/repository/user.repository';

export interface IUnitOfWork {
  userRepository: IUserRepository;
  customerRepository: ICustomerRepository;
  cartRepository: ICartRepository;
  couponRepository: ICouponRepository;
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  inventoryRepository: IInventoryRepository;
  paymentRepository: IPaymentRepository;

  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;

  execute<T>(work: () => Promise<T>): Promise<T>;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
