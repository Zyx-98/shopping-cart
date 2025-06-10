import { SagaType } from '../enum/saga-type.enum';
import { SagaTypeMap } from '../interface/saga-type-map.interface';
import { CorrelationId } from '../value-object/correlation-id.vo';
import { SagaId } from '../value-object/saga-id.vo';

export interface SagaInstanceProps<T extends SagaType> {
  id: SagaId;
  sagaType: T;
  correlationId: CorrelationId;
  currentStep: SagaTypeMap[T]['steps'];
  payload: SagaTypeMap[T]['payload'];
  isCompensating?: boolean;
  retries?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SagaInstance<T extends SagaType> {
  private readonly _id: SagaId;
  private readonly _sagaType: T;
  private readonly _correlationId: CorrelationId;
  private _currentStep: SagaTypeMap[T]['steps'];
  private _payload: SagaTypeMap[T]['payload'];
  private _isCompensating: boolean;
  private _retries: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: SagaInstanceProps<T>) {
    this._id = props.id;
    this._sagaType = props.sagaType;
    this._correlationId = props.correlationId;
    this._currentStep = props.currentStep;
    this._payload = props.payload;
    this._isCompensating = props.isCompensating ?? false;
    this._retries = props.retries ?? 0;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): SagaId {
    return this._id;
  }

  get sagaType(): SagaType {
    return this._sagaType;
  }

  get correlationId(): CorrelationId {
    return this._correlationId;
  }

  get payload(): SagaTypeMap[T]['payload'] {
    return this._payload;
  }

  get currentStep(): SagaTypeMap[T]['steps'] {
    return this._currentStep;
  }

  get isCompensating(): boolean {
    return this._isCompensating;
  }

  get retries(): number {
    return this._retries;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create<T extends SagaType>(
    sagaType: T,
    correlationId: CorrelationId,
    initialPayload: SagaTypeMap[T]['payload'],
    initialStep: SagaTypeMap[T]['steps'],
  ): SagaInstance<T> {
    return new SagaInstance<T>({
      id: SagaId.create(),
      sagaType,
      correlationId,
      currentStep: initialStep,
      payload: initialPayload,
    });
  }

  public static reconstitute<T extends SagaType>(props: SagaInstanceProps<T>) {
    return new SagaInstance<T>(props);
  }

  public advanceStep(
    nextStep: SagaTypeMap[T]['steps'],
    updatedPayload?: Partial<SagaTypeMap[T]['payload']>,
  ): void {
    if (this.isCompensating) {
      throw new Error(
        `Cannot advance a saga that is in compensation mode. Saga ID: ${this.id.toString()}`,
      );
    }
    this._currentStep = nextStep;
    if (updatedPayload) {
      this._payload = { ...this.payload, ...updatedPayload };
    }
    this._retries = 0;
    this._updatedAt = new Date();
  }

  public incrementRetry(): void {
    this._retries += 1;
    this._updatedAt = new Date();
  }

  public complete(finalStep: SagaTypeMap[T]['steps']): void {
    this._currentStep = finalStep;
    this._isCompensating = false;
    this._updatedAt = new Date();
  }

  public fail(failureReason: string, finalStep: SagaTypeMap[T]['steps']): void {
    this._currentStep = finalStep;
    this._payload.failureReason = failureReason;
    this._isCompensating = false;
    this._updatedAt = new Date();
  }

  public completeRollback(finalStep: SagaTypeMap[T]['steps']): void {
    this._currentStep = finalStep;
    this._isCompensating = false;
    this._updatedAt = new Date();
  }
}
