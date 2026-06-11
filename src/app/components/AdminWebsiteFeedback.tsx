import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Star,
} from "lucide-react";
import { getAdminWebsiteFeedback } from "../api/feedback";
import type {
  FeedbackRole,
  WebsiteFeedback,
} from "../types/feedback";

const roleLabel: Record<FeedbackRole, string> = {
  TRAINEES: "Học viên",
  COACHES: "Huấn luyện viên",
  ADMIN: "Quản trị viên",
};

export function AdminWebsiteFeedback() {
  const [rows, setRows] = useState<WebsiteFeedback[]>([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [rating, setRating] = useState("");
  const [role, setRole] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    getAdminWebsiteFeedback({
      keyword: debouncedKeyword || undefined,
      rating: rating ? Number(rating) : undefined,
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
      })
      .finally(() => setLoading(false));
  }, [debouncedKeyword, rating, role, from, to, page]);

  return (
    <div className="space-y-5">
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
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-rose-400"
              />
            </label>
            <select
              value={rating}
              onChange={(event) => {
                setRating(event.target.value);
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Đang tải đánh giá...
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
                        {feedback.fullName || feedback.username}
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
                      {feedback.updatedAt
                        ? new Date(feedback.updatedAt).toLocaleString("vi-VN")
                        : "-"}
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
