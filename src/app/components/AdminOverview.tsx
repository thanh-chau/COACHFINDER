import { type ElementType } from "react";
import {
  Users, DollarSign, TrendingUp, CreditCard, Percent,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Crown,
  Star, AlertCircle, CheckCircle2, Clock, Package
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const revenueData = [
  { month: "T10/25", tuition: 320, commission: 52, subscription: 98 },
  { month: "T11/25", tuition: 378, commission: 61, subscription: 112 },
  { month: "T12/25", tuition: 445, commission: 71, subscription: 128 },
  { month: "T1/26", tuition: 398, commission: 64, subscription: 118 },
  { month: "T2/26", tuition: 462, commission: 74, subscription: 135 },
  { month: "T3/26", tuition: 485, commission: 78, subscription: 142 },
];

const planDistributionLearner = [
  { name: "Free", value: 8500, color: "#94a3b8" },
  { name: "Pro", value: 2800, color: "#3b82f6" },
  { name: "Premium", value: 1153, color: "#8b5cf6" },
];

const planDistributionCoach = [
  { name: "Starter", value: 1800, color: "#94a3b8" },
  { name: "Pro Coach", value: 820, color: "#3b82f6" },
  { name: "Elite Coach", value: 227, color: "#8b5cf6" },
];

const recentTransactions = [
  { id: "TXN-8821", learner: "Nguyễn Minh Anh", coach: "Trần Văn Đức", amount: 400000, commission: 48000, rate: 12, time: "5 phút trước", status: "success" },
  { id: "TXN-8820", learner: "Phạm Quốc Bảo", coach: "Lê Thị Hương", amount: 500000, commission: 100000, rate: 20, time: "18 phút trước", status: "success" },
  { id: "TXN-8819", learner: "Võ Thị Lan", coach: "Nguyễn Hữu Nam", amount: 600000, commission: 0, rate: 0, time: "42 phút trước", status: "success" },
  { id: "TXN-8818", learner: "Đặng Minh Tuấn", coach: "Trần Văn Đức", amount: 800000, commission: 96000, rate: 12, time: "1 giờ trước", status: "success" },
  { id: "TXN-8817", learner: "Hoàng Thu Hà", coach: "Bùi Thị Mai", amount: 350000, commission: 70000, rate: 20, time: "2 giờ trước", status: "pending" },
];

const alerts = [
  { type: "warning", msg: "3 HLV có thanh toán đang chờ xử lý quá 48h", icon: Clock },
  { type: "info", msg: "12 HLV mới đăng ký đang chờ xét duyệt hồ sơ", icon: CheckCircle2 },
  { type: "success", msg: "Doanh thu tháng 3 tăng 4.97% so với tháng 2", icon: TrendingUp },
];

function KpiCard({ icon: Icon, label, value, sub, trend, trendUp, color, bg }: {
  icon: ElementType; label: string; value: string; sub: string;
  trend: string; trendUp: boolean; color: string; bg: string;
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
  return (
    <div className="space-y-6">
      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${a.type === "warning" ? "bg-amber-50 border-amber-200" : a.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
            <a.icon className={`w-4 h-4 shrink-0 ${a.type === "warning" ? "text-amber-500" : a.type === "success" ? "text-emerald-500" : "text-blue-500"}`} />
            <span style={{ fontSize: "0.82rem", fontWeight: 500 }} className="text-gray-700">{a.msg}</span>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard icon={DollarSign} label="Doanh thu T3" value="485M" sub="Tổng học phí" trend="+4.97%" trendUp color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard icon={Percent} label="Hoa hồng T3" value="78M" sub="Platform thu" trend="+5.4%" trendUp color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={CreditCard} label="Gói đăng ký T3" value="142M" sub="HV + HLV subs" trend="+5.2%" trendUp color="text-violet-600" bg="bg-violet-50" />
        <KpiCard icon={Users} label="Học viên" value="12,453" sub="+218 tháng này" trend="+1.78%" trendUp color="text-orange-500" bg="bg-orange-50" />
        <KpiCard icon={Activity} label="HLV active" value="2,847" sub="+45 tháng này" trend="+1.6%" trendUp color="text-cyan-600" bg="bg-cyan-50" />
        <KpiCard icon={Package} label="Giao dịch T3" value="8,234" sub="Tổng buổi học" trend="+8.1%" trendUp color="text-rose-500" bg="bg-rose-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue area chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Doanh thu nền tảng</div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-400">6 tháng gần nhất (triệu đồng)</div>
            </div>
            <div className="flex items-center gap-3">
              {[{ color: "#10b981", label: "Học phí" }, { color: "#3b82f6", label: "Hoa hồng" }, { color: "#8b5cf6", label: "Gói đăng ký" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gTuition" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCommission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number, n: string) => [`${v}M đ`, n === "tuition" ? "Học phí" : n === "commission" ? "Hoa hồng" : "Gói đăng ký"]} />
              <Area key="area-tuition" type="monotone" dataKey="tuition" stroke="#10b981" strokeWidth={2} fill="url(#gTuition)" />
              <Area key="area-commission" type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={2} fill="url(#gCommission)" />
              <Area key="area-subscription" type="monotone" dataKey="subscription" stroke="#8b5cf6" strokeWidth={2} fill="url(#gSub)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Phân bổ gói đăng ký</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mb-4">Học viên & HLV hiện tại</div>

          <div className="mb-3">
            <div style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-600 mb-2">Học viên (12,453)</div>
            <div className="flex items-center gap-2 mb-1">
              {planDistributionLearner.map(p => (
                <div key={p.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span style={{ fontSize: "0.68rem" }} className="text-gray-500">{p.name}</span>
                </div>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden h-3">
              {planDistributionLearner.map(p => (
                <div key={p.name} style={{ width: `${(p.value / 12453) * 100}%`, background: p.color }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {planDistributionLearner.map(p => (
                <span key={p.name} style={{ fontSize: "0.65rem" }} className="text-gray-400">{p.value.toLocaleString()}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-600 mb-2">HLV (2,847)</div>
            <div className="flex items-center gap-2 mb-1">
              {planDistributionCoach.map(p => (
                <div key={p.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span style={{ fontSize: "0.68rem" }} className="text-gray-500">{p.name}</span>
                </div>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden h-3">
              {planDistributionCoach.map(p => (
                <div key={p.name} style={{ width: `${(p.value / 2847) * 100}%`, background: p.color }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {planDistributionCoach.map(p => (
                <span key={p.name} style={{ fontSize: "0.65rem" }} className="text-gray-400">{p.value.toLocaleString()}</span>
              ))}
            </div>
          </div>

          {/* Revenue breakdown */}
          <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
            {[
              { label: "Hoa hồng HLV Starter (20%)", value: "38.2M", color: "bg-gray-400" },
              { label: "Hoa hồng HLV Pro (12%)", value: "29.6M", color: "bg-blue-400" },
              { label: "Hoa hồng HLV Elite (0%)", value: "0đ", color: "bg-violet-400" },
              { label: "Gói HV tháng 3", value: "89.4M", color: "bg-orange-400" },
              { label: "Gói HLV tháng 3", value: "52.6M", color: "bg-cyan-400" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{r.label}</span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Giao dịch gần nhất</div>
          <span className="text-blue-500 hover:text-blue-600 cursor-pointer" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Xem tất cả →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Mã GD", "Học viên", "HLV", "Học phí", "Hoa hồng", "Tỉ lệ", "Thời gian", "Trạng thái"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5"><span className="font-mono text-gray-500" style={{ fontSize: "0.78rem" }}>{t.id}</span></td>
                  <td className="px-4 py-3.5"><span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-gray-800">{t.learner}</span></td>
                  <td className="px-4 py-3.5"><span style={{ fontSize: "0.85rem" }} className="text-gray-600">{t.coach}</span></td>
                  <td className="px-4 py-3.5"><span style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-gray-900">{(t.amount / 1000).toFixed(0)}K đ</span></td>
                  <td className="px-4 py-3.5">
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className={t.commission === 0 ? "text-gray-400" : "text-emerald-600"}>
                      {t.commission === 0 ? "0đ" : `+${(t.commission / 1000).toFixed(0)}K đ`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full ${t.rate === 0 ? "bg-violet-100 text-violet-600" : t.rate === 12 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                      {t.rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><span style={{ fontSize: "0.78rem" }} className="text-gray-400">{t.time}</span></td>
                  <td className="px-4 py-3.5">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit ${t.status === "success" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                      {t.status === "success" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {t.status === "success" ? "Thành công" : "Đang xử lý"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}