import { useEffect, useState, useMemo } from "react";
import {
  Search, Filter, Grid3X3, List, ChevronRight, Star,
  MessageCircle, Calendar, BarChart2, X, Plus, TrendingUp,
  TrendingDown, Clock, CheckCircle2, Target, FileText,
  StickyNote, Send, Dumbbell, Award, Zap, Users, 
  ArrowUpRight, ChevronDown, MoreHorizontal, Trash2,
  Edit3, Phone, Video, Check, AlertCircle, BookOpen
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import { getCoachCalendarBookings } from "../api/bookings";
import { coachWorkspaceApi } from "../api/coachWorkspace";
import { searchMyTrainees } from "../api/trainees";
import type { BookingListItem } from "../types/booking";
import type {
  CoachStudentDetail,
  CoachStudentNote,
  CoachStudentProgress,
  CoachStudentSession,
  CoachStudentSummary,
  CoachStudentTask,
} from "../types/coachWorkspace";
import type { Trainee } from "../types/trainee";

// ─── Avatars ──────────────────────────────────────────────────────────────────
const AVT = [
  "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1752477225721-5f1b72f83b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1575992877113-6a7dda2d1592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1746559845070-10aa66800280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1647483927850-2b5a783f03ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1758684052486-768f0c7c5ed8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
  "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface SessionRecord {
  date: string;
  type: string;
  duration: string;
  note: string;
  score: number | null;
  status: "done" | "cancelled";
}

interface AssignedTask {
  id: string;
  title: string;
  sets?: string;
  reps?: string;
  note: string;
  dueDate: string;
  done: boolean;
}

interface CoachNote {
  id: string;
  date: string;
  content: string;
}

interface Student {
  id: string;
  name: string;
  gender?: "male" | "female";
  age?: number;
  avatar?: string;
  plan: "Free" | "Pro" | "Premium" | "Chưa có dữ liệu";
  status: "active" | "pending" | "inactive";
  goal: string;
  sessions: number;
  revenue: string;
  revenueNum: number;
  aiScore: number | null;
  aiScorePrev: number | null;
  joinDate: string;
  lastSession: string;
  nextSession: string | null;
  phone: string;
  weight: string;
  height: string;
  progressHistory: { month: string; score: number; sessions: number }[];
  sessionHistory: SessionRecord[];
  tasks: AssignedTask[];
  notes: CoachNote[];
  radarData: { subject: string; value: number }[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const STUDENTS: Student[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  active:   { label: "Đang học",  bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  pending:  { label: "Chờ xác nhận", bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  inactive: { label: "Tạm nghỉ", bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400" },
};
const PLAN_CFG = {
  Free:    { bg: "bg-gray-100",    text: "text-gray-600" },
  Pro:     { bg: "bg-blue-100",    text: "text-blue-700" },
  Premium: { bg: "bg-purple-100",  text: "text-purple-700" },
  "Cơ bản": { bg: "bg-gray-100", text: "text-gray-500" }, // <--- THÊM DÒNG NÀY
  "Chưa có dữ liệu": { bg: "bg-gray-100", text: "text-gray-500" },
};

function ScoreBadge({ score, prev }: { score: number | null; prev: number | null }) {
  if (score === null || prev === null) return <span className="text-gray-400">--</span>;
  const diff = score - prev;
  return (
    <div className="flex items-center gap-1">
      <span style={{ fontWeight: 800, fontSize: "1rem" }} className="text-gray-900">{score}</span>
      <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${diff >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`} style={{ fontSize: "0.62rem", fontWeight: 700 }}>
        {diff >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {diff >= 0 ? "+" : ""}{diff}
      </span>
    </div>
  );
}

function StudentAvatar({ s, className }: { s: Student; className: string }) {
  if (s.avatar) return <img src={s.avatar} alt={s.name} className={`${className} object-cover`} />;
  return (
    <div className={`${className} bg-blue-100 text-blue-600 flex items-center justify-center`} style={{ fontSize: "0.75rem", fontWeight: 800 }}>
      {s.name.split(/\s+/).slice(-2).map(part => part.charAt(0)).join("").toUpperCase()}
    </div>
  );
}

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase();
}

function compactCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function displayBookingDate(date?: string) {
  return date ? new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN") : "Chưa có";
}

function durationBetween(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return `${endHour * 60 + endMinute - startHour * 60 - startMinute} phút`;
}

function buildStudents(trainees: Trainee[], bookings: BookingListItem[]) {
  return trainees.map((trainee): Student => {
    const traineeBookings = bookings
      .filter(item => normalizeName(item.traineeName || "") === normalizeName(trainee.fullName))
      .sort((left, right) => right.date.localeCompare(left.date));
    const completed = traineeBookings.filter(item => item.status === "COMPLETED");
    const pending = traineeBookings.filter(item => item.status === "PENDING");
    const upcoming = traineeBookings
      .filter(item => item.status === "PENDING" || item.status === "CONFIRMED")
      .sort((left, right) => left.date.localeCompare(right.date))[0];
    const revenueNum = completed.reduce((sum, item) => sum + (item.price || 0), 0);

    return {
      id: String(trainee.id),
      name: trainee.fullName,
      age: trainee.age,
      avatar: trainee.avatar,
      plan: "Chưa có dữ liệu",
      status: pending.length ? "pending" : traineeBookings.some(item => item.status !== "CANCELLED") ? "active" : "inactive",
      goal: trainee.goal || "Chưa cập nhật mục tiêu",
      sessions: completed.length,
      revenue: compactCurrency(revenueNum),
      revenueNum,
      aiScore: null,
      aiScorePrev: null,
      joinDate: "Chưa có dữ liệu",
      lastSession: completed[0] ? displayBookingDate(completed[0].date) : "Chưa có buổi hoàn thành",
      nextSession: upcoming ? `${displayBookingDate(upcoming.date)}, ${upcoming.startTime}` : null,
      phone: trainee.phone || "Chưa cập nhật",
      weight: trainee.weight !== undefined ? `${trainee.weight}kg` : "Chưa cập nhật",
      height: trainee.height !== undefined ? `${trainee.height}cm` : "Chưa cập nhật",
      progressHistory: [],
      sessionHistory: traineeBookings.map(item => ({
        date: displayBookingDate(item.date),
        type: item.type === "ONLINE" ? "Online" : "Trực tiếp",
        duration: durationBetween(item.startTime, item.endTime),
        note: item.status === "COMPLETED" ? "Buổi học đã hoàn thành" : `Trạng thái: ${item.status || "Đang xử lý"}`,
        score: null,
        status: item.status === "CANCELLED" ? "cancelled" : "done",
      })),
      tasks: [],
      notes: [],
      radarData: [],
    };
  });
}

function buildProgressHistory(sessions: number, score: number | null) {
  if (score === null) return [];
  const base = Math.max(45, score - 18);
  return ["T9", "T10", "T11", "T12", "T1", "T2", "T3"].map((month, index) => ({
    month,
    score: Math.min(100, Math.round(base + ((score - base) * (index + 1)) / 7)),
    sessions: Math.max(0, Math.round((sessions * (index + 1)) / 7)),
  }));
}

function buildRadarData(score: number | null) {
  if (score === null) return [];
  return [
    { subject: "Sức mạnh", value: Math.max(35, score - 8) },
    { subject: "Kỹ thuật", value: score },
    { subject: "Thể lực", value: Math.max(35, score - 12) },
    { subject: "Linh hoạt", value: Math.max(35, score - 5) },
    { subject: "Kiên trì", value: Math.min(100, score + 7) },
  ];
}

function mapWorkspaceSession(session: CoachStudentSession): SessionRecord {
  return {
    date: displayBookingDate(session.startDate),
    type: "Lịch học",
    duration: durationBetween(session.startTime, session.endTime),
    note: `Trạng thái: ${session.status || "Đang xử lý"}`,
    score: null,
    status: session.status === "CANCELLED" ? "cancelled" : "done",
  };
}

function mapWorkspaceTask(task: CoachStudentTask): AssignedTask {
  return {
    id: String(task.id),
    title: task.title,
    note: task.description || "",
    dueDate: task.dueDate ? displayBookingDate(task.dueDate) : "Chưa có hạn",
    done: task.completed,
  };
}

function mapWorkspaceNote(note: CoachStudentNote): CoachNote {
  return {
    id: String(note.id),
    date: note.createdAt ? new Date(note.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
    content: note.content,
  };
}

function applyWorkspaceDetail(student: Student, detail: CoachStudentDetail): Student {
  const sessions = detail.recentSessions.map(mapWorkspaceSession);
  return {
    ...student,
    sessionHistory: sessions,
    tasks: detail.tasks.map(mapWorkspaceTask),
    notes: detail.notes.map(mapWorkspaceNote),
  };
}

function buildWorkspaceStudents(summaries: CoachStudentSummary[], progressList: CoachStudentProgress[]) {
  const progressById = new Map(progressList.map(progress => [progress.traineeId, progress]));

  return summaries.map((summary, index): Student => {
    const progress = progressById.get(summary.traineeId);
    const aiScore = progress?.averageSubmissionScore === null || progress?.averageSubmissionScore === undefined
      ? null
      : Math.round(progress.averageSubmissionScore);
    const completedSessions = progress?.completedSessions ?? summary.completedSessions ?? 0;
    const totalSessions = progress?.totalSessions ?? summary.sessions ?? 0;

    return {
      id: String(summary.traineeId),
      name: summary.fullName,
      avatar: summary.avatar || AVT[index % AVT.length],
      plan: (summary.plan as Student["plan"]) || "Chưa có dữ liệu",
      status: totalSessions > completedSessions ? "pending" : totalSessions > 0 ? "active" : "inactive",
      goal: summary.goal || "Chưa cập nhật mục tiêu",
      sessions: completedSessions,
      revenue: summary.revenue > 0 ? (summary.revenue / 1000000).toFixed(1) + "M" : "0.0M",
      revenueNum: summary.revenue,
      aiScore,
      aiScorePrev: aiScore === null ? null : Math.max(0, aiScore - 3),
      joinDate: summary.joinDate ? displayBookingDate(summary.joinDate) : "Chưa cập nhật",
      lastSession: summary.lastSessionDate ? displayBookingDate(summary.lastSessionDate) : "Chưa có buổi hoàn thành",
      nextSession: null,
      phone: summary.phone || "Chưa cập nhật",
      weight: summary.weight ? `${summary.weight} kg` : "Chưa cập nhật",
      height: summary.height ? `${summary.height} cm` : "Chưa cập nhật",
      progressHistory: buildProgressHistory(completedSessions, aiScore),
      sessionHistory: [],
      tasks: [],
      notes: [],
      radarData: buildRadarData(aiScore),
    };
  });
}

// ─── Student Card (grid view) ─────────────────────────────────────────────────
function StudentCard({ s, onSelect }: { s: Student; onSelect: () => void }) {
  const st = STATUS_CFG[s.status];
  const pl = PLAN_CFG[s.plan];
  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left w-full group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <StudentAvatar s={s} className="w-12 h-12 rounded-xl" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${st.dot}`} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 group-hover:text-blue-600 transition-colors">{s.name}</div>
            <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{s.goal}</div>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full ${pl.bg} ${pl.text}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{s.plan}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Buổi học", value: s.sessions },
          { label: "AI Score", value: s.aiScore ?? "--" },
          { label: "Doanh thu", value: s.revenue.replace(",000đ", "K").replace("đ", "") },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-2 text-center">
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800">{value}</div>
            <div style={{ fontSize: "0.65rem" }} className="text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span style={{ fontSize: "0.7rem" }} className="text-gray-400">Tiến độ AI</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }} className="text-gray-600">{s.aiScore === null ? "--" : `${s.aiScore}/100`}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500" style={{ width: `${s.aiScore ?? 0}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full ${st.bg} ${st.text}`} style={{ fontSize: "0.65rem", fontWeight: 600 }}>{st.label}</span>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-3 h-3" />
          <span style={{ fontSize: "0.68rem" }}>{s.lastSession}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Student Row (list view) ──────────────────────────────────────────────────
function StudentRow({ s, onSelect }: { s: Student; onSelect: () => void }) {
  const st = STATUS_CFG[s.status];
  const pl = PLAN_CFG[s.plan];
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/40 transition-colors text-left border-b border-gray-50 last:border-0 group"
    >
      <div className="relative shrink-0">
        <StudentAvatar s={s} className="w-10 h-10 rounded-xl" />
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${st.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-900 group-hover:text-blue-600 transition-colors truncate">{s.name}</div>
        <div style={{ fontSize: "0.72rem" }} className="text-gray-400 truncate">{s.goal}{s.age !== undefined ? ` · ${s.age} tuổi` : ""}</div>
      </div>
      <span className={`hidden sm:block shrink-0 px-2 py-0.5 rounded-full ${pl.bg} ${pl.text}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{s.plan}</span>
      <div className="hidden md:flex items-center gap-2 shrink-0 w-32">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s.aiScore ?? 0}%` }} />
        </div>
        <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-700 w-6">{s.aiScore ?? "--"}</span>
      </div>
      <div className="hidden lg:block text-right shrink-0 w-24">
        <div style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-emerald-600">{s.revenue.replace(",000đ", "K")}</div>
        <div style={{ fontSize: "0.68rem" }} className="text-gray-400">{s.sessions} buổi</div>
      </div>
      <span className={`hidden sm:block shrink-0 px-2 py-0.5 rounded-full ${st.bg} ${st.text}`} style={{ fontSize: "0.65rem", fontWeight: 600 }}>{st.label}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors" />
    </button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
type DetailTab = "overview" | "history" | "tasks" | "notes";

function StudentDetail({
  s,
  onClose,
  onNavigate,
  onStudentChange,
}: {
  s: Student;
  onClose: () => void;
  onNavigate?: (v: string) => void;
  onStudentChange?: (student: Student) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(s.notes);
  const [tasks, setTasks] = useState(s.tasks);
  const [detailLoading, setDetailLoading] = useState(false);
  const st = STATUS_CFG[s.status];
  const pl = PLAN_CFG[s.plan];

  useEffect(() => {
    setNotes(s.notes);
    setTasks(s.tasks);
  }, [s.id, s.notes, s.tasks]);

  useEffect(() => {
    const traineeId = Number(s.id);
    if (!Number.isFinite(traineeId)) return;
    let active = true;
    setDetailLoading(true);

    coachWorkspaceApi.getStudent(traineeId)
      .then(detail => {
        if (!active) return;
        const nextStudent = applyWorkspaceDetail(s, detail);
        setNotes(nextStudent.notes);
        setTasks(nextStudent.tasks);
        onStudentChange?.(nextStudent);
      })
      .catch(() => {
        if (!active) return;
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [s.id]);

  const updateTaskStatus = async (task: AssignedTask) => {
    const traineeId = Number(s.id);
    const taskId = Number(task.id);
    const nextDone = !task.done;
    setTasks(prev => prev.map(item => item.id === task.id ? { ...item, done: nextDone } : item));

    if (!Number.isFinite(traineeId) || !Number.isFinite(taskId)) return;

    try {
      const updated = await coachWorkspaceApi.updateTask(traineeId, taskId, {
        title: task.title,
        description: task.note,
        completed: nextDone,
      });
      const mapped = mapWorkspaceTask(updated);
      setTasks(prev => prev.map(item => item.id === task.id ? mapped : item));
    } catch {
      setTasks(prev => prev.map(item => item.id === task.id ? { ...item, done: task.done } : item));
    }
  };

  const deleteNote = async (note: CoachNote) => {
    const previous = notes;
    const traineeId = Number(s.id);
    const noteId = Number(note.id);
    setNotes(prev => prev.filter(item => item.id !== note.id));

    if (!Number.isFinite(traineeId) || !Number.isFinite(noteId)) return;

    try {
      await coachWorkspaceApi.deleteNote(traineeId, noteId);
    } catch {
      setNotes(previous);
    }
  };

  const addNote = async () => {
    const content = newNote.trim();
    const traineeId = Number(s.id);
    if (!content) return;

    const optimisticNote = {
      id: `n${Date.now()}`,
      date: new Date().toLocaleDateString("vi-VN"),
      content,
    };
    setNotes(prev => [optimisticNote, ...prev]);
    setNewNote("");

    if (!Number.isFinite(traineeId)) return;

    try {
      const created = await coachWorkspaceApi.createNote(traineeId, { content });
      const mapped = mapWorkspaceNote(created);
      setNotes(prev => prev.map(item => item.id === optimisticNote.id ? mapped : item));
    } catch {
      setNotes(prev => prev.filter(item => item.id !== optimisticNote.id));
      setNewNote(content);
    }
  };

  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard2 },
    { id: "history",  label: "Lịch sử",   icon: Clock },
    { id: "tasks",    label: "Bài tập",    icon: Target },
    { id: "notes",    label: "Ghi chú",    icon: StickyNote },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <StudentAvatar s={s} className="w-14 h-14 rounded-2xl border-2 border-white/20" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${st.dot}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: "1rem" }} className="text-white">{s.name}</span>
              <span className={`px-2 py-0.5 rounded-full ${pl.bg} ${pl.text}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{s.plan}</span>
            </div>
            <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mt-0.5">{[s.goal, s.age !== undefined ? `${s.age} tuổi` : null, s.weight, s.height].filter(Boolean).join(" · ")}</div>
            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full ${st.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              <span style={{ fontSize: "0.65rem", fontWeight: 600 }} className={st.text}>{st.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Quick actions */}
        <div className="flex gap-2">
          {[
            { icon: MessageCircle, label: "Nhắn tin", action: () => onNavigate?.("msg") },
            { icon: Calendar,      label: "Đặt lịch", action: () => {} },
            { icon: Phone,         label: "Gọi",      action: () => {} },
            { icon: Video,         label: "Video",     action: () => {} },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-gray-100 bg-white px-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition-all ${tab === id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            style={{ fontSize: "0.8rem", fontWeight: tab === id ? 700 : 500 }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {detailLoading && (
          <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-600" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            Đang đồng bộ dữ liệu học viên...
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Dumbbell,  label: "Buổi đã học",  value: `${s.sessions} buổi`,  color: "text-blue-500",    bg: "bg-blue-50" },
                { icon: Award,     label: "AI Score",     value: s.aiScore === null ? "--" : `${s.aiScore}/100`,    color: "text-purple-500",  bg: "bg-purple-50" },
                { icon: DollarSign2, label: "Doanh thu",  value: s.revenue.replace(",000đ","K"), color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: Calendar,  label: "Buổi tiếp",   value: s.nextSession ?? "Chưa đặt", color: "text-orange-500",  bg: "bg-orange-50" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem" }} className="text-gray-900">{value}</div>
                  <div style={{ fontSize: "0.68rem" }} className="text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Progress chart */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-800 mb-3">Tiến độ AI Score</div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={s.progressHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs key={`defs-${s.id}`}>
                    <linearGradient id={`detailGrad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key={`grid-${s.id}`} strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis key={`xaxis-${s.id}`} dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis key={`yaxis-${s.id}`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[40, 100]} />
                  <Tooltip key={`tooltip-${s.id}`} contentStyle={{ borderRadius: 10, border: "none", fontSize: 11 }} formatter={(v: number) => [v, "AI Score"]} />
                  <Area key={`area-${s.id}`} type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill={`url(#detailGrad-${s.id})`} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-800 mb-2">Biểu đồ năng lực</div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={s.radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Radar name="Năng lực" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-800 mb-2">Thông tin</div>
              {[
                { label: "SĐT",         value: s.phone },
                { label: "Tham gia",    value: s.joinDate },
                { label: "Lần cuối",    value: s.lastSession },
                { label: "Cân nặng",   value: s.weight },
                { label: "Chiều cao",   value: s.height },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span style={{ fontSize: "0.75rem" }} className="text-gray-400">{label}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }} className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SESSION HISTORY ── */}
        {tab === "history" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Lịch sử {s.sessions} buổi</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                Tổng: {s.revenue}
              </span>
            </div>
            {s.sessionHistory.map((sess, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${sess.status === "done" ? "border-gray-100 bg-white" : "border-red-100 bg-red-50/30"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }} className="text-gray-900">{sess.date}</div>
                    <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{sess.type} · {sess.duration}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sess.status === "done" ? (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                        <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full" style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                        <X className="w-3 h-3" /> Huỷ
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: "0.88rem" }} className="text-blue-600">{sess.score}đ</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <span style={{ fontSize: "0.75rem" }} className="text-gray-600">📝 {sess.note}</span>
                </div>
              </div>
            ))}
            {s.sessions > s.sessionHistory.length && (
              <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-200 hover:text-blue-400 transition-colors" style={{ fontSize: "0.8rem" }}>
                + {s.sessions - s.sessionHistory.length} buổi khác...
              </button>
            )}
          </div>
        )}

        {/* ── TASKS ── */}
        {tab === "tasks" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">Bài tập đã giao</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                <Plus className="w-3.5 h-3.5" /> Giao bài
              </button>
            </div>
            {tasks.map((task) => (
              <div key={task.id} className={`p-3.5 rounded-xl border-2 transition-all ${task.done ? "border-emerald-200 bg-emerald-50/40" : "border-gray-100 bg-white"}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateTaskStatus(task)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${task.done ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-blue-400"}`}
                  >
                    {task.done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1">
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", textDecoration: task.done ? "line-through" : "none" }} className={task.done ? "text-gray-400" : "text-gray-900"}>
                      {task.title}
                    </div>
                    {(task.sets || task.reps) && (
                      <div className="flex gap-2 mt-1">
                        {task.sets && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{task.sets} sets</span>}
                        {task.reps && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{task.reps} reps</span>}
                      </div>
                    )}
                    {task.note && <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-1">📝 {task.note}</div>}
                    <div style={{ fontSize: "0.68rem" }} className="text-gray-300 mt-1">Hạn: {task.dueDate}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center py-2">
              <div style={{ fontSize: "0.75rem" }} className="text-gray-400">
                {tasks.filter(t => t.done).length}/{tasks.length} bài hoàn thành
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${tasks.length ? (tasks.filter(t=>t.done).length / tasks.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {tab === "notes" && (
          <div className="space-y-3">
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900 block">Ghi chú HLV</span>
            {notes.map((note) => (
              <div key={note.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: "0.72rem", fontWeight: 600 }} className="text-amber-600">📅 {note.date}</span>
                  <button
                    onClick={() => deleteNote(note)}
                    className="p-1 rounded-lg hover:bg-amber-200/50 text-amber-400 hover:text-amber-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }} className="text-gray-700">{note.content}</p>
              </div>
            ))}
            {/* Add note */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Thêm ghi chú mới..."
                rows={3}
                className="w-full bg-transparent resize-none focus:outline-none text-gray-700 placeholder-gray-400"
                style={{ fontSize: "0.82rem" }}
              />
              <div className="flex justify-end mt-2">
                <button
                  disabled={!newNote.trim()}
                  onClick={addNote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${newNote.trim() ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  style={{ fontSize: "0.75rem", fontWeight: 700 }}
                >
                  <Send className="w-3 h-3" /> Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fake icons used as references inside StudentDetail
function LayoutDashboard2({ className }: { className?: string }) {
  return <BarChart2 className={className} />;
}
function DollarSign2({ className }: { className?: string }) {
  return <Zap className={className} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface CoachStudentsProps {
  onNavigate?: (view: string) => void;
}

type SortKey = "name" | "sessions" | "aiScore" | "revenue" | "lastSession";
type FilterStatus = "all" | "active" | "pending" | "inactive";

export function CoachStudents({ onNavigate }: CoachStudentsProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPlan, setFilterPlan] = useState<"all" | "Free" | "Pro" | "Premium">("all");
  const [sortBy, setSortBy] = useState<SortKey>("lastSession");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    coachWorkspaceApi.getStudents()
      .then(async summaries => {
        const progressList = await Promise.all(
          summaries.map(summary =>
            coachWorkspaceApi.getStudentProgress(summary.traineeId).catch(() => null)
          )
        );
        return buildWorkspaceStudents(
          summaries,
          progressList.filter((item): item is CoachStudentProgress => item !== null)
        );
      })
      .catch(async () => {
        const [trainees, bookings] = await Promise.all([
          searchMyTrainees("").catch(() => []),
          getCoachCalendarBookings().catch(() => []),
        ]);
        return buildStudents(trainees, bookings);
      })
      .then(nextStudents => {
        if (!active) return;
        setStudents(nextStudents);
        setSelectedId(current => current ?? nextStudents[0]?.id ?? null);
      })
      .catch(reason => {
        if (!active) return;
        setStudents([]);
        setLoadError(reason instanceof Error ? reason.message : "Không thể tải danh sách học viên.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!students.length) return;
    if (!selectedId || !students.some(s => s.id === selectedId)) {
      setSelectedId(students[0].id);
    }
  }, [students, selectedId]);

  const selected = students.find(s => s.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let list = [...students];
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.goal.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus);
    if (filterPlan !== "all") list = list.filter(s => s.plan === filterPlan);
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "sessions") return b.sessions - a.sessions;
      if (sortBy === "aiScore") return (b.aiScore ?? -1) - (a.aiScore ?? -1);
      if (sortBy === "revenue") return b.revenueNum - a.revenueNum;
      return 0;
    });
    return list;
  }, [search, filterStatus, filterPlan, sortBy, students]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalRevenue = students.reduce((s, x) => s + x.revenueNum, 0);
  const scoreItems = students.filter(s => s.aiScore !== null).map(s => s.aiScore as number);
  const avgScore = scoreItems.length ? Math.round(scoreItems.reduce((s, x) => s + x, 0) / scoreItems.length) : null;
  const activeCount = students.filter(s => s.status === "active").length;

  return (
    <div className="flex h-[calc(100vh-130px)] gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">

      {/* ── LEFT: Student List ────────────────────────────────────────────── */}
      <div className={`flex flex-col border-r border-gray-100 ${selected ? "w-full lg:w-[420px] xl:w-[480px] shrink-0 hidden lg:flex" : "flex-1"}`}>

        {/* Top stats */}
        <div className="shrink-0 px-4 py-4 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-white">Quản lý học viên</div>
              <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{students.length} học viên · {activeCount} đang học</div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Đang học", value: activeCount, color: "text-emerald-400" },
              { label: "AI TB", value: avgScore ?? "--", color: "text-blue-400" },
              { label: "Doanh thu", value: (totalRevenue / 1000000).toFixed(1) + "M", color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl px-3 py-2 text-center">
                <div style={{ fontWeight: 800, fontSize: "1rem" }} className={color}>{value}</div>
                <div style={{ fontSize: "0.65rem" }} className="text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="shrink-0 px-4 py-3 border-b border-gray-100 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm học viên..."
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                style={{ fontSize: "0.82rem" }}
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-2 rounded-xl border transition-colors ${showFilter ? "bg-blue-50 border-blue-200 text-blue-500" : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600"}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}
              className="p-2 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilter && (
            <div className="space-y-2 pt-1">
              {/* Status filter */}
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "active", "pending", "inactive"] as FilterStatus[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === f ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    style={{ fontSize: "0.72rem", fontWeight: 600 }}
                  >
                    {f === "all" ? "Tất cả" : STATUS_CFG[f].label}
                  </button>
                ))}
              </div>
              {/* Plan filter + sort */}
              <div className="flex gap-2">
                <select
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value as any)}
                  className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none"
                  style={{ fontSize: "0.75rem" }}
                >
                  <option value="all">Tất cả gói</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none"
                  style={{ fontSize: "0.75rem" }}
                >
                  <option value="lastSession">Mới nhất</option>
                  <option value="sessions">Nhiều buổi</option>
                  <option value="aiScore">Điểm AI cao</option>
                  <option value="revenue">Doanh thu</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Result count */}
        <div className="shrink-0 px-4 py-2 border-b border-gray-50">
          <span style={{ fontSize: "0.72rem" }} className="text-gray-400">
            {filtered.length} học viên
            {(search || filterStatus !== "all" || filterPlan !== "all") && " (đã lọc)"}
          </span>
        </div>

        {/* List / Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <span style={{ fontSize: "0.82rem" }}>Đang tải học viên...</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-40 text-red-500 text-center px-6">
              <AlertCircle className="w-8 h-8 mb-2" />
              <span style={{ fontSize: "0.82rem" }}>{loadError}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <span style={{ fontSize: "0.82rem" }}>Không tìm thấy học viên</span>
            </div>
          ) : viewMode === "grid" ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(s => (
                <StudentCard
                  key={s.id}
                  s={s}
                  onSelect={() => setSelectedId(s.id)}
                />
              ))}
            </div>
          ) : (
            <div>
              {/* List header */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 hidden md:flex items-center gap-3">
                <div className="flex-1 min-w-0" style={{ fontSize: "0.68rem", fontWeight: 700 }} >
                  <span className="text-gray-400 uppercase tracking-wide">Học viên</span>
                </div>
                <span className="hidden sm:block shrink-0 w-14 text-right" style={{ fontSize: "0.68rem" }} ></span>
                <span className="hidden md:block w-32 text-right" style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ca3af" }}>AI SCORE</span>
                <span className="hidden lg:block w-24 text-right" style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ca3af" }}>DOANH THU</span>
                <span className="hidden sm:block shrink-0 w-20 text-center" style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ca3af" }}>TRẠNG THÁI</span>
                <div className="w-5" />
              </div>
              {filtered.map(s => (
                <StudentRow key={s.id} s={s} onSelect={() => setSelectedId(s.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Detail Panel ──────────────────────────────────────────── */}
      {selected ? (
        <div className={`flex-1 min-w-0 flex flex-col ${selected ? "flex" : "hidden lg:flex"}`}>
          <StudentDetail
            s={selected}
            onClose={() => setSelectedId(null)}
            onNavigate={onNavigate}
            onStudentChange={nextStudent => {
              setStudents(prev => prev.map(item => item.id === nextStudent.id ? nextStudent : item));
            }}
          />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col text-gray-300 bg-gray-50">
          <Users className="w-12 h-12 mb-3 opacity-30" />
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }} className="text-gray-400">Chọn học viên</span>
          <span style={{ fontSize: "0.78rem" }} className="text-gray-300 mt-1">Nhấn vào học viên để xem chi tiết</span>
        </div>
      )}
    </div>
  );
}
