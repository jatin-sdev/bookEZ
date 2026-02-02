import { jwtDecode } from 'jwt-decode';

export interface JwtAccessPayload {
  id: string;
  role: 'ADMIN' | 'USER';
  iat?: number;
  exp?: number;
}

/**
 * Decodes a JWT access token and returns the payload
 * @param token - The JWT access token
 * @returns The decoded payload containing user id and role
 */
export function decodeAccessToken(token: string): JwtAccessPayload {
  return jwtDecode<JwtAccessPayload>(token);
}

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token
 * @returns true if the token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return false;
    
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
