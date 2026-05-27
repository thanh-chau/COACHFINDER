export type BookingType = "ONLINE" | "OFFLINE";
export type BookingDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface CreateBookingRequest {
  coachId: number;
  startDate: string;
  endDate: string;
  dayOfWeek: BookingDay;
  startTime: string;
  endTime: string;
  type: BookingType;
  note?: string;
}

export interface BookingResponse extends CreateBookingRequest {
  id: number;
  coachName?: string;
  traineeName?: string;
  price?: number;
  status?: string;
  paymentSettled?: boolean;
  settledAmount?: number;
  adminCommissionAmount?: number;
  coachPayoutAmount?: number;
}

export interface BookingListItem {
  id: number;
  coachName?: string;
  traineeName?: string;
  sport?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: BookingType;
  price?: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}
