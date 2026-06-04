import { CoachSchedule } from "../components/CoachSchedule";
import { CoachVideoStudio } from "../components/CoachVideoStudio";
import { CoachIncome } from "../components/CoachIncome";
import { CoachStudents } from "../components/CoachStudents";
import { CoachAnalytics } from "../components/CoachAnalytics";
import { CoachMessages } from "../components/CoachMessages";
import { CoachSubscription } from "../components/CoachSubscription";
import { CoachSettings } from "../components/CoachSettings";
import { NotificationBell } from "../components/NotificationBell";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Calendar, Video, DollarSign,
  BarChart2, MessageCircle, Settings, LogOut, Bell,
  ChevronRight, Star, TrendingUp, Plus, Upload,
  Menu, X, Dumbbell, CheckCircle2, Clock, Play,
  Award, Zap, Target, ArrowUpRight, CreditCard
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { clearAuthSession, getAuthSession } from "../utils/authSession";
import { logoutAccount } from "../api/auth";
import { getCoachCalendarBookings } from "../api/bookings";
import { coachWorkspaceApi } from "../api/coachWorkspace";
import { getNotificationUnreadCount } from "../api/notifications";
import { getChatUnreadCount } from "../api/chat";
import type { BookingListItem } from "../types/booking";
import type { CoachAnalyticsOverview, CoachStudentProgress, CoachStudentSummary } from "../types/coachWorkspace";
import type { WalletTransaction } from "../types/wallet";

const STUDENT_1 = "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";
const STUDENT_2 = "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";
const STUDENT_3 = "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100";

type EarningsRow = { month: string; revenue: number };
type DashboardStudentRow = { name: string; sport: string; sessions: number; progress: number; status: "active" | "pending"; avatar: string; lastSession: string; paid: string };
type TodaySessionRow = { student: string; time: string; type: string; status: "done" | "upcoming"; avatar: string };
type RecentPaymentRow = { student: string; amount: string; date: string; type: string };

const DEFAULT_OVERVIEW = {
  totalStudents: 0,
  monthRevenue: 0,
  averageRating: 0.0,
  totalReviews: 0,
  weekSessions: 0,
  todaySessions: 0,
  totalVideos: 0,
  totalVideoViews: 0,
};

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", id: "overview" },
  { icon: Users, label: "Học viên", id: "students" },
  { icon: Calendar, label: "Lịch dạy", id: "schedule" },
  { icon: Video, label: "Video Studio", id: "studio", badge: "Mới" },
  { icon: DollarSign, label: "Thu nhập", id: "income" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: MessageCircle, label: "Tin nhắn", id: "msg" },
  { icon: CreditCard, label: "Gói đăng ký", id: "subscription" },
];

const COACH_DASHBOARD_PATH = "/dashboard/coach";
const COACH_NAV_IDS = new Set([
  ...navItems.map((item) => item.id),
  "settings",
]);

function getCoachViewFromPath(pathname: string) {
  const suffix = pathname.slice(COACH_DASHBOARD_PATH.length).replace(/^\/+/, "");
  const view = decodeURIComponent(suffix.split("/")[0] || "overview");
  return COACH_NAV_IDS.has(view) ? view : "overview";
}
function formatCompactCurrency(amount: number) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
  return String(amount);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

const ACTIVE_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED", "COMPLETED"]);
const UPCOMING_BOOKING_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function isActiveBooking(status?: string | null) {
  return ACTIVE_BOOKING_STATUSES.has(status || "");
}

function isUpcomingBooking(status?: string | null) {
  return UPCOMING_BOOKING_STATUSES.has(status || "");
}

function mapRevenueRows(rows: { period: string; value: number }[]): EarningsRow[] {
  return rows.slice(-6).map(row => ({
    month: row.period,
    revenue: row.value,
  }));
}

function mapDashboardStudents(
  summaries: CoachStudentSummary[],
  progressList: CoachStudentProgress[],
  bookings: BookingListItem[],
): DashboardStudentRow[] {
  const progressById = new Map(progressList.map(item => [item.traineeId, item]));
  const avatars = [STUDENT_1, STUDENT_2, STUDENT_3];
  
  const sorted = [...summaries].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

  return sorted
  .map((student, index) => {
    const progress = progressById.get(student.traineeId);
    const studentBookings = bookings.filter(item => normalizeName(item.traineeName || "") === normalizeName(student.fullName));
    const activeBookings = studentBookings.filter(item => isActiveBooking(item.status));
    const pendingBookings = activeBookings.filter(item => item.status === "PENDING");
    const completedSessions = progress?.completedSessions ?? student.completedSessions ?? 0;
    const hasCompletedHistory = completedSessions > 0 || student.revenue > 0;
    if (!hasCompletedHistory && activeBookings.length === 0) return null;

    const score = progress?.averageSubmissionScore == null ? 0 : Math.round(progress.averageSubmissionScore);

    return {
      name: student.fullName,
      sport: student.goal || "Chưa cập nhật",
      sessions: completedSessions,
      progress: score,
      status: pendingBookings.length ? "pending" : "active",
      avatar: student.avatar || avatars[index % avatars.length],
      lastSession: student.lastSessionDate ? formatRelativeDate(student.lastSessionDate) : "Chưa có",
      paid: "API",
    };
  })
  .filter((student): student is DashboardStudentRow => student !== null);
}

function mapTodaySessions(bookings: BookingListItem[]): TodaySessionRow[] {
  const todayKey = new Date().toISOString().slice(0, 10);
  const source = bookings
    .filter(item => item.date === todayKey && isActiveBooking(item.status))
    .concat(bookings.filter(item => item.date !== todayKey && isUpcomingBooking(item.status)))
    .slice(0, 3);
  const avatars = [STUDENT_1, STUDENT_2, STUDENT_3];

  return source.map((booking, index) => ({
    student: booking.traineeName || "Học viên",
    time: `${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`,
    type: booking.type === "ONLINE" ? "Online" : "Offline",
    status: booking.status === "COMPLETED" ? "done" : "upcoming",
    avatar: booking.traineeAvatar || avatars[index % avatars.length],
  }));
}

function mapRecentPayments(transactions: WalletTransaction[]): RecentPaymentRow[] {
  return transactions
    .filter(item => item.amount > 0)
    .slice(0, 4)
    .map(item => ({
      student: item.processedByName || item.description || "Thanh toán",
      amount: formatCurrency(item.amount),
      date: formatRelativeDate(item.createdAt),
      type: item.referenceType || item.type,
    }));
}

function buildOverviewStats(analytics?: CoachAnalyticsOverview | null, income?: { monthRevenue: number } | null) {
  return {
    ...DEFAULT_OVERVIEW,
    totalStudents: analytics?.totalStudents ?? DEFAULT_OVERVIEW.totalStudents,
    monthRevenue: income?.monthRevenue ?? analytics?.totalRevenue ?? DEFAULT_OVERVIEW.monthRevenue,
    averageRating: analytics?.averageRating ?? DEFAULT_OVERVIEW.averageRating,
    weekSessions: analytics?.confirmedBookings ?? DEFAULT_OVERVIEW.weekSessions,
    totalVideos: analytics?.totalVideos ?? DEFAULT_OVERVIEW.totalVideos,
    totalVideoViews: analytics?.totalVideoViews ?? DEFAULT_OVERVIEW.totalVideoViews,
  };
}

export function CoachDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(() => getCoachViewFromPath(location.pathname));
  const [targetUsername, setTargetUsername] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overview, setOverview] = useState(DEFAULT_OVERVIEW);
  const [earningsRows, setEarningsRows] = useState<EarningsRow[]>([]);
  const [studentRows, setStudentRows] = useState<DashboardStudentRow[]>([]);
  const [sessionRows, setSessionRows] = useState<TodaySessionRow[]>([]);
  const [paymentRows, setPaymentRows] = useState<RecentPaymentRow[]>([]);
  const session = getAuthSession();
  const coachName = session?.fullName?.trim() || session?.username || "Huấn luyện viên";
  const coachInitials = coachName
    .split(/\s+/)
    .slice(-2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();
  const logout = async () => {
    try {
      await logoutAccount();
    } catch {
      // Keep logout reliable even if the API call cannot complete.
    }
    clearAuthSession();
    navigate("/auth");
  };
  useEffect(() => {
    setActiveNav(getCoachViewFromPath(location.pathname));
  }, [location.pathname]);

  const handleNavigate = useCallback((view: string, payload?: string) => {
    const nextView = COACH_NAV_IDS.has(view) ? view : "overview";
    setActiveNav(nextView);
    setSidebarOpen(false);
    if (nextView === "msg" && payload) {
      setTargetUsername(payload);
    }
    navigate(nextView === "overview" ? COACH_DASHBOARD_PATH : `${COACH_DASHBOARD_PATH}/${nextView}`);
  }, [navigate]);

  useEffect(() => {
    getNotificationUnreadCount()
      .then((result) => setNotificationCount(result.unreadCount))
      .catch(() => setNotificationCount(0));
    getChatUnreadCount()
      .then((result) => setChatCount(result.unreadCount))
      .catch(() => setChatCount(0));
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingOverview(true);

    Promise.all([
      coachWorkspaceApi.getAnalyticsOverview().catch(() => null),
      coachWorkspaceApi.getIncomeOverview().catch(() => null),
      coachWorkspaceApi.getRevenueAnalytics().catch(() => []),
      coachWorkspaceApi.getStudents().catch(() => []),
      coachWorkspaceApi.getIncomeTransactions().catch(() => []),
      getCoachCalendarBookings().catch(() => []),
    ]).then(async ([analytics, income, revenueRows, students, transactions, bookings]) => {
      const progressRows = await Promise.all(
        students.map(student => coachWorkspaceApi.getStudentProgress(student.traineeId).catch(() => null))
      );
      if (!active) return;

      setOverview(buildOverviewStats(analytics, income));
      const mappedRevenue = mapRevenueRows(revenueRows);
      const mappedStudents = mapDashboardStudents(
        students,
        progressRows.filter((item): item is CoachStudentProgress => item !== null),
        bookings,
      );
      const mappedSessions = mapTodaySessions(bookings);
      const mappedPayments = mapRecentPayments(transactions);

      setEarningsRows(mappedRevenue);
      setStudentRows(mappedStudents.slice(0, 5));
      setSessionRows(mappedSessions);
      setOverview(current => ({ ...current, totalStudents: mappedStudents.length, todaySessions: mappedSessions.length }));
      setPaymentRows(mappedPayments);
      setLoadingOverview(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const formatM = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    return (n / 1000).toFixed(0) + "K";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className={`
        fixed lg:relative z-40 flex flex-col h-full bg-gray-950 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} style={{ width: 256, minWidth: 256 }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Dumbbell className="w-[18px] h-[18px] text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }} className="text-white">
            Coach<span className="text-blue-400">Finder</span>
          </span>
          <button className="ml-auto lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-3.5 py-3 border border-white/[0.06]">
            <div className="relative shrink-0">
              {session?.avatar ? (
                <img src={session.avatar} alt={coachName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center ring-2 ring-blue-500/30" style={{ fontSize: "0.76rem", fontWeight: 800 }}>
                  {coachInitials}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
                <CheckCircle2 className="w-2 h-2 text-white" />
              </span>
            </div>
            <div className="min-w-0">
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-white truncate">{coachName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                <span style={{ fontSize: "0.7rem" }} className="text-gray-400">HLV · {session?.category || "Đã đăng nhập"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue mini card */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-3">
            <div style={{ fontSize: "0.68rem" }} className="text-blue-300 mb-0.5">Doanh thu tháng này</div>
            <div style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }} className="text-white">{formatCurrency(overview.monthRevenue)}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span style={{ fontSize: "0.68rem" }} className="text-green-400">Doanh thu tạm tính</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, id, badge }) => {
            let dynamicBadge = badge;
            if (id === "students") dynamicBadge = String(overview.totalStudents);
            if (id === "msg" && chatCount > 0) dynamicBadge = String(chatCount);
            
            return (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                activeNav === id
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span style={{ fontSize: "0.84rem", fontWeight: activeNav === id ? 600 : 500 }}>{label}</span>
              {dynamicBadge && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 ${
                    activeNav === id ? "bg-white/25 text-white" : typeof dynamicBadge === "string" && isNaN(Number(dynamicBadge)) ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                  }`}
                  style={{ fontSize: "0.65rem", fontWeight: 700, minWidth: 20, textAlign: "center" }}
                >
                  {dynamicBadge}
                </span>
              )}
            </button>
          );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
          {[{ icon: Settings, label: "Cài đặt", id: "settings" }, { icon: LogOut, label: "Đăng xuất", id: "logout" }].map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => { if (id === "logout") logout(); else handleNavigate(id); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 transition-all duration-200"
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span style={{ fontSize: "0.84rem", fontWeight: 500 }}>{label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-3.5 flex items-center gap-4 shrink-0 sticky top-0 z-20">
          <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }} className="text-gray-900 truncate">Xin chào, {coachName} 👊</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400 truncate">{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {overview.todaySessions} buổi dạy hôm nay</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => handleNavigate("schedule")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-200" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
              <Plus className="w-3.5 h-3.5" /> Thêm buổi dạy
            </button>
            <NotificationBell />
            {session?.avatar ? (
              <img src={session.avatar} alt={coachName} className="w-9 h-9 rounded-xl object-cover border-2 border-blue-200 cursor-pointer hover:border-blue-300 transition-colors" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 border-2 border-blue-200 flex items-center justify-center" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
                {coachInitials}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6 space-y-5 lg:space-y-6 max-w-[1440px] mx-auto w-full">

            {/* ── STUDENTS ── */}
            <div className={activeNav === "students" ? "block h-full" : "hidden"}><CoachStudents onNavigate={handleNavigate} /></div>

            {/* ── SCHEDULE ── */}
            <div className={activeNav === "schedule" ? "block h-full" : "hidden"}><CoachSchedule onNavigate={handleNavigate} /></div>

            {/* ── VIDEO STUDIO ── */}
            <div className={activeNav === "studio" ? "block h-full" : "hidden"}><CoachVideoStudio /></div>

            {/* ── INCOME ── */}
            <div className={activeNav === "income" ? "block h-full" : "hidden"}><CoachIncome /></div>

            {/* ── ANALYTICS ── */}
            <div className={activeNav === "analytics" ? "block h-full" : "hidden"}><CoachAnalytics /></div>

            {/* ── MESSAGES ── */}
            <div className={activeNav === "msg" ? "block h-full" : "hidden"}><CoachMessages targetUsername={targetUsername} /></div>
            {/* ── SUBSCRIPTION ── */}
            <div className={activeNav === "subscription" ? "block h-full" : "hidden"}><CoachSubscription /></div>

            {/* ── SETTINGS ── */}
            <div className={activeNav === "settings" ? "block h-full" : "hidden"}><CoachSettings /></div>

            {/* ── STATS ─────────────────────────────────── */}
            {activeNav === "overview" && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Học viên", value: String(overview.totalStudents), sub: "Đang theo dõi", color: "text-blue-500", bg: "bg-blue-50", trend: "API" },
                  { icon: DollarSign, label: "Doanh thu", value: formatCompactCurrency(overview.monthRevenue), sub: "Theo workspace", color: "text-emerald-500", bg: "bg-emerald-50", trend: "API" },
                  { icon: Star, label: "Đánh giá TB", value: overview.averageRating.toFixed(1), sub: `Từ ${overview.totalReviews} đánh giá`, color: "text-amber-500", bg: "bg-amber-50", trend: "★" },
                  { icon: Calendar, label: "Buổi dạy", value: String(overview.weekSessions), sub: `Tuần này · ${overview.todaySessions} hôm nay`, color: "text-purple-500", bg: "bg-purple-50", trend: "tuần" },
                ].map(({ icon: Icon, label, value, sub, color, bg, trend }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                        <Icon className={`w-4.5 h-4.5 ${color}`} />
                      </div>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                        {trend}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-gray-700 mb-0.5">{label}</div>
                    <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PLACEHOLDER for unbuilt views ── */}
            {!["overview", "students", "schedule", "studio", "income", "analytics", "msg", "subscription", "settings"].includes(activeNav) && (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div style={{ fontSize: "2.5rem" }} className="mb-3">🚧</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }} className="text-gray-600">Đang phát triển</div>
                <p style={{ fontSize: "0.82rem" }} className="text-gray-400 mt-1">Tính năng này sẽ sớm ra mắt</p>
              </div>
            )}

            {/* ── MAIN GRID ────────────────────────────── */}
            {activeNav === "overview" && (
              loadingOverview ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span style={{fontSize:"0.85rem"}}>Đang tải dữ liệu tổng quan...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              {/* LEFT 2/3 */}
              <div className="xl:col-span-2 space-y-5">

                {/* Earnings chart */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Biểu đồ doanh thu</div>
                      <div style={{ fontSize: "0.78rem" }} className="text-gray-400">6 tháng gần nhất (sau hoa hồng)</div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                      <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-emerald-600">Đang cập nhật</span>
                    </div>

                  </div>
                  <ResponsiveContainer width="100%" height={175}>
                    <BarChart data={earningsRows} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid key="cd-grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis key="cd-xaxis" dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis key="cd-yaxis" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => formatM(v)} />
                      <Tooltip key="cd-tooltip"
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                        formatter={(v: number) => [`${(v / 1000000).toFixed(1)}M đ`, "Doanh thu"]}
                      />
                      <Bar key="cd-bar" dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Today's sessions */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Lịch dạy hôm nay</div>
                    <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.72rem", fontWeight: 700 }}>{sessionRows.length} buổi</span>
                  </div>
                  <div className="space-y-3">
                    {sessionRows.map((s, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${s.status === "upcoming" ? "border-blue-200 bg-blue-50/40" : "border-gray-100 bg-gray-50 opacity-70"}`}>
                        <img src={s.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }} className="text-gray-900">{s.student}</div>
                          <div style={{ fontSize: "0.75rem" }} className="text-gray-500">{s.time} · {s.type}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {s.status === "done" ? (
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded-lg" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                              <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                            </span>
                          ) : (
                            <button onClick={() => handleNavigate("schedule")} className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                              <Play className="w-3 h-3" /> Bắt đầu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Students table */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Học viên đang học</div>
                    <button className="text-blue-500 hover:text-blue-600 flex items-center gap-1" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {studentRows.map((s) => (
                      <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <img src={s.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontWeight: 600, fontSize: "0.87rem" }} className="text-gray-900 truncate">{s.name}</div>
                          <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{s.sessions} buổi · Lần cuối: {s.lastSession}</div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          <div className="text-right mr-2">
                            <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-900">{s.progress}/100</div>
                            <div style={{ fontSize: "0.68rem" }} className="text-gray-400">Điểm AI</div>
                          </div>
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s.progress}%` }} />
                          </div>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`} style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                          {s.status === "active" ? "Active" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT 1/3 */}
              <div className="space-y-5">

                {/* Quick actions */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="mb-4">Thao tác nhanh</div>
                  <div className="space-y-2.5">
                    {[
                      { icon: Upload, label: "Upload Video 360°", color: "bg-blue-500", hot: true, nav: "studio" },
                      { icon: Plus, label: "Tạo buổi tập mới", color: "bg-emerald-500", nav: "schedule" },
                      { icon: Target, label: "Giao bài tập cho HV", color: "bg-purple-500", nav: "students" },
                      { icon: BarChart2, label: "Xem Analytics chi tiết", color: "bg-amber-500", nav: "analytics" },
                      { icon: Award, label: "Nâng cấp Elite Coach", color: "bg-gradient-to-r from-purple-500 to-violet-500", nav: "subscription" },
                    ].map(({ icon: Icon, label, color, hot, nav }) => (
                      <button key={label} onClick={() => handleNavigate(nav)} className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition-colors text-left">
                        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{label}</span>
                        {hot && <span className="ml-auto bg-red-500 text-white px-1.5 py-0.5 rounded-full" style={{ fontSize: "0.6rem", fontWeight: 700 }}>HOT</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent payments */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Thanh toán gần đây</div>
                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full" style={{ fontSize: "0.7rem", fontWeight: 700 }}>Mới nhất</span>
                  </div>
                  <div className="space-y-3">
                    {paymentRows.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-800">{p.student}</div>
                            <div style={{ fontSize: "0.7rem" }} className="text-gray-400">{p.type} · {p.date}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-emerald-600">+{p.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating & reviews */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Đánh giá của tôi</div>
                  <div className="flex items-baseline gap-2 my-3">
                    <span style={{ fontWeight: 900, fontSize: "2.5rem", lineHeight: 1 }} className="text-gray-900">{overview.averageRating.toFixed(1)}</span>
                    <div>
                      <div className="flex gap-0.5 mb-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                      </div>
                      <div style={{ fontSize: "0.72rem" }} className="text-gray-500">{overview.totalReviews} đánh giá</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[5, 4, 3].map(n => (
                      <div key={n} className="flex items-center gap-2">
                        <span style={{ fontSize: "0.72rem" }} className="text-gray-500 w-3">{n}⭐</span>
                        <div className="flex-1 bg-white/60 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-amber-400" style={{ width: n === 5 ? "82%" : n === 4 ? "14%" : "4%" }} />
                        </div>
                        <span style={{ fontSize: "0.7rem" }} className="text-gray-400 w-6 text-right">{n === 5 ? "82%" : n === 4 ? "14%" : "4%"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video studio */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5" />
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Video Studio 360°</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", lineHeight: 1.6 }} className="text-blue-100 mb-4">
                    Bạn đã upload {overview.totalVideos} video 360°. Học viên đã xem {overview.totalVideoViews} lần tháng này.
                  </p>
                  <button onClick={() => handleNavigate("studio")} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-colors" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    <Upload className="w-4 h-4" /> Upload video mới
                  </button>
                </div>
              </div>
            </div>
            )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

