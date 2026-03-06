import { useState, type ElementType } from "react";
import {
  Search, Download, CheckCircle2, Clock, XCircle,
  ChevronLeft, ChevronRight, Crown, Zap, Star,
  Users, DollarSign, TrendingUp, RefreshCw, Package, AlertCircle
} from "lucide-react";

// ── Learner subscriptions ──────────────────────────────────────────────────────
const learnerSubs = [
  { id: "LS-1021", name: "Nguyễn Minh Anh", email: "minhanh@demo.com", plan: "Pro", amount: 199000, start: "01/03/2026", renewal: "01/04/2026", status: "active", autoRenew: true },
  { id: "LS-1020", name: "Phạm Quốc Bảo", email: "quocbao@example.com", plan: "Premium", amount: 499000, start: "15/02/2026", renewal: "15/03/2026", status: "active", autoRenew: true },
  { id: "LS-1019", name: "Võ Thị Lan", email: "thilan@example.com", plan: "Free", amount: 0, start: "—", renewal: "—", status: "active", autoRenew: false },
  { id: "LS-1018", name: "Đặng Minh Tuấn", email: "minhtuan@example.com", plan: "Pro", amount: 199000, start: "20/02/2026", renewal: "20/03/2026", status: "expired", autoRenew: false },
  { id: "LS-1017", name: "Hoàng Thu Hà", email: "thuha@example.com", plan: "Premium", amount: 499000, start: "05/02/2026", renewal: "05/03/2026", status: "active", autoRenew: true },
  { id: "LS-1016", name: "Trần Thị Bình", email: "thibinh@example.com", plan: "Pro", amount: 199000, start: "01/03/2026", renewal: "01/04/2026", status: "active", autoRenew: false },
  { id: "LS-1015", name: "Lê Minh Khoa", email: "minhkhoa@example.com", plan: "Free", amount: 0, start: "—", renewal: "—", status: "active", autoRenew: false },
  { id: "LS-1014", name: "Bùi Quỳnh Anh", email: "quynh@example.com", plan: "Premium", amount: 499000, start: "28/02/2026", renewal: "28/03/2026", status: "pending", autoRenew: true },
];

// ── Coach subscriptions ────────────────────────────────────────────────────────
const coachSubs = [
  { id: "CS-521", name: "Trần Văn Đức", email: "hlv@demo.com", plan: "Pro Coach", amount: 499000, start: "01/03/2026", renewal: "01/04/2026", status: "active", commission: 12, autoRenew: true },
  { id: "CS-520", name: "Lê Thị Hương", email: "lehuong@example.com", plan: "Starter", amount: 0, start: "—", renewal: "—", status: "active", commission: 20, autoRenew: false },
  { id: "CS-519", name: "Nguyễn Hữu Nam", email: "huunam@example.com", plan: "Elite Coach", amount: 1490000, start: "01/02/2026", renewal: "01/03/2026", status: "expired", commission: 0, autoRenew: false },
  { id: "CS-518", name: "Bùi Thị Mai", email: "thimai@example.com", plan: "Starter", amount: 0, start: "—", renewal: "—", status: "active", commission: 20, autoRenew: false },
  { id: "CS-517", name: "Vũ Đình Khoa", email: "dinhkhoa@example.com", plan: "Elite Coach", amount: 1490000, start: "15/02/2026", renewal: "15/03/2026", status: "active", commission: 0, autoRenew: true },
  { id: "CS-516", name: "Phạm Thị Thảo", email: "thithao@example.com", plan: "Pro Coach", amount: 499000, start: "10/03/2026", renewal: "10/04/2026", status: "active", commission: 12, autoRenew: true },
  { id: "CS-515", name: "Đinh Văn Hùng", email: "vanhung@example.com", plan: "Starter", amount: 0, start: "—", renewal: "—", status: "active", commission: 20, autoRenew: false },
  { id: "CS-514", name: "Cao Thị Linh", email: "thilinh@example.com", plan: "Pro Coach", amount: 499000, start: "25/02/2026", renewal: "25/03/2026", status: "pending", commission: 12, autoRenew: true },
];

const learnerPlanConfig: Record<string, { color: string; bg: string; border: string; icon: ElementType; price: string }> = {
  Free: { color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", icon: Package, price: "0đ" },
  Pro: { color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", icon: Zap, price: "199K/th" },
  Premium: { color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200", icon: Crown, price: "499K/th" },
};

const coachPlanConfig: Record<string, { color: string; bg: string; border: string; icon: ElementType; price: string; commission: string }> = {
  Starter: { color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", icon: Star, price: "0đ", commission: "20%" },
  "Pro Coach": { color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", icon: Zap, price: "499K/th", commission: "12%" },
  "Elite Coach": { color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200", icon: Crown, price: "1.49M/th", commission: "0%" },
};

const statusConfig = {
  active: { label: "Đang hoạt động", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-600" },
  expired: { label: "Đã hết hạn", icon: XCircle, cls: "bg-red-100 text-red-500" },
  pending: { label: "Đang xử lý", icon: Clock, cls: "bg-amber-100 text-amber-600" },
};

export function AdminSubscriptions() {
  const [tab, setTab] = useState<"learner" | "coach">("learner");
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const isLearner = tab === "learner";
  const data = isLearner ? learnerSubs : coachSubs;

  const filtered = data.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || s.plan === filterPlan;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  // Summary stats
  const totalRevenue = data.filter(s => s.status === "active" && s.amount > 0).reduce((a, s) => a + s.amount, 0);
  const activeCount = data.filter(s => s.status === "active").length;
  const expiredCount = data.filter(s => s.status === "expired").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Quản lý gói đăng ký</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Học viên (Free/Pro/Premium) và HLV (Starter/Pro Coach/Elite Coach)</div>
        </div>
        <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      {/* Plan stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Learner plan distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-orange-500" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">Gói học viên</span>
          </div>
          {[
            { plan: "Free", count: 8500, pct: 68, color: "bg-gray-400" },
            { plan: "Pro", count: 2800, pct: 22.5, color: "bg-blue-500" },
            { plan: "Premium", count: 1153, pct: 9.3, color: "bg-violet-500" },
          ].map(p => (
            <div key={p.plan} className="mb-2">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{p.plan}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className="text-gray-700">{p.count.toLocaleString()}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Coach plan distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">Gói HLV</span>
          </div>
          {[
            { plan: "Starter", count: 1800, pct: 63.2, color: "bg-gray-400" },
            { plan: "Pro Coach", count: 820, pct: 28.8, color: "bg-blue-500" },
            { plan: "Elite Coach", count: 227, pct: 8, color: "bg-violet-500" },
          ].map(p => (
            <div key={p.plan} className="mb-2">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{p.plan}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className="text-gray-700">{p.count.toLocaleString()}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Revenue from subs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">Doanh thu gói T3</span>
          </div>
          {[
            { label: "HV Pro (2,800 × 199K)", value: "557.2M", color: "text-blue-600" },
            { label: "HV Premium (1,153 × 499K)", value: "575.3M", color: "text-violet-600" },
            { label: "HLV Pro (820 × 499K)", value: "409.2M", color: "text-cyan-600" },
            { label: "HLV Elite (227 × 1.49M)", value: "338.2M", color: "text-emerald-600" },
          ].map(r => (
            <div key={r.label} className="flex justify-between mb-1.5">
              <span style={{ fontSize: "0.68rem" }} className="text-gray-400">{r.label}</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700 }} className={r.color}>{r.value}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
            <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-600">Tổng</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className="text-gray-900">1,879.9M đ</span>
          </div>
        </div>

        {/* Renewal alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">Gia hạn trong 7 ngày</span>
          </div>
          {[
            { count: 284, label: "HV Pro cần gia hạn", color: "text-blue-600", bg: "bg-blue-50" },
            { count: 147, label: "HV Premium cần gia hạn", color: "text-violet-600", bg: "bg-violet-50" },
            { count: 89, label: "HLV Pro Coach", color: "text-cyan-600", bg: "bg-cyan-50" },
            { count: 23, label: "HLV Elite Coach", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(r => (
            <div key={r.label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${r.bg} mb-1.5`}>
              <span style={{ fontSize: "0.72rem" }} className="text-gray-600">{r.label}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className={r.color}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab + Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-50">
          {[
            { id: "learner" as const, label: "Học viên", count: learnerSubs.length },
            { id: "coach" as const, label: "Huấn luyện viên", count: coachSubs.length },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); setFilterPlan("all"); setFilterStatus("all"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${tab === t.id ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên hoặc email..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-all"
              style={{ fontSize: "0.85rem" }} />
          </div>
          <div className="flex gap-2">
            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả gói</option>
              {isLearner
                ? ["Free", "Pro", "Premium"].map(p => <option key={p}>{p}</option>)
                : ["Starter", "Pro Coach", "Elite Coach"].map(p => <option key={p}>{p}</option>)
              }
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Đã hết hạn</option>
              <option value="pending">Đang xử lý</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["ID", "Họ tên", "Email", "Gói", isLearner ? "Phí/tháng" : "Hoa hồng", "Ngày bắt đầu", "Gia hạn", "Tự gia hạn", "Trạng thái"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400" style={{ fontSize: "0.88rem" }}>Không tìm thấy kết quả</td></tr>
              ) : filtered.map((s) => {
                const cfg = isLearner ? learnerPlanConfig[s.plan] : coachPlanConfig[s.plan];
                const PlanIcon = cfg.icon;
                const sc = statusConfig[s.status as keyof typeof statusConfig];
                const StatusIcon = sc.icon;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-400" style={{ fontSize: "0.72rem" }}>{s.id}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.87rem", fontWeight: 600, color: "#111827" }}>{s.name}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit ${cfg.bg} ${cfg.color}`} style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                        <PlanIcon className="w-3 h-3" /> {s.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isLearner ? (
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className={s.amount === 0 ? "text-gray-400" : "text-gray-900"}>
                          {s.amount === 0 ? "Miễn phí" : `${(s.amount / 1000).toFixed(0)}K đ`}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full ${(s as typeof coachSubs[0]).commission === 0 ? "bg-violet-100 text-violet-600" : (s as typeof coachSubs[0]).commission === 12 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                          {(s as typeof coachSubs[0]).commission}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{s.start}</td>
                    <td className="px-4 py-3.5">
                      <span style={{ fontSize: "0.78rem", fontWeight: s.renewal !== "—" ? 600 : 400 }} className={s.renewal !== "—" && s.status === "active" ? "text-gray-800" : "text-gray-400"}>
                        {s.renewal}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${s.autoRenew ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                        {s.autoRenew ? "Bật" : "Tắt"}
                      </span>
                    </td>
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
          <span style={{ fontSize: "0.78rem" }} className="text-gray-400">{filtered.length} kết quả</span>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
              <CheckCircle2 className="w-3 h-3" /> {filtered.filter(s => s.status === "active").length} active
            </span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-500`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
              <XCircle className="w-3 h-3" /> {filtered.filter(s => s.status === "expired").length} hết hạn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}