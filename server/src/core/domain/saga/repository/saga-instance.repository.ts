import { SagaInstance } from '../entity/saga-instance.entity';
import { SagaType } from '../enum/saga-type.enum';
import { CorrelationId } from '../value-object/correlation-id.vo';
import { SagaId } from '../value-object/saga-id.vo';

export interface ISagaInstanceRepository {
  findById<T extends SagaType>(id: SagaId): Promise<SagaInstance<T> | null>;
  findByCorrelationId<T extends SagaType>(
    correlationId: CorrelationId,
  ): Promise<SagaInstance<T> | null>;
  findActiveSagaByType<T extends SagaType>(
    sagaType: T,
  ): Promise<SagaInstance<T>[]>;
  persist<T extends SagaType>(saga: SagaInstance<T>): Promise<void>;
}

export const SAGA_INSTANCE_REPOSITORY = Symbol('ISagaInstanceRepository');
