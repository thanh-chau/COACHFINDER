import type { AuthResponse, RegisterRequest } from "../types/auth";
import { apiRequest, rawApiRequest } from "./client";

export interface CurrentUserResponse {
  id: number;
  username: string;
  email: string;
  role: AuthResponse["role"];
  active: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ email, password }),
  });
}

export function registerAccount(request: RegisterRequest) {
  return apiRequest<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify(request),
  });
}

export function getCurrentUser() {
  return apiRequest<CurrentUserResponse>("/api/v1/auth/me");
}

export function logoutAccount() {
  return apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    allowEmptyData: true,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<string>("/api/v1/auth/forgot-password", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ email }),
    acceptDataWhenSuccessFalse: true,
  });
}

export function resetPassword(email: string, otp: string, newPassword: string) {
  return apiRequest<string>("/api/v1/auth/reset-password", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ email, otp, newPassword }),
    acceptDataWhenSuccessFalse: true,
  });
}

export function loginWithGoogle(idToken: string) {
  return rawApiRequest<AuthResponse>("/api/v1/auth/google", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ idToken }),
  });
}

export function loginWithFacebook(accessToken: string) {
  return rawApiRequest<AuthResponse>("/api/v1/auth/facebook", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify({ accessToken }),
  });
}
