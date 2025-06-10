import { OrderProcessingSagaStep } from '../enum/order-processing-saga-step.enum';
import { SagaType } from '../enum/saga-type.enum';
import { OrderProcessingSagaPayload } from './order-processing-saga-payload.interface';

export interface SagaTypeMap {
  [SagaType.PLACE_ORDER]: {
    steps: OrderProcessingSagaStep;
    payload: OrderProcessingSagaPayload;
  };
}
