import {
  TrendingUp, DollarSign, Percent, CreditCard,
  ArrowUpRight, Download, Calendar
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie,
  Cell, Legend, AreaChart, Area
} from "recharts";

const monthlyData = [
  { month: "T10/25", tuitionGross: 320, commission: 52, subLearner: 58, subCoach: 40, total: 150 },
  { month: "T11/25", tuitionGross: 378, commission: 61, subLearner: 65, subCoach: 47, total: 173 },
  { month: "T12/25", tuitionGross: 445, commission: 71, subLearner: 74, subCoach: 54, total: 199 },
  { month: "T1/26", tuitionGross: 398, commission: 64, subLearner: 68, subCoach: 50, total: 182 },
  { month: "T2/26", tuitionGross: 462, commission: 74, subLearner: 78, subCoach: 57, total: 209 },
  { month: "T3/26", tuitionGross: 485, commission: 78, subLearner: 89, subCoach: 53, total: 220 },
];

const commissionByPlan = [
  { plan: "Starter (20%)", value: 38.2, color: "#94a3b8" },
  { plan: "Pro Coach (12%)", value: 29.6, color: "#3b82f6" },
  { plan: "Elite Coach (0%)", value: 0, color: "#8b5cf6" },
];

const revenueBySource = [
  { name: "Hoa hồng HLV", value: 67.8, color: "#3b82f6" },
  { name: "Gói HV (Pro)", value: 55.7, color: "#f97316" },
  { name: "Gói HV (Premium)", value: 57.5, color: "#8b5cf6" },
  { name: "Gói HLV (Pro Coach)", value: 40.9, color: "#06b6d4" },
  { name: "Gói HLV (Elite Coach)", value: 33.8, color: "#10b981" },
];

const weeklyData = [
  { day: "T2", revenue: 32.4 }, { day: "T3", revenue: 28.7 }, { day: "T4", revenue: 41.2 },
  { day: "T5", revenue: 38.5 }, { day: "T6", revenue: 55.8 }, { day: "T7", revenue: 62.3 }, { day: "CN", revenue: 48.9 },
];

const topCoaches = [
  { name: "Vũ Đình Khoa", sport: "Tennis", plan: "Elite Coach", revenue: 44.2, commission: 0, sessions: 178 },
  { name: "Nguyễn Hữu Nam", sport: "Bơi lội", plan: "Elite Coach", revenue: 38.4, commission: 0, sessions: 154 },
  { name: "Trần Văn Đức", sport: "Thể hình", plan: "Pro Coach", revenue: 15.6, commission: 1.87, sessions: 89 },
  { name: "Phạm Thị Thảo", sport: "Cầu lông", plan: "Pro Coach", revenue: 9.8, commission: 1.18, sessions: 62 },
  { name: "Cao Thị Linh", sport: "Thể hình", plan: "Pro Coach", revenue: 7.5, commission: 0.9, sessions: 45 },
];

const COLORS = ["#3b82f6", "#f97316", "#8b5cf6", "#06b6d4", "#10b981"];

export function AdminFinance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Báo cáo tài chính</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Phân tích doanh thu, hoa hồng & gói đăng ký</div>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <select className="px-3 py-2 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white cursor-pointer" style={{ fontSize: "0.82rem" }}>
            <option>Tháng 3/2026</option>
            <option>Tháng 2/2026</option>
            <option>Tháng 1/2026</option>
            <option>6 tháng gần nhất</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
            <Download className="w-3.5 h-3.5" /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Tổng học phí T3", value: "485M đ", change: "+4.97%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Hoa hồng T3", value: "67.8M đ", change: "+4.6%", icon: Percent, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Gói HV T3", value: "113.2M đ", change: "+6.2%", icon: CreditCard, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Gói HLV T3", value: "52.6M đ", change: "+3.8%", icon: CreditCard, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Tổng doanh thu", value: "220M đ", change: "+5.26%", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
            <div style={{ fontSize: "0.72rem" }} className="text-gray-500 mb-0.5">{label}</div>
            <span className="flex items-center gap-0.5 text-emerald-600" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
              <ArrowUpRight className="w-3 h-3" />{change} vs T2
            </span>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Monthly revenue stacked bar */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Doanh thu nền tảng theo tháng</div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Hoa hồng + Gói HV + Gói HLV (triệu đồng)</div>
            </div>
            <div className="flex items-center gap-3">
              {[{ color: "#3b82f6", label: "Hoa hồng" }, { color: "#f97316", label: "Gói HV" }, { color: "#06b6d4", label: "Gói HLV" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  <span style={{ fontSize: "0.7rem" }} className="text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number, n: string) => [`${v}M đ`, n === "commission" ? "Hoa hồng" : n === "subLearner" ? "Gói HV" : "Gói HLV"]} />
              <Bar key="bar-commission" dataKey="commission" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar key="bar-subLearner" dataKey="subLearner" stackId="a" fill="#f97316" />
              <Bar key="bar-subCoach" dataKey="subCoach" stackId="a" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue source pie */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Cơ cấu doanh thu T3</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mb-4">Phân bổ theo nguồn</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie key="pie-revenue" data={revenueBySource} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {revenueBySource.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                formatter={(v: number) => [`${v}M đ`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {revenueBySource.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                  <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{s.name}</span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-800">{s.value}M</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-600">Tổng</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className="text-gray-900">255.7M đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly revenue line */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Doanh thu tuần này</div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Tổng thu nền tảng mỗi ngày (triệu đồng)</div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-emerald-600">T6-CN cao nhất</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gWeekly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => [`${v}M đ`, "Doanh thu"]} />
              <Area key="area-weekly" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gWeekly)" dot={{ fill: "#3b82f6", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Commission by plan bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Hoa hồng theo gói HLV</div>
              <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Tháng 3/2026 (triệu đồng)</div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { plan: "Starter (20%)", commission: 38.2, transactions: 3821, color: "bg-gray-400", pct: 100 },
              { plan: "Pro Coach (12%)", commission: 29.6, transactions: 2940, color: "bg-blue-500", pct: 77.5 },
              { plan: "Elite Coach (0%)", commission: 0, transactions: 1473, color: "bg-violet-300", pct: 0 },
            ].map(p => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">{p.plan}</span>
                    <span style={{ fontSize: "0.72rem" }} className="text-gray-400 ml-2">{p.transactions.toLocaleString()} GD</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }} className={p.commission === 0 ? "text-gray-400" : "text-gray-900"}>{p.commission === 0 ? "0đ" : `${p.commission}M đ`}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-blue-700">Tổng hoa hồng thu T3</span>
                <span style={{ fontSize: "1rem", fontWeight: 800 }} className="text-blue-700">67.8M đ</span>
              </div>
              <div style={{ fontSize: "0.72rem" }} className="text-blue-500 mt-0.5">Từ 8,234 giao dịch · Avg 8,235đ/GD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top coaches by revenue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">HLV doanh thu cao nhất tháng 3</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">Top 5 theo tổng học phí thu được</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "HLV", "Môn", "Gói", "Buổi dạy", "Tổng học phí (tr.đ)", "Hoa hồng nộp", "HLV nhận"].map(h => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topCoaches.map((c, i) => (
                <tr key={c.name} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-gray-200"}`}
                      style={{ fontSize: "0.72rem", fontWeight: 800, color: i >= 3 ? "#6b7280" : undefined }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: "0.87rem", fontWeight: 600, color: "#111827" }}>{c.name}</td>
                  <td className="px-5 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.72rem" }}>{c.sport}</span></td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full ${c.plan === "Elite Coach" ? "bg-violet-100 text-violet-600" : c.plan === "Pro Coach" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>{c.plan}</span>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>{c.sessions}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{c.revenue}M</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.88rem", fontWeight: 700, color: c.commission === 0 ? "#9ca3af" : "#3b82f6" }}>
                    {c.commission === 0 ? "0đ (0%)" : `${c.commission}M đ`}
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#059669" }}>{(c.revenue - c.commission).toFixed(2)}M đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
