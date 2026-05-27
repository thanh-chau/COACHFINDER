import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video,
  CheckCircle2, X, Calendar, List, LayoutGrid, Dumbbell,
  Users, DollarSign, Zap, MessageCircle, Edit3, Trash2,
  Link as LinkIcon, Play, AlertCircle, Bell, ChevronDown,
  Check, Search, MoreHorizontal, Globe, PhoneCall, Repeat,
  Filter, CalendarDays
} from "lucide-react";
import { getCoachCalendarBookings } from "../api/bookings";
import { createCoachSchedule, getCoachSchedule, searchCoaches } from "../api/coaches";
import type { BookingListItem } from "../types/booking";
import type { CoachSchedule as PublishedCoachSchedule } from "../types/coach";
import { getAuthSession, updateAuthSession } from "../utils/authSession";

// ─── Constants ────────────────────────────────────────────────────────────────
const TODAY_STR = "2026-03-05";
const TODAY = new Date("2026-03-05T00:00:00");

const DAYS_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAYS_FULL = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                   "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const HOUR_H = 64; // px per hour
const START_H = 6; // 06:00
const END_H = 22;  // 22:00
const HOURS = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);

// ─── Student Avatars ──────────────────────────────────────────────────────────
const AVATARS: Record<string, string> = {
  "Nguyễn Minh Anh": "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "Trần Bảo Long":   "https://images.unsplash.com/photo-1575992877113-6a7dda2d1592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "Lê Thúy Nga":     "https://images.unsplash.com/photo-1752477225721-5f1b72f83b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "Phạm Đức Hải":    "https://images.unsplash.com/photo-1647483927850-2b5a783f03ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "Võ Thị Hoa":      "https://images.unsplash.com/photo-1746559845070-10aa66800280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "Đặng Quốc Tuấn":  "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "Bùi Văn Nam":     "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SessionStatus = "upcoming" | "completed" | "cancelled" | "pending";
type SessionMode   = "Online" | "Offline";

interface CoachSession {
  id: string;
  date: string;          // "YYYY-MM-DD"
  startTime: string;     // "HH:MM"
  endTime: string;
  student: string;
  plan: "Free" | "Pro" | "Premium";
  mode: SessionMode;
  location: string;
  status: SessionStatus;
  fee: number;
  note: string;
  meetLink?: string;
  repeat?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_SESSIONS: CoachSession[] = [
  // ── Completed ──
  { id:"s1",  date:"2026-03-02", startTime:"09:00", endTime:"10:30", student:"Trần Bảo Long",  plan:"Pro",     mode:"Online",  location:"Google Meet",         status:"completed", fee:400000, note:"Kéo lưng + Vai, form cải thiện tốt", meetLink:"https://meet.google.com/abc-def-xyz" },
  { id:"s2",  date:"2026-03-02", startTime:"17:00", endTime:"18:30", student:"Nguyễn Minh Anh",plan:"Free",    mode:"Online",  location:"Google Meet",         status:"completed", fee:400000, note:"Squat & Deadlift – kỹ thuật tốt lên rõ" },
  { id:"s3",  date:"2026-03-03", startTime:"07:00", endTime:"09:00", student:"Lê Thúy Nga",    plan:"Premium", mode:"Offline", location:"Gym Gold's, Q3",     status:"completed", fee:600000, note:"Posing practice + cardio", repeat: true },
  { id:"s4",  date:"2026-03-04", startTime:"14:00", endTime:"15:30", student:"Võ Thị Hoa",     plan:"Premium", mode:"Offline", location:"Fitness Center Q1",  status:"completed", fee:500000, note:"Full body – kết quả ấn tượng" },

  // ── Today (2026-03-05) ──
  { id:"s5",  date:"2026-03-05", startTime:"09:00", endTime:"10:30", student:"Trần Bảo Long",  plan:"Pro",     mode:"Online",  location:"Google Meet",         status:"completed", fee:400000, note:"Pull day – lưng & bicep", meetLink:"https://meet.google.com/abc-def-xyz" },
  { id:"s6",  date:"2026-03-05", startTime:"14:00", endTime:"15:30", student:"Võ Thị Hoa",     plan:"Premium", mode:"Offline", location:"Fitness Center Q1",  status:"upcoming",  fee:500000, note:"Legs & glutes chuyên sâu" },
  { id:"s7",  date:"2026-03-05", startTime:"17:00", endTime:"18:30", student:"Nguyễn Minh Anh",plan:"Free",    mode:"Online",  location:"Google Meet",         status:"upcoming",  fee:400000, note:"Push day – ngực, vai, tricep", meetLink:"https://meet.google.com/xyz-abc-def" },

  // ── Upcoming ──
  { id:"s8",  date:"2026-03-06", startTime:"10:00", endTime:"12:00", student:"Đặng Quốc Tuấn", plan:"Pro",     mode:"Offline", location:"Powerhouse Gym Q7",  status:"upcoming",  fee:500000, note:"Squat 1RM test", repeat: true },
  { id:"s9",  date:"2026-03-07", startTime:"08:00", endTime:"09:30", student:"Bùi Văn Nam",    plan:"Free",    mode:"Online",  location:"Zoom",                status:"upcoming",  fee:350000, note:"Full body routine A", meetLink:"https://zoom.us/j/123456789" },
  { id:"s10", date:"2026-03-07", startTime:"10:00", endTime:"12:00", student:"Đặng Quốc Tuấn", plan:"Pro",     mode:"Offline", location:"Powerhouse Gym Q7",  status:"upcoming",  fee:500000, note:"Bench Press tháng 3" },
  { id:"s11", date:"2026-03-09", startTime:"09:00", endTime:"10:30", student:"Trần Bảo Long",  plan:"Pro",     mode:"Online",  location:"Google Meet",         status:"upcoming",  fee:400000, note:"Upper body – chest & back", meetLink:"https://meet.google.com/abc-def-xyz", repeat:true },
  { id:"s12", date:"2026-03-10", startTime:"07:00", endTime:"09:00", student:"Lê Thúy Nga",    plan:"Premium", mode:"Offline", location:"Gym Gold's, Q3",     status:"upcoming",  fee:600000, note:"Pre-competition posing", repeat:true },
  { id:"s13", date:"2026-03-11", startTime:"14:00", endTime:"15:30", student:"Võ Thị Hoa",     plan:"Premium", mode:"Offline", location:"Fitness Center Q1",  status:"upcoming",  fee:500000, note:"Cardio & core", repeat:true },
  { id:"s14", date:"2026-03-12", startTime:"09:00", endTime:"10:30", student:"Nguyễn Minh Anh",plan:"Free",    mode:"Online",  location:"Google Meet",         status:"upcoming",  fee:400000, note:"Review tháng – check tiến độ" },
  { id:"s15", date:"2026-03-12", startTime:"17:00", endTime:"18:30", student:"Phạm Đức Hải",   plan:"Free",    mode:"Online",  location:"Google Meet",         status:"pending",   fee:400000, note:"Buổi thử – chưa xác nhận" },
  { id:"s16", date:"2026-03-13", startTime:"10:00", endTime:"12:00", student:"Đặng Quốc Tuấn", plan:"Pro",     mode:"Offline", location:"Powerhouse Gym Q7",  status:"upcoming",  fee:500000, note:"Deadlift tháng 3", repeat:true },
  { id:"s17", date:"2026-03-14", startTime:"08:00", endTime:"09:30", student:"Bùi Văn Nam",    plan:"Free",    mode:"Online",  location:"Zoom",                status:"upcoming",  fee:350000, note:"Full body routine B", meetLink:"https://zoom.us/j/123456789" },
  { id:"s18", date:"2026-03-14", startTime:"16:00", endTime:"17:30", student:"Võ Thị Hoa",     plan:"Premium", mode:"Offline", location:"Fitness Center Q1",  status:"upcoming",  fee:500000, note:"Upper body tăng cường" },
  { id:"s19", date:"2026-03-15", startTime:"07:00", endTime:"09:00", student:"Lê Thúy Nga",    plan:"Premium", mode:"Offline", location:"Gym Gold's, Q3",     status:"upcoming",  fee:600000, note:"Final prep trước thi", repeat:true },
  { id:"s20", date:"2026-03-04", startTime:"11:00", endTime:"12:00", student:"Phạm Đức Hải",   plan:"Free",    mode:"Online",  location:"Google Meet",         status:"cancelled", fee:400000, note:"Học viên huỷ bệnh" },
];

const STUDENTS_LIST = ["Nguyễn Minh Anh","Trần Bảo Long","Lê Thúy Nga","Phạm Đức Hải","Võ Thị Hoa","Đặng Quốc Tuấn","Bùi Văn Nam"];

// ─── Color Config ─────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<SessionStatus, { bg: string; border: string; text: string; dot: string; label: string; hex: string }> = {
  upcoming:  { bg:"bg-blue-50",   border:"border-blue-300",  text:"text-blue-700",  dot:"bg-blue-500",   label:"Sắp tới",   hex:"#3b82f6" },
  completed: { bg:"bg-emerald-50",border:"border-emerald-300",text:"text-emerald-700",dot:"bg-emerald-500",label:"Hoàn thành",hex:"#10b981" },
  cancelled: { bg:"bg-red-50",    border:"border-red-300",   text:"text-red-600",   dot:"bg-red-400",    label:"Đã huỷ",    hex:"#ef4444" },
  pending:   { bg:"bg-amber-50",  border:"border-amber-300", text:"text-amber-700", dot:"bg-amber-500",  label:"Chờ xác nhận",hex:"#f59e0b" },
};

const PLAN_COLOR: Record<string,{bg:string;text:string}> = {
  Free:    {bg:"bg-gray-100",   text:"text-gray-500"},
  Pro:     {bg:"bg-blue-100",   text:"text-blue-700"},
  Premium: {bg:"bg-purple-100", text:"text-purple-700"},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDate(str: string) { return new Date(str + "T00:00:00"); }
function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function isSameDay(a: Date, b: Date) { return fmtDate(a) === fmtDate(b); }
function getMonday(d: Date) {
  const r = new Date(d);
  const day = r.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}
function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fmtCurrency(n: number) {
  return n >= 1000000 ? (n/1000000).toFixed(1)+"M" : (n/1000).toFixed(0)+"K";
}

function toLocalTimePayload(value: string) {
  if (!value) return value;
  return value.length === 5 ? `${value}:00` : value;
}

// ─── Session Detail Panel ─────────────────────────────────────────────────────
function SessionDetail({
  session, onClose, onEdit, onDelete, onStatusChange, onMessage
}: {
  session: CoachSession;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: SessionStatus) => void;
  onMessage?: () => void;
}) {
  const sc = STATUS_COLOR[session.status];
  const pl = PLAN_COLOR[session.plan];
  const durationMin = timeToMin(session.endTime) - timeToMin(session.startTime);
  const dateObj = toDate(session.date);
  const dayName = DAYS_FULL[(dateObj.getDay() + 6) % 7];
  const dateVI = `${dayName}, ${dateObj.getDate()} ${MONTHS_VI[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize:"0.72rem", fontWeight:600 }} className="text-gray-400 uppercase tracking-wider">Chi tiết buổi dạy</span>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Student */}
        <div className="flex items-center gap-3 mb-4">
          <img src={AVATARS[session.student] ?? AVATARS["Trần Bảo Long"]} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" />
          <div>
            <div style={{ fontWeight:700, fontSize:"1rem" }} className="text-white">{session.student}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full ${pl.bg} ${pl.text}`} style={{ fontSize:"0.65rem", fontWeight:700 }}>{session.plan}</span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`} style={{ fontSize:"0.65rem", fontWeight:600 }}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
          </div>
        </div>
        {/* Time block */}
        <div className="bg-white/10 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div style={{ fontWeight:800, fontSize:"1.1rem" }} className="text-white">{session.startTime}</div>
            <div style={{ fontSize:"0.65rem" }} className="text-gray-400">Bắt đầu</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-px bg-white/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize:"0.65rem", fontWeight:700 }} className="bg-slate-800 px-1.5 text-gray-300">{durationMin} ph</span>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:"1.1rem" }} className="text-white">{session.endTime}</div>
            <div style={{ fontSize:"0.65rem" }} className="text-gray-400">Kết thúc</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date & location */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:"0.85rem" }} className="text-gray-800">{dateVI}</div>
              {session.repeat && <div style={{ fontSize:"0.7rem" }} className="text-blue-500 flex items-center gap-1 mt-0.5"><Repeat className="w-2.5 h-2.5" /> Lặp hàng tuần</div>}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${session.mode === "Online" ? "bg-indigo-100" : "bg-emerald-100"}`}>
              {session.mode === "Online" ? <Globe className="w-4 h-4 text-indigo-500" /> : <MapPin className="w-4 h-4 text-emerald-500" />}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:"0.85rem" }} className="text-gray-800">{session.mode}</div>
              <div style={{ fontSize:"0.72rem" }} className="text-gray-400">{session.location}</div>
            </div>
            {session.meetLink && session.status === "upcoming" && (
              <a href={session.meetLink} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors" style={{ fontSize:"0.72rem", fontWeight:700 }}>
                <LinkIcon className="w-3 h-3" /> Join
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:"0.92rem" }} className="text-emerald-600">{session.fee.toLocaleString("vi-VN")}đ</div>
              <div style={{ fontSize:"0.7rem" }} className="text-gray-400">Phí buổi dạy</div>
            </div>
          </div>
        </div>

        {/* Note */}
        {session.note && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div style={{ fontSize:"0.72rem", fontWeight:600 }} className="text-amber-600 mb-1.5">📝 Ghi chú</div>
            <p style={{ fontSize:"0.82rem", lineHeight:1.6 }} className="text-gray-700">{session.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {session.status === "upcoming" && (
            <>
              <button
                onClick={() => onStatusChange(session.id, "completed")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                style={{ fontSize:"0.85rem", fontWeight:700 }}
              >
                <CheckCircle2 className="w-4 h-4" /> Đánh dấu hoàn thành
              </button>
              {session.meetLink && (
                <a href={session.meetLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors" style={{ fontSize:"0.85rem", fontWeight:700 }}>
                  <Play className="w-4 h-4" /> Vào phòng học ngay
                </a>
              )}
            </>
          )}
          {session.status === "pending" && (
            <button
              onClick={() => onStatusChange(session.id, "upcoming")}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              style={{ fontSize:"0.85rem", fontWeight:700 }}
            >
              <Check className="w-4 h-4" /> Xác nhận buổi dạy
            </button>
          )}
          <button
            onClick={onMessage}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            style={{ fontSize:"0.85rem", fontWeight:600 }}
          >
            <MessageCircle className="w-4 h-4" /> Nhắn tin học viên
          </button>
          {session.status !== "completed" && (
            <button
              onClick={() => onStatusChange(session.id, "cancelled")}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
              style={{ fontSize:"0.82rem", fontWeight:600 }}
            >
              <X className="w-4 h-4" /> Huỷ buổi dạy
            </button>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => { onDelete(session.id); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2 text-red-400 hover:text-red-600 transition-colors"
          style={{ fontSize:"0.75rem" }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Xoá khỏi lịch
        </button>
      </div>
    </div>
  );
}

// ─── Add/Edit Session Modal ───────────────────────────────────────────────────
function SessionModal({
  onClose, onSave, initial, defaultDate
}: {
  onClose: () => void;
  onSave: (s: CoachSession) => void;
  initial?: CoachSession | null;
  defaultDate?: string;
}) {
  const [form, setForm] = useState<Partial<CoachSession>>(initial ?? {
    date: defaultDate ?? TODAY_STR,
    startTime: "09:00",
    endTime: "10:30",
    student: STUDENTS_LIST[0],
    plan: "Pro",
    mode: "Online",
    location: "Google Meet",
    fee: 400000,
    note: "",
    status: "upcoming",
    repeat: false,
  });

  const set = (k: keyof CoachSession, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div style={{ fontWeight:700, fontSize:"1rem" }} className="text-gray-900">
            {initial ? "Chỉnh sửa buổi dạy" : "Thêm buổi dạy mới"}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Student */}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Học viên</label>
            <select value={form.student} onChange={e => set("student", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize:"0.85rem" }}>
              {STUDENTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Date */}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Ngày</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize:"0.85rem" }} />
          </div>
          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Bắt đầu</label>
              <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize:"0.85rem" }} />
            </div>
            <div>
              <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Kết thúc</label>
              <input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize:"0.85rem" }} />
            </div>
          </div>
          {/* Mode */}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Hình thức</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Online","Offline"] as SessionMode[]).map(m => (
                <button key={m} onClick={() => { set("mode", m); set("location", m === "Online" ? "Google Meet" : ""); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${form.mode === m ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                  style={{ fontSize:"0.85rem", fontWeight:form.mode === m ? 700 : 500 }}>
                  {m === "Online" ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />} {m}
                </button>
              ))}
            </div>
          </div>
          {/* Location */}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">
              {form.mode === "Online" ? "Link meeting" : "Địa điểm"}
            </label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder={form.mode === "Online" ? "https://meet.google.com/..." : "Địa chỉ phòng tập"} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize:"0.85rem" }} />
          </div>
          {/* Fee */}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Phí buổi dạy (đ)</label>
            <input type="number" value={form.fee} onChange={e => set("fee", Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize:"0.85rem" }} />
          </div>
          {/* Note */}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600 }} className="block text-gray-600 mb-1.5">Ghi chú</label>
            <textarea value={form.note} onChange={e => set("note", e.target.value)} rows={2} placeholder="Nội dung buổi tập..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" style={{ fontSize:"0.85rem" }} />
          </div>
          {/* Repeat */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors relative ${form.repeat ? "bg-blue-500" : "bg-gray-200"}`} onClick={() => set("repeat", !form.repeat)}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.repeat ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span style={{ fontSize:"0.82rem", fontWeight:500 }} className="text-gray-600">Lặp lại hàng tuần</span>
          </label>
          {/* Submit */}
          <button
            onClick={() => {
              if (!form.date || !form.student || !form.startTime || !form.endTime) return;
              onSave({
                id: initial?.id ?? `s${Date.now()}`,
                date: form.date!, startTime: form.startTime!, endTime: form.endTime!,
                student: form.student!, plan: form.plan ?? "Pro",
                mode: form.mode ?? "Online", location: form.location ?? "",
                status: initial?.status ?? "upcoming", fee: form.fee ?? 400000,
                note: form.note ?? "", repeat: form.repeat ?? false,
                meetLink: form.mode === "Online" ? form.location : undefined,
              });
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-200"
            style={{ fontSize:"0.9rem", fontWeight:700 }}
          >
            {initial ? "Lưu thay đổi" : "Thêm vào lịch"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({
  weekStart, sessions, todayStr, onSelect, onAddAt
}: {
  weekStart: Date; sessions: CoachSession[]; todayStr: string;
  onSelect: (s: CoachSession) => void; onAddAt: (date: string, time: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const totalH = (END_H - START_H) * HOUR_H;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to 07:00
    if (scrollRef.current) scrollRef.current.scrollTop = HOUR_H;
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Day headers */}
      <div className="shrink-0 grid border-b border-gray-100 bg-gray-50" style={{ gridTemplateColumns: "56px repeat(7,1fr)" }}>
        <div className="border-r border-gray-100" />
        {days.map((d, i) => {
          const ds = fmtDate(d);
          const isToday = ds === todayStr;
          const dayCount = sessions.filter(s => s.date === ds).length;
          return (
            <div key={i} className={`flex flex-col items-center py-2.5 border-r border-gray-100 last:border-0 ${isToday ? "bg-blue-50" : ""}`}>
              <div style={{ fontSize:"0.68rem", fontWeight:600 }} className={isToday ? "text-blue-500" : "text-gray-400"}>{DAYS_SHORT[i]}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${isToday ? "bg-blue-500 text-white" : "text-gray-700"}`} style={{ fontWeight:700, fontSize:"0.9rem" }}>
                {d.getDate()}
              </div>
              {dayCount > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(dayCount, 4) }).map((_, j) => (
                    <span key={j} className="w-1 h-1 rounded-full bg-blue-400" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto">
        <div className="relative" style={{ gridTemplateColumns: "56px repeat(7,1fr)", display: "grid", minWidth: 600 }}>
          {/* Time labels */}
          <div className="relative" style={{ height: totalH + HOUR_H }}>
            {HOURS.map(h => (
              <div key={h} className="absolute flex items-start justify-end pr-2" style={{ top: (h - START_H) * HOUR_H - 8, height: HOUR_H, width: "100%" }}>
                <span style={{ fontSize:"0.65rem", fontWeight:500 }} className="text-gray-400 mt-1">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, colIdx) => {
            const ds = fmtDate(d);
            const isToday = ds === todayStr;
            const daySessions = sessions.filter(s => s.date === ds);

            // Group overlapping: compute columns
            type Block = CoachSession & { col: number; totalCols: number };
            const blocks: Block[] = daySessions.map(s => ({ ...s, col: 0, totalCols: 1 }));
            // Simple overlap detection
            for (let i = 0; i < blocks.length; i++) {
              const aStart = timeToMin(blocks[i].startTime);
              const aEnd   = timeToMin(blocks[i].endTime);
              let maxCol = 0;
              for (let j = 0; j < i; j++) {
                const bStart = timeToMin(blocks[j].startTime);
                const bEnd   = timeToMin(blocks[j].endTime);
                if (aStart < bEnd && aEnd > bStart) {
                  maxCol = Math.max(maxCol, blocks[j].col + 1);
                }
              }
              blocks[i].col = maxCol;
            }
            const maxCols = blocks.reduce((m, b) => Math.max(m, b.col + 1), 1);
            blocks.forEach(b => b.totalCols = maxCols);

            return (
              <div
                key={colIdx}
                className={`relative border-r border-gray-100 last:border-0 ${isToday ? "bg-blue-50/20" : ""}`}
                style={{ height: totalH + HOUR_H }}
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const totalMin = (y / HOUR_H) * 60;
                  const hour = Math.floor(totalMin / 60) + START_H;
                  const min = Math.round((totalMin % 60) / 30) * 30;
                  const hStr = String(hour).padStart(2, "0");
                  const mStr = String(min % 60).padStart(2, "0");
                  onAddAt(ds, `${hStr}:${mStr}`);
                }}
              >
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div key={h} className="absolute w-full border-t border-gray-100" style={{ top: (h - START_H) * HOUR_H }} />
                ))}
                {/* Half-hour lines */}
                {HOURS.slice(0, -1).map(h => (
                  <div key={`h${h}`} className="absolute w-full border-t border-dashed border-gray-50" style={{ top: (h - START_H) * HOUR_H + HOUR_H / 2 }} />
                ))}

                {/* Current time indicator */}
                {isToday && (() => {
                  const now = new Date();
                  const mins = now.getHours() * 60 + now.getMinutes();
                  const top = ((mins / 60) - START_H) * HOUR_H;
                  if (top < 0 || top > totalH) return null;
                  return (
                    <div className="absolute w-full flex items-center z-20 pointer-events-none" style={{ top }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
                      <div className="flex-1 h-0.5 bg-red-500 opacity-60" />
                    </div>
                  );
                })()}

                {/* Sessions */}
                {blocks.map(sess => {
                  const startMin = timeToMin(sess.startTime);
                  const endMin   = timeToMin(sess.endTime);
                  const top    = ((startMin / 60) - START_H) * HOUR_H;
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_H - 3, 24);
                  const sc = STATUS_COLOR[sess.status];
                  const widthPct = 100 / sess.totalCols;
                  const leftPct  = sess.col * widthPct;
                  const short = height < 50;

                  return (
                    <div
                      key={sess.id}
                      style={{
                        position: "absolute",
                        top: top + 1,
                        height,
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                        backgroundColor: sc.hex + "22",
                        borderLeft: `3px solid ${sc.hex}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                        zIndex: 10,
                      }}
                      onClick={e => { e.stopPropagation(); onSelect(sess); }}
                      className="hover:brightness-90 transition-all group"
                    >
                      <div className="px-1.5 py-1">
                        <div style={{ fontSize:"0.65rem", fontWeight:700, color: sc.hex, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {sess.startTime} {!short && `– ${sess.endTime}`}
                        </div>
                        {!short && (
                          <div style={{ fontSize:"0.68rem", fontWeight:600, color:"#374151", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {sess.student.split(" ").pop()}
                          </div>
                        )}
                        {height > 64 && (
                          <div style={{ fontSize:"0.62rem", color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {sess.mode === "Online" ? "🌐" : "📍"} {sess.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────
function MonthView({
  year, month, sessions, todayStr, onDaySelect
}: {
  year: number; month: number; sessions: CoachSession[];
  todayStr: string; onDaySelect: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const totalDays = lastDay.getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {DAYS_SHORT.map(d => (
          <div key={d} className="py-2.5 text-center" style={{ fontSize:"0.72rem", fontWeight:700, color:"#9ca3af" }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-20 border-r border-b border-gray-50 bg-gray-50/30" />;
          const ds = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const daySessions = sessions.filter(s => s.date === ds);
          const isToday = ds === todayStr;
          const isPast  = ds < todayStr;

          return (
            <div
              key={i}
              onClick={() => onDaySelect(ds)}
              className={`h-20 border-r border-b border-gray-100 p-1.5 cursor-pointer hover:bg-blue-50/40 transition-colors ${isToday ? "bg-blue-50" : isPast ? "bg-gray-50/40" : "bg-white"}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${isToday ? "bg-blue-500 text-white" : isPast ? "text-gray-400" : "text-gray-700"}`} style={{ fontSize:"0.78rem", fontWeight: isToday ? 700 : 500 }}>
                {day}
              </div>
              <div className="space-y-0.5">
                {daySessions.slice(0, 2).map(s => {
                  const sc = STATUS_COLOR[s.status];
                  return (
                    <div key={s.id} className={`px-1.5 py-0.5 rounded text-white truncate`} style={{ fontSize:"0.58rem", fontWeight:600, backgroundColor: sc.hex, opacity: s.status === "cancelled" ? 0.5 : 1 }}>
                      {s.startTime} {s.student.split(" ").pop()}
                    </div>
                  );
                })}
                {daySessions.length > 2 && (
                  <div style={{ fontSize:"0.58rem", color:"#9ca3af", fontWeight:600 }}>+{daySessions.length - 2} nữa</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ sessions, todayStr, onSelect }: {
  sessions: CoachSession[]; todayStr: string;
  onSelect: (s: CoachSession) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, CoachSession[]> = {};
    [...sessions].sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .forEach(s => { (map[s.date] ??= []).push(s); });
    return map;
  }, [sessions]);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, list]) => {
        const d = toDate(date);
        const dayName = DAYS_FULL[(d.getDay() + 6) % 7];
        const isToday = date === todayStr;
        const isPast  = date < todayStr;
        return (
          <div key={date}>
            <div className={`flex items-center gap-3 mb-2 px-1 ${isToday ? "sticky top-0 z-10" : ""}`}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isToday ? "bg-blue-500" : isPast ? "bg-gray-100" : "bg-gray-50 border border-gray-200"}`}>
                <span style={{ fontWeight:700, fontSize:"0.8rem" }} className={isToday ? "text-white" : isPast ? "text-gray-400" : "text-gray-600"}>
                  {dayName}, {d.getDate()} {MONTHS_VI[d.getMonth()]}
                </span>
                {isToday && <span style={{ fontSize:"0.65rem", fontWeight:700 }} className="bg-white/20 px-1.5 py-0.5 rounded-full text-white">Hôm nay</span>}
              </div>
              <span style={{ fontSize:"0.72rem" }} className="text-gray-400">{list.length} buổi · {fmtCurrency(list.reduce((s, x) => s + x.fee, 0))}đ</span>
            </div>
            <div className="space-y-2">
              {list.map(s => {
                const sc = STATUS_COLOR[s.status];
                const dur = timeToMin(s.endTime) - timeToMin(s.startTime);
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s)}
                    className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 hover:border-blue-200 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: sc.hex }} />
                    <img src={AVATARS[s.student] ?? AVATARS["Trần Bảo Long"]} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight:600, fontSize:"0.88rem" }} className="text-gray-900 group-hover:text-blue-600 transition-colors truncate">{s.student}</div>
                      <div style={{ fontSize:"0.72rem" }} className="text-gray-400">{s.startTime} – {s.endTime} · {dur} phút · {s.mode}</div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`} style={{ fontSize:"0.65rem", fontWeight:600 }}>{sc.label}</span>
                      <span style={{ fontSize:"0.78rem", fontWeight:700 }} className="text-emerald-600">{s.fee.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type ViewMode = "week" | "month" | "list";

export function CoachSchedule({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const session = getAuthSession();
  const [coachId, setCoachId] = useState<number | undefined>(session?.coachId);
  const [slots, setSlots] = useState<PublishedCoachSchedule[]>([]);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
  });

  useEffect(() => {
    if (coachId) return;
    if (!session) {
      setLoading(false);
      setError("Vui lòng đăng nhập tài khoản huấn luyện viên để quản lý lịch.");
      return;
    }
    const name = session.fullName?.trim() || session.username;
    searchCoaches({ name, page: 0, size: 20 })
      .then(result => {
        const match = result.content.find(coach => coach.fullName.trim().toLocaleLowerCase() === name.toLocaleLowerCase())
          || result.content[0];
        if (match) {
          setCoachId(match.id);
          updateAuthSession({ coachId: match.id });
        } else {
          setLoading(false);
          setError("Không tìm thấy hồ sơ HLV của tài khoản này. Vui lòng hoàn thiện hồ sơ trước khi tạo lịch.");
        }
      })
      .catch(reason => {
        setLoading(false);
        setError(reason instanceof Error ? reason.message : "Không thể xác định hồ sơ huấn luyện viên.");
      });
  }, [coachId, session]);

  const loadCalendar = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const [publishedSlots, bookedSessions] = await Promise.all([
        getCoachSchedule(id),
        getCoachCalendarBookings(),
      ]);
      setSlots(publishedSlots);
      setBookings(bookedSessions);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải lịch dạy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coachId) void loadCalendar(coachId);
  }, [coachId]);

  const submitSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError("");
    setCreated("");
    if (!coachId) {
      setSaveError("Chưa xác định được hồ sơ HLV để tạo lịch.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setSaveError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    const date = new Date(`${form.date}T00:00:00`);
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    setSaving(true);
    try {
      const result = await createCoachSchedule({
        coachId,
        dayOfWeek: days[date.getDay()],
        startDate: form.date,
        endDate: form.date,
        startTime: toLocalTimePayload(form.startTime),
        endTime: toLocalTimePayload(form.endTime),
      });
      setSlots(current => [...current, { ...result, startDate: form.date, endDate: form.date }]);
      setCreated("Đã mở lịch tập. Học viên có thể chọn slot này trong hồ sơ của bạn.");
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Không thể tạo lịch tập.");
    } finally {
      setSaving(false);
    }
  };

  const dayNames: Record<string, string> = {
    MONDAY: "Thứ Hai", TUESDAY: "Thứ Ba", WEDNESDAY: "Thứ Tư",
    THURSDAY: "Thứ Năm", FRIDAY: "Thứ Sáu", SATURDAY: "Thứ Bảy", SUNDAY: "Chủ Nhật",
  };
  const statusStyle: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600",
    CONFIRMED: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-emerald-50 text-emerald-600",
    CANCELLED: "bg-red-50 text-red-600",
  };
  const statusText: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã đăng ký",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return (
    <div className="space-y-5 pb-8">
      <header className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Quản lý lịch cho học viên đăng ký</h2>
        <p className="text-blue-100 mt-1" style={{ fontSize: "0.82rem" }}>Tạo từng lịch trống. Khi học viên đặt thành công, booking xuất hiện trong danh sách đã đăng ký.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
        <form onSubmit={submitSchedule} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Plus className="w-4 h-4 text-blue-500" />
            <h3 className="text-gray-900" style={{ fontSize: "0.92rem", fontWeight: 700 }}>Mở lịch tập mới</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Ngày tập</label>
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-400 text-gray-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Bắt đầu</label>
                <input type="time" value={form.startTime} onChange={event => setForm(current => ({ ...current, startTime: event.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-400 text-gray-700" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Kết thúc</label>
                <input type="time" value={form.endTime} onChange={event => setForm(current => ({ ...current, endTime: event.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-400 text-gray-700" />
              </div>
            </div>
            {saveError && <p className="rounded-xl bg-red-50 border border-red-100 p-3 text-red-600" style={{ fontSize: "0.78rem" }}>{saveError}</p>}
            {created && <p className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-emerald-600" style={{ fontSize: "0.78rem" }}>{created}</p>}
            <button disabled={saving || !coachId} type="submit" className="w-full rounded-xl bg-blue-500 py-3 text-white hover:bg-blue-600 disabled:opacity-60 flex items-center justify-center gap-2" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              {saving ? "Đang tạo lịch..." : <><Plus className="w-4 h-4" /> Tạo lịch cho học viên chọn</>}
            </button>
          </div>
        </form>

        <div className="space-y-5">
          {loading ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center text-gray-500">Đang tải lịch từ hệ thống...</div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-red-600">{error}</div>
          ) : (
            <>
              <section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900" style={{ fontSize: "0.92rem", fontWeight: 700 }}>Lịch đang mở cho đăng ký</h3>
                  <span className="rounded-full bg-blue-50 text-blue-600 px-3 py-1" style={{ fontSize: "0.74rem", fontWeight: 700 }}>{slots.length} slot</span>
                </div>
                {slots.length === 0 ? (
                  <p className="text-gray-400 py-5 text-center" style={{ fontSize: "0.82rem" }}>Bạn chưa mở lịch tập nào.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {slots.map((slot, index) => (
                      <div key={`${slot.dayOfWeek}-${slot.startTime}-${index}`} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 flex items-center justify-between">
                        <div>
                          <div className="text-gray-900" style={{ fontSize: "0.83rem", fontWeight: 700 }}>{dayNames[slot.dayOfWeek || ""] || slot.dayOfWeek}</div>
                          <div className="text-gray-500 mt-0.5" style={{ fontSize: "0.76rem" }}>{slot.startTime} - {slot.endTime}</div>
                        </div>
                        <span className="rounded-full bg-emerald-100 text-emerald-600 px-2.5 py-1" style={{ fontSize: "0.68rem", fontWeight: 700 }}>Đang mở</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900" style={{ fontSize: "0.92rem", fontWeight: 700 }}>Lịch đã có học viên đăng ký</h3>
                  <button type="button" onClick={() => coachId && void loadCalendar(coachId)} className="text-blue-500" style={{ fontSize: "0.76rem", fontWeight: 700 }}>Tải lại</button>
                </div>
                {bookings.length === 0 ? (
                  <p className="text-gray-400 py-5 text-center" style={{ fontSize: "0.82rem" }}>Chưa có booking nào.</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(item => (
                      <div key={item.id} className="rounded-xl border border-gray-100 p-3.5 flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-[180px]">
                          <div className="text-gray-900" style={{ fontSize: "0.84rem", fontWeight: 700 }}>{item.traineeName || "Học viên"}</div>
                          <div className="text-gray-500" style={{ fontSize: "0.75rem" }}>{item.date} · {item.startTime} - {item.endTime} · {item.type === "ONLINE" ? "Online" : "Trực tiếp"}</div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 ${statusStyle[item.status || "PENDING"] || "bg-gray-50 text-gray-500"}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                          {statusText[item.status || "PENDING"] || item.status}
                        </span>
                        <button type="button" onClick={() => onNavigate?.("msg")} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50"><MessageCircle className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
