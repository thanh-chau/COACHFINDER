import { useEffect, useState } from "react";
import {
  AlertCircle, ArrowLeft, Calendar, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, LayoutGrid, List, LoaderCircle, MapPin, MessageCircle,
  Search, SlidersHorizontal, Star, Users, X
} from "lucide-react";
import { createBooking, getMyBookings } from "../api/bookings";
import { getCategories, getCoachDetail, getCoachSchedule, getCoachScheduleWithAvailability, searchCoaches } from "../api/coaches";
import type { BookingDay, BookingListItem, BookingResponse, BookingType, CreateBookingRequest } from "../types/booking";
import type { Category, Coach, CoachDetail, CoachSchedule, CoachSearchSort, TeachingType } from "../types/coach";

const PAGE_SIZE = 9;

interface PriceOption {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_OPTIONS: PriceOption[] = [
  { label: "Tất cả mức giá" },
  { label: "Dưới 200K", maxPrice: 199999 },
  { label: "200K - 350K", minPrice: 200000, maxPrice: 350000 },
  { label: "Trên 350K", minPrice: 350001 },
];

const SORT_OPTIONS: Array<{ value: CoachSearchSort; label: string }> = [
  { value: "MOST_RELEVANT", label: "Phù hợp nhất" },
  { value: "RATING_HIGHEST", label: "Đánh giá cao nhất" },
  { value: "PRICE_LOWEST", label: "Giá thấp nhất" },
  { value: "PRICE_HIGHEST", label: "Giá cao nhất" },
  { value: "MOST_REVIEWS", label: "Nhiều đánh giá nhất" },
];

const TEACHING_TYPE_LABEL: Record<TeachingType, string> = {
  ONLINE: "Online",
  OFFLINE: "Trực tiếp",
  BOTH: "Online & trực tiếp",
};

function formatPrice(price?: number) {
  if (price === undefined || price === null) return "Liên hệ";
  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

function formatTeachingType(type?: TeachingType) {
  return type ? TEACHING_TYPE_LABEL[type] : null;
}

function displayError(error: unknown) {
  return error instanceof Error ? error.message : "Không thể tải dữ liệu. Vui lòng thử lại.";
}

const BOOKING_DAYS: BookingDay[] = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
];

const DAY_LABELS: Record<BookingDay, string> = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật",
};

function getBookingDay(date: string): BookingDay {
  return BOOKING_DAYS[new Date(`${date}T00:00:00`).getDay()];
}

function todayInputValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date?: string) {
  return date ? new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN") : "";
}

function nextDateForDay(day: BookingDay) {
  const today = new Date(`${todayInputValue()}T00:00:00`);
  const targetDay = BOOKING_DAYS.indexOf(day);
  const offset = (targetDay - today.getDay() + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  return formatLocalDate(date);
}

function scheduleDayLabel(day?: string) {
  return DAY_LABELS[day as BookingDay] || day || "Lịch tập";
}

function toLocalTimePayload(value?: string) {
  if (!value) return value;
  return value.length === 5 ? `${value}:00` : value;
}

function comparableTime(value?: string) {
  return value?.slice(0, 5) || "";
}

function normalizeName(name?: string) {
  return name?.trim().toLocaleLowerCase() || "";
}

function scheduleDate(schedule?: CoachSchedule) {
  return schedule?.startDate || schedule?.endDate;
}

function scheduleLabel(schedule: CoachSchedule) {
  const day = scheduleDayLabel(schedule.dayOfWeek);
  const date = scheduleDate(schedule);
  return date ? `${day}, ${formatDate(date)}` : day;
}

function scheduleMatchesBooking(schedule: CoachSchedule, booking: BookingListItem, coachName?: string) {
  if (booking.status === "CANCELLED") return false;
  if (coachName) {
    if (!booking.coachName) return false;
    if (normalizeName(booking.coachName) !== normalizeName(coachName)) return false;
  }
  if (schedule.startTime && booking.startTime && comparableTime(schedule.startTime) !== comparableTime(booking.startTime)) return false;
  if (schedule.endTime && booking.endTime && comparableTime(schedule.endTime) !== comparableTime(booking.endTime)) return false;

  const date = scheduleDate(schedule);
  if (date) return booking.date === date;
  if (schedule.dayOfWeek && DAY_LABELS[schedule.dayOfWeek as BookingDay]) {
    return booking.date === nextDateForDay(schedule.dayOfWeek as BookingDay);
  }
  return false;
}

function blockedScheduleIndexes(schedules?: CoachSchedule[]) {
  return new Set((schedules || []).flatMap((schedule, index) => (
    schedule.available === false || schedule.bookingStatus === "PENDING" || schedule.bookingStatus === "CONFIRMED"
      ? [index]
      : []
  )));
}

function CoachAvatar({ coach, className }: { coach: Pick<Coach, "avatar" | "fullName">; className: string }) {
  if (coach.avatar) {
    return <img src={coach.avatar} alt={coach.fullName} className={`${className} object-cover`} />;
  }

  return (
    <div className={`${className} bg-orange-100 text-orange-600 flex items-center justify-center font-bold`}>
      {coach.fullName?.trim().charAt(0).toUpperCase() || "H"}
    </div>
  );
}

function CoachCard({
  coach,
  onSelect,
  view,
}: {
  coach: Coach;
  onSelect: () => void;
  view: "grid" | "list";
}) {
  const teachingType = formatTeachingType(coach.teachingType);

  if (view === "list") {
    return (
      <article className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 transition-all flex flex-col sm:flex-row gap-4">
        <CoachAvatar coach={coach} className="w-full sm:w-24 h-40 sm:h-24 rounded-2xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="text-gray-900" style={{ fontWeight: 800, fontSize: "1rem" }}>{coach.fullName}</h3>
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                {coach.category && <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.73rem", fontWeight: 600 }}>{coach.category}</span>}
                {teachingType && <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.73rem", fontWeight: 600 }}>{teachingType}</span>}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-orange-500" style={{ fontWeight: 800 }}>{formatPrice(coach.price)}</div>
              <span className="text-gray-400" style={{ fontSize: "0.7rem" }}>/ buổi</span>
            </div>
          </div>
          <p className="text-gray-500 line-clamp-2 mt-2" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
            {coach.bio || "Huấn luyện viên chưa cập nhật giới thiệu."}
          </p>
          <div className="flex items-center flex-wrap gap-4 mt-3 text-gray-500" style={{ fontSize: "0.76rem" }}>
            <Rating rating={coach.rating} reviews={coach.reviewCount} />
            {coach.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{coach.location}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="self-center px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shrink-0"
          style={{ fontSize: "0.82rem", fontWeight: 700 }}
        >
          Xem hồ sơ
        </button>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all flex flex-col">
      <CoachAvatar coach={coach} className="w-full h-44" />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-gray-900 truncate" style={{ fontWeight: 800, fontSize: "0.98rem" }}>{coach.fullName}</h3>
            <p className="text-orange-600 mt-0.5" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{coach.category || "Huấn luyện viên"}</p>
          </div>
          <Rating rating={coach.rating} reviews={coach.reviewCount} compact />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {teachingType && <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.7rem", fontWeight: 600 }}>{teachingType}</span>}
          {coach.location && <span className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full flex items-center gap-1" style={{ fontSize: "0.7rem" }}><MapPin className="w-3 h-3" />{coach.location}</span>}
        </div>
        <p className="text-gray-500 line-clamp-2 mt-3 flex-1" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>
          {coach.bio || "Huấn luyện viên chưa cập nhật giới thiệu."}
        </p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
          <div>
            <div className="text-orange-500" style={{ fontWeight: 800, fontSize: "0.98rem" }}>{formatPrice(coach.price)}</div>
            <span className="text-gray-400" style={{ fontSize: "0.68rem" }}>mỗi buổi tập</span>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className="px-3.5 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            style={{ fontSize: "0.78rem", fontWeight: 700 }}
          >
            Xem hồ sơ
          </button>
        </div>
      </div>
    </article>
  );
}

function Rating({ rating, reviews, compact = false }: { rating?: number; reviews?: number; compact?: boolean }) {
  if (rating === undefined || rating === null) return <span className="text-gray-400" style={{ fontSize: "0.74rem" }}>Chưa có đánh giá</span>;

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-gray-800" style={{ fontSize: compact ? "0.78rem" : "0.82rem", fontWeight: 700 }}>{rating.toFixed(1)}</span>
      {!compact && reviews !== undefined && <span className="text-gray-400">({reviews})</span>}
    </div>
  );
}

function CoachDetailModal({ coachId, onClose }: { coachId: number; onClose: () => void }) {
  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setBookingOpen(false);

    Promise.all([
      getCoachDetail(coachId),
      getCoachScheduleWithAvailability(coachId).catch(() => getCoachSchedule(coachId).catch(() => [])),
    ])
      .then(([result, schedules]) => {
        if (active) setCoach({ ...result, schedules: schedules.length ? schedules : result.schedules });
      })
      .catch(reason => {
        if (active) setError(displayError(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [coachId]);

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <section
        className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col"
        onClick={event => event.stopPropagation()}
        aria-label="Chi tiết huấn luyện viên"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontSize: "1rem", fontWeight: 700 }}>Hồ sơ huấn luyện viên</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 gap-2">
            <LoaderCircle className="w-5 h-5 animate-spin text-orange-500" /> Đang tải hồ sơ...
          </div>
        ) : error ? (
          <div className="m-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span style={{ fontSize: "0.85rem" }}>{error}</span>
          </div>
        ) : coach && bookingOpen ? (
          <BookingPanel coach={coach} onBack={() => setBookingOpen(false)} onClose={onClose} />
        ) : coach && (
          <>
            <div className="overflow-y-auto flex-1">
              <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
                <CoachAvatar coach={coach} className="w-20 h-20 rounded-2xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900" style={{ fontSize: "1.25rem", fontWeight: 800 }}>{coach.fullName}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coach.category && <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.76rem", fontWeight: 600 }}>{coach.category}</span>}
                    {formatTeachingType(coach.teachingType) && <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full" style={{ fontSize: "0.76rem", fontWeight: 600 }}>{formatTeachingType(coach.teachingType)}</span>}
                  </div>
                  {coach.location && <p className="mt-2 text-gray-500 flex items-center gap-1" style={{ fontSize: "0.8rem" }}><MapPin className="w-3.5 h-3.5" />{coach.location}</p>}
                </div>
                <div className="text-right">
                  <div className="text-orange-500" style={{ fontSize: "1.1rem", fontWeight: 800 }}>{formatPrice(coach.price)}</div>
                  <span className="text-gray-400" style={{ fontSize: "0.72rem" }}>mỗi buổi</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 px-6 py-5">
                <ProfileStat icon={Star} label="Đánh giá" value={coach.rating?.toFixed(1) || "-"} />
                <ProfileStat icon={Users} label="Học viên" value={coach.students?.toString() || "-"} />
                <ProfileStat icon={Calendar} label="Buổi dạy" value={coach.totalSessions?.toString() || "-"} />
              </div>

              <div className="px-6 pb-6 space-y-5">
                {coach.bio && <DetailSection title="Giới thiệu"><p className="text-gray-600" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>{coach.bio}</p></DetailSection>}
                {!!coach.specializations?.length && (
                  <DetailSection title="Chuyên môn">
                    <div className="flex flex-wrap gap-2">
                      {coach.specializations.map(item => <span key={item} className="bg-orange-50 text-orange-600 border border-orange-100 rounded-xl px-3 py-1.5" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{item}</span>)}
                    </div>
                  </DetailSection>
                )}
                {!!coach.certificates?.length && (
                  <DetailSection title="Chứng chỉ">
                    <ul className="space-y-2">
                      {coach.certificates.map(item => <li key={item} className="text-gray-600 bg-gray-50 rounded-xl p-3" style={{ fontSize: "0.82rem" }}>{item}</li>)}
                    </ul>
                  </DetailSection>
                )}
                {!!coach.schedules?.length && (
                  <DetailSection title="Lịch làm việc">
                    <div className="space-y-2">
                      {coach.schedules.map((schedule, index) => (
                        <div key={`${schedule.dayOfWeek}-${index}`} className="flex justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-gray-600" style={{ fontSize: "0.82rem" }}>
                          <span>{scheduleDayLabel(schedule.dayOfWeek)}</span>
                          <span>{schedule.startTime || "--"} - {schedule.endTime || "--"}</span>
                        </div>
                      ))}
                    </div>
                  </DetailSection>
                )}
                {!!coach.reviews?.length && (
                  <DetailSection title={`Đánh giá (${coach.reviews.length})`}>
                    <div className="space-y-3">
                      {coach.reviews.map((review, index) => (
                        <div key={`${review.userName}-${index}`} className="rounded-2xl bg-gray-50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-800" style={{ fontSize: "0.83rem", fontWeight: 700 }}>{review.userName || "Học viên"}</span>
                            <Rating rating={review.rating} compact />
                          </div>
                          {review.comment && <p className="text-gray-600" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>{review.comment}</p>}
                          {review.createdAt && <p className="text-gray-400 mt-2" style={{ fontSize: "0.7rem" }}>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>}
                        </div>
                      ))}
                    </div>
                  </DetailSection>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button type="button" className="flex-1 rounded-xl border border-gray-200 py-3 text-gray-700 flex items-center justify-center gap-2" style={{ fontWeight: 600, fontSize: "0.86rem" }}>
                <MessageCircle className="w-4 h-4" /> Nhắn tin
              </button>
              <button type="button" onClick={() => setBookingOpen(true)} className="flex-1 rounded-xl bg-orange-500 py-3 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 700, fontSize: "0.86rem" }}>
                <Calendar className="w-4 h-4" /> Đặt lịch tập ngay
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

interface BookingFormState {
  date: string;
  type: BookingType;
  note: string;
}

function BookingPanel({
  coach,
  onBack,
  onClose,
}: {
  coach: CoachDetail;
  onBack: () => void;
  onClose: () => void;
}) {
  const availableTypes: BookingType[] = coach.teachingType === "ONLINE"
    ? ["ONLINE"]
    : coach.teachingType === "OFFLINE"
      ? ["OFFLINE"]
      : ["ONLINE", "OFFLINE"];
  const [form, setForm] = useState<BookingFormState>({
    date: "",
    type: availableTypes[0],
    note: "",
  });
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [unavailableSlots, setUnavailableSlots] = useState<Set<number>>(new Set());
  const [rejectedSlots, setRejectedSlots] = useState<Set<number>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const minimumDate = todayInputValue();

  useEffect(() => {
    setSelectedSlot(null);
    setUnavailableSlots(new Set());
    setRejectedSlots(blockedScheduleIndexes(coach.schedules));
    setCheckingAvailability(true);
    setForm({
      date: "",
      type: availableTypes[0],
      note: "",
    });
  }, [coach.id, coach.teachingType]);

  useEffect(() => {
    let active = true;

    setCheckingAvailability(true);
    getMyBookings()
      .then(items => {
        if (!active || !coach.schedules?.length) return;
        const next = new Set<number>();

        coach.schedules.forEach((schedule, index) => {
          if (items.some(item => scheduleMatchesBooking(schedule, item, coach.fullName))) {
            next.add(index);
          }
        });

        setRejectedSlots(blockedScheduleIndexes(coach.schedules));
        setUnavailableSlots(next);
      })
      .catch(() => {
        if (active) setUnavailableSlots(new Set());
      })
      .finally(() => {
        if (active) setCheckingAvailability(false);
      });

    return () => {
      active = false;
    };
  }, [coach.fullName, coach.schedules]);

  const selectSchedule = (index: number) => {
    const slot = coach.schedules?.[index];
    if (!slot || checkingAvailability || unavailableSlots.has(index) || rejectedSlots.has(index)) return;
    const day = slot.dayOfWeek as BookingDay;
    const fixedDate = scheduleDate(slot);
    setSelectedSlot(index);
    setSubmitError("");
    setForm(current => ({
      ...current,
      date: fixedDate || (DAY_LABELS[day] ? nextDateForDay(day) : current.date),
    }));
  };

  const submitBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    const slot = selectedSlot === null ? undefined : coach.schedules?.[selectedSlot];

    if (!slot || selectedSlot === null) {
      setSubmitError("Vui lòng chọn một lịch tập do huấn luyện viên công bố.");
      return;
    }
    const fixedDate = scheduleDate(slot);
    const selectedDate = fixedDate || form.date;

    if (!selectedDate || !slot.startTime || !slot.endTime) {
      setSubmitError("Vui lòng chọn ngày tập hợp lệ.");
      return;
    }
    if (fixedDate && selectedDate !== fixedDate) {
      setSubmitError(`Lịch này chỉ áp dụng cho ngày ${formatDate(fixedDate)}.`);
      return;
    }
    if (slot.dayOfWeek && getBookingDay(selectedDate) !== slot.dayOfWeek) {
      setSubmitError(`Ngày bạn chọn phải là ${scheduleDayLabel(slot.dayOfWeek)} theo lịch của huấn luyện viên.`);
      return;
    }

    const request: CreateBookingRequest = {
      coachId: coach.id,
      startDate: selectedDate,
      endDate: selectedDate,
      dayOfWeek: (slot.dayOfWeek as BookingDay) || getBookingDay(selectedDate),
      startTime: toLocalTimePayload(slot.startTime) || slot.startTime,
      endTime: toLocalTimePayload(slot.endTime) || slot.endTime,
      type: form.type,
      note: form.note.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const result = await createBooking(request);
      setUnavailableSlots(current => new Set(current).add(selectedSlot));
      setBooking(result);
    } catch (reason) {
      const message = displayError(reason);
      const networkFailure = /không thể kết nối|network|failed to fetch/i.test(message);
      if (!networkFailure) {
        setRejectedSlots(current => new Set(current).add(selectedSlot));
        setSelectedSlot(null);
        setForm(current => ({ ...current, date: "" }));
      }
      if (/trùng|đã.*đặt|đăng ký|book|open|available|exist|reserved|occupied|slot|schedule|không.*trống|không.*khả dụng/i.test(message)) {
        setSubmitError("Lịch tập này không còn khả dụng. Học viên khác có thể đã đăng ký trước bạn.");
      } else {
        setSubmitError(`Không thể đặt lịch này lúc này. ${message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-gray-900" style={{ fontSize: "1.15rem", fontWeight: 800 }}>Đặt lịch thành công</h3>
            <p className="text-gray-500 mt-2 mb-5" style={{ fontSize: "0.84rem" }}>
              Lịch tập với {booking.coachName || coach.fullName} đã được gửi đến hệ thống.
            </p>
            <div className="rounded-2xl bg-white border border-emerald-100 p-4 text-left space-y-2 mb-5">
              <p className="text-gray-700" style={{ fontSize: "0.82rem" }}><strong>Mã lịch:</strong> #{booking.id}</p>
              <p className="text-gray-700" style={{ fontSize: "0.82rem" }}><strong>Ngày:</strong> {formatDate(booking.startDate)}</p>
              <p className="text-gray-700" style={{ fontSize: "0.82rem" }}><strong>Thời gian:</strong> {booking.startTime} - {booking.endTime}</p>
              <p className="text-gray-700" style={{ fontSize: "0.82rem" }}><strong>Trạng thái:</strong> {booking.status || "Đang xử lý"}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onBack} className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-gray-700" style={{ fontSize: "0.84rem", fontWeight: 700 }}>
                Về hồ sơ
              </button>
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-orange-500 py-3 text-white hover:bg-orange-600" style={{ fontSize: "0.84rem", fontWeight: 700 }}>
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitBooking} className="flex-1 flex flex-col min-h-0">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          <ArrowLeft className="w-4 h-4" /> Quay lại hồ sơ
        </button>
        <div className="flex items-center gap-3">
          <CoachAvatar coach={coach} className="w-12 h-12 rounded-xl shrink-0" />
          <div>
            <h3 className="text-gray-900" style={{ fontSize: "1.05rem", fontWeight: 800 }}>Đặt lịch với {coach.fullName}</h3>
            <p className="text-orange-500" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{formatPrice(coach.price)} / buổi</p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {!!coach.schedules?.length ? (
          <div>
            <p className="text-gray-700 mb-2" style={{ fontSize: "0.83rem", fontWeight: 700 }}>Chọn lịch tập đang mở *</p>
            <div className="space-y-2">
              {coach.schedules.map((schedule, index) => (
                <button
                  type="button"
                  key={`${schedule.dayOfWeek}-${index}`}
                  disabled={checkingAvailability || unavailableSlots.has(index) || rejectedSlots.has(index)}
                  onClick={() => selectSchedule(index)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-3 transition-colors ${
                    checkingAvailability || unavailableSlots.has(index) || rejectedSlots.has(index)
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : selectedSlot === index
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                  }`}
                  style={{ fontSize: "0.76rem", fontWeight: 600 }}
                >
                  <span>{scheduleLabel(schedule)}: {schedule.startTime || "--"} - {schedule.endTime || "--"}</span>
                  <span className={`rounded-full px-2 py-1 ${
                    unavailableSlots.has(index) || rejectedSlots.has(index)
                      ? "bg-gray-200 text-gray-500"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {checkingAvailability ? "Đang tải" : unavailableSlots.has(index) ? "Bạn đã đăng ký" : rejectedSlots.has(index) ? "Đã có người đăng ký" : "Chọn lịch"}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-gray-400 mt-2" style={{ fontSize: "0.73rem" }}>Lịch của học viên khác không được hiển thị trước. Tình trạng chỗ sẽ được hệ thống xác nhận khi bạn gửi yêu cầu đặt lịch.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-500" style={{ fontSize: "0.82rem" }}>
            Huấn luyện viên chưa mở lịch tập nào để đăng ký.
          </div>
        )}

        {selectedSlot !== null && (
          <div>
            <label className="block text-gray-700 mb-2" style={{ fontSize: "0.83rem", fontWeight: 700 }}>Ngày tập *</label>
            <input
              type="date"
              min={minimumDate}
              max={scheduleDate(coach.schedules?.[selectedSlot]) || undefined}
              value={form.date}
              onChange={event => setForm(current => ({ ...current, date: event.target.value }))}
              disabled={!!scheduleDate(coach.schedules?.[selectedSlot])}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-3 outline-none focus:border-orange-400 text-gray-700"
            />
          </div>
        )}

        {form.date && (
          <p className="rounded-xl bg-blue-50 px-3 py-2.5 text-blue-600" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
            Ngày tập: {DAY_LABELS[getBookingDay(form.date)]}, {formatDate(form.date)}
          </p>
        )}

        <div>
          <p className="text-gray-700 mb-2" style={{ fontSize: "0.83rem", fontWeight: 700 }}>Hình thức tập *</p>
          <div className="flex gap-2">
            {availableTypes.map(type => (
              <label key={type} className={`flex-1 rounded-xl border px-4 py-3 cursor-pointer ${form.type === type ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600"}`}>
                <input
                  type="radio"
                  name="booking-type"
                  value={type}
                  checked={form.type === type}
                  onChange={() => setForm(current => ({ ...current, type }))}
                  className="mr-2 accent-orange-500"
                />
                <span style={{ fontSize: "0.83rem", fontWeight: 600 }}>{type === "ONLINE" ? "Online" : "Trực tiếp"}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="booking-note" className="block text-gray-700 mb-2" style={{ fontSize: "0.83rem", fontWeight: 700 }}>Ghi chú</label>
          <textarea
            id="booking-note"
            rows={3}
            value={form.note}
            onChange={event => setForm(current => ({ ...current, note: event.target.value }))}
            placeholder="Mục tiêu buổi tập hoặc lưu ý cho HLV..."
            className="w-full rounded-xl border border-gray-200 px-3.5 py-3 outline-none focus:border-orange-400 resize-none text-gray-700"
            style={{ fontSize: "0.82rem" }}
          />
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span style={{ fontSize: "0.82rem" }}>{submitError}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <button type="submit" disabled={submitting || checkingAvailability || !coach.schedules?.length} className="w-full rounded-xl bg-orange-500 py-3.5 text-white hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 700, fontSize: "0.88rem" }}>
          {submitting ? <><LoaderCircle className="w-4 h-4 animate-spin" /> Đang đặt lịch...</> : <><Calendar className="w-4 h-4" /> Xác nhận đặt lịch</>}
        </button>
      </div>
    </form>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-gray-900 mb-2" style={{ fontSize: "0.9rem", fontWeight: 700 }}>{title}</h4>
      {children}
    </section>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 text-center">
      <Icon className="w-4 h-4 text-orange-500 mx-auto mb-1" />
      <div className="text-gray-900" style={{ fontWeight: 800 }}>{value}</div>
      <div className="text-gray-400" style={{ fontSize: "0.68rem" }}>{label}</div>
    </div>
  );
}

export function FindCoach() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [priceIndex, setPriceIndex] = useState(0);
  const [sort, setSort] = useState<CoachSearchSort>("MOST_RELEVANT");
  const [pageNumber, setPageNumber] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then(data => {
        if (active) setCategories(data);
      })
      .catch(reason => {
        if (active) setCategoryError(displayError(reason));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const price = PRICE_OPTIONS[priceIndex];
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError("");
      searchCoaches({
        keyword: query.trim() || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        location: location.trim() || undefined,
        minPrice: price.minPrice,
        maxPrice: price.maxPrice,
        sort,
        page: pageNumber,
        size: PAGE_SIZE,
      })
        .then(result => {
          if (!active) return;
          setCoaches(result.content || []);
          setTotalElements(result.totalElements || 0);
          setTotalPages(result.totalPages || 0);
        })
        .catch(reason => {
          if (!active) return;
          setCoaches([]);
          setTotalElements(0);
          setTotalPages(0);
          setError(displayError(reason));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [categoryId, location, pageNumber, priceIndex, query, sort]);

  const hasFilters = !!categoryId || !!location.trim() || priceIndex !== 0;

  const resetFilters = () => {
    setQuery("");
    setCategoryId("");
    setLocation("");
    setPriceIndex(0);
    setSort("MOST_RELEVANT");
    setPageNumber(0);
  };

  const selectFilter = (update: () => void) => {
    update();
    setPageNumber(0);
  };

  return (
    <div className="space-y-5 pb-8">
      <header className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
        <h2 className="text-white mb-1" style={{ fontWeight: 800, fontSize: "1.15rem" }}>Tìm huấn luyện viên</h2>
        <p className="text-gray-400 mb-4" style={{ fontSize: "0.82rem" }}>
          Dữ liệu huấn luyện viên được cập nhật từ CoachFinder.
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={event => selectFilter(() => setQuery(event.target.value))}
            type="search"
            placeholder="Tìm theo tên hoặc chuyên môn..."
            className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-400 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-400 transition-colors"
            style={{ fontSize: "0.9rem" }}
          />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => selectFilter(() => setCategoryId(""))}
          className={`shrink-0 px-4 py-2 rounded-xl border ${!categoryId ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}
          style={{ fontSize: "0.82rem", fontWeight: 600 }}
        >
          Tất cả
        </button>
        {categories.map(category => (
          <button
            type="button"
            key={category.id}
            onClick={() => selectFilter(() => setCategoryId(String(category.id)))}
            className={`shrink-0 px-4 py-2 rounded-xl border ${categoryId === String(category.id) ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}
            style={{ fontSize: "0.82rem", fontWeight: 600 }}
          >
            {category.name}
          </button>
        ))}
      </div>
      {categoryError && <p className="text-red-500" style={{ fontSize: "0.78rem" }}>{categoryError}</p>}

      <div className="flex items-center flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setFilterOpen(current => !current)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${filterOpen || hasFilters ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-gray-200 text-gray-600"}`}
          style={{ fontSize: "0.85rem", fontWeight: 600 }}
        >
          <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
        </button>

        <div className="relative">
          <select
            value={sort}
            onChange={event => selectFilter(() => setSort(event.target.value as CoachSearchSort))}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 outline-none focus:border-orange-400 text-gray-700"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <p className="text-gray-500 ml-auto" style={{ fontSize: "0.82rem" }}>
          <span className="text-gray-800" style={{ fontWeight: 700 }}>{totalElements}</span> HLV được tìm thấy
        </p>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button type="button" onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button type="button" onClick={() => setView("list")} className={`p-2 rounded-lg ${view === "list" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {filterOpen && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Bộ lọc nâng cao</h3>
            {hasFilters && <button type="button" onClick={resetFilters} className="text-orange-500 flex items-center gap-1" style={{ fontSize: "0.8rem", fontWeight: 600 }}><X className="w-3.5 h-3.5" /> Xóa bộ lọc</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="coach-location" className="block text-gray-600 mb-2" style={{ fontWeight: 600, fontSize: "0.82rem" }}>Khu vực</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="coach-location"
                  value={location}
                  onChange={event => selectFilter(() => setLocation(event.target.value))}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 outline-none focus:border-orange-400"
                  style={{ fontSize: "0.84rem" }}
                />
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2" style={{ fontWeight: 600, fontSize: "0.82rem" }}>Mức giá / buổi</p>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_OPTIONS.map((option, index) => (
                  <label key={option.label} className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${priceIndex === index ? "border-orange-300 bg-orange-50 text-orange-600" : "border-gray-100 text-gray-600"}`}>
                    <input type="radio" name="price" checked={priceIndex === index} onChange={() => selectFilter(() => setPriceIndex(index))} className="accent-orange-500" />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500 gap-2">
          <LoaderCircle className="w-6 h-6 animate-spin text-orange-500" /> Đang tải danh sách huấn luyện viên...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p style={{ fontSize: "0.86rem", fontWeight: 600 }}>Không thể tải danh sách huấn luyện viên</p>
            <p className="mt-1" style={{ fontSize: "0.8rem" }}>{error}</p>
          </div>
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <Search className="w-11 h-11 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700" style={{ fontWeight: 600 }}>Không tìm thấy huấn luyện viên phù hợp</p>
          <button type="button" onClick={resetFilters} className="mt-4 px-4 py-2.5 rounded-xl bg-orange-500 text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Xóa bộ lọc</button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {coaches.map(coach => <CoachCard key={coach.id} coach={coach} view="grid" onSelect={() => setSelectedCoachId(coach.id)} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {coaches.map(coach => <CoachCard key={coach.id} coach={coach} view="list" onSelect={() => setSelectedCoachId(coach.id)} />)}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button type="button" disabled={pageNumber === 0} onClick={() => setPageNumber(page => page - 1)} className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-gray-600" style={{ fontSize: "0.83rem", fontWeight: 600 }}>Trang {pageNumber + 1} / {totalPages}</span>
          <button type="button" disabled={pageNumber + 1 >= totalPages} onClick={() => setPageNumber(page => page + 1)} className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {selectedCoachId !== null && <CoachDetailModal coachId={selectedCoachId} onClose={() => setSelectedCoachId(null)} />}
    </div>
  );
}
