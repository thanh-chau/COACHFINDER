import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Calendar,
  Video, Star, Eye, Clock, Award, Zap, Target,
  RefreshCw, Play, Heart, BookOpen, Activity, ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart,
} from "recharts";
import { coachWorkspaceApi } from "../api/coachWorkspace";
import type { CoachChartPoint, CoachStudentProgress } from "../types/coachWorkspace";

// ─── Data Types & Helpers ──────────────────────────────────────────────────
type AnalyticsMonthRow = { m: string; gross: number; net: number; students: number; sessions: number; newHV: number; retainHV: number; };
type StudentProgressRow = { name: string; progress: number; sessions: number; retention: number; sport: string; nps: number; paid: number; };
type VideoTrendRow = { m: string; views: number; };

function mapChartPointToMonth(point: CoachChartPoint): AnalyticsMonthRow {
  return {
    m: point.period,
    gross: point.value,
    net: Math.round(point.value * 0.88),
    students: point.count,
    sessions: point.count,
    newHV: 0,
    retainHV: point.count,
  };
}

function mapStudentProgress(item: CoachStudentProgress): StudentProgressRow {
  const progress = item.averageSubmissionScore == null ? Math.min(100, item.completedSessions * 10) : Math.round(item.averageSubmissionScore);
  const retention = item.totalSessions > 0 ? Math.round((item.completedSessions / item.totalSessions) * 100) : 0;
  return {
    name: `HV #${item.traineeId}`,
    progress,
    sessions: item.totalSessions,
    retention,
    sport: "Training",
    nps: Math.max(1, Math.round(progress / 10)),
    paid: 0,
  };
}

function mapVideoTrend(point: CoachChartPoint): VideoTrendRow {
  return {
    m: point.period,
    views: point.value,
  };
}

const fmtM = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : (n / 1000).toFixed(0) + "K";

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-xs min-w-28">
      <div className="font-bold text-gray-700 mb-1.5">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-3">
          <span style={{ color: p.color || p.stroke }} className="truncate">{p.name}</span>
          <span className="font-bold text-gray-800">{typeof p.value === "number" && p.value > 100000 ? fmtM(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, trend, trendUp, bg, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
            {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}{trend}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 800, fontSize: "1.3rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
      <div style={{ fontWeight: 600, fontSize: "0.78rem" }} className="text-gray-700 mb-0.5">{label}</div>
      <div style={{ fontSize: "0.7rem" }} className="text-gray-400">{sub}</div>
    </div>
  );
}

// ─── Empty State Helper ──────────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
      {message}
    </div>
  );
}

// ─── REVENUE TAB ─────────────────────────────────────────────────────────────
function RevenueTab({ months }: { months: AnalyticsMonthRow[] }) {
  const defaultCur = { m: "Tháng này", gross: 0, net: 0, sessions: 0, students: 0, newHV: 0, retainHV: 0 };
  const cur = months.length > 0 ? months[months.length - 1] : defaultCur;
  const prev = months.length > 1 ? months[months.length - 2] : cur;
  
  const growG = prev.gross === 0 ? (cur.gross > 0 ? "100.0" : "0.0") : ((cur.gross - prev.gross) / prev.gross * 100).toFixed(1);
  const growN = prev.net === 0 ? (cur.net > 0 ? "100.0" : "0.0") : ((cur.net - prev.net) / prev.net * 100).toFixed(1);
  const avgPerSession = cur.sessions > 0 ? Math.round(cur.net / cur.sessions) : 0;
  const forecast = Math.round(cur.net * 1.08);

  const rawMonthStr = cur.m || "";
  let displayMonth = "Tháng này";
  if (rawMonthStr.includes("-")) {
    const parts = rawMonthStr.split("-");
    if (parts.length >= 2) displayMonth = "T" + parseInt(parts[1], 10);
  } else if (rawMonthStr.includes("/")) {
    displayMonth = rawMonthStr.split("/")[0];
  } else if (rawMonthStr.startsWith("T")) {
    displayMonth = rawMonthStr;
  }
  let nextMonth = "Tháng sau";
  if (displayMonth.startsWith("T")) {
    let num = parseInt(displayMonth.substring(1));
    nextMonth = "T" + (num === 12 ? 1 : num + 1);
  }

  // Generate pie data dynamically from recent months
  const SOURCE_PIE = cur.gross > 0 ? [
    { name: "Học phí & Lịch dạy", value: 100, color: "#3b82f6" }
  ] : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={DollarSign} label={`Thu nhập thực ${displayMonth}`} value={fmtM(cur.net)} sub="Sau hoa hồng 12%" trend={`+${growN}%`} trendUp bg="bg-emerald-50" color="text-emerald-500" />
        <KPI icon={TrendingUp} label={`Doanh thu gộp ${displayMonth}`} value={fmtM(cur.gross)} sub="Trước hoa hồng" trend={`+${growG}%`} trendUp bg="bg-blue-50" color="text-blue-500" />
        <KPI icon={Zap} label="TB thu/buổi" value={fmtM(avgPerSession)} sub={`${cur.sessions} buổi ${displayMonth}`} trend="+0%" trendUp bg="bg-purple-50" color="text-purple-500" />
        <KPI icon={Target} label={`Dự báo ${nextMonth}`} value={fmtM(forecast)} sub="Dự kiến +8%" trend="~+8%" trendUp bg="bg-amber-50" color="text-amber-500" />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Xu hướng doanh thu</div>
            <div style={{ fontSize: "0.75rem" }} className="text-gray-400">Doanh thu gộp vs thu nhập thực (sau HH 12%)</div>
          </div>
        </div>
        <div className="h-[220px]">
          {months.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.18} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="gross" name="Doanh thu gộp" stroke="#3b82f6" strokeWidth={2} fill="url(#gG)" />
                <Area type="monotone" dataKey="net" name="Thu nhập thực" stroke="#10b981" strokeWidth={2.5} fill="url(#gN)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Chưa có dữ liệu doanh thu" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Phân bổ nguồn thu</div>
          <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mb-3">{displayMonth}</div>
          <div className="flex items-center gap-3 h-[120px]">
            {SOURCE_PIE.length > 0 ? (
              <>
                <ResponsiveContainer width={120} height="100%">
                  <PieChart><Pie data={SOURCE_PIE} cx="50%" cy="50%" innerRadius={35} outerRadius={56} dataKey="value" strokeWidth={2} stroke="#fff">
                    {SOURCE_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie></PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {SOURCE_PIE.map(s => (
                    <div key={s.name}>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5 text-gray-700" style={{ fontSize: "0.78rem" }}><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />{s.name}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-900">{s.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart message="Chưa có nguồn thu" />}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Tăng trưởng theo tháng</div>
          <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mb-3">MoM % thay đổi doanh thu gộp</div>
          <div className="h-[150px]">
            {months.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months.slice(1).map((m, i) => {
                  const prevGross = months[i].gross;
                  return {
                    m: m.m,
                    growth: prevGross === 0 ? (m.gross > 0 ? 100 : 0) : Number(((m.gross - prevGross) / prevGross * 100).toFixed(1))
                  };
                })} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => v + "%"} />
                  <Tooltip content={<Tip />} formatter={(v: any) => [v + "%", "Tăng trưởng"]} />
                  <Bar dataKey="growth" name="Tăng trưởng" radius={[4, 4, 0, 0]} fill="#3b82f6">
                    {months.slice(1).map((_, i) => {
                      const prevGross = months[i].gross;
                      const curGross = months[i + 1].gross;
                      const g = prevGross === 0 ? (curGross > 0 ? 100 : 0) : (curGross - prevGross) / prevGross * 100;
                      return <Cell key={i} fill={g >= 0 ? "#10b981" : "#ef4444"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="Cần ít nhất 2 tháng dữ liệu" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────────────────
function StudentsTab({ students, months }: { students: StudentProgressRow[]; months: AnalyticsMonthRow[] }) {
  const active = students.filter(s => s.retention >= 80).length;
  const avgProg = students.length ? Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length) : 0;
  const avgNPS = students.length ? (students.reduce((a, s) => a + s.nps, 0) / students.length).toFixed(1) : "0";

  const curMonth = months.length > 0 ? months[months.length - 1] : { students: 0, retainHV: 0, m: "Tháng này" };
  let displayMonth = curMonth.m.startsWith("T") ? curMonth.m : "tháng này";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Users} label={`Học viên ${displayMonth}`} value={students.length.toString()} sub="Tổng cộng" trendUp bg="bg-blue-50" color="text-blue-500" />
        <KPI icon={Activity} label="Active (≥80% RT)" value={active.toString()} sub="retention cao" trendUp bg="bg-emerald-50" color="text-emerald-500" />
        <KPI icon={Star} label="Tiến độ TB" value={avgProg + "%"} sub="Đánh giá tiến độ" trendUp bg="bg-purple-50" color="text-purple-500" />
        <KPI icon={Award} label="NPS Score" value={avgNPS} sub="Trung bình 0–10" trendUp bg="bg-amber-50" color="text-amber-500" />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Số lượng học viên</div>
        <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mb-4">Theo tháng</div>
        <div className="h-[200px]">
          {months.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="retainHV" name="Học viên" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="students" name="Tổng HV" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b" }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Chưa có dữ liệu" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Tiến độ học viên</div>
          <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mb-3">Tỉ lệ hoàn thành / số buổi</div>
          <div className="space-y-2 h-[180px] overflow-y-auto">
            {students.length > 0 ? [...students].sort((a, b) => b.progress - a.progress).map((s, idx) => (
              <div key={idx} className="flex items-center gap-2.5 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <span style={{ fontSize: "0.78rem", fontWeight: 500 }} className="text-gray-700 truncate">{s.name}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className={s.progress >= 80 ? "text-emerald-600" : s.progress >= 60 ? "text-blue-500" : "text-amber-500"}>{s.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-1.5 rounded-full transition-all ${s.progress >= 80 ? "bg-emerald-400" : s.progress >= 60 ? "bg-blue-400" : "bg-amber-400"}`} style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right" style={{ minWidth: 40 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700 }} className="text-gray-500">{s.retention}%</div>
                  <div style={{ fontSize: "0.6rem" }} className="text-gray-300">retain</div>
                </div>
              </div>
            )) : <EmptyChart message="Chưa có dữ liệu học viên" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VIDEO TAB ────────────────────────────────────────────────────────────────
function VideoTab({ videoTrend }: { videoTrend: VideoTrendRow[] }) {
  const totalViews = videoTrend.reduce((a, v) => a + v.views, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Eye} label="Tổng lượt xem" value={totalViews > 1000 ? (totalViews / 1000).toFixed(1) + "K" : totalViews.toString()} sub="Video của bạn" trendUp bg="bg-blue-50" color="text-blue-500" />
        <KPI icon={Play} label="Tỷ lệ hoàn thành" value="N/A" sub="Chưa có dữ liệu" bg="bg-emerald-50" color="text-emerald-500" />
        <KPI icon={Clock} label="Giờ xem TB" value="N/A" sub="Chưa có dữ liệu" bg="bg-purple-50" color="text-purple-500" />
        <KPI icon={Heart} label="Tổng lượt thích" value="N/A" sub="Chưa có dữ liệu" bg="bg-rose-50" color="text-rose-500" />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Xu hướng lượt xem</div>
        <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mb-4">Tổng lượt xem theo tháng</div>
        <div className="h-[180px]">
          {videoTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={videoTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs><linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="views" name="Lượt xem" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gV)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Chưa có dữ liệu lượt xem" />}
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <div style={{ fontWeight: 700, fontSize: "1.1rem" }} className="text-gray-800">Lịch dạy</div>
        <p style={{ fontSize: "0.85rem" }} className="text-gray-500 mt-2">Dữ liệu phân tích lịch dạy hiện tại chưa có đủ. Hãy bắt đầu dạy thêm để xem thống kê nhé!</p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
type ATab = "revenue" | "students" | "video" | "schedule";

export function CoachAnalytics() {
  const [tab, setTab] = useState<ATab>("revenue");
  const [months, setMonths] = useState<AnalyticsMonthRow[]>([]);
  const [students, setStudents] = useState<StudentProgressRow[]>([]);
  const [videoTrend, setVideoTrend] = useState<VideoTrendRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coachWorkspaceApi.getRevenueAnalytics(),
      coachWorkspaceApi.getStudentsProgress(),
      coachWorkspaceApi.getVideoAnalytics(),
      coachWorkspaceApi.getStudents(),
    ])
      .then(([revenueData, studentProgressData, videoData, studentsData]) => {
        setMonths(revenueData?.length ? revenueData.map(mapChartPointToMonth) : []);
        
        const studentsMap = new Map((studentsData || []).map(s => [s.traineeId, s]));
        
        setStudents(studentProgressData?.length ? studentProgressData.map(p => {
          const summary = studentsMap.get(p.traineeId);
          const name = summary?.fullName || `HV #${p.traineeId}`;
          const progress = p.averageSubmissionScore == null ? Math.min(100, p.completedSessions * 10) : Math.round(p.averageSubmissionScore);
          const retention = p.totalSessions > 0 ? Math.round((p.completedSessions / p.totalSessions) * 100) : 0;
          return {
            name,
            progress,
            sessions: p.totalSessions,
            retention,
            sport: summary?.goal || "Training",
            nps: Math.max(1, Math.round(progress / 10)),
            paid: summary?.revenue || 0,
          };
        }) : []);
        
        setVideoTrend(videoData?.length ? videoData.map(mapVideoTrend) : []);
      })
      .catch((e) => {
        console.error("Error fetching analytics:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const TABS: { id: ATab; emoji: string; label: string }[] = [
    { id: "revenue", emoji: "💰", label: "Doanh thu" },
    { id: "students", emoji: "👥", label: "Học viên" },
    { id: "video", emoji: "🎬", label: "Video" },
    { id: "schedule", emoji: "📅", label: "Lịch dạy" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.2rem" }} className="text-gray-900">Analytics</h1>
          <p style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">Phân tích chi tiết hiệu suất huấn luyện</p>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}>
          <RefreshCw className="w-3.5 h-3.5" /> Cập nhật
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors border-r border-gray-100 last:border-0 ${tab === t.id ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            style={{ fontSize: "0.82rem", fontWeight: tab === t.id ? 700 : 500 }}>
            <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400" style={{ fontSize: "0.85rem" }}>Đang tải dữ liệu phân tích...</div>
      ) : (
        <>
          {tab === "revenue" && <RevenueTab months={months} />}
          {tab === "students" && <StudentsTab students={students} months={months} />}
          {tab === "video" && <VideoTab videoTrend={videoTrend} />}
          {tab === "schedule" && <ScheduleTab />}
        </>
      )}
    </div>
  );
}
