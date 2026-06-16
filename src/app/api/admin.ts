import { apiRequest } from "./client";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: "TRAINEES" | "COACHES" | "ADMIN";
  active: boolean;
  avatarUrl: string | null;
  createdAt: string;
  subscriptionPlanName?: string;
  totalSessions?: number;
  totalSpent?: number;
  totalStudents?: number;
  totalRevenue?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export async function fetchAdminUsers(params: {
  role?: string;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();
  if (params.role) query.append("role", params.role);
  if (params.status && params.status !== "all")
    query.append("status", params.status);
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());

  return apiRequest<PaginatedResponse<AdminUser>>(
    `/api/v1/admin/users?${query.toString()}`,
  );
}

export async function fetchAdminUser(id: number) {
  return apiRequest<AdminUser>(`/api/v1/admin/users/${id}`);
}

export async function updateAdminUserStatus(id: number, active: boolean) {
  return apiRequest<AdminUser>(
    `/api/v1/admin/users/${id}/status?active=${active}`,
    {
      method: "PUT",
    },
  );
}

export interface DashboardOverview {
  totalUsers: number;
  totalCoaches: number;
  totalTrainees: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalTransactions: number;
  todayTransactions: number;
  todayRevenue: number;
  monthRevenue: number;
  platformCommission: number;
  traineeTopUpAmount: number;
  coachTopUpAmount: number;
  traineeFeedbackAverageRating: number;
  traineeFeedbackCount: number;
  coachFeedbackAverageRating: number;
  coachFeedbackCount: number;
}

export async function fetchAdminOverview() {
  return apiRequest<DashboardOverview>("/api/v1/admin/dashboard/overview");
}

export interface RevenueChartPoint {
  period: string;
  revenue: number;
  bookingRevenue: number;
  subscriptionRevenue: number;
  commission: number;
}

export interface AdminAlert {
  type: string;
  severity: string;
  message: string;
  createdAt: string;
}

export async function fetchAdminRevenueChart(range = "month") {
  return apiRequest<RevenueChartPoint[]>(
    `/api/v1/admin/dashboard/revenue-chart?range=${encodeURIComponent(range)}`,
  );
}

export async function deleteAdminUser(id: number) {
  return apiRequest<void>(`/api/v1/admin/users/${id}`, {
    method: "DELETE",
    allowEmptyData: true,
  });
}

export async function fetchAdminRecentTransactions() {
  return apiRequest<AdminTransaction[]>("/api/v1/admin/dashboard/recent-transactions");
}

export async function fetchAdminAlerts() {
  return apiRequest<AdminAlert[]>("/api/v1/admin/dashboard/alerts");
}

export interface AdminTransaction {
  id: number;
  type: string;
  userId: number | null;
  userName: string | null;
  learnerName: string | null;
  coachName: string | null;
  bookingId: number | null;
  bookingType: string | null;
  coachPlanCode: "FREE" | "PRO" | "PREMIUM" | null;
  coachPlanName: string | null;
  commissionRate: number | null;
  amount: number;
  commission: number | null;
  coachPayout: number | null;
  status: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface TuitionCommissionByPlan {
  planCode: "FREE" | "PRO" | "PREMIUM";
  planName: string;
  commissionRate: number;
  transactionCount: number;
  totalTuition: number;
  commission: number;
  coachPayout: number;
}

export interface TuitionTransactionSummary {
  totalAmount: number;
  totalCommission: number;
  totalCoachPayout: number;
  transactionCount: number;
  averageCommissionRate: number;
  breakdownByPlan: TuitionCommissionByPlan[];
}

export async function fetchAdminTransactions(params: {
  status?: string;
  coachPlan?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.coachPlan && params.coachPlan !== "all") query.append("coachPlan", params.coachPlan);
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());

  return apiRequest<PaginatedResponse<AdminTransaction>>(
    `/api/v1/admin/transactions?${query.toString()}`,
  );
}

export async function fetchAdminTransactionSummary(params: {
  status?: string;
  coachPlan?: string;
  keyword?: string;
}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.coachPlan && params.coachPlan !== "all") query.append("coachPlan", params.coachPlan);
  if (params.keyword) query.append("keyword", params.keyword);

  return apiRequest<TuitionTransactionSummary>(
    `/api/v1/admin/transactions/summary?${query.toString()}`,
  );
}

export interface AdminSubscription {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: "TRAINEES" | "COACHES";
  planCode: "FREE" | "PRO" | "PREMIUM";
  planName: string;
  billingCycle: "MONTHLY" | "YEARLY";
  active: boolean;
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  monthlyPrice: number;
  billingPrice: number;
  startedAt: string;
  expiresAt: string | null;
  updatedAt: string;
}

export interface SubscriptionPlanSummary {
  role: "TRAINEES" | "COACHES";
  planCode: "FREE" | "PRO" | "PREMIUM";
  planName: string;
  count: number;
  percentage: number;
}

export interface SubscriptionRevenueSummary {
  role: "TRAINEES" | "COACHES";
  planCode: "FREE" | "PRO" | "PREMIUM";
  planName: string;
  count: number;
  monthlyPrice: number;
  revenue: number;
}

export interface SubscriptionRenewalAlert {
  role: "TRAINEES" | "COACHES";
  planCode: "FREE" | "PRO" | "PREMIUM";
  planName: string;
  count: number;
}

export interface SubscriptionSummary {
  learnerPlans: SubscriptionPlanSummary[];
  coachPlans: SubscriptionPlanSummary[];
  revenueRows: SubscriptionRevenueSummary[];
  renewalAlerts: SubscriptionRenewalAlert[];
  totalMonthlyRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
}

export async function fetchAdminSubscriptions(params: {
  role?: string;
  plan?: string;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();
  if (params.role) query.append("role", params.role);
  if (params.plan && params.plan !== "all") query.append("plan", params.plan);
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());

  return apiRequest<PaginatedResponse<AdminSubscription>>(
    `/api/v1/admin/subscriptions?${query.toString()}`,
  );
}

export async function fetchAdminSubscriptionSummary() {
  return apiRequest<SubscriptionSummary>("/api/v1/admin/subscriptions/summary");
}

export async function updateAdminSubscription(
  userId: number,
  request: {
    planCode?: "FREE" | "PRO" | "PREMIUM";
    billingCycle?: "MONTHLY" | "YEARLY";
    active?: boolean;
    expiresAt?: string | null;
  },
) {
  return apiRequest<AdminSubscription>(`/api/v1/admin/subscriptions/${userId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export interface FinanceOverview {
  totalRevenue: number;
  monthRevenue: number;
  weekRevenue: number;
  subscriptionRevenue: number;
  bookingRevenue: number;
  platformCommission: number;
  coachPayout: number;
}

export interface CommissionByPlan {
  planCode: "FREE" | "PRO" | "PREMIUM";
  commission: number;
  transactionCount: number;
}

export interface RevenueBySource {
  source: string;
  revenue: number;
  transactionCount: number;
}

export interface TopCoach {
  coachId: number;
  coachName: string;
  completedBookings: number;
  revenue: number;
  payout: number;
}

export async function fetchAdminFinanceOverview() {
  return apiRequest<FinanceOverview>("/api/v1/admin/finance/overview");
}

export async function fetchAdminMonthlyRevenue() {
  return apiRequest<RevenueChartPoint[]>("/api/v1/admin/finance/monthly-revenue");
}

export async function fetchAdminCommissionByPlan() {
  return apiRequest<CommissionByPlan[]>("/api/v1/admin/finance/commission-by-plan");
}

export async function fetchAdminRevenueBySource() {
  return apiRequest<RevenueBySource[]>("/api/v1/admin/finance/revenue-by-source");
}

export async function fetchAdminTopCoaches() {
  return apiRequest<TopCoach[]>("/api/v1/admin/finance/top-coaches");
}

export interface AdminWalletOverview {
  wallet: {
    walletId: number;
    userId: number;
    ownerName: string;
    role: string;
    balance: number;
    currency: string;
    updatedAt: string;
  };
  totalTransactions: number;
  recentTransactions: Array<{
    id: number;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string | null;
    withdrawalStatus: string | null;
    createdAt: string;
  }>;
}

export interface AdminWalletWithdrawRequest {
  transactionId: number;
  walletId?: number;
  userId: number;
  ownerName: string;
  role: string;
  type?: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  currency: string;
  description?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  bankCode: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolderName: string | null;
  bankBranch: string | null;
  withdrawalStatus: string;
  adminNote: string | null;
  processedByName: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface AdminWalletHistoryItem {
  id: string;
  source: string;
  userId: number;
  username: string | null;
  ownerName: string | null;
  email: string | null;
  role: "TRAINEES" | "COACHES" | "ADMIN";
  type: "TOP_UP" | "WITHDRAWAL";
  amount: number;
  balanceBefore: number | null;
  balanceAfter: number | null;
  currency: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED" | "REJECTED";
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  bankCode: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolderName: string | null;
  bankBranch: string | null;
  adminNote: string | null;
  processedByUserId: number | null;
  processedByName: string | null;
  processedAt: string | null;
  createdAt: string;
}

export async function fetchAdminWalletOverview() {
  return apiRequest<AdminWalletOverview>("/api/v1/admin/wallets/overview");
}

export async function fetchAdminWalletTransactions(params: {
  keyword?: string;
  role?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.role && params.role !== "all") query.append("role", params.role);
  if (params.type && params.type !== "all") query.append("type", params.type);
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.from) query.append("from", params.from);
  if (params.to) query.append("to", params.to);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());

  return apiRequest<PaginatedResponse<AdminWalletHistoryItem>>(
    `/api/v1/admin/wallets/transactions?${query.toString()}`,
  );
}

export async function fetchAdminWalletWithdrawRequests(status?: string) {
  const suffix = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<AdminWalletWithdrawRequest[]>(`/api/v1/admin/wallets/withdraw-requests${suffix}`);
}

export async function approveAdminWalletWithdrawRequest(transactionId: number, note?: string) {
  return apiRequest<AdminWalletWithdrawRequest>(
    `/api/v1/admin/wallets/withdraw-requests/${transactionId}/approve`,
    {
      method: "PATCH",
      body: JSON.stringify({ note }),
    },
  );
}

export async function rejectAdminWalletWithdrawRequest(transactionId: number, note?: string) {
  return apiRequest<AdminWalletWithdrawRequest>(
    `/api/v1/admin/wallets/withdraw-requests/${transactionId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ note }),
    },
  );
}
