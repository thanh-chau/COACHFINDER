import type { Category, Coach, CoachDetail, CoachPage, CoachSchedule, CoachSearchRequest, CreateCoachProfileRequest, CreateCoachScheduleRequest } from "../types/coach";
import { apiRequest } from "./client";

export function createCoachProfile(profile: CreateCoachProfileRequest) {
  const formData = new FormData();
  formData.append("categoryId", String(profile.categoryId));
  formData.append("price", String(profile.price));
  formData.append("experienceYears", String(profile.experienceYears));
  formData.append("location", profile.location);
  formData.append("teachingType", profile.teachingType);
  formData.append("bio", profile.bio);
  formData.append("avatar", profile.avatar);

  return apiRequest<Coach>("/api/coaches/profile", {
    method: "POST",
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
