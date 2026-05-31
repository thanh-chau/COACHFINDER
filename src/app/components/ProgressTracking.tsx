import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Flame, Trophy, Target, Dumbbell,
  Calendar, Clock, CheckCircle2, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus, Brain, Zap, Star,
  BarChart2, Activity, Heart, Weight, Ruler, Award
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Cell
} from "recharts";
import {
  createBodyMetric,
  createExerciseProgress,
  getAchievements,
  getBodyMetrics,
  getExerciseProgress,
  getProgressHeatmap,
  getProgressOverview,
} from "../api/progress";
import { getMyVideoSubmissions } from "../api/videos";
import type {
  Achievement,
  BodyMetricEntry,
  ExerciseProgressEntry,
  ProgressOverview,
} from "../types/progress";
import type { CoachVideoSubmission } from "../types/video";

// ─── Types ───────────────────────────────────────────────────────────────────
type TimeRange = "week" | "month" | "3months" | "year";
type MetricTab = "overview" | "body" | "exercise" | "ai";

type BodyMetricChartRow = {
  month: string;
  weight: number;
  fat: number;
  muscle: number;
  bmi: number;
};

type ExerciseChartItem = {
  id: string;
  name: string;
  emoji: string;
  current1RM: number;
  prev1RM: number;
  unit: string;
  history: Array<{ month: string; value: number }>;
  color: string;
};

type AchievementCard = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  date: string;
  unlocked: boolean;
};

type AIScoreRow = {
  month: string;
  avg: number;
};

type AIScoreBreakdown = {
  name: string;
  score: number;
  prev: number;
  color: string;
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const WEEKLY_DATA: any[] = [];
const MONTHLY_DATA: any[] = [];
const QUARTERLY_DATA: any[] = [];
const BODY_METRICS_HISTORY: any[] = [];
const EXERCISE_PROGRESS: any[] = [];
const ACHIEVEMENTS: AchievementCard[] = [];
const WEEKLY_HEATMAP: number[][] = [];
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pct(current: number, prev: number) {
  if (prev === 0) return 0;
  return Math.round(((current - prev) / prev) * 100);
}

function textValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return textValue(record.name ?? record.title ?? record.label, fallback);
  }
  return fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return numberValue(record.value ?? record.score ?? record.total, fallback);
  }
  return fallback;
}

function monthLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `T${date.getMonth() + 1}`;
}

function mapBodyMetricRows(entries: BodyMetricEntry[]): BodyMetricChartRow[] {
  const source = Array.isArray(entries) ? entries : [];
  const rows = source
    .filter((entry) => entry.weight || entry.bodyFat || entry.muscleMass)
    .map((entry) => {
      const weight = entry.weight ?? 0;
      return {
        month: monthLabel(entry.measuredAt),
        weight,
        fat: entry.bodyFat ?? 0,
        muscle: entry.muscleMass ?? 0,
        bmi: weight ? Number((weight / (1.7 * 1.7)).toFixed(1)) : 0,
      };
    });
  return rows.length >= 2 ? rows.slice(-7) : BODY_METRICS_HISTORY;
}

function mapExerciseRows(entries: ExerciseProgressEntry[]): ExerciseChartItem[] {
  const source = Array.isArray(entries) ? entries : [];
  const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#f59e0b"];
  const grouped = source.reduce<Record<string, ExerciseProgressEntry[]>>((acc, entry) => {
    const key = entry.exerciseName || "Exercise";
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});

  const mapped = Object.entries(grouped).map(([name, rows], index) => {
    const sorted = [...rows].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2] ?? latest;
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `exercise-${index}`,
      name,
      emoji: "💪",
      current1RM: latest?.value ?? 0,
      prev1RM: prev?.value ?? 0,
      unit: latest?.unit ?? "kg",
      history: sorted.slice(-6).map((entry) => ({
        month: monthLabel(entry.measuredAt),
        value: entry.value,
      })),
      color: colors[index % colors.length],
    };
  });

  return mapped.length ? mapped : EXERCISE_PROGRESS;
}

function mapHeatmapRows(points: Array<{ date: string; value: number }>) {
  if (!Array.isArray(points)) return WEEKLY_HEATMAP;
  if (!points.length) return WEEKLY_HEATMAP;
  const recent = points.slice(-84);
  const weeks: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const week = recent.slice(i * 7, i * 7 + 7).map((point) => Math.min(2, point.value));
    weeks.push(week.length === 7 ? week : [...week, ...Array(7 - week.length).fill(0)]);
  }
  return weeks.length ? weeks : WEEKLY_HEATMAP;
}

function mapAchievements(items: Achievement[]) {
  if (!Array.isArray(items)) return ACHIEVEMENTS;
  if (!items.length) return ACHIEVEMENTS;
  return items.map((item, index) => ({
    id: item.id,
    icon: ["🔥", "🏆", "💪", "🎯"][index % 4],
    title: item.title,
    desc: item.description,
    date: new Date(item.achievedAt).toLocaleDateString("vi-VN"),
    unlocked: true,
  }));
}

function mapAIScoreRows(items: CoachVideoSubmission[]): AIScoreRow[] {
  const scored = (Array.isArray(items) ? items : []).filter(item => item.totalScore != null);
  const grouped = scored.reduce<Record<string, number[]>>((acc, item) => {
    const key = monthLabel(item.submittedAt);
    acc[key] = [...(acc[key] ?? []), numberValue(item.totalScore) * 10];
    return acc;
  }, {});
  return Object.entries(grouped).map(([month, scores]) => ({
    month,
    avg: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
  }));
}

function mapAIScoreBreakdown(items: CoachVideoSubmission[]): AIScoreBreakdown[] {
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];
  return (Array.isArray(items) ? items : [])
    .filter(item => item.totalScore != null)
    .slice(0, 4)
    .map((item, index) => ({
      name: item.videoTitle || `Bài nộp ${item.id}`,
      score: Math.round(numberValue(item.totalScore) * 10),
      prev: Math.round(numberValue(item.totalScore) * 10),
      color: colors[index % colors.length],
    }))
    .map((row) => ({ ...row, name: textValue(row.name, "Bài nộp") }));
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có ngày";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function isReviewedSubmission(submission: CoachVideoSubmission) {
  const status = textValue(submission.status).toUpperCase();
  return Boolean(
    status === "REVIEWED" ||
    status === "DONE" ||
    status === "PASSED" ||
    status === "APPROVED" ||
    submission.feedback ||
    submission.totalScore != null ||
    submission.postureScore != null ||
    submission.techniqueScore != null ||
    submission.rhythmScore != null ||
    submission.strengthScore != null,
  );
}

function statusLabel(status?: string | null, reviewed = false) {
  const normalized = textValue(status).toUpperCase();
  if (reviewed) return "Đã nhận xét";
  if (normalized === "REVIEWED" || normalized === "DONE") return "Đã nhận xét";
  if (normalized === "APPROVED") return "Đạt";
  if (normalized === "REJECTED") return "Cần cải thiện";
  return "Chờ nhận xét";
}

function statusClass(status?: string | null, reviewed = false) {
  const normalized = textValue(status).toUpperCase();
  if (reviewed) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (normalized === "REVIEWED" || normalized === "DONE" || normalized === "APPROVED") {
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  }
  if (normalized === "REJECTED") return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-blue-50 text-blue-600 border-blue-100";
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

function HeatmapSection({ heatmap = WEEKLY_HEATMAP, streakDays = 14 }: { heatmap?: number[][]; streakDays?: number }) {
  const activeDays = heatmap.flat().filter((value) => value > 0).length;
  const totalDays = heatmap.flat().length || 84;
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
          {heatmap.map((week, wi) => (
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
          <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-900">{streakDays} ngày streak</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="text-gray-600">{activeDays}/{totalDays} ngày ({Math.round((activeDays / totalDays) * 100)}%)</span>
        </div>
      </div>
    </div>
  );
}

function AchievementsSection({ achievements = ACHIEVEMENTS }: { achievements?: AchievementCard[] }) {
  const rows = Array.isArray(achievements) ? achievements : [];
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Thành tích</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400">{rows.length} mục đã mở khóa</div>
        </div>
        <Award className="w-4 h-4 text-amber-500" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-gray-400" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          Chưa có thành tích từ API.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rows.map((item) => (
            <div key={item.id} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "1.35rem" }}>{item.icon}</span>
                <div className="min-w-0">
                  <div className="truncate text-gray-900" style={{ fontSize: "0.85rem", fontWeight: 800 }}>{item.title}</div>
                  <div className="truncate text-gray-500" style={{ fontSize: "0.72rem" }}>{item.desc}</div>
                  <div className="text-amber-600 mt-1" style={{ fontSize: "0.72rem", fontWeight: 700 }}>{item.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainingChart({ timeRange, overview }: { timeRange: TimeRange; overview: ProgressOverview | null }) {
  const apiData = timeRange === "week" ? (overview?.weeklySummary ?? WEEKLY_DATA)
    : timeRange === "3months" ? (overview?.quarterlySummary ?? QUARTERLY_DATA)
    : (overview?.monthlySummary ?? MONTHLY_DATA);
  const data = (Array.isArray(apiData) ? apiData : []).map((row) => ({
    ...row,
    hours: numberValue((row as Record<string, unknown>).hours),
    calories: numberValue((row as Record<string, unknown>).calories),
    caloriesScaled: Number((numberValue((row as Record<string, unknown>).calories) / 100).toFixed(1)),
  }));

  const dataKey = timeRange === "week" ? "day" : "label";
  const summaryItems = [
    { label: "Giờ tập", value: overview?.trainingHours ?? 0, max: 12, color: "bg-orange-500", suffix: "h" },
    { label: "Buổi đã tập", value: overview?.totalSessions ?? 0, max: 8, color: "bg-emerald-500", suffix: "" },
    { label: "AI Score", value: overview?.averageAiScore ?? 0, max: 100, color: "bg-purple-500", suffix: "" },
  ];

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
              return [`${Math.round(v * 100)} kcal`, "Calo tiêu thụ"];
            }}
          />
          <Bar key="bar-hours" dataKey="hours" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={32} />
          <Bar key="bar-cal" dataKey="caloriesScaled" name="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {summaryItems.map((item) => {
          const pctValue = Math.min(100, Math.round((Number(item.value || 0) / item.max) * 100));
          return (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "0.76rem", fontWeight: 700 }} className="text-gray-600">{item.label}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className="text-gray-900">{item.value}{item.suffix}</span>
              </div>
              <div className="h-2 rounded-full bg-white overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pctValue > 0 ? Math.max(8, pctValue) : 0}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BodyMetricsSection({ data = BODY_METRICS_HISTORY }: { data?: BodyMetricChartRow[] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center text-gray-500" style={{ fontSize: "0.86rem", fontWeight: 600 }}>
        Chưa có dữ liệu chỉ số cơ thể từ API.
      </div>
    );
  }

  const latest = data[data.length - 1] ?? BODY_METRICS_HISTORY[BODY_METRICS_HISTORY.length - 1];
  const prev = data[data.length - 2] ?? latest;

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
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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

function ExerciseProgressSection({ data = EXERCISE_PROGRESS }: { data?: ExerciseChartItem[] }) {
  const [selected, setSelected] = useState(data[0]?.id ?? "squat");

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center text-gray-500" style={{ fontSize: "0.86rem", fontWeight: 600 }}>
        Chưa có dữ liệu tiến độ bài tập từ API.
      </div>
    );
  }

  const selectedEx = data.find((e) => e.id === selected) ?? data[0] ?? EXERCISE_PROGRESS[0];

  // combined chart data
  const longestHistory = data.reduce((max, ex) => ex.history.length > max.length ? ex.history : max, data[0]?.history ?? []);
  const combinedData = longestHistory.map((point, i) => {
    const row: Record<string, string | number> = { month: point.month };
    data.forEach((ex) => {
      row[ex.id] = ex.history[i]?.value ?? 0;
    });
    return row;
  });

  return (
    <div className="space-y-5">
      {/* Exercise cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {data.map((ex) => {
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
            {data.map((ex) => (
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

function AIScoreSection({ trend, breakdown }: { trend: AIScoreRow[]; breakdown: AIScoreBreakdown[] }) {
  if (!trend.length && !breakdown.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center text-gray-500" style={{ fontSize: "0.86rem", fontWeight: 600 }}>
        Chưa có kết quả nhận xét từ coach. Khi coach chấm bài nộp video, điểm sẽ hiển thị tại đây.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Xu hướng AI Score</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Dữ liệu lấy từ bài nộp đã được coach nhận xét</div>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-purple-600">Coach Review</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={trend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs key="defs">
              <linearGradient id="progressAvgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip key="tooltip" contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
            <Area key="area-avg" type="monotone" dataKey="avg" name="Trung bình" stroke="#f97316" strokeWidth={2.5} fill="url(#progressAvgGrad)" dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Kết quả bài nộp gần nhất</div>
        <div className="space-y-4">
          {breakdown.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <span style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-900 truncate">{s.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span style={{ fontWeight: 800, fontSize: "1.05rem" }} className="text-gray-900">{s.score}</span>
                  <span style={{ fontSize: "0.72rem" }} className="text-gray-400">/100</span>
                  <TrendBadge value={s.score - s.prev} suffix="pt" />
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: String(s.score) + "%", backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
function SubmissionReviewsSection({ submissions }: { submissions: CoachVideoSubmission[] }) {
  const rows = (Array.isArray(submissions) ? submissions : [])
    .slice()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Video đã nộp cho coach</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Xem lại video đã nộp và nhận xét sau khi coach chấm bài</div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
          {rows.length} bài
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-gray-400" style={{ fontSize: "0.84rem", fontWeight: 600 }}>
          Chưa có video nào được nộp. Khi bạn nộp video trong thư viện 360°, bài nộp sẽ xuất hiện ở tab này.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((item) => {
            const scores = [
              ["Tư thế", item.postureScore],
              ["Kỹ thuật", item.techniqueScore],
              ["Nhịp điệu", item.rhythmScore],
              ["Sức mạnh", item.strengthScore],
            ].filter(([, score]) => score != null);
            const videoTitle = textValue(item.videoTitle, `Bài nộp ${item.id}`);
            const videoUrl = textValue(item.videoUrl);
            const feedback = textValue(item.feedback);
            const totalScore = item.totalScore == null ? null : numberValue(item.totalScore);
            const reviewed = isReviewedSubmission(item);

            return (
              <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video">
                    {videoUrl ? (
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/60" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                        Chưa có video
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="text-gray-900 truncate" style={{ fontSize: "0.95rem", fontWeight: 800 }}>{videoTitle}</div>
                      <span className={`px-2 py-0.5 rounded-full border ${statusClass(item.status, reviewed)}`} style={{ fontSize: "0.68rem", fontWeight: 800 }}>
                        {statusLabel(item.status, reviewed)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-gray-400 mb-3" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
                      <span>Nộp ngày {formatDate(item.submittedAt)}</span>
                      {totalScore != null && <span className="text-purple-600">Điểm tổng {Math.round(totalScore * 10)}/100</span>}
                    </div>
                    {feedback ? (
                      <div className="rounded-xl bg-white border border-gray-100 p-3 text-gray-700" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                        {feedback}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-white border border-dashed border-gray-200 p-3 text-gray-400" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        Coach chưa gửi nhận xét cho bài này.
                      </div>
                    )}
                    {scores.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        {scores.map(([label, score]) => (
                          <div key={String(label)} className="rounded-xl bg-white border border-gray-100 p-2">
                            <div className="text-gray-400" style={{ fontSize: "0.68rem", fontWeight: 700 }}>{label}</div>
                            <div className="text-gray-900" style={{ fontSize: "0.95rem", fontWeight: 900 }}>{numberValue(score)}/10</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Props {
  onNavigate?: (view: string) => void;
}

export function ProgressTracking({ onNavigate }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [metricTab, setMetricTab] = useState<MetricTab>("overview");
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricChartRow[]>(BODY_METRICS_HISTORY);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseChartItem[]>(EXERCISE_PROGRESS);
  const [heatmap, setHeatmap] = useState<number[][]>(WEEKLY_HEATMAP);
  const [achievements, setAchievements] = useState<AchievementCard[]>(ACHIEVEMENTS);
  const [aiScoreTrend, setAiScoreTrend] = useState<AIScoreRow[]>([]);
  const [aiScoreBreakdown, setAiScoreBreakdown] = useState<AIScoreBreakdown[]>([]);
  const [mySubmissions, setMySubmissions] = useState<CoachVideoSubmission[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [bodyForm, setBodyForm] = useState({
    measuredAt: new Date().toISOString().slice(0, 10),
    weight: "",
    bodyFat: "",
    muscleMass: "",
    note: "",
  });
  const [exerciseForm, setExerciseForm] = useState({
    measuredAt: new Date().toISOString().slice(0, 10),
    exerciseName: "Squat",
    value: "",
    unit: "kg",
  });

  const loadProgress = async () => {
    try {
      const [overviewData, bodyData, exerciseData, heatmapData, achievementData, submissionData] = await Promise.all([
        getProgressOverview(),
        getBodyMetrics(),
        getExerciseProgress(),
        getProgressHeatmap(),
        getAchievements(),
        getMyVideoSubmissions(),
      ]);
      setOverview(overviewData);
      setBodyMetrics(mapBodyMetricRows(bodyData));
      setExerciseProgress(mapExerciseRows(exerciseData));
      setHeatmap(mapHeatmapRows(heatmapData));
      setAchievements(mapAchievements(achievementData));
      setMySubmissions(Array.isArray(submissionData) ? submissionData : []);
      setAiScoreTrend(mapAIScoreRows(submissionData));
      setAiScoreBreakdown(mapAIScoreBreakdown(submissionData));
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Không thể tải dữ liệu tiến độ.");
    }
  };

  useEffect(() => {
    void loadProgress();
  }, []);

  const submitBodyMetric = async () => {
    setSavingProgress(true);
    setActionNotice(null);
    try {
      await createBodyMetric({
        measuredAt: bodyForm.measuredAt,
        weight: bodyForm.weight ? Number(bodyForm.weight) : undefined,
        bodyFat: bodyForm.bodyFat ? Number(bodyForm.bodyFat) : undefined,
        muscleMass: bodyForm.muscleMass ? Number(bodyForm.muscleMass) : undefined,
        note: bodyForm.note.trim() || undefined,
      });
      setActionNotice("Đã lưu chỉ số cơ thể.");
      await loadProgress();
    } catch (error) {
      setActionNotice(error instanceof Error ? error.message : "Không lưu được chỉ số cơ thể.");
    } finally {
      setSavingProgress(false);
    }
  };

  const submitExerciseProgress = async () => {
    const value = Number(exerciseForm.value);
    if (!exerciseForm.exerciseName.trim() || !Number.isFinite(value)) {
      setActionNotice("Vui lòng nhập tên bài tập và giá trị hợp lệ.");
      return;
    }
    setSavingProgress(true);
    setActionNotice(null);
    try {
      await createExerciseProgress({
        measuredAt: exerciseForm.measuredAt,
        exerciseName: exerciseForm.exerciseName.trim(),
        value,
        unit: exerciseForm.unit.trim() || "kg",
      });
      setActionNotice("Đã lưu tiến độ bài tập.");
      await loadProgress();
    } catch (error) {
      setActionNotice(error instanceof Error ? error.message : "Không lưu được tiến độ bài tập.");
    } finally {
      setSavingProgress(false);
    }
  };

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
  const reviewedSubmissionCount = aiScoreBreakdown.length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Buổi đã tập" value={String(overview?.totalSessions ?? 0)} sub="Theo dữ liệu đặt lịch" color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard icon={Clock} label="Tổng giờ tập" value={`${overview?.trainingHours ?? 0}h`} sub="Tổng thời lượng ước tính" color="text-blue-500" bg="bg-blue-50" />
        <StatCard icon={Flame} label="Bài đã nhận xét" value={String(reviewedSubmissionCount)} sub="Từ video bạn đã nộp" color="text-orange-500" bg="bg-orange-50" />
        <StatCard icon={Trophy} label="AI Score TB" value={String(overview?.averageAiScore ?? 0)} sub={`${overview?.activeCoaches ?? 0} HLV đang hoạt động`} color="text-purple-500" bg="bg-purple-50" />
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

      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          Không tải được API tiến độ: {apiError}
        </div>
      )}

      {actionNotice && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          {actionNotice}
        </div>
      )}

      {metricTab === "body" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-red-500" />
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">Cập nhật chỉ số cơ thể</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input type="date" value={bodyForm.measuredAt} onChange={e => setBodyForm(p => ({ ...p, measuredAt: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <input type="number" placeholder="Cân nặng kg" value={bodyForm.weight} onChange={e => setBodyForm(p => ({ ...p, weight: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <input type="number" placeholder="Mỡ %" value={bodyForm.bodyFat} onChange={e => setBodyForm(p => ({ ...p, bodyFat: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <input type="number" placeholder="Cơ bắp kg" value={bodyForm.muscleMass} onChange={e => setBodyForm(p => ({ ...p, muscleMass: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <button onClick={submitBodyMetric} disabled={savingProgress} className="rounded-xl bg-red-500 px-4 py-2.5 text-white disabled:opacity-60" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
              {savingProgress ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
          <input value={bodyForm.note} onChange={e => setBodyForm(p => ({ ...p, note: e.target.value }))} placeholder="Ghi chú" className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
        </div>
      )}

      {metricTab === "exercise" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">Cập nhật tiến độ bài tập</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input type="date" value={exerciseForm.measuredAt} onChange={e => setExerciseForm(p => ({ ...p, measuredAt: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <input value={exerciseForm.exerciseName} onChange={e => setExerciseForm(p => ({ ...p, exerciseName: e.target.value }))} placeholder="Bài tập" className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <input type="number" value={exerciseForm.value} onChange={e => setExerciseForm(p => ({ ...p, value: e.target.value }))} placeholder="Giá trị" className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <input value={exerciseForm.unit} onChange={e => setExerciseForm(p => ({ ...p, unit: e.target.value }))} placeholder="Đơn vị" className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none" style={{ fontSize: "0.82rem" }} />
            <button onClick={submitExerciseProgress} disabled={savingProgress} className="rounded-xl bg-orange-500 px-4 py-2.5 text-white disabled:opacity-60" style={{ fontSize: "0.82rem", fontWeight: 800 }}>
              {savingProgress ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      )}

      {/* Tab content */}
      {metricTab === "overview" && (
        <div className="space-y-6">
          <TrainingChart timeRange={timeRange} overview={overview} />
          <HeatmapSection heatmap={heatmap} streakDays={overview?.streakDays ?? 0} />
          <AchievementsSection achievements={achievements} />
        </div>
      )}

      {metricTab === "body" && <BodyMetricsSection data={bodyMetrics} />}
      {metricTab === "exercise" && <ExerciseProgressSection data={exerciseProgress} />}
      {metricTab === "ai" && (
        <div className="space-y-5">
          <AIScoreSection trend={aiScoreTrend} breakdown={aiScoreBreakdown} />
          <SubmissionReviewsSection submissions={mySubmissions} />
        </div>
      )}
    </div>
  );
}
