import { useState, useMemo } from "react";
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
  score: number;
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
  gender: "male" | "female";
  age: number;
  avatar: string;
  plan: "Free" | "Pro" | "Premium";
  status: "active" | "pending" | "inactive";
  goal: string;
  sessions: number;
  revenue: string;
  revenueNum: number;
  aiScore: number;
  aiScorePrev: number;
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
const STUDENTS: Student[] = [
  {
    id: "s1", name: "Nguyễn Minh Anh", gender: "female", age: 24,
    avatar: AVT[0], plan: "Free", status: "active",
    goal: "Giảm mỡ & tăng cơ", sessions: 18, revenue: "3,600,000đ", revenueNum: 3600000,
    aiScore: 87, aiScorePrev: 80, joinDate: "15/09/2025", lastSession: "2 ngày trước",
    nextSession: "T5, 17:00", phone: "0901 234 567", weight: "55kg", height: "162cm",
    progressHistory: [
      { month: "T9", score: 61, sessions: 3 }, { month: "T10", score: 68, sessions: 5 },
      { month: "T11", score: 74, sessions: 6 }, { month: "T12", score: 79, sessions: 5 },
      { month: "T1", score: 83, sessions: 7 },  { month: "T2", score: 85, sessions: 6 },
      { month: "T3", score: 87, sessions: 7 },
    ],
    sessionHistory: [
      { date: "03/03/2026", type: "Online", duration: "90 phút", note: "Squat form tốt, cần cải thiện hinge", score: 88, status: "done" },
      { date: "28/02/2026", type: "Online", duration: "90 phút", note: "Deadlift cải thiện rõ", score: 85, status: "done" },
      { date: "24/02/2026", type: "Online", duration: "60 phút", note: "Review tuần, giao bài", score: 82, status: "done" },
      { date: "20/02/2026", type: "Offline", duration: "90 phút", note: "Push day - bench press cần sửa", score: 80, status: "done" },
      { date: "14/02/2026", type: "Online", duration: "60 phút", note: "Học viên bận, rút ngắn buổi", score: 78, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Squat 4x10 @60kg", sets: "4", reps: "10", note: "Quay video để HLV check form", dueDate: "08/03/2026", done: false },
      { id: "t2", title: "Plank 3x60s", sets: "3", reps: "60s", note: "Mỗi ngày", dueDate: "08/03/2026", done: true },
      { id: "t3", title: "Cardio 30 phút", sets: "", reps: "", note: "Treadmill tốc độ 6km/h", dueDate: "07/03/2026", done: true },
    ],
    notes: [
      { id: "n1", date: "03/03/2026", content: "Tiến bộ tốt, động lực cao. Cần tập trung vào kỹ thuật Deadlift." },
      { id: "n2", date: "20/02/2026", content: "Knee có dấu hiệu đau nhẹ, cần giảm tải squat trong 1 tuần." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 78 }, { subject: "Kỹ thuật", value: 87 },
      { subject: "Thể lực", value: 72 }, { subject: "Linh hoạt", value: 80 },
      { subject: "Kiên trì", value: 95 },
    ],
  },
  {
    id: "s2", name: "Trần Bảo Long", gender: "male", age: 28,
    avatar: AVT[2], plan: "Pro", status: "active",
    goal: "Tăng cơ bắp", sessions: 12, revenue: "2,400,000đ", revenueNum: 2400000,
    aiScore: 74, aiScorePrev: 68, joinDate: "01/11/2025", lastSession: "Hôm nay",
    nextSession: "T2, 09:00", phone: "0912 345 678", weight: "72kg", height: "175cm",
    progressHistory: [
      { month: "T11", score: 55, sessions: 3 }, { month: "T12", score: 61, sessions: 4 },
      { month: "T1", score: 65, sessions: 5 },  { month: "T2", score: 68, sessions: 5 },
      { month: "T3", score: 74, sessions: 5 },
    ],
    sessionHistory: [
      { date: "05/03/2026", type: "Online", duration: "90 phút", note: "Kéo lưng tốt, cần cải thiện vai", score: 74, status: "done" },
      { date: "01/03/2026", type: "Offline · Q1", duration: "90 phút", note: "Bench tăng 5kg so với tháng trước", score: 72, status: "done" },
      { date: "25/02/2026", type: "Online", duration: "60 phút", note: "Hỏi bệnh, rút ngắn", score: 65, status: "cancelled" },
    ],
    tasks: [
      { id: "t1", title: "Pull-up 3x8", sets: "3", reps: "8", note: "Assisted nếu cần", dueDate: "09/03/2026", done: false },
      { id: "t2", title: "Bench Press 4x8 @80kg", sets: "4", reps: "8", note: "", dueDate: "07/03/2026", done: false },
    ],
    notes: [
      { id: "n1", date: "05/03/2026", content: "Tiến bộ đều đặn. Cần tăng cường tập vai để cân đối." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 82 }, { subject: "Kỹ thuật", value: 70 },
      { subject: "Thể lực", value: 75 }, { subject: "Linh hoạt", value: 60 },
      { subject: "Kiên trì", value: 80 },
    ],
  },
  {
    id: "s3", name: "Lê Thúy Nga", gender: "female", age: 31,
    avatar: AVT[1], plan: "Premium", status: "active",
    goal: "Thi đấu thể hình", sessions: 7, revenue: "1,400,000đ", revenueNum: 1400000,
    aiScore: 91, aiScorePrev: 88, joinDate: "10/01/2026", lastSession: "3 ngày trước",
    nextSession: "T6, 07:00", phone: "0923 456 789", weight: "52kg", height: "158cm",
    progressHistory: [
      { month: "T1", score: 80, sessions: 3 }, { month: "T2", score: 86, sessions: 4 },
      { month: "T3", score: 91, sessions: 4 },
    ],
    sessionHistory: [
      { date: "02/03/2026", type: "Offline · Q3", duration: "120 phút", note: "Posing practice - cải thiện rõ", score: 92, status: "done" },
      { date: "26/02/2026", type: "Offline · Q3", duration: "120 phút", note: "Cardio + pose training", score: 90, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Posing 20 phút/ngày", sets: "", reps: "", note: "Quay video cuối tuần gửi HLV", dueDate: "10/03/2026", done: false },
      { id: "t2", title: "Diet theo kế hoạch", sets: "", reps: "", note: "Nhật ký ăn uống mỗi ngày", dueDate: "10/03/2026", done: true },
    ],
    notes: [
      { id: "n1", date: "02/03/2026", content: "Hình thể tiến bộ rõ. Cần giữ cân nặng 52kg cho đến thi." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 70 }, { subject: "Kỹ thuật", value: 92 },
      { subject: "Thể lực", value: 88 }, { subject: "Linh hoạt", value: 85 },
      { subject: "Kiên trì", value: 98 },
    ],
  },
  {
    id: "s4", name: "Phạm Đức Hải", gender: "male", age: 22,
    avatar: AVT[4], plan: "Free", status: "pending",
    goal: "Tăng cơ bắp đại cương", sessions: 5, revenue: "1,000,000đ", revenueNum: 1000000,
    aiScore: 62, aiScorePrev: 58, joinDate: "20/01/2026", lastSession: "1 tuần trước",
    nextSession: null, phone: "0934 567 890", weight: "65kg", height: "170cm",
    progressHistory: [
      { month: "T1", score: 50, sessions: 2 }, { month: "T2", score: 57, sessions: 3 },
      { month: "T3", score: 62, sessions: 2 },
    ],
    sessionHistory: [
      { date: "26/02/2026", type: "Online", duration: "60 phút", note: "Cơ bản tốt nhưng thiếu tập trung", score: 62, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Push-up 3x15", sets: "3", reps: "15", note: "Mỗi ngày", dueDate: "10/03/2026", done: false },
    ],
    notes: [
      { id: "n1", date: "26/02/2026", content: "Học viên chưa tập đều. Cần nhắc nhở thêm về lịch tập." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 55 }, { subject: "Kỹ thuật", value: 60 },
      { subject: "Thể lực", value: 65 }, { subject: "Linh hoạt", value: 58 },
      { subject: "Kiên trì", value: 50 },
    ],
  },
  {
    id: "s5", name: "Võ Thị Hoa", gender: "female", age: 35,
    avatar: AVT[3], plan: "Premium", status: "active",
    goal: "Duy trì vóc dáng sau sinh", sessions: 22, revenue: "4,400,000đ", revenueNum: 4400000,
    aiScore: 95, aiScorePrev: 93, joinDate: "05/07/2025", lastSession: "Hôm nay",
    nextSession: "T4, 14:00", phone: "0945 678 901", weight: "58kg", height: "164cm",
    progressHistory: [
      { month: "T7", score: 72, sessions: 5 }, { month: "T8", score: 78, sessions: 6 },
      { month: "T9", score: 83, sessions: 7 }, { month: "T10", score: 87, sessions: 7 },
      { month: "T11", score: 90, sessions: 8 }, { month: "T12", score: 92, sessions: 7 },
      { month: "T1", score: 93, sessions: 8 },  { month: "T2", score: 94, sessions: 8 },
      { month: "T3", score: 95, sessions: 7 },
    ],
    sessionHistory: [
      { date: "05/03/2026", type: "Offline · Q1", duration: "90 phút", note: "Xuất sắc! Cardio & strength tuyệt vời", score: 96, status: "done" },
      { date: "01/03/2026", type: "Offline · Q1", duration: "90 phút", note: "Tiến bộ đều, hình thể cải thiện rõ", score: 95, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Pilates 30 phút", sets: "", reps: "", note: "Video trên thư viện", dueDate: "08/03/2026", done: true },
      { id: "t2", title: "Walking 8,000 bước", sets: "", reps: "", note: "Mỗi ngày", dueDate: "08/03/2026", done: true },
    ],
    notes: [
      { id: "n1", date: "05/03/2026", content: "Học viên xuất sắc! Kết quả ấn tượng sau 8 tháng. Cân nhắc thi đấu." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 88 }, { subject: "Kỹ thuật", value: 95 },
      { subject: "Thể lực", value: 92 }, { subject: "Linh hoạt", value: 90 },
      { subject: "Kiên trì", value: 98 },
    ],
  },
  {
    id: "s6", name: "Đặng Quốc Tuấn", gender: "male", age: 26,
    avatar: AVT[6], plan: "Pro", status: "active",
    goal: "Tăng sức mạnh powerlifting", sessions: 9, revenue: "1,800,000đ", revenueNum: 1800000,
    aiScore: 78, aiScorePrev: 71, joinDate: "05/12/2025", lastSession: "4 ngày trước",
    nextSession: "T7, 10:00", phone: "0956 789 012", weight: "80kg", height: "178cm",
    progressHistory: [
      { month: "T12", score: 60, sessions: 3 }, { month: "T1", score: 67, sessions: 4 },
      { month: "T2", score: 72, sessions: 5 }, { month: "T3", score: 78, sessions: 4 },
    ],
    sessionHistory: [
      { date: "01/03/2026", type: "Offline · Q7", duration: "120 phút", note: "1RM Squat tăng 10kg!", score: 80, status: "done" },
      { date: "25/02/2026", type: "Offline · Q7", duration: "120 phút", note: "Deadlift form cải thiện tốt", score: 77, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Squat 5x5 @110kg", sets: "5", reps: "5", note: "", dueDate: "08/03/2026", done: false },
      { id: "t2", title: "Romanian Deadlift 4x8", sets: "4", reps: "8", note: "@100kg", dueDate: "09/03/2026", done: false },
    ],
    notes: [
      { id: "n1", date: "01/03/2026", content: "Sức mạnh tăng nhanh. Tiềm năng thi đấu powerlifting." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 92 }, { subject: "Kỹ thuật", value: 75 },
      { subject: "Thể lực", value: 80 }, { subject: "Linh hoạt", value: 55 },
      { subject: "Kiên trì", value: 85 },
    ],
  },
  {
    id: "s7", name: "Hoàng Thị Lan", gender: "female", age: 29,
    avatar: AVT[5], plan: "Pro", status: "inactive",
    goal: "Giảm cân", sessions: 4, revenue: "800,000đ", revenueNum: 800000,
    aiScore: 55, aiScorePrev: 52, joinDate: "10/02/2026", lastSession: "2 tuần trước",
    nextSession: null, phone: "0967 890 123", weight: "68kg", height: "160cm",
    progressHistory: [
      { month: "T2", score: 45, sessions: 2 }, { month: "T3", score: 55, sessions: 2 },
    ],
    sessionHistory: [
      { date: "18/02/2026", type: "Online", duration: "60 phút", note: "Cơ bản, cần cải thiện nhiều", score: 55, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Cardio 20 phút", sets: "", reps: "", note: "Mỗi ngày", dueDate: "10/03/2026", done: false },
    ],
    notes: [
      { id: "n1", date: "18/02/2026", content: "Chưa liên hệ lại sau buổi tập cuối. Cần follow up." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 45 }, { subject: "Kỹ thuật", value: 52 },
      { subject: "Thể lực", value: 58 }, { subject: "Linh hoạt", value: 65 },
      { subject: "Kiên trì", value: 48 },
    ],
  },
  {
    id: "s8", name: "Bùi Văn Nam", gender: "male", age: 33,
    avatar: AVT[7], plan: "Free", status: "active",
    goal: "Sức khỏe tổng thể", sessions: 15, revenue: "3,000,000đ", revenueNum: 3000000,
    aiScore: 81, aiScorePrev: 75, joinDate: "01/08/2025", lastSession: "5 ngày trước",
    nextSession: "CN, 08:00", phone: "0978 901 234", weight: "75kg", height: "172cm",
    progressHistory: [
      { month: "T8", score: 58, sessions: 4 }, { month: "T9", score: 64, sessions: 5 },
      { month: "T10", score: 69, sessions: 5 }, { month: "T11", score: 73, sessions: 6 },
      { month: "T12", score: 76, sessions: 6 }, { month: "T1", score: 79, sessions: 7 },
      { month: "T2", score: 80, sessions: 6 }, { month: "T3", score: 81, sessions: 6 },
    ],
    sessionHistory: [
      { date: "28/02/2026", type: "Online", duration: "90 phút", note: "Toàn thân, ổn định tốt", score: 81, status: "done" },
    ],
    tasks: [
      { id: "t1", title: "Full body workout", sets: "", reps: "", note: "Theo chương trình A/B", dueDate: "09/03/2026", done: false },
    ],
    notes: [
      { id: "n1", date: "28/02/2026", content: "Học viên đều đặn, tiến bộ tốt. Phù hợp gói Pro." },
    ],
    radarData: [
      { subject: "Sức mạnh", value: 75 }, { subject: "Kỹ thuật", value: 78 },
      { subject: "Thể lực", value: 82 }, { subject: "Linh hoạt", value: 70 },
      { subject: "Kiên trì", value: 88 },
    ],
  },
];

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
};

function ScoreBadge({ score, prev }: { score: number; prev: number }) {
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
            <img src={s.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
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
          { label: "AI Score", value: s.aiScore },
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
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }} className="text-gray-600">{s.aiScore}/100</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500" style={{ width: `${s.aiScore}%` }} />
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
        <img src={s.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${st.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-900 group-hover:text-blue-600 transition-colors truncate">{s.name}</div>
        <div style={{ fontSize: "0.72rem" }} className="text-gray-400 truncate">{s.goal} · {s.age} tuổi</div>
      </div>
      <span className={`hidden sm:block shrink-0 px-2 py-0.5 rounded-full ${pl.bg} ${pl.text}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{s.plan}</span>
      <div className="hidden md:flex items-center gap-2 shrink-0 w-32">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s.aiScore}%` }} />
        </div>
        <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-700 w-6">{s.aiScore}</span>
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

function StudentDetail({ s, onClose, onNavigate }: { s: Student; onClose: () => void; onNavigate?: (v: string) => void }) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(s.notes);
  const [tasks, setTasks] = useState(s.tasks);
  const st = STATUS_CFG[s.status];
  const pl = PLAN_CFG[s.plan];

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
            <img src={s.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${st.dot}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: "1rem" }} className="text-white">{s.name}</span>
              <span className={`px-2 py-0.5 rounded-full ${pl.bg} ${pl.text}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{s.plan}</span>
            </div>
            <div style={{ fontSize: "0.75rem" }} className="text-gray-400 mt-0.5">{s.goal} · {s.age} tuổi · {s.weight} · {s.height}</div>
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

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Dumbbell,  label: "Buổi đã học",  value: `${s.sessions} buổi`,  color: "text-blue-500",    bg: "bg-blue-50" },
                { icon: Award,     label: "AI Score",     value: `${s.aiScore}/100`,    color: "text-purple-500",  bg: "bg-purple-50" },
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
                    onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
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
                <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${(tasks.filter(t=>t.done).length / tasks.length) * 100}%` }} />
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
                    onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))}
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
                  onClick={() => {
                    if (!newNote.trim()) return;
                    setNotes(prev => [{ id: `n${Date.now()}`, date: "05/03/2026", content: newNote.trim() }, ...prev]);
                    setNewNote("");
                  }}
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
  const [selectedId, setSelectedId] = useState<string | null>("s1");
  const [showFilter, setShowFilter] = useState(false);

  const selected = STUDENTS.find(s => s.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let list = [...STUDENTS];
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.goal.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus);
    if (filterPlan !== "all") list = list.filter(s => s.plan === filterPlan);
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "sessions") return b.sessions - a.sessions;
      if (sortBy === "aiScore") return b.aiScore - a.aiScore;
      if (sortBy === "revenue") return b.revenueNum - a.revenueNum;
      return 0;
    });
    return list;
  }, [search, filterStatus, filterPlan, sortBy]);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalRevenue = STUDENTS.reduce((s, x) => s + x.revenueNum, 0);
  const avgScore = Math.round(STUDENTS.reduce((s, x) => s + x.aiScore, 0) / STUDENTS.length);
  const activeCount = STUDENTS.filter(s => s.status === "active").length;

  return (
    <div className="flex h-[calc(100vh-130px)] gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">

      {/* ── LEFT: Student List ────────────────────────────────────────────── */}
      <div className={`flex flex-col border-r border-gray-100 ${selected ? "w-full lg:w-[420px] xl:w-[480px] shrink-0 hidden lg:flex" : "flex-1"}`}>

        {/* Top stats */}
        <div className="shrink-0 px-4 py-4 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-white">Quản lý học viên</div>
              <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{STUDENTS.length} học viên · {activeCount} đang học</div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Đang học", value: activeCount, color: "text-emerald-400" },
              { label: "AI TB", value: avgScore, color: "text-blue-400" },
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
          {filtered.length === 0 ? (
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