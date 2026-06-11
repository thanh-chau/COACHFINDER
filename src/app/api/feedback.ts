import { apiRequest } from "./client";
import type {
  FeedbackRole,
  PaginatedFeedback,
  WebsiteFeedback,
  WebsiteFeedbackRequest,
} from "../types/feedback";

export function getMyWebsiteFeedback() {
  return apiRequest<WebsiteFeedback>("/api/v1/website-feedback/me");
}

export function saveMyWebsiteFeedback(request: WebsiteFeedbackRequest) {
  return apiRequest<WebsiteFeedback>("/api/v1/website-feedback/me", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function getAdminWebsiteFeedback(params: {
  keyword?: string;
  rating?: number;
  role?: FeedbackRole;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.rating) query.set("rating", String(params.rating));
  if (params.role) query.set("role", params.role);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  return apiRequest<PaginatedFeedback>(
    `/api/v1/admin/website-feedback?${query.toString()}`,
  );
}
