import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SagaInstance } from 'src/core/domain/saga/entity/saga-instance.entity';
import { SagaType } from 'src/core/domain/saga/enum/saga-type.enum';
import { ISagaInstanceRepository } from 'src/core/domain/saga/repository/saga-instance.repository';
import { CorrelationId } from 'src/core/domain/saga/value-object/correlation-id.vo';
import { SagaId } from 'src/core/domain/saga/value-object/saga-id.vo';
import { SagaInstanceSchema } from '../entities/saga-instance.schema';
import { Repository } from 'typeorm';
import { PersistenceSagaInstanceMapper } from '../mappers/persistence-saga-instance.mapper';

@Injectable()
export class SagaInstanceRepository implements ISagaInstanceRepository {
  constructor(
    @InjectRepository(SagaInstanceSchema)
    private readonly ormRepository: Repository<SagaInstanceSchema>,
    private readonly mapper: PersistenceSagaInstanceMapper,
  ) {}

  async findById<T extends SagaType>(
    id: SagaId,
  ): Promise<SagaInstance<T> | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        uuid: id.toValue(),
      },
    });

    return schema ? this.mapper.toDomain<T>(schema) : null;
  }

  async findByCorrelationId<T extends SagaType>(
    correlationId: CorrelationId,
  ): Promise<SagaInstance<T> | null> {
    const schema = await this.ormRepository.findOne({
      where: {
        correlationId: correlationId.toValue(),
      },
    });

    return schema ? this.mapper.toDomain(schema) : null;
  }

  async findActiveSagaByType<T extends SagaType>(
    sagaType: SagaType,
  ): Promise<SagaInstance<T>[]> {
    const schemas = await this.ormRepository.find({
      where: {
        sagaType,
      },
    });

    return schemas.map((schema) => this.mapper.toDomain<T>(schema));
  }

  async persist<T extends SagaType>(saga: SagaInstance<T>): Promise<void> {
    const persistence = this.mapper.toPersistence<T>(saga);

    await this.ormRepository.save(persistence);
  }
}
