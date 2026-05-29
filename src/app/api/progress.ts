import type {
  Achievement,
  BodyMetricEntry,
  ExerciseProgressEntry,
  ProgressOverview,
} from "../types/progress";
import { apiRequest } from "./client";

export function getProgressOverview() {
  return apiRequest<ProgressOverview>("/api/v1/trainees/progress/overview");
}

export function getBodyMetrics() {
  return apiRequest<BodyMetricEntry[]>("/api/v1/trainees/progress/body-metrics");
}

export function createBodyMetric(request: Partial<BodyMetricEntry>) {
  return apiRequest<BodyMetricEntry>("/api/v1/trainees/progress/body-metrics", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getExerciseProgress() {
  return apiRequest<ExerciseProgressEntry[]>("/api/v1/trainees/progress/exercises");
}

export function createExerciseProgress(request: Partial<ExerciseProgressEntry>) {
  return apiRequest<ExerciseProgressEntry>("/api/v1/trainees/progress/exercises", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getAchievements() {
  return apiRequest<Achievement[]>("/api/v1/trainees/progress/achievements");
}

export function getProgressStreak() {
  return apiRequest<{ streakDays: number }>("/api/v1/trainees/progress/streak");
}

export function getProgressHeatmap() {
  return apiRequest<Array<{ date: string; value: number }>>("/api/v1/trainees/progress/heatmap");
}

