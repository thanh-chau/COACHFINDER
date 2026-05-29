export interface VideoItem {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  categoryId: number | null;
  coachName: string | null;
  coachUserId: number | null;
  videoType: string;
  format: string | null;
  resolution: string | null;
  size: number | null;
  duration: number | null;
  difficulty: string | null;
  visibility: string | null;
  viewCount: number;
  likes: number;
  isPremium: boolean;
  liked: boolean;
  saved: boolean;
  tags: string[];
  uploadDate: string | null;
}

export interface VideoAnalytics {
  videoId: number;
  views: number;
  likes: number;
  saves: number;
  submissions: number;
  pendingSubmissions: number;
  averageScore: number | null;
}

export interface CoachVideoSubmission {
  id: number;
  videoId: number;
  videoTitle: string;
  traineeId: number;
  traineeName: string;
  videoUrl: string;
  note: string | null;
  status: string;
  totalScore: number | null;
  feedback: string | null;
  submittedAt: string;
}

export interface ReviewCoachVideoSubmissionRequest {
  totalScore: number;
  feedback: string;
  status?: "REVIEWED" | "APPROVED";
}

export interface AssignCoachVideoStudentsRequest {
  traineeIds: number[];
}

export interface VideoPlaybackEventRequest {
  eventType: "START" | "PROGRESS" | "PAUSE" | "COMPLETE" | "BOOKMARK";
  positionSeconds: number;
  durationSeconds?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface UpdateCoachVideoRequest {
  title?: string;
  description?: string;
  difficulty?: string;
  visibility?: string;
  isPremium?: boolean;
  tags?: string[];
}
