import { useState } from "react";
import {
  Search, Filter, Download, CheckCircle2, Clock,
  XCircle, ChevronLeft, ChevronRight, ArrowUpDown,
  DollarSign, Percent, TrendingUp, Calendar
} from "lucide-react";

const allTransactions = [
  { id: "TXN-8821", learner: "Nguyễn Minh Anh", coach: "Trần Văn Đức", coachPlan: "Pro Coach", amount: 400000, commission: 48000, rate: 12, net: 352000, type: "Buổi tập", date: "06/03/2026 14:32", status: "success" },
  { id: "TXN-8820", learner: "Phạm Quốc Bảo", coach: "Lê Thị Hương", coachPlan: "Starter", amount: 500000, commission: 100000, rate: 20, net: 400000, type: "Buổi tập", date: "06/03/2026 14:14", status: "success" },
  { id: "TXN-8819", learner: "Võ Thị Lan", coach: "Nguyễn Hữu Nam", coachPlan: "Elite Coach", amount: 600000, commission: 0, rate: 0, net: 600000, type: "Buổi tập", date: "06/03/2026 13:50", status: "success" },
  { id: "TXN-8818", learner: "Đặng Minh Tuấn", coach: "Trần Văn Đức", coachPlan: "Pro Coach", amount: 800000, commission: 96000, rate: 12, net: 704000, type: "Gói 2 buổi", date: "06/03/2026 12:10", status: "success" },
  { id: "TXN-8817", learner: "Hoàng Thu Hà", coach: "Bùi Thị Mai", coachPlan: "Starter", amount: 350000, commission: 70000, rate: 20, net: 280000, type: "Buổi tập", date: "06/03/2026 11:45", status: "pending" },
  { id: "TXN-8816", learner: "Trần Thị Bình", coach: "Vũ Đình Khoa", coachPlan: "Elite Coach", amount: 1200000, commission: 0, rate: 0, net: 1200000, type: "Gói 3 buổi", date: "06/03/2026 10:20", status: "success" },
  { id: "TXN-8815", learner: "Lê Minh Khoa", coach: "Phạm Thị Thảo", coachPlan: "Pro Coach", amount: 450000, commission: 54000, rate: 12, net: 396000, type: "Buổi tập", date: "06/03/2026 09:55", status: "success" },
  { id: "TXN-8814", learner: "Nguyễn Thị Hoa", coach: "Lê Thị Hương", coachPlan: "Starter", amount: 300000, commission: 60000, rate: 20, net: 240000, type: "Buổi tập", date: "05/03/2026 18:30", status: "success" },
  { id: "TXN-8813", learner: "Phan Thanh Tùng", coach: "Nguyễn Hữu Nam", coachPlan: "Elite Coach", amount: 750000, commission: 0, rate: 0, net: 750000, type: "Buổi tập", date: "05/03/2026 17:15", status: "success" },
  { id: "TXN-8812", learner: "Bùi Quỳnh Anh", coach: "Trần Văn Đức", coachPlan: "Pro Coach", amount: 400000, commission: 48000, rate: 12, net: 352000, type: "Buổi tập", date: "05/03/2026 16:00", status: "failed" },
  { id: "TXN-8811", learner: "Đỗ Huy Hoàng", coach: "Bùi Thị Mai", coachPlan: "Starter", amount: 500000, commission: 100000, rate: 20, net: 400000, type: "Gói 2 buổi", date: "05/03/2026 14:50", status: "success" },
  { id: "TXN-8810", learner: "Chu Thị Mai", coach: "Vũ Đình Khoa", coachPlan: "Elite Coach", amount: 900000, commission: 0, rate: 0, net: 900000, type: "Gói 2 buổi", date: "05/03/2026 13:30", status: "success" },
];

const statusConfig = {
  success: { label: "Thành công", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-600" },
  pending: { label: "Đang xử lý", icon: Clock, cls: "bg-amber-100 text-amber-600" },
  failed: { label: "Thất bại", icon: XCircle, cls: "bg-red-100 text-red-500" },
};

const planColor: Record<string, string> = {
  "Starter": "bg-gray-100 text-gray-600",
  "Pro Coach": "bg-blue-100 text-blue-600",
  "Elite Coach": "bg-violet-100 text-violet-600",
};

export function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = allTransactions.filter(t => {
    const matchSearch = t.learner.toLowerCase().includes(search.toLowerCase()) ||
      t.coach.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPlan = filterPlan === "all" || t.coachPlan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const totalCommission = filtered.filter(t => t.status === "success").reduce((s, t) => s + t.commission, 0);
  const totalAmount = filtered.filter(t => t.status === "success").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Quản lý giao dịch học phí</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Theo dõi toàn bộ thanh toán & hoa hồng nền tảng</div>
        </div>
        <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Tổng học phí (lọc)", value: `${(totalAmount / 1000000).toFixed(1)}M đ`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Percent, label: "Hoa hồng thu (lọc)", value: `${(totalCommission / 1000000).toFixed(1)}M đ`, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Tỉ lệ HH trung bình", value: totalAmount > 0 ? `${((totalCommission / totalAmount) * 100).toFixed(1)}%` : "—", color: "text-violet-600", bg: "bg-violet-50" },
          { icon: Calendar, label: "Tổng giao dịch", value: `${filtered.length}`, color: "text-orange-500", bg: "bg-orange-50" },
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

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên HV, HLV hoặc mã GD..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-all"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
            <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả gói HLV</option>
              <option value="Starter">Starter (20%)</option>
              <option value="Pro Coach">Pro Coach (12%)</option>
              <option value="Elite Coach">Elite Coach (0%)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Mã GD", "Học viên", "HLV", "Gói HLV", "Loại", "Học phí", "Hoa hồng (đ)", "Tỉ lệ", "HLV nhận", "Ngày", "Trạng thái"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400" style={{ fontSize: "0.88rem" }}>Không tìm thấy giao dịch nào</td>
                </tr>
              ) : paged.map((t) => {
                const sc = statusConfig[t.status as keyof typeof statusConfig];
                const StatusIcon = sc.icon;
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-500" style={{ fontSize: "0.75rem" }}>{t.id}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{t.learner}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", color: "#4b5563" }}>{t.coach}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${planColor[t.coachPlan]}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>{t.coachPlan}</span>
                    </td>
                    <td className="px-4 py-3.5"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.72rem" }}>{t.type}</span></td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{(t.amount / 1000).toFixed(0)}K đ</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.88rem", fontWeight: 700, color: t.commission === 0 ? "#9ca3af" : "#059669" }}>
                      {t.commission === 0 ? "—" : `+${(t.commission / 1000).toFixed(0)}K đ`}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${t.rate === 0 ? "bg-violet-100 text-violet-600" : t.rate === 12 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                        {t.rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4b5563" }}>{(t.net / 1000).toFixed(0)}K đ</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{t.date}</td>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
          <span style={{ fontSize: "0.78rem" }} className="text-gray-400">
            Hiển thị {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} / {filtered.length} giao dịch
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
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
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Commission breakdown by plan */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Hoa hồng thu theo gói HLV (tháng 3/2026)</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { plan: "Starter", rate: "20%", transactions: 3821, totalTuition: "191M", commission: "38.2M", color: "gray", border: "border-gray-200", bg: "bg-gray-50", textColor: "text-gray-700", badge: "bg-gray-100 text-gray-600" },
            { plan: "Pro Coach", rate: "12%", transactions: 2940, totalTuition: "246.7M", commission: "29.6M", color: "blue", border: "border-blue-200", bg: "bg-blue-50", textColor: "text-blue-700", badge: "bg-blue-100 text-blue-600" },
            { plan: "Elite Coach", rate: "0%", transactions: 1473, totalTuition: "227.6M", commission: "0đ", color: "violet", border: "border-violet-200", bg: "bg-violet-50", textColor: "text-violet-700", badge: "bg-violet-100 text-violet-600" },
          ].map(p => (
            <div key={p.plan} className={`rounded-2xl border-2 ${p.border} ${p.bg} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }} className={p.textColor}>{p.plan}</span>
                <span className={`px-2 py-0.5 rounded-full ${p.badge}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>HH {p.rate}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span style={{ fontSize: "0.75rem" }} className="text-gray-500">Giao dịch</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-800">{p.transactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: "0.75rem" }} className="text-gray-500">Tổng học phí</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }} className="text-gray-800">{p.totalTuition} đ</span>
                </div>
                <div className={`flex justify-between border-t pt-1.5 mt-1.5 border-${p.color}-200`}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600 }} className={p.textColor}>Platform thu</span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800 }} className={p.textColor}>{p.commission} đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
