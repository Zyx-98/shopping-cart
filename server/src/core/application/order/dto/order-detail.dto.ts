import { ApiProperty } from '@nestjs/swagger';
import { OrderLineDto } from './order-line.dto';

export class OrderDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ type: [OrderLineDto] })
  orderLines: OrderLineDto[];

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  canceledAt?: Date | null;

  @ApiProperty()
  completedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;
}
