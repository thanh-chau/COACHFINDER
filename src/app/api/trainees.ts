import type { Trainee } from "../types/trainee";
import { apiRequest } from "./client";

export function searchMyTrainees(keyword = "") {
  return apiRequest<Trainee[]>(`/api/trainees/my-trainees/search?keyword=${encodeURIComponent(keyword)}`, {
    acceptDataWhenSuccessFalse: true,
  });
}
