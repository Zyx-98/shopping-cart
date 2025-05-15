export interface IWritableRepository<T> {
  persist(entity: T): Promise<T>;
}
