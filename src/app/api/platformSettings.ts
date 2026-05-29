import type {
  AdminCommissionSettings,
  AdminPlatformSettings,
  AdminSubscriptionPrices,
} from "../types/platformSettings";
import { apiRequest } from "./client";

export function fetchAdminPlatformSettings() {
  return apiRequest<AdminPlatformSettings>("/api/v1/admin/platform-settings");
}

export function updateAdminCommissionRates(request: AdminCommissionSettings) {
  return apiRequest<AdminCommissionSettings>(
    "/api/v1/admin/platform-settings/commission-rates",
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
  );
}

export function updateAdminSubscriptionPrices(request: AdminSubscriptionPrices) {
  return apiRequest<AdminSubscriptionPrices>(
    "/api/v1/admin/platform-settings/subscription-prices",
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
  );
}

