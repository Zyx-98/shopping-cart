import { v7 } from 'uuid';

export class UniqueEntityId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || v7();
  }

  public static create<T extends UniqueEntityId>(
    this: new (id?: string) => T,
    id?: string,
  ): T {
    return new this(id);
  }

  public equals(id?: UniqueEntityId): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof this.constructor)) {
      return false;
    }
    return id.value === this.value;
  }

  public toString(): string {
    return this.value;
  }

  public toValue(): string {
    return this.value;
  }
}
