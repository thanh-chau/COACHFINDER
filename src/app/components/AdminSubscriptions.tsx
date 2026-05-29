import { useEffect, useState, type ElementType } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Crown,
  Zap,
  Star,
  Users,
  DollarSign,
  RefreshCw,
  Package,
} from "lucide-react";
import {
  AdminSubscription,
  SubscriptionPlanSummary,
  SubscriptionSummary,
  fetchAdminSubscriptionSummary,
  fetchAdminSubscriptions,
} from "../api/admin";

const learnerPlanConfig: Record<string, { color: string; bg: string; icon: ElementType }> = {
  FREE: { color: "text-gray-600", bg: "bg-gray-100", icon: Package },
  PRO: { color: "text-blue-600", bg: "bg-blue-100", icon: Zap },
  PREMIUM: { color: "text-violet-600", bg: "bg-violet-100", icon: Crown },
};

const coachPlanConfig: Record<string, { color: string; bg: string; icon: ElementType }> = {
  FREE: { color: "text-gray-600", bg: "bg-gray-100", icon: Star },
  PRO: { color: "text-blue-600", bg: "bg-blue-100", icon: Zap },
  PREMIUM: { color: "text-violet-600", bg: "bg-violet-100", icon: Crown },
};

const statusConfig = {
  ACTIVE: { label: "Đang hoạt động", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-600" },
  EXPIRED: { label: "Đã hết hạn", icon: XCircle, cls: "bg-red-100 text-red-500" },
  INACTIVE: { label: "Tạm dừng", icon: XCircle, cls: "bg-gray-100 text-gray-500" },
};

const planBarColors: Record<string, string> = {
  FREE: "bg-gray-400",
  PRO: "bg-blue-500",
  PREMIUM: "bg-violet-500",
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
  return amount === 0 ? "Miễn phí" : `${amount.toLocaleString("vi-VN")} đ`;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";

function PlanDistribution({
  title,
  icon: Icon,
  color,
  rows,
}: {
  title: string;
  icon: ElementType;
  color: string;
  rows: SubscriptionPlanSummary[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">{title}</span>
      </div>
      {rows.map((p) => (
        <div key={p.planCode} className="mb-2">
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{p.planName}</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className="text-gray-700">{p.count.toLocaleString("vi-VN")}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${planBarColors[p.planCode]}`} style={{ width: `${Math.min(p.percentage, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminSubscriptions() {
  const [tab, setTab] = useState<"learner" | "coach">("learner");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isLearner = tab === "learner";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const role = isLearner ? "TRAINEES" : "COACHES";
        const status =
          filterStatus === "active" ? "ACTIVE" : filterStatus === "expired" ? "EXPIRED" : filterStatus === "inactive" ? "INACTIVE" : undefined;
        const [pageResult, summaryResult] = await Promise.all([
          fetchAdminSubscriptions({
            role,
            plan: filterPlan !== "all" ? filterPlan : undefined,
            status,
            keyword: debouncedSearch || undefined,
            page: 0,
            size: 100,
          }),
          fetchAdminSubscriptionSummary(),
        ]);
        setSubscriptions(pageResult.content || []);
        setTotalElements(pageResult.totalElements || 0);
        setSummary(summaryResult);
      } catch (error) {
        console.error(error);
        setSubscriptions([]);
        setTotalElements(0);
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [tab, filterPlan, filterStatus, debouncedSearch, isLearner]);

  const planConfig = isLearner ? learnerPlanConfig : coachPlanConfig;
  const learnerTotal = summary?.learnerPlans?.reduce((sum, row) => sum + row.count, 0) || 0;
  const coachTotal = summary?.coachPlans?.reduce((sum, row) => sum + row.count, 0) || 0;
  const visibleActiveCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const visibleExpiredCount = subscriptions.filter((s) => s.status === "EXPIRED").length;


  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Quản lý gói đăng ký</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Học viên và HLV theo gói, doanh thu, gia hạn</div>
        </div>
        <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlanDistribution title="Gói học viên" icon={Users} color="text-orange-500" rows={summary?.learnerPlans || []} />
        <PlanDistribution title="Gói HLV" icon={Zap} color="text-blue-500" rows={summary?.coachPlans || []} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">Doanh thu gói/tháng</span>
          </div>
          {(summary?.revenueRows || []).length === 0 ? (
            <div className="text-gray-400" style={{ fontSize: "0.78rem" }}>Chưa có doanh thu gói</div>
          ) : (summary?.revenueRows || []).map((r) => (
            <div key={`${r.role}-${r.planCode}`} className="flex justify-between mb-1.5">
              <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{r.planName} ({r.count.toLocaleString("vi-VN")} x {formatCompactMoney(r.monthlyPrice)})</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className={r.planCode === "PREMIUM" ? "text-violet-600" : "text-blue-600"}>{formatCompactMoney(r.revenue)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
            <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-600">Tổng</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className="text-gray-900">{formatMoney(summary?.totalMonthlyRevenue)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">Gia hạn trong 7 ngày</span>
          </div>
          {(summary?.renewalAlerts || []).length === 0 ? (
            <div className="text-gray-400" style={{ fontSize: "0.78rem" }}>Không có gói sắp gia hạn</div>
          ) : (summary?.renewalAlerts || []).map((r) => (
            <div key={`${r.role}-${r.planCode}`} className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 mb-1.5">
              <span style={{ fontSize: "0.72rem" }} className="text-gray-600">{r.planName}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className="text-amber-600">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-gray-50">
          {[
            { id: "learner" as const, label: "Học viên", count: learnerTotal },
            { id: "coach" as const, label: "Huấn luyện viên", count: coachTotal },
          ].map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); setFilterPlan("all"); setFilterStatus("all"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${tab === t.id ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên hoặc email..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-all"
              style={{ fontSize: "0.85rem" }} />
          </div>
          <div className="flex gap-2">
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả gói</option>
              {(isLearner ? summary?.learnerPlans : summary?.coachPlans || [])?.map((p) => <option key={p.planCode} value={p.planCode}>{p.planName}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Đã hết hạn</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["ID", "Họ tên", "Email", "Gói", "Chu kỳ", "Phí/tháng", "Ngày bắt đầu", "Gia hạn", "Trạng thái"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400" style={{ fontSize: "0.88rem" }}>{isLoading ? "Đang tải gói đăng ký..." : "Không tìm thấy kết quả"}</td></tr>
              ) : subscriptions.map((s) => {
                const cfg = planConfig[s.planCode] || planConfig.FREE;
                const PlanIcon = cfg.icon;
                const sc = statusConfig[s.status] || statusConfig.INACTIVE;
                const StatusIcon = sc.icon;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-400" style={{ fontSize: "0.72rem" }}>SUB-{s.id}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.87rem", fontWeight: 600, color: "#111827" }}>{s.fullName || s.username}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit ${cfg.bg} ${cfg.color}`} style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                        <PlanIcon className="w-3 h-3" /> {s.planName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.78rem", color: "#6b7280" }}>{s.billingCycle === "YEARLY" ? "Năm" : "Tháng"}</td>
                    <td className={`px-4 py-3.5 ${s.monthlyPrice === 0 ? "text-gray-400" : "text-gray-900"}`} style={{ fontSize: "0.85rem", fontWeight: 700 }}>{formatCompactMoney(s.monthlyPrice)}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{formatDate(s.startedAt)}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{formatDate(s.expiresAt)}</td>
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
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <span style={{ fontSize: "0.78rem" }} className="text-gray-400">{totalElements} kết quả</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
              <CheckCircle2 className="w-3 h-3" /> {visibleActiveCount} active
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-500" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
              <XCircle className="w-3 h-3" /> {visibleExpiredCount} hết hạn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
