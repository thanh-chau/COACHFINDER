export type BookingType = "ONLINE" | "OFFLINE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
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
  coachAvatar?: string;
  traineeName?: string;
  traineeAvatar?: string;
  price?: number;
  status?: string;
  paymentSettled?: boolean;
  settledAmount?: number;
  adminCommissionAmount?: number;
  coachPayoutAmount?: number;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface BookingListItem {
  id: number;
  coachId?: number;
  coachName?: string;
  coachAvatar?: string;
  traineeName?: string;
  traineeAvatar?: string;
  sport?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: BookingType;
  price?: number;
  status?: BookingStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}
