import type { ApiRole } from "./auth";
import type { Wallet, WalletTransactionPage } from "./wallet";

export type GymProfileStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type GymCoachStatus = "ACTIVE" | "REMOVED";

export interface GymProfile {
  id: number;
  ownerId: number;
  ownerName: string | null;
  ownerEmail: string | null;
  name: string;
  address: string | null;
  hotline: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  status: GymProfileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GymCoach {
  id: number;
  coachProfileId: number;
  coachUserId: number;
  coachName: string | null;
  coachEmail: string | null;
  avatarUrl: string | null;
  categoryName: string | null;
  price: number | null;
  rating: number | null;
  status: GymCoachStatus;
  joinedAt: string;
  removedAt: string | null;
}

export interface GymBooking {
  id: number;
  coachProfileId: number | null;
  coachName: string | null;
  traineeName: string | null;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  price: number | null;
  status: string;
  type: string | null;
  paymentSettled: boolean;
  settledAmount: number | null;
  adminCommissionAmount: number | null;
  coachPayoutAmount: number | null;
  payoutRecipientUserId: number | null;
  payoutRecipientRole: ApiRole | null;
  payoutRecipientName: string | null;
  createdAt: string;
  settledAt: string | null;
}

export interface GymOverview {
  profile: GymProfile;
  activeCoachCount: number;
  totalBookingCount: number;
  monthBookingCount: number;
  settledRevenue: number;
  monthSettledRevenue: number;
  platformCommission: number;
  wallet: Wallet;
  coaches: GymCoach[];
  recentBookings: GymBooking[];
}

export interface GymProfileUpdateRequest {
  name?: string;
  address?: string;
  hotline?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
}

export interface GymCoachAddRequest {
  coachProfileId?: number;
  emailOrUsername?: string;
}

export type GymTransactions = WalletTransactionPage;
