import type { NotificationItem } from "../types/notification";
import { apiRequest } from "./client";

export function getNotifications() {
  return apiRequest<NotificationItem[]>("/api/v1/notifications");
}

export function getNotificationUnreadCount() {
  return apiRequest<{ unreadCount: number }>("/api/v1/notifications/unread-count");
}

export function markNotificationRead(id: number) {
  return apiRequest<NotificationItem>(`/api/v1/notifications/${id}/read`, {
    method: "PUT",
  });
}

export function markAllNotificationsRead() {
  return apiRequest<void>("/api/v1/notifications/read-all", {
    method: "PUT",
    allowEmptyData: true,
  });
}

export function deleteNotification(id: number) {
  return apiRequest<void>(`/api/v1/notifications/${id}`, {
    method: "DELETE",
    allowEmptyData: true,
  });
}
