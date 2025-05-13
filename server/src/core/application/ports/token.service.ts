export const TOKEN_SERVICE = Symbol('ITokenService');

export interface TokenPayload {
  sub: string; // User ID (subject)
  customerId: string | null;
  // roles: string[]; // User roles
  // Add other relevant payload data (e.g., email)
}

export interface ITokens {
  accessToken: string;
  // refreshToken?: string; // Optional: If implementing refresh tokens
}

export interface ITokenService {
  generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<ITokens>;
  // validateAccessToken?(token: string): Promise<TokenPayload | null>; // Optional for verification logic if needed here
}
