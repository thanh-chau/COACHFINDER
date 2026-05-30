import { useEffect, useState, type ElementType } from "react";
import {
  Users, DollarSign, CreditCard, Percent, Activity, Package,
  ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  AdminAlert,
  AdminTransaction,
  DashboardOverview,
  RevenueChartPoint,
  SubscriptionSummary,
  fetchAdminAlerts,
  fetchAdminOverview,
  fetchAdminRecentTransactions,
  fetchAdminRevenueChart,
  fetchAdminSubscriptionSummary,
} from "../api/admin";

const formatMoney = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);

const compactMoney = (value?: number | null) => {
  const amount = value || 0;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
  return amount.toLocaleString("vi-VN");
};

const planColors: Record<string, string> = {
  FREE: "#94a3b8",
  PRO: "#3b82f6",
  PREMIUM: "#8b5cf6",
};

function KpiCard({ icon: Icon, label, value, sub, trend = "real-time", trendUp = true, color, bg }: {
  icon: ElementType; label: string; value: string; sub: string;
  trend?: string; trendUp?: boolean; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      </div>
      <div style={{ fontWeight: 900, fontSize: "1.55rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
      <div style={{ fontWeight: 600, fontSize: "0.83rem" }} className="text-gray-700 mb-0.5">{label}</div>
      <div style={{ fontSize: "0.72rem" }} className="text-gray-400">{sub}</div>
    </div>
  );
}

export function AdminOverview() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [chart, setChart] = useState<RevenueChartPoint[]>([]);
  const [recent, setRecent] = useState<AdminTransaction[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAdminOverview(),
      fetchAdminRevenueChart("month"),
      fetchAdminRecentTransactions(),
      fetchAdminAlerts(),
      fetchAdminSubscriptionSummary(),
    ])
      .then(([overviewResult, chartResult, recentResult, alertsResult, subscriptionResult]) => {
        setOverview(overviewResult);
        setChart(chartResult || []);
        setRecent((recentResult || []).filter((t) => t.type === "BOOKING_PAYMENT").slice(0, 5));
        setAlerts(alertsResult || []);
        setSubscriptionSummary(subscriptionResult);
      })
      .catch((error) => console.error(error));
  }, []);

  const chartData = chart.map((p) => ({
    month: p.period,
    tuition: Number(((p.bookingRevenue || 0) / 1000000).toFixed(2)),
    commission: Number(((p.commission || 0) / 1000000).toFixed(2)),
    subscription: Number(((p.subscriptionRevenue || 0) / 1000000).toFixed(2)),
  }));
  const learnerPlans = subscriptionSummary?.learnerPlans || [];
  const coachPlans = subscriptionSummary?.coachPlans || [];
  const learnerTotal = learnerPlans.reduce((sum, p) => sum + p.count, 0);
  const coachTotal = coachPlans.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-gray-50 border-gray-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-gray-400" />
            <span style={{ fontSize: "0.82rem", fontWeight: 500 }} className="text-gray-500">Không có cảnh báo hệ thống nào.</span>
          </div>
        ) : alerts.map((a, i) => {
          const isWarning = a.severity === "WARNING";
          const isInfo = a.severity === "INFO";
          const Icon = isWarning ? AlertCircle : isInfo ? Clock : CheckCircle2;
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isWarning ? "bg-amber-50 border-amber-200" : isInfo ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"}`}>
              <Icon className={`w-4 h-4 shrink-0 ${isWarning ? "text-amber-500" : isInfo ? "text-blue-500" : "text-emerald-500"}`} />
              <span style={{ fontSize: "0.82rem", fontWeight: 500 }} className="text-gray-700">{a.message}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard icon={DollarSign} label="Doanh thu tháng" value={compactMoney(overview?.monthRevenue)} sub="Học phí + gói" color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard icon={Percent} label="Hoa hồng" value={compactMoney(overview?.platformCommission)} sub="Platform thu" color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={CreditCard} label="Gói đăng ký" value={compactMoney(subscriptionSummary?.totalMonthlyRevenue)} sub="HV + HLV subs" color="text-violet-600" bg="bg-violet-50" />
        <KpiCard icon={Users} label="Học viên" value={(overview?.totalTrainees || 0).toLocaleString("vi-VN")} sub="Trên hệ thống" color="text-orange-500" bg="bg-orange-50" />
        <KpiCard icon={Activity} label="HLV" value={(overview?.totalCoaches || 0).toLocaleString("vi-VN")} sub="Trên hệ thống" color="text-cyan-600" bg="bg-cyan-50" />
        <KpiCard icon={Package} label="Giao dịch" value={(overview?.totalTransactions || 0).toLocaleString("vi-VN")} sub="Wallet transactions" color="text-rose-500" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Doanh thu nền tảng</div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-400">6 tháng gần nhất (triệu đồng)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
              <Tooltip formatter={(v: number, n: string) => [`${v}M đ`, n === "tuition" ? "Học phí" : n === "commission" ? "Hoa hồng" : "Gói đăng ký"]} />
              <Area type="monotone" dataKey="tuition" stroke="#10b981" strokeWidth={2} fill="#10b98122" />
              <Area type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={2} fill="#3b82f622" />
              <Area type="monotone" dataKey="subscription" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf622" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Phân bổ gói đăng ký</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mb-4">Học viên & HLV hiện tại</div>
          {[
            { title: `Học viên (${learnerTotal})`, rows: learnerPlans, total: learnerTotal },
            { title: `HLV (${coachTotal})`, rows: coachPlans, total: coachTotal },
          ].map((group) => (
            <div key={group.title} className="mb-4">
              <div style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-600 mb-2">{group.title}</div>
              <div className="flex rounded-lg overflow-hidden h-3 bg-gray-100">
                {group.rows.map((p) => (
                  <div key={p.planCode} style={{ width: `${group.total ? (p.count / group.total) * 100 : 0}%`, background: planColors[p.planCode] }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {group.rows.map((p) => (
                  <span key={p.planCode} style={{ fontSize: "0.65rem" }} className="text-gray-400">{p.planName}: {p.count}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Giao dịch học phí gần nhất</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Mã GD", "Học viên", "HLV", "Học phí", "Hoa hồng", "Tỉ lệ", "Ngày", "Trạng thái"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Chưa có giao dịch học phí</td></tr>
              ) : recent.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-gray-500">TXN-{t.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">{t.learnerName || t.userName || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-600">{t.coachName || "-"}</td>
                  <td className="px-4 py-3.5 font-bold">{compactMoney(t.amount)} đ</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{formatMoney(t.commission)}</td>
                  <td className="px-4 py-3.5">{t.commissionRate || 0}%</td>
                  <td className="px-4 py-3.5 text-gray-400">{new Date(t.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3.5 text-emerald-600 font-bold">Thành công</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
