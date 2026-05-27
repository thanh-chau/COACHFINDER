import type { AuthResponse, RegisterRequest } from "../types/auth";
import { apiRequest } from "./client";

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
