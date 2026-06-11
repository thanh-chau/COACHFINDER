import { expireAuthSession, getAccessToken } from "../utils/authSession";
import { clearApiCache, resolveCachedApiData } from "../stores/apiCacheStore";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
  acceptDataWhenSuccessFalse?: boolean;
  allowEmptyData?: boolean;
}

const API_BASE_URLS = (
  import.meta.env.VITE_API_BASE_URLS
    ? String(import.meta.env.VITE_API_BASE_URLS).split(",").map(value => value.trim()).filter(Boolean)
    : [
        import.meta.env.VITE_API_BASE_URL || "https://be.minhthien.io.vn",
        "https://www.be.minhthien.io.vn",
      ]
);

function getRequestMethod(options: RequestInit) {
  return (options.method || "GET").toUpperCase();
}

function shouldUseApiCache(options: RequestInit) {
  return getRequestMethod(options) === "GET";
}

function getApiCacheKey(path: string, authenticated: boolean, token?: string) {
  return `${authenticated ? token || "anonymous" : "public"}:${path}`;
}

async function fetchFromApiBaseUrls(path: string, init: RequestInit) {
  let lastError: unknown;

  for (const baseUrl of API_BASE_URLS) {
    try {
      return await fetch(`${baseUrl}${path}`, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  const {
    authenticated = true,
    acceptDataWhenSuccessFalse = false,
    allowEmptyData = false,
    headers,
    ...requestOptions
  } = options;
  const token = authenticated ? getAccessToken() : undefined;
  const requestHeaders = new Headers(headers);
  const cacheEnabled = shouldUseApiCache(requestOptions);

  if (!(requestOptions.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetchFromApiBaseUrls(path, {
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
  if (response.ok && allowEmptyData && payload?.success !== false) {
    const emptyData = data as T;
    if (!cacheEnabled) {
      clearApiCache();
      return emptyData;
    }

    return resolveCachedApiData(getApiCacheKey(path, authenticated, token), emptyData);
  }

  if (
    !response.ok ||
    data === undefined ||
    data === null ||
    (!payload?.success && !acceptDataWhenSuccessFalse)
  ) {
    if (response.status === 401) {
      expireAuthSession();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      payload?.message ||
        responseBody ||
        "Yêu cầu không thành công. Vui lòng thử lại.",
    );
  }

  if (!cacheEnabled) {
    clearApiCache();
    return data;
  }

  return resolveCachedApiData(getApiCacheKey(path, authenticated, token), data);
}

export async function rawApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  const { authenticated = true, headers, ...requestOptions } = options;
  const token = authenticated ? getAccessToken() : undefined;
  const requestHeaders = new Headers(headers);
  const cacheEnabled = shouldUseApiCache(requestOptions);

  if (!(requestOptions.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetchFromApiBaseUrls(path, {
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
      expireAuthSession();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new Error(
      (payload as { message?: string } | undefined)?.message ||
        responseBody ||
        "Yêu cầu không thành công. Vui lòng thử lại.",
    );
  }

  const data = payload as T;

  if (!cacheEnabled) {
    clearApiCache();
    return data;
  }

  return resolveCachedApiData(getApiCacheKey(path, authenticated, token), data);
}
