import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareHeart,
  Search,
  Send,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMyWebsiteFeedback,
  getWebsiteFeedback,
  saveMyWebsiteFeedback,
} from "../api/feedback";
import type { FeedbackRole, WebsiteFeedback } from "../types/feedback";

type FeedbackAccent = "orange" | "blue";

interface UserWebsiteFeedbackProps {
  accent?: FeedbackAccent;
}

const roleLabel: Record<FeedbackRole, string> = {
  TRAINEES: "Học viên",
  COACHES: "Huấn luyện viên",
  ADMIN: "Quản trị viên",
};

const accentStyle: Record<
  FeedbackAccent,
  {
    button: string;
    ring: string;
    icon: string;
    soft: string;
    focus: string;
  }
> = {
  orange: {
    button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
    ring: "ring-orange-100",
    icon: "text-orange-500",
    soft: "bg-orange-50 text-orange-600 border-orange-100",
    focus: "focus:border-orange-400",
  },
  blue: {
    button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
    ring: "ring-blue-100",
    icon: "text-blue-500",
    soft: "bg-blue-50 text-blue-600 border-blue-100",
    focus: "focus:border-blue-400",
  },
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function displayName(feedback: WebsiteFeedback) {
  return feedback.fullName || feedback.username || "Người dùng";
}

export function UserWebsiteFeedback({
  accent = "orange",
}: UserWebsiteFeedbackProps) {
  const styles = accentStyle[accent];
  const [myFeedback, setMyFeedback] = useState<WebsiteFeedback | null>(null);
  const [myLoading, setMyLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [rows, setRows] = useState<WebsiteFeedback[]>([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [role, setRole] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadMine = useCallback(() => {
    setMyLoading(true);
    getMyWebsiteFeedback()
      .then((feedback) => {
        setMyFeedback(feedback);
        setRating(feedback.rating ?? 0);
        setComment(feedback.comment ?? "");
      })
      .catch(() => {
        setMyFeedback(null);
        setRating(0);
        setComment("");
      })
      .finally(() => setMyLoading(false));
  }, []);

  const loadRows = useCallback(() => {
    setLoadingRows(true);
    setLoadError("");
    getWebsiteFeedback({
      keyword: debouncedKeyword || undefined,
      rating: filterRating ? Number(filterRating) : undefined,
      role: (role || undefined) as FeedbackRole | undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      size: 10,
    })
      .then((result) => {
        setRows(result.content ?? []);
        setTotalPages(Math.max(result.totalPages ?? 1, 1));
        setTotalElements(result.totalElements ?? 0);
      })
      .catch(() => {
        setRows([]);
        setTotalPages(1);
        setTotalElements(0);
        setLoadError("Không thể tải danh sách đánh giá. Vui lòng thử lại.");
      })
      .finally(() => setLoadingRows(false));
  }, [debouncedKeyword, filterRating, from, page, role, to]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const hasSubmittedFeedback = Boolean(
    myFeedback?.rating != null || myFeedback?.updatedAt,
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (hasSubmittedFeedback) {
      toast.error("Bạn đã gửi đánh giá rồi, không thể đánh giá lần thứ hai.");
      return;
    }
    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá.");
      return;
    }

    setSaving(true);
    try {
      const saved = await saveMyWebsiteFeedback({
        rating,
        comment: comment.trim() || undefined,
      });
      setMyFeedback(saved);
      setComment(saved.comment ?? "");
      toast.success("Đã lưu đánh giá của bạn.");
      loadRows();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể lưu đánh giá. Vui lòng thử lại.",
      );
      loadMine();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.4fr]">
          <div className={`border-b border-gray-100 p-5 lg:border-b-0 lg:border-r ${styles.soft}`}>
            <div className="mb-4 flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-4 ${styles.ring}`}>
                <MessageSquareHeart className={`h-5 w-5 ${styles.icon}`} />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900">Đánh giá của tôi</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Chia sẻ trải nghiệm để CoachFinder cải thiện tốt hơn.
                </p>
              </div>
            </div>

            {myLoading ? (
              <div className="flex items-center gap-2 rounded-xl bg-white/80 p-3 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải đánh giá của bạn...
              </div>
            ) : (
              <div className="rounded-xl bg-white/80 p-3 text-sm text-gray-500">
                {myFeedback?.updatedAt ? (
                  <>Cập nhật gần nhất: {formatDateTime(myFeedback.updatedAt)}</>
                ) : (
                  <>Bạn chưa gửi đánh giá nào.</>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {hasSubmittedFeedback && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                Bạn đã gửi đánh giá. Mỗi tài khoản chỉ được đánh giá một lần.
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Mức độ hài lòng
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={hasSubmittedFeedback}
                    onClick={() => setRating(value)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                      rating >= value
                        ? "border-amber-300 bg-amber-50 text-amber-500"
                        : "border-gray-200 bg-white text-gray-300 hover:border-amber-200 hover:text-amber-400"
                    }`}
                    aria-label={`${value} sao`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        rating >= value ? "fill-amber-400" : ""
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-sm font-semibold text-gray-600">
                  {rating ? `${rating}/5 sao` : "Chọn số sao"}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-bold text-gray-800">
                  Nhận xét
                </label>
                <span className="text-xs text-gray-400">
                  {comment.length}/1000
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value.slice(0, 1000))}
                disabled={hasSubmittedFeedback}
                rows={4}
                placeholder="Viết cảm nhận của bạn về trải nghiệm sử dụng website..."
                className={`w-full resize-none rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${styles.focus}`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || hasSubmittedFeedback}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 ${styles.button}`}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Lưu đánh giá
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="mb-4">
            <h2 className="font-extrabold text-gray-900">
              Đánh giá từ người dùng
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {totalElements} đánh giá trong hệ thống
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <label className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm tên, email hoặc nội dung..."
                className={`w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none ${styles.focus}`}
              />
            </label>
            <select
              value={filterRating}
              onChange={(event) => {
                setFilterRating(event.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              <option value="">Tất cả số sao</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} sao
                </option>
              ))}
            </select>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              <option value="">Tất cả vai trò</option>
              <option value="TRAINEES">Học viên</option>
              <option value="COACHES">Huấn luyện viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(0);
                }}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-2 py-2.5 text-xs"
              />
              <input
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(0);
                }}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-2 py-2.5 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Người dùng</th>
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-5 py-3">Số sao</th>
                <th className="px-5 py-3">Nhận xét</th>
                <th className="px-5 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingRows ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Đang tải đánh giá...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    {loadError}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Không tìm thấy đánh giá phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((feedback) => (
                  <tr key={feedback.id ?? feedback.userId}>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">
                        {displayName(feedback)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {feedback.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {roleLabel[feedback.role]}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-extrabold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {feedback.rating}
                      </span>
                    </td>
                    <td className="max-w-md px-5 py-4 text-sm text-gray-600">
                      {feedback.comment || "Không có nhận xét"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">
                      {formatDateTime(feedback.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <span className="text-xs text-gray-400">
            Trang {page + 1}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPage((value) => Math.min(totalPages - 1, value + 1))
              }
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
