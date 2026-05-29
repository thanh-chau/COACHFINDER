import { useEffect, useState } from "react";
import {
  TrendingUp, DollarSign, Percent, CreditCard,
  ArrowUpRight, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  CommissionByPlan,
  FinanceOverview,
  RevenueBySource,
  RevenueChartPoint,
  TopCoach,
  AdminWalletOverview,
  AdminWalletWithdrawRequest,
  approveAdminWalletWithdrawRequest,
  fetchAdminCommissionByPlan,
  fetchAdminFinanceOverview,
  fetchAdminMonthlyRevenue,
  fetchAdminWalletOverview,
  fetchAdminWalletWithdrawRequests,
  fetchAdminRevenueBySource,
  fetchAdminTopCoaches,
  rejectAdminWalletWithdrawRequest,
} from "../api/admin";

const COLORS = ["#3b82f6", "#f97316", "#8b5cf6", "#06b6d4", "#10b981"];
const PLAN_LABEL: Record<string, string> = {
  FREE: "Starter",
  PRO: "Pro Coach",
  PREMIUM: "Elite Coach",
};

const formatMoney = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);

const compactMoney = (value?: number | null) => {
  const amount = value || 0;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M đ`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K đ`;
  return `${amount.toLocaleString("vi-VN")} đ`;
};

export function AdminFinance() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [monthly, setMonthly] = useState<RevenueChartPoint[]>([]);
  const [commissionByPlan, setCommissionByPlan] = useState<CommissionByPlan[]>([]);
  const [revenueBySource, setRevenueBySource] = useState<RevenueBySource[]>([]);
  const [topCoaches, setTopCoaches] = useState<TopCoach[]>([]);
  const [walletOverview, setWalletOverview] = useState<AdminWalletOverview | null>(null);
  const [withdrawRequests, setWithdrawRequests] = useState<AdminWalletWithdrawRequest[]>([]);
  const [walletActionId, setWalletActionId] = useState<number | null>(null);
  const [walletError, setWalletError] = useState("");

  const loadWalletReview = async () => {
    try {
      const [walletResult, withdrawResult] = await Promise.all([
        fetchAdminWalletOverview(),
        fetchAdminWalletWithdrawRequests("PENDING"),
      ]);
      setWalletOverview(walletResult);
      setWithdrawRequests(withdrawResult || []);
      setWalletError("");
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Khong tai duoc yeu cau rut tien.");
    }
  };

  useEffect(() => {
    Promise.all([
      fetchAdminFinanceOverview(),
      fetchAdminMonthlyRevenue(),
      fetchAdminCommissionByPlan(),
      fetchAdminRevenueBySource(),
      fetchAdminTopCoaches(),
    ])
      .then(([overviewResult, monthlyResult, commissionResult, sourceResult, coachResult]) => {
        setOverview(overviewResult);
        setMonthly(monthlyResult || []);
        setCommissionByPlan(commissionResult || []);
        setRevenueBySource(sourceResult || []);
        setTopCoaches(coachResult || []);
      })
      .catch((error) => console.error(error));
    void loadWalletReview();
  }, []);

  const reviewWithdraw = async (transactionId: number, action: "approve" | "reject") => {
    const note = prompt(action === "approve" ? "Ghi chu phe duyet (optional)" : "Ly do tu choi");
    if (action === "reject" && !note) return;
    setWalletActionId(transactionId);
    setWalletError("");
    try {
      if (action === "approve") {
        await approveAdminWalletWithdrawRequest(transactionId, note || undefined);
      } else {
        await rejectAdminWalletWithdrawRequest(transactionId, note || undefined);
      }
      await loadWalletReview();
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Khong the cap nhat yeu cau rut tien.");
    } finally {
      setWalletActionId(null);
    }
  };

  const monthlyData = monthly.map((m) => ({
    month: m.period,
    commission: Math.round((m.commission || 0) / 1000000),
    subscription: Math.round((m.subscriptionRevenue || 0) / 1000000),
    booking: Math.round((m.bookingRevenue || 0) / 1000000),
    total: Math.round((m.revenue || 0) / 1000000),
  }));
  const sourceData = revenueBySource.map((s) => ({
    name: s.source.replaceAll("_", " "),
    value: Math.round((s.revenue || 0) / 1000000),
  }));
  const totalSource = revenueBySource.reduce((sum, item) => sum + item.revenue, 0);
  const maxCommission = Math.max(...commissionByPlan.map((p) => p.commission), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Báo cáo tài chính</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Phân tích doanh thu, hoa hồng & gói đăng ký từ API</div>
        </div>
        <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          <Download className="w-3.5 h-3.5" /> Xuất PDF
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Tổng học phí", value: compactMoney(overview?.bookingRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Hoa hồng", value: compactMoney(overview?.platformCommission), icon: Percent, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Gói đăng ký", value: compactMoney(overview?.subscriptionRevenue), icon: CreditCard, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Tuần này", value: compactMoney(overview?.weekRevenue), icon: CreditCard, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Tổng doanh thu", value: compactMoney(overview?.totalRevenue), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1 }} className="text-gray-900 mb-0.5">{value}</div>
            <div style={{ fontSize: "0.72rem" }} className="text-gray-500 mb-0.5">{label}</div>
            <span className="flex items-center gap-0.5 text-emerald-600" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
              <ArrowUpRight className="w-3 h-3" />real-time
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-5">
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Doanh thu nền tảng theo tháng</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Tính từ wallet transactions (triệu đồng)</div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
              <Tooltip formatter={(v: number, n: string) => [`${v}M đ`, n === "commission" ? "Hoa hồng" : n === "subscription" ? "Gói đăng ký" : "Học phí"]} />
              <Bar dataKey="commission" stackId="a" fill="#3b82f6" />
              <Bar dataKey="subscription" stackId="a" fill="#f97316" />
              <Bar dataKey="booking" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-1">Cơ cấu doanh thu</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mb-4">Phân bổ theo nguồn</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {sourceData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}M đ`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span style={{ fontSize: "0.72rem" }} className="text-gray-500">{s.name}</span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }} className="text-gray-800">{s.value}M</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }} className="text-gray-600">Tổng</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800 }} className="text-gray-900">{formatMoney(totalSource)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Xu hướng tổng doanh thu</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">6 tháng gần nhất</div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
              <Tooltip formatter={(v: number) => [`${v}M đ`, "Doanh thu"]} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} fill="#3b82f622" dot={{ fill: "#3b82f6", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Hoa hồng theo gói HLV</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400">Dữ liệu từ giao dịch học phí</div>
          </div>
          <div className="space-y-4">
            {commissionByPlan.length === 0 ? (
              <div className="text-gray-400">Chưa có hoa hồng học phí</div>
            ) : commissionByPlan.map((p) => (
              <div key={p.planCode}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-800">{PLAN_LABEL[p.planCode]}</span>
                    <span style={{ fontSize: "0.72rem" }} className="text-gray-400 ml-2">{p.transactionCount.toLocaleString("vi-VN")} GD</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }} className={p.commission === 0 ? "text-gray-400" : "text-gray-900"}>{formatMoney(p.commission)}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-blue-500 transition-all" style={{ width: `${(p.commission / maxCommission) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">HLV doanh thu cao nhất</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">Top theo tổng học phí hoàn tất</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "HLV", "Buổi hoàn tất", "Tổng học phí", "HLV nhận", "Platform thu"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topCoaches.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Chưa có dữ liệu HLV</td></tr>
              ) : topCoaches.map((c, i) => (
                <tr key={c.coachId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">{i + 1}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{c.coachName}</td>
                  <td className="px-5 py-4 font-bold">{c.completedBookings}</td>
                  <td className="px-5 py-4 font-bold">{formatMoney(c.revenue)}</td>
                  <td className="px-5 py-4 font-bold text-emerald-600">{formatMoney(c.payout)}</td>
                  <td className="px-5 py-4 font-bold text-blue-600">{formatMoney(c.revenue - c.payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Duyet yeu cau rut tien</div>
            <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">
              Vi admin: {formatMoney(walletOverview?.wallet?.balance)} Â· {walletOverview?.totalTransactions || 0} giao dich
            </div>
          </div>
          <button onClick={() => void loadWalletReview()} className="sm:ml-auto rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
            Tai lai
          </button>
        </div>
        {walletError && <div className="mx-5 mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600" style={{ fontSize: "0.8rem" }}>{walletError}</div>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Ma", "Nguoi rut", "Ngan hang", "So tien", "Trang thai", "Ngay tao", "Hanh dong"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {withdrawRequests.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Khong co yeu cau rut tien dang cho duyet</td></tr>
              ) : withdrawRequests.map((request) => (
                <tr key={request.transactionId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-gray-400">WD-{request.transactionId}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">{request.ownerName}</div>
                    <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>{request.role}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-900" style={{ fontWeight: 700 }}>{request.bankName || request.bankCode || "-"}</div>
                    <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>{request.bankAccountHolderName || "-"} Â· {request.bankAccountNumber || "-"}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-600">{formatMoney(request.amount)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700" style={{ fontSize: "0.7rem", fontWeight: 700 }}>{request.withdrawalStatus}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500" style={{ fontSize: "0.78rem" }}>{new Date(request.createdAt).toLocaleString("vi-VN")}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button disabled={walletActionId === request.transactionId} onClick={() => void reviewWithdraw(request.transactionId, "approve")} className="rounded-lg bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-600 disabled:opacity-60" style={{ fontSize: "0.72rem", fontWeight: 700 }}>Duyet</button>
                      <button disabled={walletActionId === request.transactionId} onClick={() => void reviewWithdraw(request.transactionId, "reject")} className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 disabled:opacity-60" style={{ fontSize: "0.72rem", fontWeight: 700 }}>Tu choi</button>
                    </div>
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
