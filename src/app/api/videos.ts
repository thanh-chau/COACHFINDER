import type {
  AssignCoachVideoStudentsRequest,
  CoachVideoSubmission,
  ReviewCoachVideoSubmissionRequest,
  UpdateCoachVideoRequest,
  VideoAnalytics,
  VideoPlaybackEventRequest,
  VideoItem,
} from "../types/video";
import { apiRequest, rawApiRequest } from "./client";

export function getVideos(params: { keyword?: string; type?: string; coachId?: number } = {}) {
  const query = new URLSearchParams();
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.type) query.append("type", params.type);
  if (params.coachId !== undefined) query.append("coachId", String(params.coachId));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<any>(`/api/v1/videos${suffix}`).then(res => res.data || res);
}

export function getVideo(id: number) {
  return apiRequest<any>(`/api/v1/videos/${id}`).then(res => res.data || res);
}

export function likeVideo(id: number) {
  return apiRequest<VideoItem>(`/api/v1/videos/${id}/like`, { method: "POST" });
}

export function unlikeVideo(id: number) {
  return apiRequest<VideoItem>(`/api/v1/videos/${id}/like`, { method: "DELETE" });
}

export function saveVideo(id: number) {
  return apiRequest<VideoItem>(`/api/v1/videos/${id}/save`, { method: "POST" });
}

export function unsaveVideo(id: number) {
  return apiRequest<VideoItem>(`/api/v1/videos/${id}/save`, { method: "DELETE" });
}

export function getSavedVideos() {
  return apiRequest<any>("/api/v1/videos/saved").then(res => res.data || res);
}

export function getMyVideoSubmissions() {
  return apiRequest<CoachVideoSubmission[]>("/api/v1/videos/submissions/my");
}

export function submitVideoForReview(videoId: number, request: { file: File; note?: string }) {
  const formData = new FormData();
  formData.append("file", request.file);
  if (request.note) formData.append("note", request.note);
  return apiRequest<CoachVideoSubmission>(`/api/v1/videos/${videoId}/submissions`, {
    method: "POST",
    body: formData,
  });
}

export function updateCoachVideo(id: number, request: UpdateCoachVideoRequest) {
  return apiRequest<VideoItem>(`/api/v1/coach/videos/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function uploadCoachVideo(request: {
  coachId: number;
  title: string;
  format: string;
  resolution: string;
  tags: string[];
  videoType: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("coachId", String(request.coachId));
  formData.append("title", request.title);
  formData.append("format", request.format);
  formData.append("resolution", request.resolution);
  if (request.tags && request.tags.length > 0) {
    request.tags.forEach(tag => formData.append("tags", tag));
  } else {
    formData.append("tags", "chung");
  }
  formData.append("videoType", request.videoType);
  formData.append("file", request.file);

  return rawApiRequest<VideoItem>("/api/coach/videos/upload", {
    method: "POST",
    body: formData,
  });
}

export function deleteCoachVideo(id: number) {
  return apiRequest<void>(`/api/v1/coach/videos/${id}`, {
    method: "DELETE",
    allowEmptyData: true,
  });
}

export function getCoachVideoAnalytics(id: number) {
  return apiRequest<VideoAnalytics>(`/api/v1/coach/videos/${id}/analytics`);
}

export function getCoachSubmissions(status?: string) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<CoachVideoSubmission[]>(`/api/v1/coach/submissions${suffix}`);
}

export function getPendingCoachSubmissions() {
  return apiRequest<CoachVideoSubmission[]>("/api/v1/coach/submissions/pending");
}

export function reviewCoachSubmission(id: number, request: ReviewCoachVideoSubmissionRequest) {
  return apiRequest<CoachVideoSubmission>(`/api/v1/coach/submissions/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function assignCoachVideoStudents(id: number, request: AssignCoachVideoStudentsRequest) {
  return apiRequest<VideoItem>(`/api/v1/coach/videos/${id}/assignments`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function recordVideoPlaybackEvent(id: number, request: VideoPlaybackEventRequest) {
  return apiRequest<void>(`/api/v1/videos/${id}/events`, {
    method: "POST",
    body: JSON.stringify(request),
    allowEmptyData: true,
  });
}
