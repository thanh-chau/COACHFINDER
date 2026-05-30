import type { WalletTransaction } from "./wallet";

export interface CoachIncomeOverview {
  monthRevenue: number;
  weekRevenue: number;
  totalRevenue: number;
  availableBalance: number;
  pendingWithdrawals: number;
  platformCommission: number;
  completedBookings: number;
}

export interface CoachChartPoint {
  period: string;
  value: number;
  count: number;
}

export interface CoachTopStudent {
  traineeId: number;
  traineeName: string;
  sessions: number;
  revenue: number;
}

export interface CoachAnalyticsOverview {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalStudents: number;
  totalRevenue: number;
  totalVideos: number;
  totalVideoViews: number;
  averageRating: number;
}

export interface CoachStudentSummary {
  traineeId: number;
  userId: number;
  fullName: string;
  avatar: string | null;
  goal: string | null;
  phone: string | null;
  sessions: number;
  completedSessions: number;
  lastSessionDate: string | null;
  weight: number | null;
  height: number | null;
  joinDate: string | null;
  plan: string | null;
  revenue: number;
}

export interface CoachStudentSession {
  bookingId: number;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number | null;
}

export interface CoachStudentProgress {
  traineeId: number;
  totalSessions: number;
  completedSessions: number;
  pendingSubmissions: number;
  reviewedSubmissions: number;
  averageSubmissionScore: number | null;
}

export interface CoachStudentTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoachStudentNote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoachStudentDetail {
  profile: CoachStudentSummary;
  recentSessions: CoachStudentSession[];
  tasks: CoachStudentTask[];
  notes: CoachStudentNote[];
}

export type CoachIncomeTransactions = WalletTransaction[];

