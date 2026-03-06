import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Flame, Trophy, Target, Dumbbell,
  Calendar, Clock, CheckCircle2, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus, Brain, Zap, Star,
  BarChart2, Activity, Heart, Weight, Ruler, Award
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, XAxis, YAxis, Tooltip, Cell
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
type TimeRange = "week" | "month" | "3months" | "year";
type MetricTab = "overview" | "body" | "exercise" | "ai";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day: "T2", hours: 1.5, cal: 420, sessions: 1 },
  { day: "T3", hours: 2,   cal: 580, sessions: 1 },
  { day: "T4", hours: 0,   cal: 0,   sessions: 0 },
  { day: "T5", hours: 1.5, cal: 450, sessions: 1 },
  { day: "T6", hours: 2,   cal: 620, sessions: 1 },
  { day: "T7", hours: 3,   cal: 850, sessions: 2 },
  { day: "CN", hours: 1,   cal: 300, sessions: 1 },
];

const MONTHLY_DATA = [
  { label: "T1", hours: 28, cal: 8400, sessions: 18 },
  { label: "T2", hours: 32, cal: 9600, sessions: 20 },
  { label: "T3", hours: 38, cal: 11400, sessions: 24 },
  { label: "T4", hours: 35, cal: 10500, sessions: 22 },
  { label: "T5", hours: 42, cal: 12600, sessions: 26 },
  { label: "T6", hours: 40, cal: 12000, sessions: 25 },
  { label: "T7", hours: 45, cal: 13500, sessions: 28 },
  { label: "T8", hours: 38, cal: 11400, sessions: 24 },
  { label: "T9", hours: 48, cal: 14400, sessions: 30 },
  { label: "T10", hours: 44, cal: 13200, sessions: 27 },
  { label: "T11", hours: 50, cal: 15000, sessions: 31 },
  { label: "T12", hours: 46, cal: 13800, sessions: 29 },
];

const QUARTERLY_DATA = [
  { label: "Tháng 1", hours: 28, cal: 8400, sessions: 18 },
  { label: "Tháng 2", hours: 35, cal: 10500, sessions: 22 },
  { label: "Tháng 3", hours: 48, cal: 14400, sessions: 30 },
];

const BODY_METRICS_HISTORY = [
  { month: "T9",  weight: 72,   fat: 18, muscle: 35, bmi: 23.1 },
  { month: "T10", weight: 71.5, fat: 17.2, muscle: 35.8, bmi: 22.9 },
  { month: "T11", weight: 70.8, fat: 16.5, muscle: 36.2, bmi: 22.7 },
  { month: "T12", weight: 70.2, fat: 15.8, muscle: 36.8, bmi: 22.5 },
  { month: "T1",  weight: 69.5, fat: 15.2, muscle: 37.2, bmi: 22.3 },
  { month: "T2",  weight: 69,   fat: 14.5, muscle: 37.8, bmi: 22.1 },
  { month: "T3",  weight: 68.5, fat: 14,   muscle: 38.2, bmi: 22.0 },
];

const EXERCISE_PROGRESS = [
  {
    id: "squat", name: "Squat", emoji: "🦵",
    current1RM: 100, prev1RM: 85, unit: "kg",
    history: [
      { month: "T10", value: 70 }, { month: "T11", value: 78 },
      { month: "T12", value: 85 }, { month: "T1", value: 90 },
      { month: "T2", value: 95 }, { month: "T3", value: 100 },
    ],
    color: "#10b981",
  },
  {
    id: "bench", name: "Bench Press", emoji: "💪",
    current1RM: 75, prev1RM: 65, unit: "kg",
    history: [
      { month: "T10", value: 50 }, { month: "T11", value: 55 },
      { month: "T12", value: 60 }, { month: "T1", value: 65 },
      { month: "T2", value: 70 }, { month: "T3", value: 75 },
    ],
    color: "#3b82f6",
  },
  {
    id: "deadlift", name: "Deadlift", emoji: "🏋️",
    current1RM: 120, prev1RM: 105, unit: "kg",
    history: [
      { month: "T10", value: 85 }, { month: "T11", value: 92 },
      { month: "T12", value: 100 }, { month: "T1", value: 105 },
      { month: "T2", value: 112 }, { month: "T3", value: 120 },
    ],
    color: "#f97316",
  },
  {
    id: "ohp", name: "Overhead Press", emoji: "🙌",
    current1RM: 50, prev1RM: 45, unit: "kg",
    history: [
      { month: "T10", value: 35 }, { month: "T11", value: 38 },
      { month: "T12", value: 42 }, { month: "T1", value: 45 },
      { month: "T2", value: 48 }, { month: "T3", value: 50 },
    ],
    color: "#8b5cf6",
  },
];

const AI_SCORE_HISTORY = [
  { month: "T10", squat: 68, bench: 62, deadlift: 55, avg: 62 },
  { month: "T11", squat: 75, bench: 70, deadlift: 63, avg: 69 },
  { month: "T12", squat: 80, bench: 76, deadlift: 70, avg: 75 },
  { month: "T1",  squat: 85, bench: 80, deadlift: 74, avg: 80 },
  { month: "T2",  squat: 90, bench: 83, deadlift: 78, avg: 84 },
  { month: "T3",  squat: 92, bench: 85, deadlift: 82, avg: 87 },
];

const RADAR_DATA = [
  { subject: "Sức mạnh", value: 85, fullMark: 100 },
  { subject: "Sức bền", value: 72, fullMark: 100 },
  { subject: "Linh hoạt", value: 68, fullMark: 100 },
  { subject: "Kỹ thuật", value: 87, fullMark: 100 },
  { subject: "Tốc độ", value: 75, fullMark: 100 },
  { subject: "Phục hồi", value: 80, fullMark: 100 },
];

const ACHIEVEMENTS = [
  { id: 1, icon: "🔥", title: "Streak Master", desc: "14 ngày tập liên tiếp", date: "Hôm nay", unlocked: true },
  { id: 2, icon: "🏆", title: "20 Sessions", desc: "Hoàn thành 20 buổi tập", date: "2 ngày trước", unlocked: true },
  { id: 3, icon: "💪", title: "Squat Pro", desc: "Squat đạt 90+ AI score", date: "Tuần trước", unlocked: true },
  { id: 4, icon: "🎯", title: "Perfect Form", desc: "3 bài tập đạt 85+ AI", date: "5 ngày trước", unlocked: true },
  { id: 5, icon: "⚡", title: "Power Up", desc: "1RM tăng 15% trong 1 tháng", date: "10 ngày trước", unlocked: true },
  { id: 6, icon: "🥇", title: "Century Club", desc: "Squat đạt 100kg", date: "Hôm nay", unlocked: true },
  { id: 7, icon: "🌟", title: "50 Sessions", desc: "Hoàn thành 50 buổi tập", date: "Còn 26 buổi", unlocked: false },
  { id: 8, icon: "💎", title: "Diamond Form", desc: "Tất cả bài đạt 95+ AI", date: "Còn 3 điểm", unlocked: false },
];

const WEEKLY_HEATMAP = [
  [1, 0, 1, 1, 0, 2, 1],
  [1, 1, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 1, 2, 1],
  [1, 1, 0, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 2, 0],
  [1, 1, 0, 1, 1, 1, 1],
  [0, 1, 1, 1, 0, 2, 1],
  [1, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 1, 2, 1],
  [1, 1, 0, 1, 1, 1, 1],
  [0, 1, 1, 0, 1, 2, 1],
  [1, 1, 0, 1, 1, 1, 0],
];

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pct(current: number, prev: number) {
  if (prev === 0) return 0;
  return Math.round(((current - prev) / prev) * 100);
}

function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  if (value === 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
      <Minus className="w-3 h-3" /> 0{suffix}
    </span>
  );
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`} style={{ fontSize: "0.72rem", fontWeight: 600 }}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {positive ? "+" : ""}{value}{suffix}
    </span>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, trend, color, bg }: {
  icon: React.ElementType; label: string; value: string; sub: string; trend: number; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <TrendBadge value={trend} />
      </div>
      <div style={{ fontWeight: 800, fontSize: "1.5rem", lineHeight: 1 }} className="text-gray-900 mb-1">{value}</div>
      <div style={{ fontSize: "0.8rem", fontWeight: 600 }} className="text-gray-700">{label}</div>
      <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

function HeatmapSection() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Lịch sử tập luyện</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400">12 tuần gần nhất</div>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "0.7rem" }} className="text-gray-400">ít</span>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((level) => (
              <div key={`legend-${level}`} className={`w-3 h-3 rounded-sm ${level === 0 ? "bg-gray-100" : level === 1 ? "bg-orange-200" : "bg-orange-500"}`} />
            ))}
          </div>
          <span style={{ fontSize: "0.7rem" }} className="text-gray-400">nhiều</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Day headers */}
          <div className="flex gap-1 mb-1 ml-10">
            {DAY_LABELS.map((d) => (
              <div key={d} className="flex-1 text-center" style={{ fontSize: "0.65rem", fontWeight: 500, color: "#9ca3af" }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          {WEEKLY_HEATMAP.map((week, wi) => (
            <div key={`week-${wi}`} className="flex items-center gap-1 mb-1">
              <div className="w-9 text-right pr-1" style={{ fontSize: "0.6rem", color: "#9ca3af" }}>
                {wi === 0 ? "Tuần này" : wi === 1 ? "1 tuần" : `${wi} tuần`}
              </div>
              {week.map((val, di) => (
                <div
                  key={`cell-${wi}-${di}`}
                  className={`flex-1 aspect-square rounded-sm transition-colors ${
                    val === 0 ? "bg-gray-100" : val === 1 ? "bg-orange-200 hover:bg-orange-300" : "bg-orange-500 hover:bg-orange-600"
                  }`}
                  title={`${DAY_LABELS[di]}, ${val} buổi tập`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-900">14 ngày streak</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-600">62/84 ngày (74%)</span>
        </div>
      </div>
    </div>
  );
}

function TrainingChart({ timeRange }: { timeRange: TimeRange }) {
  const data = timeRange === "week" ? WEEKLY_DATA
    : timeRange === "3months" ? QUARTERLY_DATA
    : MONTHLY_DATA;

  const dataKey = timeRange === "week" ? "day" : "label";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Thời gian & Calo</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400">
            {timeRange === "week" ? "Tuần này" : timeRange === "month" ? "12 tháng qua" : timeRange === "3months" ? "3 tháng gần nhất" : "Năm 2025-2026"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span style={{ fontSize: "0.72rem" }} className="text-gray-500">Giờ tập</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span style={{ fontSize: "0.72rem" }} className="text-gray-500">Calo (x100)</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis key="xaxis" dataKey={dataKey} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis key="yaxis" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <Tooltip
            key="tooltip"
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
            formatter={(v: number, name: string) => {
              if (name === "hours") return [`${v}h`, "Thời gian tập"];
              return [`${v} kcal`, "Calo tiêu thụ"];
            }}
          />
          <Bar key="bar-hours" dataKey="hours" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={32} />
          <Bar key="bar-cal" dataKey="cal" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BodyMetricsSection() {
  const latest = BODY_METRICS_HISTORY[BODY_METRICS_HISTORY.length - 1];
  const prev = BODY_METRICS_HISTORY[BODY_METRICS_HISTORY.length - 2];

  const metrics = [
    { label: "Cân nặng", value: `${latest.weight}`, unit: "kg", prev: prev.weight, current: latest.weight, color: "text-blue-600", bg: "bg-blue-50", icon: Weight, better: "down" },
    { label: "Mỡ cơ thể", value: `${latest.fat}`, unit: "%", prev: prev.fat, current: latest.fat, color: "text-red-500", bg: "bg-red-50", icon: Heart, better: "down" },
    { label: "Cơ bắp", value: `${latest.muscle}`, unit: "kg", prev: prev.muscle, current: latest.muscle, color: "text-emerald-600", bg: "bg-emerald-50", icon: Dumbbell, better: "up" },
    { label: "BMI", value: `${latest.bmi}`, unit: "", prev: prev.bmi, current: latest.bmi, color: "text-purple-600", bg: "bg-purple-50", icon: Ruler, better: "down" },
  ];

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const diff = m.current - m.prev;
          const isGood = m.better === "down" ? diff <= 0 : diff >= 0;
          return (
            <div key={m.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-gray-500">{m.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontWeight: 800, fontSize: "1.4rem" }} className="text-gray-900">{m.value}</span>
                <span style={{ fontSize: "0.78rem" }} className="text-gray-400">{m.unit}</span>
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${isGood ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`} style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)} so tháng trước
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Body chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Biến đổi cơ thể</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">7 tháng gần nhất</div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span style={{ fontSize: "0.72rem" }} className="text-gray-500">Cân nặng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span style={{ fontSize: "0.72rem" }} className="text-gray-500">% Mỡ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span style={{ fontSize: "0.72rem" }} className="text-gray-500">Cơ bắp</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={BODY_METRICS_HISTORY} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip key="tooltip" contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
            <Line key="line-weight" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} />
            <Line key="line-fat" type="monotone" dataKey="fat" name="Mỡ (%)" stroke="#f87171" strokeWidth={2.5} dot={{ r: 4, fill: "#f87171", strokeWidth: 0 }} />
            <Line key="line-muscle" type="monotone" dataKey="muscle" name="Cơ bắp (kg)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ExerciseProgressSection() {
  const [selected, setSelected] = useState("squat");
  const selectedEx = EXERCISE_PROGRESS.find((e) => e.id === selected)!;

  // combined chart data
  const combinedData = EXERCISE_PROGRESS[0].history.map((_, i) => {
    const row: Record<string, string | number> = { month: EXERCISE_PROGRESS[0].history[i].month };
    EXERCISE_PROGRESS.forEach((ex) => {
      row[ex.id] = ex.history[i].value;
    });
    return row;
  });

  return (
    <div className="space-y-5">
      {/* Exercise cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {EXERCISE_PROGRESS.map((ex) => {
          const change = pct(ex.current1RM, ex.prev1RM);
          const isActive = selected === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => setSelected(ex.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                isActive ? "border-orange-300 bg-orange-50 shadow-md" : "border-gray-100 bg-white hover:border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "1.2rem" }}>{ex.emoji}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-900">{ex.name}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span style={{ fontWeight: 800, fontSize: "1.4rem" }} className="text-gray-900">{ex.current1RM}</span>
                <span style={{ fontSize: "0.75rem" }} className="text-gray-400">{ex.unit}</span>
              </div>
              <div className="mt-1">
                <TrendBadge value={change} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Combined 1RM chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Tiến trình 1RM</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">So sánh tất cả bài tập</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={combinedData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
            {EXERCISE_PROGRESS.map((ex) => (
              <Line
                key={ex.id}
                type="monotone"
                dataKey={ex.id}
                name={ex.name}
                stroke={ex.color}
                strokeWidth={selected === ex.id ? 3 : 1.5}
                strokeOpacity={selected === ex.id ? 1 : 0.4}
                dot={selected === ex.id ? { r: 5, fill: ex.color, strokeWidth: 0 } : false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Selected detail */}
        <div className="mt-4 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: selectedEx.color + "40", background: selectedEx.color + "08" }}>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span style={{ fontSize: "0.75rem" }} className="text-gray-500">Bài tập</span>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">{selectedEx.emoji} {selectedEx.name}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem" }} className="text-gray-500">1RM hiện tại</span>
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">{selectedEx.current1RM}{selectedEx.unit}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem" }} className="text-gray-500">1RM trước</span>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }} className="text-gray-500">{selectedEx.prev1RM}{selectedEx.unit}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem" }} className="text-gray-500">Tăng</span>
              <div style={{ fontWeight: 700 }}><TrendBadge value={pct(selectedEx.current1RM, selectedEx.prev1RM)} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIScoreSection() {
  return (
    <div className="space-y-5">
      {/* AI Score trend */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Xu hướng AI Score</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Điểm kỹ thuật qua từng tháng</div>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-purple-600">AI Powered</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={AI_SCORE_HISTORY} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs key="defs">
              <linearGradient id="progressAvgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[50, 100]} />
            <Tooltip key="tooltip" contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
            <Line key="line-squat" type="monotone" dataKey="squat" name="Squat" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
            <Line key="line-bench" type="monotone" dataKey="bench" name="Bench Press" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
            <Line key="line-deadlift" type="monotone" dataKey="deadlift" name="Deadlift" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} />
            <Area key="area-avg" type="monotone" dataKey="avg" name="Trung bình" stroke="#f97316" strokeWidth={2.5} fill="url(#progressAvgGrad)" dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Radar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Biểu đồ năng lực</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Radar name="Năng lực" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Chi tiết AI Score hiện tại</div>
          <div className="space-y-4">
            {[
              { name: "Squat", score: 92, prev: 90, color: "#10b981", emoji: "🦵" },
              { name: "Bench Press", score: 85, prev: 83, color: "#3b82f6", emoji: "💪" },
              { name: "Deadlift", score: 82, prev: 78, color: "#f59e0b", emoji: "🏋️" },
            ].map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "1rem" }}>{s.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-900">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 800, fontSize: "1.05rem" }} className="text-gray-900">{s.score}</span>
                    <span style={{ fontSize: "0.72rem" }} className="text-gray-400">/100</span>
                    <TrendBadge value={s.score - s.prev} suffix="pt" />
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}

            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-orange-500" />
                <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-gray-900">Trung bình: 87/100</span>
              </div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-500">Top 15% học viên trên CoachFinder. Tăng 3 điểm so với tháng trước!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementsSection() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked);
  const locked = ACHIEVEMENTS.filter((a) => !a.unlocked);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Thành tích</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">{unlocked.length}/{ACHIEVEMENTS.length} đã mở khóa</div>
          </div>
        </div>
        {/* progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }} />
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-amber-600">{Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {unlocked.map((a) => (
          <div key={a.id} className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-2">
              <span style={{ fontSize: "1.5rem" }}>{a.icon}</span>
              <div className="min-w-0">
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-900 truncate">{a.title}</div>
                <div style={{ fontSize: "0.72rem" }} className="text-gray-500 truncate">{a.desc}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{a.date}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        ))}
        {locked.map((a) => (
          <div key={a.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 opacity-60">
            <div className="flex items-center gap-2.5 mb-2">
              <span style={{ fontSize: "1.5rem" }} className="grayscale">{a.icon}</span>
              <div className="min-w-0">
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-500 truncate">{a.title}</div>
                <div style={{ fontSize: "0.72rem" }} className="text-gray-400 truncate">{a.desc}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "0.68rem" }} className="text-amber-500">{a.date}</span>
              <Target className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────��──────────────────────────────────────────
interface Props {
  onNavigate?: (view: string) => void;
}

export function ProgressTracking({ onNavigate }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [metricTab, setMetricTab] = useState<MetricTab>("overview");

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: "week", label: "Tuần" },
    { id: "month", label: "Tháng" },
    { id: "3months", label: "3 tháng" },
    { id: "year", label: "Năm" },
  ];

  const metricTabs: { id: MetricTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Tổng quan", icon: BarChart2 },
    { id: "body", label: "Cơ thể", icon: Heart },
    { id: "exercise", label: "Bài tập", icon: Dumbbell },
    { id: "ai", label: "AI Score", icon: Brain },
  ];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Buổi đã tập" value="24" sub="Tháng 3/2026" trend={12} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard icon={Clock} label="Tổng giờ tập" value="48h" sub="Tương đương ~86 tiếng" trend={28} color="text-blue-500" bg="bg-blue-50" />
        <StatCard icon={Flame} label="Calo tiêu thụ" value="14.4K" sub="kcal tháng này" trend={18} color="text-orange-500" bg="bg-orange-50" />
        <StatCard icon={Trophy} label="AI Score TB" value="87" sub="Top 15% học viên" trend={4} color="text-purple-500" bg="bg-purple-50" />
      </div>

      {/* Tab navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {metricTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMetricTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                metricTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontSize: "0.82rem", fontWeight: metricTab === tab.id ? 700 : 500 }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {(metricTab === "overview") && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {timeRanges.map((tr) => (
              <button
                key={tr.id}
                onClick={() => setTimeRange(tr.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === tr.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontSize: "0.78rem", fontWeight: timeRange === tr.id ? 700 : 500 }}
              >
                {tr.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab content */}
      {metricTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <TrainingChart timeRange={timeRange} />
            </div>
            <div>
              <HeatmapSection />
            </div>
          </div>
          <AchievementsSection />
        </div>
      )}

      {metricTab === "body" && <BodyMetricsSection />}
      {metricTab === "exercise" && <ExerciseProgressSection />}
      {metricTab === "ai" && <AIScoreSection />}
    </div>
  );
}