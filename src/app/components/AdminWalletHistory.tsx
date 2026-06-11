import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  RefreshCcw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  AdminWalletHistoryItem,
  AdminWalletWithdrawRequest,
  approveAdminWalletWithdrawRequest,
  fetchAdminWalletTransactions,
  fetchAdminWalletWithdrawRequests,
  rejectAdminWalletWithdrawRequest,
} from "../api/admin";

const PAGE_SIZE = 12;

const formatMoney = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const typeLabel: Record<string, string> = {
  TOP_UP: "Nạp tiền",
  WITHDRAWAL: "Rút tiền",
};

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
  REJECTED: "Từ chối",
  COMPLETED: "Thành công",
};

function statusClass(status?: string | null) {
  switch (status) {
    case "SUCCESS":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "PROCESSING":
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "REJECTED":
    case "FAILED":
      return "bg-red-50 text-red-700 border-red-100";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 px-3 py-2">
      <span className="text-gray-500" style={{ fontSize: "0.76rem" }}>{label}</span>
      <span className="text-right font-semibold text-gray-800 break-all" style={{ fontSize: "0.8rem" }}>
        {value ?? "-"}
      </span>
    </div>
  );
}

export function AdminWalletHistory() {
  const [tab, setTab] = useState<"history" | "pending">("history");
  const [items, setItems] = useState<AdminWalletHistoryItem[]>([]);
  const [pending, setPending] = useState<AdminWalletWithdrawRequest[]>([]);
  const [selected, setSelected] = useState<AdminWalletHistoryItem | AdminWalletWithdrawRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [role, setRole] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminWalletTransactions({
        keyword: debouncedKeyword,
        role,
        type,
        status,
        from,
        to,
        page,
        size: PAGE_SIZE,
      });
      setItems(result.content || []);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được lịch sử nạp/rút.");
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
    setPendingLoading(true);
    setError("");
    try {
      const result = await fetchAdminWalletWithdrawRequests("PROCESSING");
      setPending(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được yêu cầu rút tiền.");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [debouncedKeyword, role, type, status, from, to, page]);

  useEffect(() => {
    void loadPending();
  }, []);

  const pendingTotal = useMemo(
    () => pending.reduce((sum, item) => sum + (item.amount || 0), 0),
    [pending],
  );

  const reviewWithdraw = async (transactionId: number, action: "approve" | "reject") => {
    const note = window.prompt(action === "approve" ? "Ghi chú phê duyệt (tùy chọn)" : "Lý do từ chối");
    if (action === "reject" && !note?.trim()) return;
    setActionId(transactionId);
    setError("");
    try {
      if (action === "approve") {
        await approveAdminWalletWithdrawRequest(transactionId, note?.trim() || undefined);
      } else {
        await rejectAdminWalletWithdrawRequest(transactionId, note.trim());
      }
      await Promise.all([loadPending(), loadHistory()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật yêu cầu rút tiền.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <WalletCards className="w-5 h-5" />
          </div>
          <div className="font-extrabold text-gray-900" style={{ fontSize: "1.15rem" }}>{items.length}</div>
          <div className="text-gray-500" style={{ fontSize: "0.78rem" }}>Dòng lịch sử đang hiển thị</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="font-extrabold text-gray-900" style={{ fontSize: "1.15rem" }}>{pending.length}</div>
          <div className="text-gray-500" style={{ fontSize: "0.78rem" }}>Yêu cầu rút đang chờ duyệt</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div className="font-extrabold text-gray-900" style={{ fontSize: "1.15rem" }}>{formatMoney(pendingTotal)}</div>
          <div className="text-gray-500" style={{ fontSize: "0.78rem" }}>Tổng tiền rút chờ duyệt</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setTab("history")}
              className={`px-4 py-2 rounded-lg transition-colors ${tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              style={{ fontSize: "0.82rem", fontWeight: 800 }}
            >
              Lịch sử
            </button>
            <button
              onClick={() => setTab("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${tab === "pending" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              style={{ fontSize: "0.82rem", fontWeight: 800 }}
            >
              Chờ duyệt
            </button>
          </div>
          <button
            onClick={() => tab === "history" ? void loadHistory() : void loadPending()}
            className="lg:ml-auto inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50"
            style={{ fontSize: "0.78rem", fontWeight: 700 }}
          >
            <RefreshCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        {tab === "history" ? (
          <>
            <div className="p-5 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              <div className="relative xl:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm tên, email, mã giao dịch..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-gray-700 outline-none focus:border-blue-300 focus:bg-white"
                  style={{ fontSize: "0.82rem" }}
                />
              </div>
              <select value={role} onChange={(event) => { setRole(event.target.value); setPage(0); }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 outline-none" style={{ fontSize: "0.82rem" }}>
                <option value="all">Tất cả vai trò</option>
                <option value="TRAINEES">Học viên</option>
                <option value="COACHES">HLV</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 outline-none" style={{ fontSize: "0.82rem" }}>
                <option value="all">Nạp & rút</option>
                <option value="TOP_UP">Nạp tiền</option>
                <option value="WITHDRAWAL">Rút tiền</option>
              </select>
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 outline-none" style={{ fontSize: "0.82rem" }}>
                <option value="all">Tất cả trạng thái</option>
                {["PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED", "EXPIRED", "REJECTED"].map(item => (
                  <option key={item} value={item}>{statusLabel[item]}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(0); }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 outline-none" style={{ fontSize: "0.8rem" }} />
                <input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(0); }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 outline-none" style={{ fontSize: "0.8rem" }} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Mã", "User", "Loại", "Số tiền", "Trạng thái", "Thời gian", "Chi tiết"].map((header) => (
                      <th key={header} className="px-5 py-3 text-left whitespace-nowrap text-gray-500" style={{ fontSize: "0.73rem", fontWeight: 800 }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Đang tải lịch sử...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Chưa có giao dịch nạp/rút phù hợp</td></tr>
                  ) : items.map((item) => (
                    <tr key={`${item.source}-${item.id}`} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4 font-mono text-gray-500">{item.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{item.ownerName || item.username || "-"}</div>
                        <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>{item.email || "-"} · {item.role}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${item.type === "TOP_UP" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`} style={{ fontSize: "0.72rem", fontWeight: 800 }}>
                          {item.type === "TOP_UP" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {typeLabel[item.type] || item.type}
                        </span>
                      </td>
                      <td className={`px-5 py-4 font-extrabold ${item.type === "TOP_UP" ? "text-emerald-600" : "text-orange-600"}`}>
                        {item.type === "TOP_UP" ? "+" : "-"}{formatMoney(Math.abs(item.amount || 0))}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 ${statusClass(item.status)}`} style={{ fontSize: "0.7rem", fontWeight: 800 }}>
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap" style={{ fontSize: "0.78rem" }}>{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
                          <Eye className="w-3.5 h-3.5" /> Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <span className="text-gray-500" style={{ fontSize: "0.78rem" }}>Trang {page + 1} / {Math.max(totalPages, 1)}</span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(value => Math.max(0, value - 1))} className="rounded-xl border border-gray-200 px-3 py-2 disabled:opacity-40" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Trước</button>
                <button disabled={page + 1 >= totalPages} onClick={() => setPage(value => value + 1)} className="rounded-xl border border-gray-200 px-3 py-2 disabled:opacity-40" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Sau</button>
              </div>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Mã", "Người rút", "Ngân hàng", "Số tiền", "Ngày tạo", "Hành động"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left whitespace-nowrap text-gray-500" style={{ fontSize: "0.73rem", fontWeight: 800 }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingLoading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Đang tải yêu cầu rút tiền...</td></tr>
                ) : pending.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Không có yêu cầu rút tiền đang chờ duyệt</td></tr>
                ) : pending.map((request) => (
                  <tr key={request.transactionId} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 font-mono text-gray-500">WD-{request.transactionId}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{request.ownerName}</div>
                      <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>User #{request.userId} · {request.role}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{request.bankName || request.bankCode || "-"}</div>
                      <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>{request.bankAccountHolderName || "-"} · {request.bankAccountNumber || "-"}</div>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-orange-600">{formatMoney(request.amount)}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap" style={{ fontSize: "0.78rem" }}>{formatDate(request.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button disabled={actionId === request.transactionId} onClick={() => void reviewWithdraw(request.transactionId, "approve")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-600 disabled:opacity-60" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                        </button>
                        <button disabled={actionId === request.transactionId} onClick={() => void reviewWithdraw(request.transactionId, "reject")} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 disabled:opacity-60" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
                          <XCircle className="w-3.5 h-3.5" /> Từ chối
                        </button>
                        <button onClick={() => setSelected(request)} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50" style={{ fontSize: "0.72rem", fontWeight: 800 }}>Chi tiết</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <div className="font-extrabold text-gray-900">Chi tiết giao dịch</div>
                <div className="text-gray-400" style={{ fontSize: "0.78rem" }}>
                  {"id" in selected ? selected.id : `WD-${selected.transactionId}`}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-xl bg-gray-100 px-3 py-2 text-gray-600">Đóng</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
              <DetailRow label="User" value={"username" in selected ? selected.ownerName || selected.username : selected.ownerName} />
              <DetailRow label="Vai trò" value={selected.role} />
              <DetailRow label="Loại" value={"type" in selected ? typeLabel[selected.type || "WITHDRAWAL"] || selected.type : "Rút tiền"} />
              <DetailRow label="Trạng thái" value={"status" in selected ? statusLabel[selected.status] || selected.status : statusLabel[selected.withdrawalStatus] || selected.withdrawalStatus} />
              <DetailRow label="Số tiền" value={formatMoney(selected.amount)} />
              <DetailRow label="Số dư trước" value={formatMoney(selected.balanceBefore)} />
              <DetailRow label="Số dư sau" value={formatMoney(selected.balanceAfter)} />
              <DetailRow label="Reference" value={"referenceId" in selected ? selected.referenceId : selected.referenceId} />
              <DetailRow label="Ngân hàng" value={selected.bankName || selected.bankCode} />
              <DetailRow label="Số tài khoản" value={selected.bankAccountNumber} />
              <DetailRow label="Chủ tài khoản" value={selected.bankAccountHolderName} />
              <DetailRow label="Chi nhánh" value={selected.bankBranch} />
              <DetailRow label="Admin xử lý" value={selected.processedByName} />
              <DetailRow label="Ngày xử lý" value={formatDate(selected.processedAt)} />
              <div className="sm:col-span-2">
                <DetailRow label="Ghi chú" value={"description" in selected ? selected.adminNote || selected.description : selected.adminNote || selected.description} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
