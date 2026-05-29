export type AiAnalysisStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AiAnalysisMetric {
  key: string;
  label: string;
  value: number;
  unit?: string | null;
  severity: "GOOD" | "WARNING" | "ERROR";
}

export interface AiAnalysisIssue {
  bodyPart: string;
  severity: "GOOD" | "WARNING" | "ERROR";
  actualAngle?: number | null;
  idealAngle?: number | null;
  feedback: string;
}

export interface AiAnalysisResult {
  overallScore: number;
  metrics: AiAnalysisMetric[];
  issues: AiAnalysisIssue[];
  recommendations: string[];
  reportUrl?: string | null;
}

export interface AiAnalysisJob {
  id: number;
  sport: string;
  technique: string;
  status: AiAnalysisStatus;
  sourceVideoUrl: string | null;
  createdAt: string;
  completedAt: string | null;
  result: AiAnalysisResult | null;
  errorMessage?: string | null;
}

export interface CreateAiAnalysisRequest {
  sport: string;
  technique: string;
  video: File;
}

export interface AiAnalysisFeedbackRequest {
  rating: number;
  comment?: string;
}
