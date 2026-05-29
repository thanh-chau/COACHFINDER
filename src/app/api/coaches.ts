import type { Category, Coach, CoachDetail, CoachPage, CoachSchedule, CoachSearchRequest, CreateCoachProfileRequest, CreateCoachScheduleRequest, UpdateCoachProfileRequest } from "../types/coach";
import { apiRequest } from "./client";

function appendCoachProfileForm(formData: FormData, profile: CreateCoachProfileRequest | UpdateCoachProfileRequest) {
  if (profile.categoryId !== undefined) formData.append("categoryId", String(profile.categoryId));
  if (profile.price !== undefined) formData.append("price", String(profile.price));
  if (profile.experienceYears !== undefined) formData.append("experienceYears", String(profile.experienceYears));
  if (profile.location !== undefined) formData.append("location", profile.location);
  if (profile.teachingType !== undefined) formData.append("teachingType", profile.teachingType);
  if (profile.bio !== undefined) formData.append("bio", profile.bio);
  if (profile.avatar) formData.append("avatar", profile.avatar);
}

export function createCoachProfile(profile: CreateCoachProfileRequest) {
  const formData = new FormData();
  appendCoachProfileForm(formData, profile);

  return apiRequest<Coach>("/api/coaches/profile", {
    method: "POST",
    body: formData,
    acceptDataWhenSuccessFalse: true,
  });
}

export function getCurrentCoachProfile() {
  return apiRequest<CoachDetail>("/api/coaches/me", {
    acceptDataWhenSuccessFalse: true,
  });
}

export function updateCurrentCoachProfile(profile: UpdateCoachProfileRequest) {
  const formData = new FormData();
  appendCoachProfileForm(formData, profile);

  return apiRequest<Coach>("/api/coaches/me", {
    method: "PUT",
    body: formData,
    acceptDataWhenSuccessFalse: true,
  });
}

export function searchCoaches(filters: CoachSearchRequest) {
  return apiRequest<CoachPage>("/api/coaches/search", {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

export function getFeaturedCoaches() {
  return apiRequest<Coach[]>("/api/coaches/featured", {
    acceptDataWhenSuccessFalse: true,
  });
}

export function getCoachDetail(coachId: number) {
  return apiRequest<CoachDetail>(`/api/coaches/coachDetail/${coachId}`, {
    acceptDataWhenSuccessFalse: true,
  });
}

export function getCoachSchedule(coachId: number) {
  return apiRequest<CoachSchedule[]>(`/api/coaches/${coachId}/schedule`, {
    acceptDataWhenSuccessFalse: true,
  });
}

export function getCoachAvailableSlots(coachId: number, date: string) {
  return apiRequest<CoachSchedule[]>(`/api/coaches/${coachId}/available-slots?date=${encodeURIComponent(date)}`, {
    acceptDataWhenSuccessFalse: true,
  });
}

export function getCoachScheduleWithAvailability(coachId: number) {
  return apiRequest<CoachSchedule[]>(`/api/coaches/${coachId}/schedule-with-availability`, {
    acceptDataWhenSuccessFalse: true,
  });
}

export function createCoachSchedule(request: CreateCoachScheduleRequest) {
  return apiRequest<CoachSchedule>("/api/coaches/create/Schedule", {
    method: "POST",
    body: JSON.stringify(request),
    acceptDataWhenSuccessFalse: true,
  });
}

export function getCategories() {
  return apiRequest<Category[]>("/api/categories", {
    acceptDataWhenSuccessFalse: true,
  });
}
