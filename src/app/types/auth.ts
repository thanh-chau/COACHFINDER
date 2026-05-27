export type ApiRole = "TRAINEES" | "COACHES" | "ADMIN";

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  phone?: string;
  email: string;
  role: ApiRole;
  fullName?: string;
}

export interface AuthSession extends AuthResponse {
  coachId?: number;
  avatar?: string;
  category?: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: ApiRole;
}
