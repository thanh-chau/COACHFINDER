import type {
  CoachAnalyticsOverview,
  CoachChartPoint,
  CoachIncomeOverview,
  CoachStudentDetail,
  CoachStudentNote,
  CoachStudentProgress,
  CoachStudentSession,
  CoachStudentSummary,
  CoachStudentTask,
  CoachTopStudent,
} from "../types/coachWorkspace";
import type { WalletTransaction } from "../types/wallet";
import { apiRequest } from "./client";

export const coachWorkspaceApi = {
  getIncomeOverview: () => apiRequest<CoachIncomeOverview>("/api/v1/coach/income/overview"),
  getIncomeTransactions: () => apiRequest<WalletTransaction[]>("/api/v1/coach/income/transactions"),
  getMonthlyChart: () => apiRequest<CoachChartPoint[]>("/api/v1/coach/income/monthly-chart"),
  getTopStudents: () => apiRequest<CoachTopStudent[]>("/api/v1/coach/income/top-students"),
  getPayouts: () => apiRequest<WalletTransaction[]>("/api/v1/coach/income/payouts"),
  getAnalyticsOverview: () => apiRequest<CoachAnalyticsOverview>("/api/v1/coach/analytics/overview"),
  getBookingAnalytics: () => apiRequest<CoachChartPoint[]>("/api/v1/coach/analytics/bookings"),
  getRevenueAnalytics: () => apiRequest<CoachChartPoint[]>("/api/v1/coach/analytics/revenue"),
  getStudentsProgress: () => apiRequest<CoachStudentProgress[]>("/api/v1/coach/analytics/students-progress"),
  getVideoAnalytics: () => apiRequest<CoachChartPoint[]>("/api/v1/coach/analytics/videos"),
  getProfileViews: () => apiRequest<CoachChartPoint[]>("/api/v1/coach/analytics/profile-views"),
  getStudents: () => apiRequest<CoachStudentSummary[]>("/api/v1/coach/students"),
  getStudent: (traineeId: number) => apiRequest<CoachStudentDetail>(`/api/v1/coach/students/${traineeId}`),
  getStudentSessions: (traineeId: number) => apiRequest<CoachStudentSession[]>(`/api/v1/coach/students/${traineeId}/sessions`),
  getStudentProgress: (traineeId: number) => apiRequest<CoachStudentProgress>(`/api/v1/coach/students/${traineeId}/progress`),
  getTasks: (traineeId: number) => apiRequest<CoachStudentTask[]>(`/api/v1/coach/students/${traineeId}/tasks`),
  createTask: (traineeId: number, request: { title: string; description?: string; dueDate?: string; completed?: boolean }) =>
    apiRequest<CoachStudentTask>(`/api/v1/coach/students/${traineeId}/tasks`, {
      method: "POST",
      body: JSON.stringify(request),
    }),
  updateTask: (traineeId: number, taskId: number, request: { title: string; description?: string; dueDate?: string; completed?: boolean }) =>
    apiRequest<CoachStudentTask>(`/api/v1/coach/students/${traineeId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    }),
  deleteTask: (traineeId: number, taskId: number) =>
    apiRequest<void>(`/api/v1/coach/students/${traineeId}/tasks/${taskId}`, {
      method: "DELETE",
      allowEmptyData: true,
    }),
  getNotes: (traineeId: number) => apiRequest<CoachStudentNote[]>(`/api/v1/coach/students/${traineeId}/notes`),
  createNote: (traineeId: number, request: { title?: string; content: string }) =>
    apiRequest<CoachStudentNote>(`/api/v1/coach/students/${traineeId}/notes`, {
      method: "POST",
      body: JSON.stringify(request),
    }),
  updateNote: (traineeId: number, noteId: number, request: { title?: string; content: string }) =>
    apiRequest<CoachStudentNote>(`/api/v1/coach/students/${traineeId}/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify(request),
    }),
  deleteNote: (traineeId: number, noteId: number) =>
    apiRequest<void>(`/api/v1/coach/students/${traineeId}/notes/${noteId}`, {
      method: "DELETE",
      allowEmptyData: true,
    }),
};

