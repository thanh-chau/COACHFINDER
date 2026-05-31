import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, Search, Calendar, Brain, BarChart2, Video,
  MessageCircle, CreditCard, Settings, LogOut, Dumbbell, X, Menu,
  Bell, Flame, CheckCircle2, Clock, Trophy, Users, TrendingUp,
  ChevronRight, Star, Play, Award, Zap
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { LearnerSubscription } from "../components/LearnerSubscription";
import { FindCoach } from "../components/FindCoach";
import { TrainingSchedule } from "../components/TrainingSchedule";
import { AIAnalysis } from "../components/AIAnalysis";
import { ProgressTracking } from "../components/ProgressTracking";
import { VideoLibrary } from "../components/VideoLibrary";
import { Messaging } from "../components/Messaging";
import { NotificationBell } from "../components/NotificationBell";
import { clearAuthSession, getAuthSession } from "../utils/authSession";
import { logoutAccount } from "../api/auth";
import { getMyBookings } from "../api/bookings";
import { getChatUnreadCount } from "../api/chat";
import { searchCoaches } from "../api/coaches";
import { getNotificationUnreadCount } from "../api/notifications";
import { getAchievements, getProgressHeatmap, getProgressOverview } from "../api/progress";
import { getCurrentSubscription } from "../api/subscriptions";
import type { BookingListItem } from "../types/booking";
import type { Coach } from "../types/coach";
import type { Achievement, ProgressOverview } from "../types/progress";
import type { CurrentSubscription } from "../types/subscription";



const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan",     id: "overview" },
  { icon: Search,          label: "Tìm HLV",       id: "find" },
  { icon: Calendar,        label: "Lịch tập",      id: "schedule" },
  { icon: Brain,           label: "AI Phân tích",  id: "ai",           badge: "3" },
  { icon: BarChart2,       label: "Tiến độ",       id: "progress" },
  { icon: Video,           label: "Video 360°",    id: "video" },
  { icon: MessageCircle,   label: "Tin nhắn",      id: "msg",          badge: "2" },
  { icon: CreditCard,      label: "Gói của tôi",   id: "subscription" },
];

const bottomNav = [
  { icon: Settings, label: "Cài đặt",    id: "settings" },
  { icon: LogOut,   label: "Đăng xuất",  id: "logout" },
];

const HEADER_TITLES: Record<string, { title: string; sub: string }> = {
  find:         { title: "Tìm huấn luyện viên 🔍",     sub: "Khám phá HLV phù hợp với bạn" },
  subscription: { title: "Gói dịch vụ của tôi 💎",     sub: "Quản lý & nâng cấp gói học viên" },
  ai:           { title: "AI Phân tích động tác 🤖",   sub: "Phân tích kỹ thuật với trí tuệ nhân tạo" },
  schedule:     { title: "Lịch tập của tôi 📅",        sub: "Quản lý lịch tập và đặt buổi mới" },
  progress:     { title: "Tiến độ luyện tập 📊",       sub: "Theo dõi hành trình của bạn" },
  video:        { title: "Video 360° 🎥",              sub: "Thư viện video từ HLV chuyên nghiệp" },
  msg:          { title: "Tin nhắn 💬",                sub: "Trò chuyện với HLV của bạn" },
};

type ProgressChartRow = { week: string; hours: number };
type MyCoachRow = { name: string; sport: string; rating: number; avatar: string; sessions: number; nextSession: string };
type UpcomingSessionRow = { coach: string; sport: string; time: string; type: string; avatar: string; status: "confirmed" | "pending" };
type SuggestedCoachRow = { name: string; sport: string; price: string; avatar: string; tag: string };

const DEFAULT_OVERVIEW: ProgressOverview = {
  totalSessions: 0,
  trainingHours: 0,
  averageAiScore: 0,
  activeCoaches: 0,
  streakDays: 0,
};

function formatRelativeDateTime(value?: string | null) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });
}

function mapProgressChart(rows: Array<{ date: string; value: number }>): ProgressChartRow[] {
  return rows.slice(-7).map(row => ({
    week: new Date(row.date).toLocaleDateString("vi-VN", { weekday: "short" }),
    hours: row.value,
  }));
}

function mapUpcomingSessions(bookings: BookingListItem[]): UpcomingSessionRow[] {
  return bookings
    .filter(item => item.status === "PENDING" || item.status === "CONFIRMED")
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
    .slice(0, 3)
    .map((booking) => {
      const coachName = booking.coachName || "Huấn luyện viên";
      return {
        coach: coachName,
        sport: booking.sport || "Buổi tập",
        time: `${formatRelativeDateTime(booking.date)}, ${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`,
        type: booking.type === "ONLINE" ? "Online" : "Offline",
        avatar: booking.coachAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(coachName)}&background=ffedd5&color=f97316`,
        status: booking.status === "CONFIRMED" ? "confirmed" : "pending",
      };
    });
}

function mapMyCoaches(bookings: BookingListItem[]): MyCoachRow[] {
  const byCoach = new Map<string, BookingListItem[]>();
  bookings.forEach(booking => {
    const key = booking.coachName || "Huấn luyện viên";
    byCoach.set(key, [...(byCoach.get(key) || []), booking]);
  });

  return Array.from(byCoach.entries()).slice(0, 3).map(([name, coachBookings]) => {
    const next = coachBookings
      .filter(item => item.status === "PENDING" || item.status === "CONFIRMED")
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))[0];
    return {
      name,
      sport: coachBookings[0]?.sport || "Huấn luyện",
      rating: 4.8,
      avatar: coachBookings[0]?.coachAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffedd5&color=f97316`,
      sessions: coachBookings.filter(item => item.status === "COMPLETED").length,
      nextSession: next ? `${formatRelativeDateTime(next.date)}, ${next.startTime.slice(0, 5)}` : "Chưa có lịch",
    };
  });
}

function mapSuggestedCoaches(coaches: Coach[]): SuggestedCoachRow[] {
  return coaches.slice(0, 3).map((coach) => ({
    name: coach.fullName,
    sport: coach.category || "Huấn luyện",
    price: coach.price ? `${Math.round(coach.price / 1000)}K/buổi` : "Liên hệ",
    avatar: coach.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.fullName || "Coach")}&background=ffedd5&color=f97316`,
    tag: coach.rating && coach.rating >= 4.8 ? "Top" : "Gợi ý",
  }));
}

function mapAchievements(rows: Achievement[]) {
  return rows.slice(0, 3).map(row => ({
    badge: "🏆",
    label: row.title,
    date: row.achievedAt ? new Date(row.achievedAt).toLocaleDateString("vi-VN") : "Gần đây",
  }));
}

export function LearnerDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [targetUsername, setTargetUsername] = useState<string | null>(null);

  const handleNavigate = (view: string, payload?: string) => {
    setActiveNav(view);
    if (view === "msg" && payload) {
      try {
        const data = JSON.parse(payload);
        setTargetUsername(data.name || data);
      } catch {
        setTargetUsername(payload);
      }
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [overview, setOverview] = useState(DEFAULT_OVERVIEW);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [progressRows, setProgressRows] = useState<ProgressChartRow[]>([]);
  const [coachRows, setCoachRows] = useState<MyCoachRow[]>([]);
  const [sessionRows, setSessionRows] = useState<UpcomingSessionRow[]>([]);
  const [suggestedRows, setSuggestedRows] = useState<SuggestedCoachRow[]>([]);
  const [achievementRows, setAchievementRows] = useState<Array<{ badge: string; label: string; date: string }>>([]);
  const navigate = useNavigate();
  const session = getAuthSession();
  const learnerName = session?.fullName?.trim() || session?.username || "Học viên";
  const learnerInitials = learnerName
    .split(/\s+/)
    .slice(-2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();

  const header = activeNav === "overview"
    ? { title: `Xin chào, ${learnerName} 👋`, sub: session?.email || "Tổng quan luyện tập của bạn" }
    : HEADER_TITLES[activeNav] ?? { title: "Dashboard", sub: "" };
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
    getNotificationUnreadCount()
      .then((result) => setNotificationCount(result.unreadCount))
      .catch(() => setNotificationCount(0));
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      getProgressOverview().catch(() => null),
      getProgressHeatmap().catch(() => []),
      getMyBookings().catch(() => []),
      searchCoaches({ page: 0, size: 3, sort: "RATING_HIGHEST" }).catch(() => null),
      getAchievements().catch(() => []),
      getCurrentSubscription().catch(() => null),
      getChatUnreadCount().catch(() => ({ unreadCount: 0 })),
    ]).then(([progressOverview, heatmap, bookings, coachPage, achievements, currentSubscription, unread]) => {
      if (!active) return;
      if (progressOverview) setOverview(progressOverview);
      
      setProgressRows(mapProgressChart(heatmap));
      setSessionRows(mapUpcomingSessions(bookings));
      setCoachRows(mapMyCoaches(bookings));
      setSuggestedRows(mapSuggestedCoaches(coachPage?.content ?? []));
      setAchievementRows(mapAchievements(achievements));
      setSubscription(currentSubscription);
      setChatCount(unread.unreadCount);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50/80 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className={`
        fixed lg:relative z-40 flex flex-col h-full bg-gray-950 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} style={{ width: 256, minWidth: 256 }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-[18px] h-[18px] text-white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }} className="text-white">
            Coach<span className="text-orange-400">Finder</span>
          </span>
          <button className="ml-auto lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-3.5 py-3 border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0 ring-2 ring-orange-500/30" style={{ fontSize: "0.76rem", fontWeight: 800 }}>
              {learnerInitials}
            </div>
            <div className="min-w-0">
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-white truncate">{learnerName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span style={{ fontSize: "0.7rem" }} className="text-gray-400">Học viên · {subscription?.displayName || "Gói Free"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, id, badge }) => {
            const dynamicBadge = id === "msg" ? (chatCount ? String(chatCount) : undefined) : badge;
            return (
            <button
              key={id}
              onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                activeNav === id
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span style={{ fontSize: "0.84rem", fontWeight: activeNav === id ? 600 : 500 }}>{label}</span>
              {dynamicBadge && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 ${
                    activeNav === id ? "bg-white/25" : "bg-orange-500/90"
                  } text-white`}
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
          {bottomNav.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => { if (id === "logout") logout(); else { setActiveNav(id); setSidebarOpen(false); } }}
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
            <div style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }} className="text-gray-900 truncate">{header.title}</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400 truncate">{header.sub}</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-orange-600">{overview.streakDays} ngày liên tiếp</span>
            </div>
            <NotificationBell />
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 border-2 border-orange-200 flex items-center justify-center" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
              {learnerInitials}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6 space-y-5 lg:space-y-6 max-w-[1440px] mx-auto w-full">

            {/* ── SUBSCRIPTION ── */}
            {activeNav === "subscription" && <LearnerSubscription />}

            {/* ── FIND COACH ── */}
            {activeNav === "find" && <FindCoach />}

            {/* ── SCHEDULE ── */}
            {activeNav === "schedule" && <TrainingSchedule onNavigate={handleNavigate} />}

            {/* ── AI ANALYSIS ── */}
            {activeNav === "ai" && <AIAnalysis onNavigate={handleNavigate} />}

            {/* ── PROGRESS ── */}
            {activeNav === "progress" && <ProgressTracking onNavigate={handleNavigate} />}

            {/* ── VIDEO LIBRARY ── */}
            {activeNav === "video" && <VideoLibrary onNavigate={handleNavigate} />}

            {/* ── MESSAGING ── */}
            {activeNav === "msg" && <Messaging userPlan="free" onNavigate={handleNavigate} targetUsername={targetUsername} />}

            {/* ── OVERVIEW ── */}
            {activeNav === "overview" && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: CheckCircle2, label: "Buổi đã tập",  value: String(overview.totalSessions),   sub: "Theo lịch đã hoàn thành",       color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { icon: Clock,        label: "Giờ tập",       value: `${overview.trainingHours}h`,  sub: "Tổng thời lượng",      color: "text-blue-500",    bg: "bg-blue-50",    border: "border-blue-100" },
                    { icon: Trophy,       label: "Điểm AI TB",    value: String(overview.averageAiScore),   sub: "Từ phân tích gần đây",  color: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-100" },
                    { icon: Users,        label: "HLV đang học",  value: String(overview.activeCoaches),    sub: subscription?.displayName || "Gói hiện tại", color: "text-purple-500",  bg: "bg-purple-50",  border: "border-purple-100" },
                  ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
                    <div key={label} className={`bg-white rounded-2xl p-5 border ${border} hover:shadow-md transition-all duration-200 group`}>
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "1.6rem", lineHeight: 1, letterSpacing: "-0.02em" }} className="text-gray-900 mb-1">{value}</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600 }} className="text-gray-700 mb-0.5">{label}</div>
                      <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Main 2-col grid */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 lg:gap-6">

                  {/* Left 3/5 */}
                  <div className="xl:col-span-3 space-y-5 lg:space-y-6">

                    {/* Progress chart */}
                    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Tiến độ tuần này</div>
                          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">Số giờ tập mỗi ngày</div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                          <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-green-600">+28% tuần trước</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={progressRows} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs key="defs">
                            <linearGradient id="learnerColorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                          <XAxis key="xaxis" dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                          <YAxis key="yaxis" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 8]} tickCount={5} />
                          <Tooltip key="tooltip" contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} formatter={(v: number) => [`${v} giờ`, "Số giờ tập"]} />
                          <Area key="area-hours" type="monotone" dataKey="hours" stroke="#f97316" strokeWidth={2.5} fill="url(#learnerColorHours)" dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Upcoming sessions */}
                    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Lịch tập sắp tới</div>
                        <button onClick={() => setActiveNav("schedule")} className="text-orange-500 hover:text-orange-600 flex items-center gap-1 hover:gap-2 transition-all" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                          Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {sessionRows.length === 0 ? (
                          <div className="text-center py-6 text-gray-400" style={{ fontSize: "0.85rem" }}>
                            Bạn chưa có lịch tập nào sắp tới.
                          </div>
                        ) : (
                          sessionRows.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer" onClick={() => setActiveNav("schedule")}>
                              <img src={s.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-900 truncate">{s.coach}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold ${s.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {s.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.72rem" }} className="text-gray-500">{s.time}</div>
                                <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-0.5">{s.sport} · {s.type}</div>
                              </div>
                              <button className="shrink-0 w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 transition-colors">
                                <Video className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <button
                        onClick={() => setActiveNav("ai")}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-200 rounded-xl text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        style={{ fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        <Play className="w-3.5 h-3.5" /> Upload video mới để phân tích
                      </button>
                    </div>
                  </div>

                  {/* Right 2/5 */}
                  <div className="xl:col-span-2 space-y-5 lg:space-y-6">

                    {/* Quick actions */}
                    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-5 lg:p-6 text-white shadow-xl shadow-gray-900/10">
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="mb-4">Thao tác nhanh</div>
                      <div className="space-y-2">
                        {[
                          { icon: Search,    label: "Tìm HLV mới",            color: "bg-orange-500", nav: "find" },
                          { icon: Brain,     label: "Phân tích AI động tác",  color: "bg-purple-500", nav: "ai" },
                          { icon: Calendar,  label: "Xem lịch tập",            color: "bg-blue-500",   nav: "schedule" },
                          { icon: Video,     label: "Xem Video 360°",          color: "bg-emerald-500", nav: "video" },
                        ].map(({ icon: Icon, label, color, nav }) => (
                          <button key={label} onClick={() => setActiveNav(nav)} className="w-full flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3.5 py-3 rounded-xl transition-all duration-200 text-left group">
                            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span style={{ fontSize: "0.84rem", fontWeight: 500 }}>{label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-500 ml-auto group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                        <button
                          onClick={() => setActiveNav("subscription")}
                          className="w-full flex items-center gap-3 bg-gradient-to-r from-orange-500/15 to-red-500/10 border border-orange-500/25 hover:from-orange-500/25 hover:to-red-500/15 px-3.5 py-3 rounded-xl transition-all duration-200 text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <span style={{ fontSize: "0.84rem", fontWeight: 600 }} className="text-orange-300">Nâng cấp gói Pro</span>
                          <ChevronRight className="w-3.5 h-3.5 text-orange-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* My coaches */}
                    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">HLV của tôi</div>
                        <span className="bg-orange-50 text-orange-500 px-2.5 py-0.5 rounded-full border border-orange-100" style={{ fontSize: "0.7rem", fontWeight: 700 }}>{coachRows.length} HLV</span>
                      </div>
                      <div className="space-y-3">
                        {coachRows.length === 0 ? (
                          <div className="text-center py-6 text-gray-400" style={{ fontSize: "0.85rem" }}>
                            Bạn chưa có Huấn luyện viên nào.
                          </div>
                        ) : (
                          coachRows.map((c) => (
                            <div key={c.name} className="p-3.5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
                              <div className="flex items-center gap-3 mb-2.5">
                                <img src={c.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900 truncate">{c.name}</div>
                                  <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-0.5">{c.sport}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                  <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-700">{c.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                                  {c.sessions} buổi đã học
                                </span>
                                <span className="text-orange-500" style={{ fontSize: "0.72rem", fontWeight: 600 }}>📅 {c.nextSession}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Suggested coaches */}
                    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Gợi ý HLV</div>
                        <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full" style={{ fontSize: "0.7rem", fontWeight: 700 }}>AI đề xuất</span>
                      </div>
                      <div className="space-y-3">
                        {suggestedRows.map((c) => (
                          <div key={c.name} className="flex items-center gap-3 group">
                            <img src={c.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-900 truncate">{c.name}</span>
                                <span style={{ fontSize: "0.65rem" }}>{c.tag}</span>
                              </div>
                              <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-0.5">{c.sport} · {c.price}</div>
                            </div>
                            <button onClick={() => setActiveNav("find")} className="shrink-0 px-3 py-1.5 bg-orange-50 text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all duration-200" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                              Xem
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50/80 border border-amber-200/80 rounded-2xl p-5 lg:p-6">
                      <div className="flex items-center gap-2 mb-3.5">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Thành tích gần đây</span>
                      </div>
                      <div className="space-y-3">
                        {achievementRows.length === 0 ? (
                          <div className="text-center py-6 text-gray-400" style={{ fontSize: "0.85rem" }}>
                            Bạn chưa có thành tích nào. Hãy tích cực tập luyện nhé!
                          </div>
                        ) : (
                          achievementRows.map((a) => (
                            <div key={a.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                              <span style={{ fontSize: "1.2rem" }} className="shrink-0">{a.badge}</span>
                              <div className="flex-1 min-w-0">
                                <div style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-800">{a.label}</div>
                                <div style={{ fontSize: "0.68rem" }} className="text-gray-400 mt-0.5">{a.date}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── PLACEHOLDER for unbuilt views ── */}
            {!["overview", "subscription", "find", "schedule", "ai", "progress", "video", "msg"].includes(activeNav) && (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div style={{ fontSize: "2.5rem" }} className="mb-3">🚧</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }} className="text-gray-600">Đang phát triển</div>
                <p style={{ fontSize: "0.82rem" }} className="text-gray-400 mt-1">Tính năng này sẽ sớm ra mắt</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
