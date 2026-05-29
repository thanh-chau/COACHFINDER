import { useEffect, useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Percent,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  AdminTransaction,
  TuitionTransactionSummary,
  fetchAdminTransactions,
  fetchAdminTransactionSummary,
} from "../api/admin";

const statusConfig = {
  SUCCESS: { label: "Thành công", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-600" },
  PROCESSING: { label: "Đang xử lý", icon: Clock, cls: "bg-amber-100 text-amber-600" },
  FAILED: { label: "Thất bại", icon: XCircle, cls: "bg-red-100 text-red-500" },
};

const planColor: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  PRO: "bg-blue-100 text-blue-600",
  PREMIUM: "bg-violet-100 text-violet-600",
};

const planCardStyle: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  FREE: { border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-700", badge: "bg-gray-100 text-gray-600" },
  PRO: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-600" },
  PREMIUM: { border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700", badge: "bg-violet-100 text-violet-600" },
};

const formatMoney = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatCompactMoney = (value?: number | null) => {
  const amount = value || 0;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M đ`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K đ`;
  return `${amount.toLocaleString("vi-VN")} đ`;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [summary, setSummary] = useState<TuitionTransactionSummary | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const perPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const status = filterStatus === "success" ? "SUCCESS" : filterStatus === "pending" ? "PROCESSING" : undefined;
    const params = {
      status,
      coachPlan: filterPlan !== "all" ? filterPlan : undefined,
      keyword: debouncedSearch || undefined,
    };

    const load = async () => {
      try {
        setIsLoading(true);
        const [transactionPage, transactionSummary] = await Promise.all([
          fetchAdminTransactions({ ...params, page: page - 1, size: perPage }),
          fetchAdminTransactionSummary(params),
        ]);
        setTransactions(transactionPage.content || []);
        setTotalElements(transactionPage.totalElements || 0);
        setTotalPages(Math.max(transactionPage.totalPages || 1, 1));
        setSummary(transactionSummary);
      } catch (error) {
        console.error(error);
        setTransactions([]);
        setTotalElements(0);
        setTotalPages(1);
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [debouncedSearch, filterStatus, filterPlan, page]);

  const totalAmount = summary?.totalAmount || 0;
  const totalCommission = summary?.totalCommission || 0;
  const averageRate = summary?.averageCommissionRate || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Quản lý giao dịch học phí</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Theo dõi toàn bộ thanh toán & hoa hồng nền tảng</div>
        </div>
        <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Tổng học phí (lọc)", value: formatCompactMoney(totalAmount), color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Percent, label: "Hoa hồng thu (lọc)", value: formatCompactMoney(totalCommission), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Tỉ lệ HH trung bình", value: totalAmount > 0 ? `${averageRate.toFixed(1)}%` : "-", color: "text-violet-600", bg: "bg-violet-50" },
          { icon: Calendar, label: "Tổng giao dịch", value: `${summary?.transactionCount || 0}`, color: "text-orange-500", bg: "bg-orange-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
            <div style={{ fontSize: "0.75rem" }} className="text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên HV, HLV hoặc mã GD..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-all"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
            </select>
            <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả gói HLV</option>
              <option value="FREE">Starter</option>
              <option value="PRO">Pro Coach</option>
              <option value="PREMIUM">Elite Coach</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Mã GD", "Học viên", "HLV", "Gói HLV", "Loại", "Học phí", "Hoa hồng", "Tỉ lệ", "HLV nhận", "Ngày", "Trạng thái"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400" style={{ fontSize: "0.88rem" }}>
                    {isLoading ? "Đang tải giao dịch..." : "Không tìm thấy giao dịch nào"}
                  </td>
                </tr>
              ) : transactions.map((t) => {
                const sc = statusConfig[(t.status || "SUCCESS") as keyof typeof statusConfig] || statusConfig.SUCCESS;
                const StatusIcon = sc.icon;
                const planCode = t.coachPlanCode || "FREE";
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-500" style={{ fontSize: "0.75rem" }}>TXN-{t.id}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{t.learnerName || t.userName || "-"}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", color: "#4b5563" }}>{t.coachName || "-"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${planColor[planCode]}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>{t.coachPlanName || "Starter"}</span>
                    </td>
                    <td className="px-4 py-3.5"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.72rem" }}>{t.bookingType || "Buổi tập"}</span></td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{formatCompactMoney(t.amount)}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.88rem", fontWeight: 700, color: (t.commission || 0) === 0 ? "#9ca3af" : "#059669" }}>
                      {(t.commission || 0) === 0 ? "-" : `+${formatCompactMoney(t.commission)}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${planColor[planCode]}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                        {t.commissionRate ?? 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>{formatCompactMoney(t.coachPayout)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit ${sc.cls}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                        <StatusIcon className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
          <span style={{ fontSize: "0.78rem" }} className="text-gray-400">
            Hiển thị {totalElements === 0 ? 0 : Math.min((page - 1) * perPage + 1, totalElements)}-{Math.min(page * perPage, totalElements)} / {totalElements} giao dịch
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-sm font-bold transition-colors ${page === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                style={{ fontSize: "0.8rem" }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Hoa hồng thu theo gói HLV</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(summary?.breakdownByPlan || []).length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400" style={{ fontSize: "0.88rem" }}>Chưa có dữ liệu hoa hồng theo bộ lọc này</div>
          ) : (summary?.breakdownByPlan || []).map((p) => {
            const style = planCardStyle[p.planCode] || planCardStyle.FREE;
            return (
              <div key={p.planCode} className={`rounded-2xl border-2 ${style.border} ${style.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className={style.text}>{p.planName}</span>
                  <span className={`px-2 py-0.5 rounded-full ${style.badge}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>HH {p.commissionRate}%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span style={{ fontSize: "0.75rem" }} className="text-gray-500">Giao dịch</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-800">{p.transactionCount.toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: "0.75rem" }} className="text-gray-500">Tổng học phí</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-800">{formatMoney(p.totalTuition)}</span>
                  </div>
                  <div className={`flex justify-between border-t pt-1.5 mt-1.5 ${style.border}`}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className={style.text}>Platform thu</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800 }} className={style.text}>{formatMoney(p.commission)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
