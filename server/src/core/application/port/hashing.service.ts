export const HASHING_SERVICE = Symbol('HASHING_SERVICE');

export interface IHashingService {
  hash(plain: string): Promise<string>;
  compare(plain: string, encrypted: string): Promise<boolean>;
}
