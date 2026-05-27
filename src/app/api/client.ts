import { getAccessToken } from "../utils/authSession";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
  acceptDataWhenSuccessFalse?: boolean;
}

const API_BASE_URL = "https://www.minhthien.io.vn";

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { authenticated = true, acceptDataWhenSuccessFalse = false, headers, ...requestOptions } = options;
  const token = authenticated ? getAccessToken() : undefined;
  const requestHeaders = new Headers(headers);

  if (!(requestOptions.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
  }

  let payload: ApiResponse<T> | undefined;
  let responseBody = "";
  try {
    responseBody = await response.text();
    payload = JSON.parse(responseBody) as ApiResponse<T>;
  } catch {
    payload = undefined;
  }

  const data = payload?.data;
  if (!response.ok || data === undefined || data === null || (!payload?.success && !acceptDataWhenSuccessFalse)) {
    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(payload?.message || responseBody || "Yêu cầu không thành công. Vui lòng thử lại.");
  }

  return data;
}

export async function rawApiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { authenticated = true, headers, ...requestOptions } = options;
  const token = authenticated ? getAccessToken() : undefined;
  const requestHeaders = new Headers(headers);

  if (!(requestOptions.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
  }

  const responseBody = await response.text();
  let payload: T | { message?: string } | undefined;
  try {
    payload = JSON.parse(responseBody) as T | { message?: string };
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error((payload as { message?: string } | undefined)?.message || responseBody || "Yêu cầu không thành công. Vui lòng thử lại.");
  }

  return payload as T;
}
