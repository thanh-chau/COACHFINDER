import type { ApiRole, AuthResponse, AuthSession } from "../types/auth";

const AUTH_SESSION_KEY = "coachfinder.auth";
export const AUTH_SESSION_EXPIRED_EVENT = "coachfinder:auth-expired";

function readStorage(storage: Storage) {
  const rawSession = storage.getItem(AUTH_SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    storage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAuthSession() {
  return readStorage(localStorage) ?? readStorage(sessionStorage);
}

export function getAccessToken() {
  return getAuthSession()?.token;
}

export function saveAuthSession(auth: AuthResponse, remember = false) {
  const selectedStorage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(AUTH_SESSION_KEY);
  selectedStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(auth));
}

export function updateAuthSession(updates: Partial<AuthSession>) {
  const storage = localStorage.getItem(AUTH_SESSION_KEY) ? localStorage : sessionStorage;
  const session = readStorage(storage);

  if (session) {
    storage.setItem(AUTH_SESSION_KEY, JSON.stringify({ ...session, ...updates }));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function expireAuthSession() {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export function getDashboardPath(role: ApiRole) {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "COACHES":
      return "/dashboard/coach";
    case "TRAINEES":
      return "/dashboard/learner";
  }
}
