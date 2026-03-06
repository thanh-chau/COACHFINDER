import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video,
  CheckCircle2, X, Calendar, List, LayoutGrid, Dumbbell,
  Users, DollarSign, Zap, MessageCircle, Edit3, Trash2,
  Link as LinkIcon, Play, AlertCircle, Bell, ChevronDown,
  Check, Search, MoreHorizontal, Globe, PhoneCall, Repeat,
  Filter, CalendarDays
} from "lucide-react";

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
  const [sessions, setSessions] = useState<CoachSession[]>(INITIAL_SESSIONS);
  const [view, setView] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => getMonday(TODAY));
  const [calMonth, setCalMonth] = useState({ year: 2026, month: 2 }); // 0-indexed
  const [selectedSession, setSelectedSession] = useState<CoachSession | null>(null);
  const [editSession, setEditSession] = useState<CoachSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [addDate, setAddDate] = useState<string | null>(null);
  const [addTime, setAddTime] = useState<string>("09:00");
  const [filterStatus, setFilterStatus] = useState<"all" | SessionStatus>("all");

  // Filtered sessions
  const visibleSessions = useMemo(() => {
    let list = sessions;
    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus);
    return list;
  }, [sessions, filterStatus]);

  // Week sessions for week view
  const weekEnd = addDays(weekStart, 6);
  const weekSessions = visibleSessions.filter(s => s.date >= fmtDate(weekStart) && s.date <= fmtDate(weekEnd));

  // Stats
  const todaySessions  = sessions.filter(s => s.date === TODAY_STR);
  const weekAllSessions= sessions.filter(s => s.date >= fmtDate(weekStart) && s.date <= fmtDate(weekEnd));
  const weekRevenue    = weekAllSessions.filter(s => s.status !== "cancelled").reduce((sum, s) => sum + s.fee, 0);
  const upcomingToday  = todaySessions.filter(s => s.status === "upcoming").length;

  const handleSave = (s: CoachSession) => {
    setSessions(prev => {
      const idx = prev.findIndex(x => x.id === s.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = s; return n; }
      return [...prev, s];
    });
  };
  const handleDelete = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));
  const handleStatusChange = (id: string, status: SessionStatus) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setSelectedSession(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  // Month navigation title
  const weekLabel = (() => {
    const ms = weekStart, me = addDays(weekStart, 6);
    if (ms.getMonth() === me.getMonth()) return `${MONTHS_VI[ms.getMonth()]} ${ms.getFullYear()}`;
    return `${ms.getDate()} ${MONTHS_VI[ms.getMonth()]} – ${me.getDate()} ${MONTHS_VI[me.getMonth()]} ${me.getFullYear()}`;
  })();

  return (
    <div className="flex gap-4 h-[calc(100vh-130px)]">
      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          {[
            { icon: CalendarDays, label:"Hôm nay",        value: todaySessions.filter(s=>s.status!=="cancelled").length+" buổi", sub:`${upcomingToday} sắp tới`,      color:"text-blue-500",   bg:"bg-blue-50"   },
            { icon: Users,        label:"Tuần này",        value: weekAllSessions.filter(s=>s.status!=="cancelled").length+" buổi", sub:`${weekAllSessions.filter(s=>s.status==="completed").length} đã xong`, color:"text-purple-500", bg:"bg-purple-50" },
            { icon: DollarSign,   label:"Doanh thu tuần",  value: fmtCurrency(weekRevenue)+"đ",                                    sub:"Chưa trừ hoa hồng",            color:"text-emerald-500",bg:"bg-emerald-50" },
            { icon: Zap,          label:"Pending",         value: sessions.filter(s=>s.status==="pending").length+" buổi",         sub:"Cần xác nhận",                  color:"text-amber-500",  bg:"bg-amber-50"  },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:"1rem" }} className="text-gray-900">{value}</div>
                <div style={{ fontSize:"0.7rem" }} className="text-gray-400">{label} · {sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="shrink-0 flex items-center gap-3 flex-wrap">
          {/* Nav arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (view === "week") setWeekStart(d => addDays(d, -7));
                else setCalMonth(m => { const d = new Date(m.year, m.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; });
              }}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setWeekStart(getMonday(TODAY)); setCalMonth({ year: 2026, month: 2 }); }}
              className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
              style={{ fontSize:"0.8rem", fontWeight:600 }}
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                if (view === "week") setWeekStart(d => addDays(d, 7));
                else setCalMonth(m => { const d = new Date(m.year, m.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; });
              }}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Date label */}
          <div style={{ fontWeight:700, fontSize:"0.95rem" }} className="text-gray-900">
            {view === "week" ? weekLabel : `${MONTHS_VI[calMonth.month]} ${calMonth.year}`}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Filter */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none" style={{ fontSize:"0.8rem" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Sắp tới</option>
            <option value="completed">Hoàn thành</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="cancelled">Đã huỷ</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            {([["week","Tuần",Calendar],["month","Tháng",LayoutGrid],["list","DS",List]] as [ViewMode,string,any][]).map(([v,label,Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${view === v ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                style={{ fontSize:"0.78rem", fontWeight: view === v ? 700 : 500 }}>
                <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => { setEditSession(null); setAddDate(TODAY_STR); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-200"
            style={{ fontSize:"0.82rem", fontWeight:700 }}
          >
            <Plus className="w-4 h-4" /> Thêm buổi
          </button>
        </div>

        {/* ── Views ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {view === "week" && (
            <WeekView
              weekStart={weekStart}
              sessions={weekSessions}
              todayStr={TODAY_STR}
              onSelect={s => setSelectedSession(s)}
              onAddAt={(date, time) => { setAddDate(date); setAddTime(time); setEditSession(null); setShowModal(true); }}
            />
          )}
          {view === "month" && (
            <div className="overflow-y-auto h-full">
              <MonthView
                year={calMonth.year}
                month={calMonth.month}
                sessions={visibleSessions}
                todayStr={TODAY_STR}
                onDaySelect={date => {
                  setWeekStart(getMonday(toDate(date)));
                  setView("week");
                }}
              />
            </div>
          )}
          {view === "list" && (
            <div className="overflow-y-auto h-full pr-1">
              <ListView sessions={visibleSessions} todayStr={TODAY_STR} onSelect={s => setSelectedSession(s)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Panel (right) ── */}
      {selectedSession && (
        <div className="w-72 xl:w-80 shrink-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden hidden md:flex flex-col">
          <SessionDetail
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onEdit={() => { setEditSession(selectedSession); setShowModal(true); }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onMessage={() => onNavigate?.("msg")}
          />
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <SessionModal
          onClose={() => { setShowModal(false); setEditSession(null); }}
          onSave={handleSave}
          initial={editSession}
          defaultDate={addDate ?? TODAY_STR}
        />
      )}
    </div>
  );
}
