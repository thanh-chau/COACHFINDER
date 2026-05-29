import type { BookingListItem, BookingResponse, CreateBookingRequest } from "../types/booking";
import { apiRequest, rawApiRequest } from "./client";

type LocalTimePayload = {
  hour?: number;
  minute?: number;
  second?: number;
  nano?: number;
};

function formatLocalTime(value?: string | LocalTimePayload) {
  if (!value) return value;
  if (typeof value === "string") return value;
  const hour = String(value.hour ?? 0).padStart(2, "0");
  const minute = String(value.minute ?? 0).padStart(2, "0");
  const second = String(value.second ?? 0).padStart(2, "0");
  return `${hour}:${minute}:${second}`;
}

function normalizeBookingResponse<T extends BookingResponse | BookingListItem>(item: T): T {
  return {
    ...item,
    startTime: formatLocalTime(item.startTime) as T["startTime"],
    endTime: formatLocalTime(item.endTime) as T["endTime"],
  };
}

export function createBooking(request: CreateBookingRequest) {
  return apiRequest<BookingResponse>("/api/bookings", {
    method: "POST",
    body: JSON.stringify({
      ...request,
      startTime: formatLocalTime(request.startTime) as string,
      endTime: formatLocalTime(request.endTime) as string,
    }),
    acceptDataWhenSuccessFalse: true,
  }).then(result => normalizeBookingResponse(result));
}

export function getCoachCalendarBookings() {
  return rawApiRequest<BookingListItem[]>("/api/coach/calendar/list")
    .then(items => items.map(item => normalizeBookingResponse(item)));
}

export function confirmBooking(bookingId: number) {
  return apiRequest<BookingResponse>(`/api/bookings/${bookingId}/confirm`, {
    method: "PUT",
    acceptDataWhenSuccessFalse: true,
  }).then(result => normalizeBookingResponse(result));
}

export function rejectBooking(bookingId: number) {
  return apiRequest<BookingResponse>(`/api/bookings/${bookingId}/reject`, {
    method: "PUT",
    acceptDataWhenSuccessFalse: true,
  }).then(result => normalizeBookingResponse(result));
}

export function cancelBookingByCoach(bookingId: number, reason?: string) {
  return apiRequest<BookingResponse>(`/api/bookings/${bookingId}/cancel-by-coach`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
    acceptDataWhenSuccessFalse: true,
  }).then(result => normalizeBookingResponse(result));
}

export function completeBooking(bookingId: number) {
  return apiRequest<BookingResponse>(`/api/bookings/${bookingId}/complete`, {
    method: "PUT",
    acceptDataWhenSuccessFalse: true,
  }).then(result => normalizeBookingResponse(result));
}

export function cancelBooking(bookingId: number, reason: string) {
  return apiRequest<string>(`/api/bookings/${bookingId}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
    acceptDataWhenSuccessFalse: true,
  });
}

export function getMyBookings() {
  return rawApiRequest<BookingListItem[] | { data?: BookingListItem[] }>("/api/bookings/my")
    .then(payload => {
      const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
      return items.map(item => normalizeBookingResponse(item));
    });
}
