export type UserRole = "ADMIN" | "USER";

export interface JwtAccessPayload {
  id: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  id: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
