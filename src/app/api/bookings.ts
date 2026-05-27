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

export function getMyBookings() {
  return rawApiRequest<BookingListItem[] | { data?: BookingListItem[] }>("/api/bookings/my")
    .then(payload => {
      const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
      return items.map(item => normalizeBookingResponse(item));
    });
}
