import type {
  ChangeSubscriptionPlanRequest,
  CurrentSubscription,
  SubscriptionBillingCycle,
  SubscriptionCatalog,
  SubscriptionChange,
} from "../types/subscription";
import { apiRequest } from "./client";

function billingQuery(billingCycle?: SubscriptionBillingCycle) {
  return billingCycle ? `?billingCycle=${encodeURIComponent(billingCycle)}` : "";
}

export function getSubscriptionPackages(billingCycle?: SubscriptionBillingCycle) {
  return apiRequest<SubscriptionCatalog>(`/api/v1/subscriptions/packages${billingQuery(billingCycle)}`);
}

export function getTraineeSubscriptionCatalog(billingCycle?: SubscriptionBillingCycle) {
  return apiRequest<SubscriptionCatalog>(`/api/v1/subscriptions/trainee/catalog${billingQuery(billingCycle)}`);
}

export function getCoachSubscriptionCatalog(billingCycle?: SubscriptionBillingCycle) {
  return apiRequest<SubscriptionCatalog>(`/api/v1/subscriptions/coach/catalog${billingQuery(billingCycle)}`);
}

export function getCurrentSubscription() {
  return apiRequest<CurrentSubscription>("/api/v1/subscriptions/me");
}

export function purchaseSubscription(request: ChangeSubscriptionPlanRequest) {
  return apiRequest<SubscriptionChange>("/api/v1/subscriptions/purchase", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function changeSubscription(request: ChangeSubscriptionPlanRequest) {
  return apiRequest<SubscriptionChange>("/api/v1/subscriptions/me", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function changeCoachSubscription(request: ChangeSubscriptionPlanRequest) {
  return apiRequest<SubscriptionChange>("/api/v1/subscriptions/coach/plan", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

