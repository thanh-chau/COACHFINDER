import type {
  AiAnalysisFeedbackRequest,
  AiAnalysisJob,
  CreateAiAnalysisRequest,
} from "../types/aiAnalysis";
import { apiRequest } from "./client";

const AI_SERVICE_BASE_URL = "https://ai.minhthien.io.vn";

export interface SportCompanionExercise {
  name: string;
  display_name_vi?: string;
  category?: string;
  equipment?: string[];
  movement_type?: string;
  primary_joints?: string[];
  issue_codes?: string[];
}

export interface SportCompanionIssue {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message_vi: string;
  frame_indices?: number[];
  recommendation?: string;
}

export interface SportCompanionAspect {
  key: string;
  title: string;
  status?: "good" | "warning" | "critical" | "unknown";
  score?: number | null;
  actual?: string;
  ideal?: string;
  message?: string;
  recommendation?: string;
}

export interface SportCompanionFeedback {
  overall_summary?: string;
  aspects?: SportCompanionAspect[];
  joint_analysis?: Array<{
    key: string;
    title: string;
    status?: "good" | "warning" | "critical" | "unknown";
    confidence?: number | null;
    message?: string;
  }>;
  priority_items?: Array<{
    title: string;
    message?: string;
    recommendation?: string;
  }>;
  suggestions?: string[];
}

export interface SportCompanionReport {
  exercise: string;
  pose_model: string;
  total_reps?: number;
  passed_reps?: number;
  avg_score?: number;
  session_summary?: string | null;
  ai_feedback?: SportCompanionFeedback | null;
  reps?: Array<{
    rep_index: number;
    score?: number | null;
    passed?: boolean | null;
    inconclusive?: boolean;
    inconclusive_reason?: string | null;
    issues?: SportCompanionIssue[];
    metrics?: Record<string, number | null>;
  }>;
  warnings?: Array<{
    code?: string;
    message?: string;
  }>;
}

export function fetchSportCompanionExercises() {
  return fetch(`${AI_SERVICE_BASE_URL}/exercises`).then(async response => {
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(text || "Failed to load AI exercises.");
    }

    if (typeof payload === "object" && payload && "exercises" in payload) {
      return (payload as { exercises: SportCompanionExercise[] }).exercises;
    }

    return [];
  });
}

export function analyzeSportCompanionVideo(request: {
  video: File;
  exercise: string;
  skeletonOutput?: "full" | "sampled" | "keyframes" | "none";
  enrich?: boolean;
}) {
  const formData = new FormData();
  formData.append("video", request.video);
  formData.append("exercise", request.exercise);
  formData.append("skeleton_output", request.skeletonOutput ?? "keyframes");
  formData.append("enrich", String(request.enrich ?? true));

  return fetch(`${AI_SERVICE_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  }).then(async response => {
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(
        typeof payload === "object" && payload && "detail" in payload
          ? JSON.stringify((payload as { detail: unknown }).detail)
          : text || "AI analysis request failed.",
      );
    }

    return payload as SportCompanionReport;
  });
}

export function createAiAnalysisJob(request: CreateAiAnalysisRequest) {
  const formData = new FormData();
  formData.append("sport", request.sport);
  formData.append("technique", request.technique);
  formData.append("video", request.video);

  return apiRequest<AiAnalysisJob>("/api/v1/ai/analysis/jobs", {
    method: "POST",
    body: formData,
  });
}

export function getAiAnalysisJob(jobId: number) {
  return apiRequest<AiAnalysisJob>(`/api/v1/ai/analysis/jobs/${jobId}`);
}

export function getAiAnalysisHistory(params: { page?: number; size?: number } = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.append("page", String(params.page));
  if (params.size !== undefined) query.append("size", String(params.size));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<AiAnalysisJob[]>(`/api/v1/ai/analysis/jobs${suffix}`);
}

export function submitAiAnalysisFeedback(jobId: number, request: AiAnalysisFeedbackRequest) {
  return apiRequest<AiAnalysisJob>(`/api/v1/ai/analysis/jobs/${jobId}/feedback`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
