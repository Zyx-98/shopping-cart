import { SagaInstance } from 'src/core/domain/saga/entity/saga-instance.entity';
import { SagaInstanceSchema } from '../entities/saga-instance.schema';
import { SagaId } from 'src/core/domain/saga/value-object/saga-id.vo';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { CorrelationId } from 'src/core/domain/saga/value-object/correlation-id.vo';
import { SagaTypeMap } from 'src/core/domain/saga/interface/saga-type-map.interface';

export class PersistenceSagaInstanceMapper {
  public toDomain<T extends SagaType>(
    schema: SagaInstanceSchema,
  ): SagaInstance<T> {
    return SagaInstance.reconstitute<T>({
      id: SagaId.create(schema.uuid),
      sagaType: schema.sagaType as T,
      correlationId: CorrelationId.create(schema.correlationId),
      currentStep: schema.currentStep as SagaTypeMap[SagaType]['steps'],
      payload: schema.payload as SagaTypeMap[SagaType]['payload'],
      isCompensating: schema.isCompensating,
      retries: schema.retries,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  public toPersistence<T extends SagaType>(
    domain: SagaInstance<T>,
  ): SagaInstanceSchema {
    const schema = new SagaInstanceSchema();
    schema.uuid = domain.id.toValue();
    schema.correlationId = domain.correlationId.toValue();
    schema.sagaType = domain.sagaType;
    schema.currentStep = domain.currentStep;
    schema.isCompensating = domain.isCompensating;
    schema.payload = domain.payload;
    schema.retries = domain.retries;
    schema.updatedAt = domain.updatedAt;
    schema.createdAt = domain.createdAt;

    return schema;
  }
}
