import { apiRequest } from "./client";

// Generated API client functions for missing BE endpoints to fulfill "pull all APIs" requirement

export async function adminGetTransaction(id: number) {
  return apiRequest<any>(`/api/v1/admin/transactions/${id}`);
}

export async function adminGetSubscriptionsStats() {
  return apiRequest<any>(`/api/v1/admin/subscriptions/stats`);
}

export async function adminGetPlatformSettings() {
  return apiRequest<any>(`/api/v1/admin/platform-settings`);
}

export async function getCalendarTraineesMonth(params: { month?: number; year?: number } = {}) {
  const q = new URLSearchParams(params as any).toString();
  return apiRequest<any>(`/api/calendar/traines/month${q ? '?' + q : ''}`);
}

export async function getCalendarTraineesWeek(params: { date?: string } = {}) {
  const q = new URLSearchParams(params as any).toString();
  return apiRequest<any>(`/api/calendar/traines/week${q ? '?' + q : ''}`);
}

export async function getCalendarTraineesList() {
  return apiRequest<any>(`/api/calendar/traines/list`);
}

export async function getCategoryById(id: number) {
  return apiRequest<any>(`/api/categories/${id}`);
}

export async function getCoachCalendarWeek(params: { date?: string } = {}) {
  const q = new URLSearchParams(params as any).toString();
  return apiRequest<any>(`/api/coach/calendar/week${q ? '?' + q : ''}`);
}

export async function getCoachCalendarMonth(params: { month?: number; year?: number } = {}) {
  const q = new URLSearchParams(params as any).toString();
  return apiRequest<any>(`/api/coach/calendar/month${q ? '?' + q : ''}`);
}

export async function getTrendingCoaches() {
  return apiRequest<any>(`/api/coaches/trending`);
}

export async function getCoachById(id: number) {
  return apiRequest<any>(`/api/coaches/${id}`);
}

export async function submitCoachReview(data: any) {
  return apiRequest<any>(`/api/coaches/review`, { method: "POST", body: JSON.stringify(data) });
}

export async function createCoachSpecialization(data: any) {
  return apiRequest<any>(`/api/coaches/create/specialization`, { method: "POST", body: JSON.stringify(data) });
}

export async function createCoachCertificate(data: any) {
  return apiRequest<any>(`/api/coaches/create/certificate`, { method: "POST", body: JSON.stringify(data) });
}

export async function getCoachSchedule(scheduleId: number) {
  return apiRequest<any>(`/api/coaches/schedules/${scheduleId}`);
}

export async function searchCoachVideos(params: any = {}) {
  const q = new URLSearchParams(params).toString();
  return apiRequest<any>(`/api/coach/videos/coach/videos/search${q ? '?' + q : ''}`);
}

export async function viewCoachVideo(videoId: number) {
  return apiRequest<any>(`/api/coach/videos/coach/videos/${videoId}/view`, { method: "POST" });
}

export async function getTraineeDashboardStats() {
  return apiRequest<any>(`/api/dashboard/Traine/traines/stats`);
}

export async function getCoachDashboardStats() {
  return apiRequest<any>(`/api/dashboard/Traine/coach/stats`);
}

export async function getVideoCoachDashboard() {
  return apiRequest<any>(`/api/dashboard/Traine/video/coach/dashboard`);
}

export async function getSubscriptionPackages() {
  return apiRequest<any>(`/api/v1/subscriptions/packages`);
}

export async function getTraineeSubscriptionCatalog() {
  return apiRequest<any>(`/api/v1/subscriptions/trainee/catalog`);
}

export async function getCoachSubscriptionCatalog() {
  return apiRequest<any>(`/api/v1/subscriptions/coach/catalog`);
}

export async function getSubscriptionPurchaseHistory() {
  return apiRequest<any>(`/api/v1/subscriptions/purchase-history`);
}

export async function getTrainees() {
  return apiRequest<any>(`/api/trainees`);
}

export async function getTraineeProfile() {
  return apiRequest<any>(`/api/trainees/profile`);
}

export async function getTraineeById(id: number) {
  return apiRequest<any>(`/api/trainees/${id}`);
}

export async function uploadTraineeSubmission(formData: FormData) {
  return apiRequest<any>(`/api/trainee/submissions/upload`, { method: "POST", body: formData });
}

export async function getSubmissionsForVideo(videoId: number) {
  return apiRequest<any>(`/api/trainee/submissions/coach/videos/${videoId}/submissions`);
}

export async function reviewSubmission(submissionId: number, data: any) {
  return apiRequest<any>(`/api/trainee/submissions/coach/submissions/${submissionId}/review`, { method: "PUT", body: JSON.stringify(data) });
}

export async function getUserById(id: number) {
  return apiRequest<any>(`/api/v1/users/${id}`);
}

export async function updatePassword(data: any) {
  return apiRequest<any>(`/api/v1/users/password`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deactivateUser() {
  return apiRequest<any>(`/api/v1/users/deactivate`, { method: "PUT" });
}

export async function activateUser(userId: number) {
  return apiRequest<any>(`/api/v1/users/activate/${userId}`, { method: "PUT" });
}

export async function uploadTraineessVideo(formData: FormData) {
  return apiRequest<any>(`/api/trainess/videos/upload`, { method: "POST", body: formData });
}

export async function getVideos() {
  return apiRequest<any>(`/api/v1/videos`);
}

export async function getCoachVideosDashboard() {
  return apiRequest<any>(`/api/v1/coach/videos/dashboard`);
}

export async function getCoachSubmissions() {
  return apiRequest<any>(`/api/v1/coach/submissions`);
}

export async function payosWebhook(data: any) {
  return apiRequest<any>(`/api/v1/wallets/top-up/payos/webhook`, { method: "POST", body: JSON.stringify(data) });
}

export async function getAdminWithdrawRequests() {
  return apiRequest<any>(`/api/v1/admin/wallets/withdraw-requests`);
}
