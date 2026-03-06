import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video,
  CheckCircle2, X, AlertCircle, Star, List, LayoutGrid,
  CalendarDays, MessageCircle, Zap, Globe, ArrowRight,
  Dumbbell, Users, TrendingUp, Flame, Search
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const TODAY = "2026-03-05";
const DAYS_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS_VI = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

const SPORT_COLORS: Record<string, { bg: string; text: string; dot: string; hex: string; light: string; border: string }> = {
  "Thể hình": { bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-500", hex: "#f97316", light: "bg-orange-50", border: "border-orange-300" },
  "Yoga":     { bg: "bg-purple-100", text: "text-purple-600", dot: "bg-purple-500", hex: "#8b5cf6", light: "bg-purple-50", border: "border-purple-300" },
  "Tennis":   { bg: "bg-emerald-100", text: "text-emerald-600", dot: "bg-emerald-500", hex: "#10b981", light: "bg-emerald-50", border: "border-emerald-300" },
  "Boxing":   { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500", hex: "#ef4444", light: "bg-red-50", border: "border-red-300" },
  "CrossFit": { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500", hex: "#3b82f6", light: "bg-blue-50", border: "border-blue-300" },
  "Pilates":  { bg: "bg-pink-100", text: "text-pink-600", dot: "bg-pink-500", hex: "#ec4899", light: "bg-pink-50", border: "border-pink-300" },
};
function sc(sport: string) {
  return SPORT_COLORS[sport] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", hex: "#9ca3af", light: "bg-gray-50", border: "border-gray-200" };
}

const AVATAR_1 = "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const AVATAR_2 = "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const AVATAR_3 = "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const AVATAR_4 = "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const AVATAR_5 = "https://images.unsplash.com/photo-1680759170077-e9e2d838a34c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";

// ─── Types ────────────────────────────────────────────────────────────────────
type SessionStatus = "upcoming" | "completed" | "cancelled" | "pending";
interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  coach: string;
  coachAvatar: string;
  sport: string;
  emoji: string;
  mode: "Online" | "Offline";
  location: string;
  status: SessionStatus;
  price: number;
  note: string;
  meetLink?: string;
  rating?: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_SESSIONS: Session[] = [
  // Past (completed)
  { id: 1,  date: "2026-02-24", startTime: "14:00", endTime: "15:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "completed", price: 250000, note: "Tập Squat & Deadlift cơ bản", rating: 5 },
  { id: 2,  date: "2026-02-26", startTime: "08:00", endTime: "09:00", coach: "Lê Thị Mai",      coachAvatar: AVATAR_2, sport: "Yoga",     emoji: "🧘", mode: "Offline", location: "27 Nguyễn Đình Chiểu, Q1", status: "completed", price: 180000, note: "Yoga buổi sáng – căng cơ toàn thân", rating: 5 },
  { id: 3,  date: "2026-02-28", startTime: "17:00", endTime: "18:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "completed", price: 250000, note: "Bench Press + Shoulder Press", rating: 4 },
  { id: 4,  date: "2026-03-02", startTime: "08:00", endTime: "09:00", coach: "Lê Thị Mai",      coachAvatar: AVATAR_2, sport: "Yoga",     emoji: "🧘", mode: "Offline", location: "27 Nguyễn Đình Chiểu, Q1", status: "completed", price: 180000, note: "Vinyasa flow nhẹ nhàng", rating: 5 },
  { id: 5,  date: "2026-03-03", startTime: "14:00", endTime: "15:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "completed", price: 250000, note: "Leg day: Squat + Lunge + RDL", rating: 5 },
  { id: 6,  date: "2026-03-04", startTime: "18:00", endTime: "19:30", coach: "Phạm Thị Linh",   coachAvatar: AVATAR_4, sport: "Boxing",   emoji: "🥊", mode: "Offline", location: "98 Lê Lợi, Q1",    status: "completed", price: 220000, note: "Kỹ thuật đấm cơ bản + combo", rating: 5 },
  // Today & upcoming
  { id: 7,  date: "2026-03-05", startTime: "14:00", endTime: "15:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "upcoming",  price: 250000, note: "Upper body: Chest + Back", meetLink: "https://meet.google.com/abc-defg-hij" },
  { id: 8,  date: "2026-03-06", startTime: "08:00", endTime: "09:00", coach: "Lê Thị Mai",      coachAvatar: AVATAR_2, sport: "Yoga",     emoji: "🧘", mode: "Offline", location: "27 Nguyễn Đình Chiểu, Q1", status: "upcoming", price: 180000, note: "Hatha Yoga + Thiền 15 phút" },
  { id: 9,  date: "2026-03-07", startTime: "16:00", endTime: "17:30", coach: "Nguyễn Hoàng Minh", coachAvatar: AVATAR_3, sport: "Tennis",   emoji: "🎾", mode: "Offline", location: "Sân Tennis Tao Đàn, Q3", status: "pending",   price: 350000, note: "Kỹ thuật serve + forehand" },
  { id: 10, date: "2026-03-09", startTime: "14:00", endTime: "15:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "upcoming",  price: 250000, note: "Pull day: Pull-up + Row" },
  { id: 11, date: "2026-03-10", startTime: "18:30", endTime: "20:00", coach: "Đỗ Minh Khoa",    coachAvatar: AVATAR_5, sport: "CrossFit", emoji: "🏋️", mode: "Offline", location: "CrossFit HCM, Q7",  status: "upcoming",  price: 400000, note: "WOD: AMRAP 20 phút" },
  { id: 12, date: "2026-03-12", startTime: "08:00", endTime: "09:00", coach: "Lê Thị Mai",      coachAvatar: AVATAR_2, sport: "Yoga",     emoji: "🧘", mode: "Online",  location: "Google Meet",       status: "upcoming",  price: 180000, note: "Yin Yoga – giãn cơ sâu", meetLink: "https://meet.google.com/xyz-uvwx-yz1" },
  { id: 13, date: "2026-03-14", startTime: "10:00", endTime: "11:30", coach: "Nguyễn Hoàng Minh", coachAvatar: AVATAR_3, sport: "Tennis",   emoji: "🎾", mode: "Offline", location: "Sân Tennis Tao Đàn, Q3", status: "upcoming",  price: 350000, note: "Chiến thuật thi đấu đơn" },
  { id: 14, date: "2026-03-16", startTime: "14:00", endTime: "15:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "upcoming",  price: 250000, note: "Push day: Chest Press + Dips", meetLink: "https://meet.google.com/def-ghij-klm" },
  { id: 15, date: "2026-03-17", startTime: "08:00", endTime: "09:00", coach: "Lê Thị Mai",      coachAvatar: AVATAR_2, sport: "Yoga",     emoji: "🧘", mode: "Offline", location: "27 Nguyễn Đình Chiểu, Q1", status: "upcoming", price: 180000, note: "Vinyasa Flow nâng cao" },
  { id: 16, date: "2026-03-19", startTime: "18:30", endTime: "20:00", coach: "Đỗ Minh Khoa",    coachAvatar: AVATAR_5, sport: "CrossFit", emoji: "🏋️", mode: "Offline", location: "CrossFit HCM, Q7",  status: "upcoming",  price: 400000, note: "Olympic Lifting: Clean & Jerk" },
  { id: 17, date: "2026-03-21", startTime: "14:00", endTime: "15:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "upcoming",  price: 250000, note: "Leg day nâng cao", meetLink: "https://meet.google.com/nop-qrst-uvw" },
  { id: 18, date: "2026-03-23", startTime: "08:00", endTime: "09:00", coach: "Lê Thị Mai",      coachAvatar: AVATAR_2, sport: "Yoga",     emoji: "🧘", mode: "Offline", location: "27 Nguyễn Đình Chiểu, Q1", status: "upcoming", price: 180000, note: "Restorative Yoga" },
  { id: 19, date: "2026-03-25", startTime: "16:00", endTime: "17:30", coach: "Nguyễn Hoàng Minh", coachAvatar: AVATAR_3, sport: "Tennis",   emoji: "🎾", mode: "Offline", location: "Sân Tennis Tao Đàn, Q3", status: "upcoming",  price: 350000, note: "Backhand + Volley" },
  { id: 20, date: "2026-03-28", startTime: "10:00", endTime: "11:30", coach: "Trần Văn Đức",    coachAvatar: AVATAR_1, sport: "Thể hình", emoji: "💪", mode: "Online",  location: "Google Meet",       status: "upcoming",  price: 250000, note: "Full body review", meetLink: "https://meet.google.com/xyz-1234-abc" },
];

const STATUS_CFG: Record<SessionStatus, { label: string; cls: string; dot: string }> = {
  upcoming:  { label: "Sắp tới",         cls: "bg-blue-100 text-blue-600 border-blue-200",    dot: "bg-blue-500"   },
  completed: { label: "Đã hoàn thành",   cls: "bg-emerald-100 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Đã huỷ",         cls: "bg-red-100 text-red-500 border-red-200",        dot: "bg-red-400"    },
  pending:   { label: "Chờ xác nhận",    cls: "bg-amber-100 text-amber-600 border-amber-200", dot: "bg-amber-500"  },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
function parseDate(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function isoDate(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
// Mon = 0 index
function weekStart(d: Date) { const day = d.getDay(); const diff = (day === 0 ? -6 : 1 - day); return addDays(d, diff); }
function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const dow = firstDay.getDay(); // 0=Sun
  const startOffset = dow === 0 ? 6 : dow - 1; // Mon first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date; isCurrentMonth: boolean }> = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ date: addDays(firstDay, -i - 1), isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  while (cells.length % 7 !== 0) cells.push({ date: addDays(new Date(year, month + 1, 1), cells.length - daysInMonth - startOffset), isCurrentMonth: false });
  return cells;
}

// ─── Session detail modal ─────────────────────────────────────────────────────
function SessionModal({
  session,
  onClose,
  onCancel,
  onRate,
}: {
  session: Session;
  onClose: () => void;
  onCancel: (id: number) => void;
  onRate: (id: number, rating: number) => void;
}) {
  const [cancelStep, setCancelStep] = useState<"idle" | "confirm" | "done">("idle");
  const [hoverRating, setHoverRating] = useState(0);
  const [rated, setRated] = useState(!!session.rating);
  const [myRating, setMyRating] = useState(session.rating ?? 0);
  const color = sc(session.sport);
  const stCfg = STATUS_CFG[session.status];

  const handleCancel = () => {
    onCancel(session.id);
    setCancelStep("done");
  };

  const handleRate = (r: number) => {
    setMyRating(r);
    setRated(true);
    onRate(session.id, r);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Color header */}
        <div className={`${color.light} px-6 pt-5 pb-4 border-b ${color.border}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${color.bg} flex items-center justify-center text-xl`}>
                {session.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem" }} className="text-gray-900">{session.sport}</div>
                <div style={{ fontSize: "0.8rem" }} className="text-gray-500">với {session.coach}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${stCfg.cls}`} style={{ fontWeight: 600, fontSize: "0.72rem" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                {stCfg.label}
              </span>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarDays, label: "Ngày", value: (() => { const d = parseDate(session.date); return `${DAYS_SHORT[(d.getDay() + 6) % 7]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })() },
              { icon: Clock, label: "Thời gian", value: `${session.startTime} – ${session.endTime}` },
              { icon: session.mode === "Online" ? Globe : MapPin, label: "Hình thức", value: session.mode },
              { icon: Dumbbell, label: "Chi phí", value: `${(session.price / 1000).toFixed(0)},000đ` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span style={{ fontSize: "0.7rem", fontWeight: 600 }} className="text-gray-400">{label}</span>
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Location / meet link */}
          {session.mode === "Offline" ? (
            <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600 }} className="text-emerald-600 mb-0.5">Địa điểm tập</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-gray-800">{session.location}</div>
              </div>
            </div>
          ) : session.meetLink && (
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
              <Video className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: "0.72rem", fontWeight: 600 }} className="text-blue-600 mb-0.5">Link tham gia</div>
                <div style={{ fontSize: "0.78rem" }} className="text-gray-600 truncate">{session.meetLink}</div>
              </div>
            </div>
          )}

          {/* Note */}
          {session.note && (
            <div className="bg-gray-50 rounded-xl p-3.5">
              <div style={{ fontSize: "0.72rem", fontWeight: 600 }} className="text-gray-400 mb-1">Nội dung buổi tập</div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }} className="text-gray-700">{session.note}</p>
            </div>
          )}

          {/* Coach avatar row */}
          <div className="flex items-center gap-3">
            <img src={session.coachAvatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
            <div className="flex-1">
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-gray-900">{session.coach}</div>
              <div style={{ fontSize: "0.72rem" }} className="text-gray-400">Huấn luyện viên</div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
              <MessageCircle className="w-3.5 h-3.5" /> Nhắn tin
            </button>
          </div>

          {/* Rating (for completed) */}
          {session.status === "completed" && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-800 mb-2">
                {rated ? "Đánh giá của bạn" : "Đánh giá buổi tập này"}
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    disabled={rated}
                    onMouseEnter={() => !rated && setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(n)}
                    className="transition-transform hover:scale-110 disabled:cursor-default"
                  >
                    <Star className={`w-6 h-6 ${n <= (hoverRating || myRating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                  </button>
                ))}
                {rated && <span style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-amber-600 ml-1">Cảm ơn bạn! ✨</span>}
              </div>
            </div>
          )}

          {/* Cancel confirm */}
          {cancelStep === "confirm" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-red-600">Xác nhận huỷ lịch?</span>
              </div>
              <p style={{ fontSize: "0.78rem", lineHeight: 1.6 }} className="text-gray-600 mb-3">
                Huỷ trước 24h sẽ được hoàn tiền 100%. Huỷ muộn hơn sẽ không được hoàn tiền.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setCancelStep("idle")} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Giữ lịch</button>
                <button onClick={handleCancel} className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Huỷ lịch</button>
              </div>
            </div>
          )}

          {cancelStep === "done" && (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-gray-700">Đã huỷ lịch thành công</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cancelStep === "idle" && (
          <div className="px-6 pb-6 flex gap-3">
            {session.status === "upcoming" && (
              <>
                <button onClick={() => setCancelStep("confirm")} className="flex-1 py-2.5 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  Huỷ lịch
                </button>
                {session.meetLink ? (
                  <a href={session.meetLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex-[2] py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    <Video className="w-4 h-4" /> Tham gia ngay
                  </a>
                ) : (
                  <button className="flex-[2] py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    <MapPin className="w-4 h-4" /> Xem bản đồ
                  </button>
                )}
              </>
            )}
            {session.status === "pending" && (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-600" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                <Clock className="w-4 h-4" /> Chờ HLV xác nhận
              </div>
            )}
            {session.status === "completed" && (
              <button onClick={onClose} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                Đóng
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Month Calendar ───────────────────────────────────────────────────────────
function MonthCalendar({
  sessions,
  year,
  month,
  selectedDate,
  onSelectDate,
}: {
  sessions: Session[];
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const getSessionsForDate = (dateStr: string) =>
    sessions.filter(s => s.date === dateStr && s.status !== "cancelled");

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center py-2" style={{ fontSize: "0.72rem", fontWeight: 700, color: d === "CN" ? "#ef4444" : "#9ca3af" }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {grid.map((cell, idx) => {
          const dateStr = isoDate(cell.date);
          const daySessions = getSessionsForDate(dateStr);
          const isToday = dateStr === TODAY;
          const isSelected = dateStr === selectedDate;
          const isPast = dateStr < TODAY;
          const isSun = cell.date.getDay() === 0;

          return (
            <button
              key={idx}
              onClick={() => cell.isCurrentMonth && onSelectDate(dateStr)}
              className={`relative rounded-xl p-1.5 flex flex-col items-center transition-all min-h-14 ${
                !cell.isCurrentMonth ? "opacity-25 cursor-default" : "cursor-pointer hover:bg-gray-50"
              } ${isSelected && cell.isCurrentMonth ? "bg-orange-500 hover:bg-orange-500 ring-2 ring-orange-300" : ""}
              ${isToday && !isSelected ? "ring-2 ring-orange-200" : ""}`}
            >
              <span style={{
                fontSize: "0.82rem",
                fontWeight: isToday || isSelected ? 800 : 500,
                color: isSelected ? "#fff" : isToday ? "#f97316" : isSun ? "#ef4444" : !cell.isCurrentMonth ? "#d1d5db" : "#374151"
              }}>
                {cell.date.getDate()}
              </span>
              {isToday && !isSelected && (
                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
              {/* Session dots */}
              {daySessions.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-full">
                  {daySessions.slice(0, 3).map((s, i) => {
                    const c = sc(s.sport);
                    return (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : c.hex }}
                      />
                    );
                  })}
                  {daySessions.length > 3 && (
                    <span style={{ fontSize: "0.5rem", color: isSelected ? "rgba(255,255,255,0.7)" : "#9ca3af", lineHeight: 1 }} className="self-end">+{daySessions.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week Time Grid ───────────────────────────────────────────────────────────
function WeekGrid({
  sessions,
  weekOf,
  onSelectSession,
}: {
  sessions: Session[];
  weekOf: Date;
  onSelectSession: (s: Session) => void;
}) {
  const HOUR_H = 52; // px per hour
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 5); // 5:00 - 21:00
  const ws = weekStart(weekOf);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

  const getSessionsForDay = (d: Date) => {
    const ds = isoDate(d);
    return sessions.filter(s => s.date === ds && s.status !== "cancelled");
  };

  const sessionTop = (startTime: string) => {
    const [h, m] = startTime.split(":").map(Number);
    return (h - 5 + m / 60) * HOUR_H;
  };

  const sessionHeight = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return Math.max((eh + em / 60 - sh - sm / 60) * HOUR_H - 4, 28);
  };

  const nowMins = 9 * 60 + 30; // 09:30 - today position
  const nowTop = (nowMins / 60 - 5) * HOUR_H;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
        <div className="py-3" />
        {days.map((d, i) => {
          const ds = isoDate(d);
          const isToday = ds === TODAY;
          const isSun = d.getDay() === 0;
          return (
            <div key={i} className="text-center py-3 border-l border-gray-100">
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: isSun ? "#ef4444" : "#9ca3af" }}>
                {DAYS_SHORT[i]}
              </div>
              <div className={`mx-auto w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${isToday ? "bg-orange-500" : ""}`} style={{ fontSize: "0.88rem", fontWeight: isToday ? 800 : 500, color: isToday ? "#fff" : isSun ? "#ef4444" : "#374151" }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
        <div className="relative" style={{ gridTemplateColumns: "48px repeat(7, 1fr)", display: "grid" }}>
          {/* Time axis */}
          <div className="sticky left-0 bg-white z-10">
            {HOURS.map(h => (
              <div key={h} className="flex items-start justify-end pr-2" style={{ height: HOUR_H, paddingTop: 4 }}>
                <span style={{ fontSize: "0.62rem" }} className="text-gray-400">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, di) => {
            const daySessions = getSessionsForDay(d);
            const isToday = isoDate(d) === TODAY;
            return (
              <div key={di} className="relative border-l border-gray-100">
                {/* Hour rows */}
                {HOURS.map(h => (
                  <div key={h} className="border-b border-gray-50" style={{ height: HOUR_H }} />
                ))}
                {/* Today line */}
                {isToday && (
                  <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: nowTop }}>
                    <div className="w-2 h-2 rounded-full bg-red-400 -ml-1 shrink-0" />
                    <div className="flex-1 h-px bg-red-400" />
                  </div>
                )}
                {/* Sessions */}
                {daySessions.map(s => {
                  const c = sc(s.sport);
                  return (
                    <button
                      key={s.id}
                      onClick={() => onSelectSession(s)}
                      className={`absolute left-1 right-1 rounded-lg overflow-hidden text-left hover:opacity-80 transition-opacity z-10 border-l-[3px]`}
                      style={{
                        top: sessionTop(s.startTime) + 2,
                        height: sessionHeight(s.startTime, s.endTime),
                        backgroundColor: c.hex + "20",
                        borderLeftColor: c.hex,
                      }}
                    >
                      <div className="px-1.5 py-1">
                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: c.hex }} className="truncate">{s.emoji} {s.sport}</div>
                        <div style={{ fontSize: "0.58rem", color: "#6b7280" }} className="truncate">{s.startTime}</div>
                        {sessionHeight(s.startTime, s.endTime) > 42 && (
                          <div style={{ fontSize: "0.58rem", color: "#6b7280" }} className="truncate">{s.coach.split(" ").pop()}</div>
                        )}
                      </div>
                    </button>
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

// ─── Session Item ─────────────────────────────────────────────────────────────
function SessionItem({ session, onClick, compact }: { session: Session; onClick: () => void; compact?: boolean }) {
  const c = sc(session.sport);
  const stCfg = STATUS_CFG[session.status];
  const d = parseDate(session.date);
  const dayLabel = `${DAYS_SHORT[(d.getDay() + 6) % 7]}, ${d.getDate()}/${d.getMonth() + 1}`;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all text-left group"
    >
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-xl shrink-0`}>
        {session.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-900">{session.sport}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${stCfg.cls}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>
            <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
            {stCfg.label}
          </span>
        </div>
        {!compact && (
          <div style={{ fontSize: "0.75rem" }} className="text-gray-500 mt-0.5 truncate">với {session.coach}</div>
        )}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <div className="flex items-center gap-1 text-gray-400">
            <CalendarDays className="w-3 h-3" />
            <span style={{ fontSize: "0.73rem" }}>{dayLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span style={{ fontSize: "0.73rem" }}>{session.startTime} – {session.endTime}</span>
          </div>
          <div className={`flex items-center gap-1 ${session.mode === "Online" ? "text-blue-500" : "text-emerald-500"}`}>
            {session.mode === "Online" ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            <span style={{ fontSize: "0.73rem" }}>{session.mode}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span style={{ fontWeight: 700, fontSize: "0.82rem" }} className={c.text}>{(session.price / 1000).toFixed(0)}K</span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
      </div>
    </button>
  );
}

// ─── Main TrainingSchedule ────────────────────────────────────────────────────
interface TrainingScheduleProps {
  onNavigate?: (view: string) => void;
}

export function TrainingSchedule({ onNavigate }: TrainingScheduleProps) {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [sessionModal, setSessionModal] = useState<Session | null>(null);
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "all">("all");

  const activeSessions = useMemo(() =>
    sessions.filter(s => s.status !== "cancelled"),
    [sessions]
  );

  // Stats
  const thisMonthSessions = activeSessions.filter(s => s.date.startsWith("2026-03"));
  const completedThisMonth = thisMonthSessions.filter(s => s.status === "completed");
  const upcomingCount = activeSessions.filter(s => s.status === "upcoming" || s.status === "pending").length;
  const totalSpent = completedThisMonth.reduce((acc, s) => acc + s.price, 0);

  // Selected day sessions
  const selectedDaySessions = activeSessions.filter(s => s.date === selectedDate);

  // Filtered list
  const filteredList = useMemo(() => {
    const list = filterStatus === "all" ? activeSessions : sessions.filter(s => s.status === filterStatus);
    return [...list].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [sessions, filterStatus, activeSessions]);

  // Group list by date
  const groupedList = useMemo(() => {
    const groups: Record<string, Session[]> = {};
    filteredList.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredList]);

  const handleCancel = (id: number) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "cancelled" } : s));
    setTimeout(() => setSessionModal(null), 1200);
  };

  const handleRate = (id: number, rating: number) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, rating } : s));
  };

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const dateLabel = (dateStr: string) => {
    if (dateStr === TODAY) return "Hôm nay";
    const d = parseDate(dateStr);
    const diff = Math.round((d.getTime() - parseDate(TODAY).getTime()) / 86400000);
    if (diff === 1) return "Ngày mai";
    if (diff === -1) return "Hôm qua";
    return `${DAYS_SHORT[(d.getDay() + 6) % 7]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-5 pb-8">

      {/* ── STATS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CalendarDays, label: "Buổi tháng này",   value: thisMonthSessions.length.toString(), sub: "Tháng 3/2026",          color: "text-blue-500",    bg: "bg-blue-50" },
          { icon: CheckCircle2, label: "Đã hoàn thành",    value: completedThisMonth.length.toString(), sub: "+3 so với tháng trước", color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Zap,          label: "Sắp diễn ra",      value: upcomingCount.toString(),              sub: "Buổi chờ bạn",          color: "text-orange-500",  bg: "bg-orange-50" },
          { icon: TrendingUp,   label: "Chi tiêu tháng",   value: `${(totalSpent / 1000).toFixed(0)}K`, sub: "đồng đã đầu tư",        color: "text-purple-500",  bg: "bg-purple-50" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.45rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-gray-700 mb-0.5">{label}</div>
            <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── VIEW CONTROLS + MONTH NAV ─────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
          {([["month", CalendarDays, "Tháng"], ["week", LayoutGrid, "Tuần"], ["list", List, "Danh sách"]] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${view === v ? "bg-white shadow text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
              style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Month nav (month/week views) */}
        {(view === "month" || view === "week") && (
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800 min-w-28 text-center">
              {MONTHS_VI[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status filter (list view) */}
        {view === "list" && (
          <div className="flex gap-1.5 flex-wrap">
            {([["all", "Tất cả"], ["upcoming", "Sắp tới"], ["completed", "Đã xong"], ["pending", "Chờ xác nhận"], ["cancelled", "Đã huỷ"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setFilterStatus(val)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${filterStatus === val ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Book new session */}
        <button
          onClick={() => onNavigate?.("find")}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-100"
          style={{ fontSize: "0.85rem", fontWeight: 700 }}
        >
          <Plus className="w-4 h-4" /> Đặt lịch mới
        </button>
      </div>

      {/* ── MONTH VIEW ────────────────────────────────────── */}
      {view === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <MonthCalendar
              sessions={activeSessions}
              year={currentMonth.getFullYear()}
              month={currentMonth.getMonth()}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap mt-4 pt-4 border-t border-gray-100">
              {Object.entries(SPORT_COLORS).slice(0, 5).map(([sport, c]) => (
                <div key={sport} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{sport}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">{dateLabel(selectedDate)}</div>
                <div style={{ fontSize: "0.75rem" }} className="text-gray-400">
                  {selectedDaySessions.length > 0 ? `${selectedDaySessions.length} buổi tập` : "Không có buổi tập"}
                </div>
              </div>
              {selectedDate === TODAY && (
                <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full flex items-center gap-1" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                  <Flame className="w-3 h-3" /> Hôm nay
                </span>
              )}
            </div>

            {selectedDaySessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div style={{ fontSize: "2rem" }} className="mb-2">📅</div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem" }} className="text-gray-600 mb-1">Ngày rảnh!</div>
                <p style={{ fontSize: "0.78rem" }} className="text-gray-400 mb-4">Không có buổi tập nào được đặt</p>
                <button onClick={() => onNavigate?.("find")} className="flex items-center gap-2 mx-auto px-4 py-2 bg-orange-50 text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  <Search className="w-3.5 h-3.5" /> Tìm HLV đặt lịch
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDaySessions.map(s => (
                  <SessionItem key={s.id} session={s} onClick={() => setSessionModal(s)} compact />
                ))}
              </div>
            )}

            {/* Upcoming mini preview */}
            {view === "month" && (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700 mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-orange-500" /> 3 buổi tới gần nhất
                </div>
                <div className="space-y-2">
                  {activeSessions
                    .filter(s => s.date >= TODAY && (s.status === "upcoming" || s.status === "pending"))
                    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                    .slice(0, 3)
                    .map(s => {
                      const c = sc(s.sport);
                      return (
                        <button key={s.id} onClick={() => setSessionModal(s)} className="w-full flex items-center gap-2.5 hover:bg-white rounded-xl p-2 transition-colors text-left">
                          <span className="text-base">{s.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: "0.8rem", fontWeight: 600 }} className="text-gray-800 truncate">{s.sport}</div>
                            <div style={{ fontSize: "0.68rem" }} className="text-gray-400">{dateLabel(s.date)} · {s.startTime}</div>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── WEEK VIEW ─────────────────────────────────────── */}
      {view === "week" && (
        <WeekGrid
          sessions={activeSessions}
          weekOf={parseDate(selectedDate)}
          onSelectSession={setSessionModal}
        />
      )}

      {/* ── LIST VIEW ─────────────────────────────────────── */}
      {view === "list" && (
        <div className="space-y-6">
          {groupedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div style={{ fontSize: "2.5rem" }} className="mb-3">📋</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }} className="text-gray-600 mb-1">Không có buổi tập nào</div>
              <p style={{ fontSize: "0.82rem" }} className="text-gray-400 mb-4">Thử thay đổi bộ lọc hoặc đặt lịch mới</p>
              <button onClick={() => onNavigate?.("find")} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                <Plus className="w-4 h-4" /> Đặt lịch mới
              </button>
            </div>
          ) : (
            groupedList.map(([dateStr, daySessions]) => {
              const d = parseDate(dateStr);
              const isToday = dateStr === TODAY;
              const isPast = dateStr < TODAY;
              return (
                <div key={dateStr}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isToday ? "bg-orange-500" : isPast ? "bg-gray-100" : "bg-blue-50 border border-blue-100"}`}>
                      <CalendarDays className={`w-3.5 h-3.5 ${isToday ? "text-white" : isPast ? "text-gray-400" : "text-blue-500"}`} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 700 }} className={isToday ? "text-white" : isPast ? "text-gray-500" : "text-blue-600"}>
                        {dateLabel(dateStr)}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span style={{ fontSize: "0.72rem" }} className="text-gray-400">{daySessions.length} buổi</span>
                  </div>
                  <div className="space-y-2.5">
                    {daySessions.map(s => (
                      <SessionItem key={s.id} session={s} onClick={() => setSessionModal(s)} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── SESSION MODAL ─────────────────────────────────── */}
      {sessionModal && (
        <SessionModal
          session={sessionModal}
          onClose={() => setSessionModal(null)}
          onCancel={handleCancel}
          onRate={handleRate}
        />
      )}
    </div>
  );
}
