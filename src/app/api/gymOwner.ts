import type {
  GymBooking,
  GymCoach,
  GymCoachAddRequest,
  GymOverview,
  GymProfile,
  GymProfileStatus,
  GymProfileUpdateRequest,
  GymTransactions,
} from "../types/gymOwner";
import type { Wallet } from "../types/wallet";
import { apiRequest } from "./client";

export function getGymOwnerOverview() {
  return apiRequest<GymOverview>("/api/v1/gym-owner/overview");
}

export function getGymOwnerProfile() {
  return apiRequest<GymProfile>("/api/v1/gym-owner/profile");
}

export function updateGymOwnerProfile(request: GymProfileUpdateRequest) {
  return apiRequest<GymProfile>("/api/v1/gym-owner/profile", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function getGymOwnerCoaches() {
  return apiRequest<GymCoach[]>("/api/v1/gym-owner/coaches");
}

export function addGymOwnerCoach(request: GymCoachAddRequest) {
  return apiRequest<GymCoach>("/api/v1/gym-owner/coaches", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function removeGymOwnerCoach(coachProfileId: number) {
  return apiRequest<GymCoach>(`/api/v1/gym-owner/coaches/${coachProfileId}/remove`, {
    method: "PATCH",
  });
}

export function getGymOwnerBookings() {
  return apiRequest<GymBooking[]>("/api/v1/gym-owner/bookings");
}

export function getGymOwnerWallet() {
  return apiRequest<Wallet>("/api/v1/gym-owner/wallet");
}

export function getGymOwnerTransactions(page = 0, size = 10) {
  return apiRequest<GymTransactions>(`/api/v1/gym-owner/transactions?page=${page}&size=${size}`);
}

export function getAdminGyms(status?: GymProfileStatus | "all") {
  const suffix = status && status !== "all" ? `?status=${status}` : "";
  return apiRequest<GymProfile[]>(`/api/v1/admin/gyms${suffix}`);
}

export function updateAdminGymStatus(id: number, status: GymProfileStatus) {
  return apiRequest<GymProfile>(`/api/v1/admin/gyms/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function adminRemoveGymCoach(gymId: number, coachProfileId: number) {
  return apiRequest<GymCoach>(`/api/v1/admin/gyms/${gymId}/coaches/${coachProfileId}/remove`, {
    method: "PATCH",
  });
}
