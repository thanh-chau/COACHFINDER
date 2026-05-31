import type { Trainee, TraineeProfileRequest } from "../types/trainee";
import { apiRequest } from "./client";

function buildTraineeProfileFormData(request: TraineeProfileRequest) {
  const formData = new FormData();

  if (request.goal) formData.append("goal", request.goal);
  if (request.age !== undefined) formData.append("age", String(request.age));
  if (request.weight !== undefined) formData.append("weight", String(request.weight));
  if (request.height !== undefined) formData.append("height", String(request.height));
  if (request.phone) formData.append("phone", request.phone);
  if (request.avatar) formData.append("avatar", request.avatar);

  return formData;
}

export function getMyTraineeProfile() {
  return apiRequest<Trainee>("/api/trainees/me");
}

export function createTraineeProfile(request: TraineeProfileRequest) {
  return apiRequest<Trainee>("/api/trainees/profile", {
    method: "POST",
    body: buildTraineeProfileFormData(request),
  });
}

export function updateMyTraineeProfile(request: TraineeProfileRequest) {
  return apiRequest<Trainee>("/api/trainees/me", {
    method: "PUT",
    body: buildTraineeProfileFormData(request),
  });
}

export function searchMyTrainees(keyword = "") {
  return apiRequest<Trainee[]>(`/api/trainees/my-trainees/search?keyword=${encodeURIComponent(keyword)}`, {
    acceptDataWhenSuccessFalse: true,
  });
}
