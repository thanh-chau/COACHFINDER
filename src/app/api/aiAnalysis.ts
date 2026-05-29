import type {
  AiAnalysisFeedbackRequest,
  AiAnalysisJob,
  CreateAiAnalysisRequest,
} from "../types/aiAnalysis";
import { apiRequest } from "./client";

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
