import { useState } from "react";
import {
  Search, Download, CheckCircle2, Clock, XCircle,
  ChevronLeft, ChevronRight, Shield, ShieldOff,
  Star, MoreVertical, Eye, Ban, Crown, Zap, Package
} from "lucide-react";

const learners = [
  { id: "U-10021", name: "Nguyễn Minh Anh", email: "minhanh@demo.com", phone: "0901 234 567", plan: "Pro", joined: "15/01/2026", sessions: 18, spent: "3.6M", status: "active", avatar: "NM" },
  { id: "U-10020", name: "Phạm Quốc Bảo", email: "quocbao@example.com", phone: "0912 345 678", plan: "Premium", joined: "22/12/2025", sessions: 34, spent: "12.4M", status: "active", avatar: "PQ" },
  { id: "U-10019", name: "Võ Thị Lan", email: "thilan@example.com", phone: "0923 456 789", plan: "Free", joined: "05/02/2026", sessions: 3, spent: "600K", status: "active", avatar: "VL" },
  { id: "U-10018", name: "Đặng Minh Tuấn", email: "minhtuan@example.com", phone: "0934 567 890", plan: "Pro", joined: "10/11/2025", sessions: 21, spent: "7.2M", status: "suspended", avatar: "ĐT" },
  { id: "U-10017", name: "Hoàng Thu Hà", email: "thuha@example.com", phone: "0945 678 901", plan: "Premium", joined: "03/01/2026", sessions: 45, spent: "18.9M", status: "active", avatar: "HH" },
  { id: "U-10016", name: "Trần Thị Bình", email: "thibinh@example.com", phone: "0956 789 012", plan: "Pro", joined: "28/01/2026", sessions: 12, spent: "2.8M", status: "active", avatar: "TB" },
  { id: "U-10015", name: "Lê Minh Khoa", email: "minhkhoa@example.com", phone: "0967 890 123", plan: "Free", joined: "20/02/2026", sessions: 5, spent: "1.0M", status: "active", avatar: "LK" },
  { id: "U-10014", name: "Bùi Quỳnh Anh", email: "quynh@example.com", phone: "0978 901 234", plan: "Premium", joined: "05/03/2026", sessions: 2, spent: "400K", status: "active", avatar: "BQ" },
];

const coaches = [
  { id: "C-2021", name: "Trần Văn Đức", email: "hlv@demo.com", phone: "0901 111 222", plan: "Pro Coach", sport: "Thể hình", joined: "01/10/2025", students: 24, revenue: "15.6M", rating: 4.9, verified: true, status: "active", avatar: "TĐ" },
  { id: "C-2020", name: "Lê Thị Hương", email: "lehuong@example.com", phone: "0912 222 333", plan: "Starter", sport: "Yoga", joined: "15/11/2025", students: 8, revenue: "4.2M", rating: 4.7, verified: true, status: "active", avatar: "LH" },
  { id: "C-2019", name: "Nguyễn Hữu Nam", email: "huunam@example.com", phone: "0923 333 444", plan: "Elite Coach", sport: "Bơi lội", joined: "20/08/2025", students: 52, revenue: "38.4M", rating: 5.0, verified: true, status: "active", avatar: "NN" },
  { id: "C-2018", name: "Bùi Thị Mai", email: "thimai@example.com", phone: "0934 444 555", plan: "Starter", sport: "Chạy bộ", joined: "12/12/2025", students: 6, revenue: "2.1M", rating: 4.5, verified: false, status: "pending", avatar: "BM" },
  { id: "C-2017", name: "Vũ Đình Khoa", email: "dinhkhoa@example.com", phone: "0945 555 666", plan: "Elite Coach", sport: "Tennis", joined: "05/09/2025", students: 61, revenue: "44.2M", rating: 4.8, verified: true, status: "active", avatar: "VK" },
  { id: "C-2016", name: "Phạm Thị Thảo", email: "thithao@example.com", phone: "0956 666 777", plan: "Pro Coach", sport: "Cầu lông", joined: "10/01/2026", students: 18, revenue: "9.8M", rating: 4.6, verified: true, status: "active", avatar: "PT" },
  { id: "C-2015", name: "Đinh Văn Hùng", email: "vanhung@example.com", phone: "0967 777 888", plan: "Starter", sport: "Boxing", joined: "22/02/2026", students: 4, revenue: "1.2M", rating: 4.3, verified: false, status: "pending", avatar: "DH" },
  { id: "C-2014", name: "Cao Thị Linh", email: "thilinh@example.com", phone: "0978 888 999", plan: "Pro Coach", sport: "Thể hình", joined: "15/02/2026", students: 15, revenue: "7.5M", rating: 4.7, verified: true, status: "suspended", avatar: "CL" },
];

const planBadge: Record<string, string> = {
  Free: "bg-gray-100 text-gray-600",
  Pro: "bg-blue-100 text-blue-600",
  Premium: "bg-violet-100 text-violet-600",
  Starter: "bg-gray-100 text-gray-600",
  "Pro Coach": "bg-blue-100 text-blue-600",
  "Elite Coach": "bg-violet-100 text-violet-600",
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-600",
  pending: "bg-amber-100 text-amber-600",
  suspended: "bg-red-100 text-red-500",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  pending: "Chờ duyệt",
  suspended: "Bị khóa",
};

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`} style={{ fontSize: "0.72rem", fontWeight: 800 }}>
      {initials}
    </div>
  );
}

const avatarColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500", "bg-cyan-500", "bg-rose-500", "bg-amber-500", "bg-indigo-500"];

export function AdminUsers() {
  const [tab, setTab] = useState<"learner" | "coach">("learner");
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const isLearner = tab === "learner";
  const data = isLearner ? learners : coaches;

  const filtered = data.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.plan === filterPlan;
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">Quản lý người dùng</div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">Danh sách học viên và huấn luyện viên trên nền tảng</div>
        </div>
        <button className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng học viên", value: "12,453", sub: "+218 tháng này", color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Tổng HLV", value: "2,847", sub: "+45 tháng này", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "HLV chờ duyệt", value: "12", sub: "Cần xét duyệt ngay", color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Tài khoản bị khóa", value: "38", sub: "Vi phạm điều khoản", color: "text-red-500", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div style={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1 }} className={`${s.color} mb-0.5`}>{s.value}</div>
            <div style={{ fontWeight: 600, fontSize: "0.82rem" }} className="text-gray-700">{s.label}</div>
            <div style={{ fontSize: "0.72rem" }} className="text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-50">
          {[{ id: "learner" as const, label: "Học viên", count: learners.length },
            { id: "coach" as const, label: "Huấn luyện viên", count: coaches.length }].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); setFilterPlan("all"); setFilterStatus("all"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${tab === t.id ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.65rem", fontWeight: 700 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email, ID..."
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
                : ["Starter", "Pro Coach", "Elite Coach"].map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}>
              <option value="all">Tất cả TT</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="suspended">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {(isLearner
                  ? ["ID", "Họ tên", "Email", "SĐT", "Gói", "Ngày tham gia", "Buổi học", "Chi tiêu", "Trạng thái", ""]
                  : ["ID", "Họ tên", "Email", "Gói", "Môn", "Học viên", "Doanh thu", "Đánh giá", "Verified", "Trạng thái", ""]
                ).map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ fontSize: "0.73rem", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400" style={{ fontSize: "0.88rem" }}>Không tìm thấy kết quả</td></tr>
              ) : filtered.map((u, idx) => (
                isLearner ? (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-400" style={{ fontSize: "0.72rem" }}>{u.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={(u as typeof learners[0]).avatar} color={avatarColors[idx % avatarColors.length]} />
                        <span style={{ fontSize: "0.87rem", fontWeight: 600 }} className="text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.8rem", color: "#6b7280" }}>{u.email}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.8rem", color: "#6b7280" }}>{(u as typeof learners[0]).phone}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${planBadge[u.plan]}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>{u.plan}</span>
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{(u as typeof learners[0]).joined}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>{(u as typeof learners[0]).sessions}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#059669" }}>{(u as typeof learners[0]).spent}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${statusBadge[u.status]}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>{statusLabel[u.status]}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-400" style={{ fontSize: "0.72rem" }}>{u.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={(u as typeof coaches[0]).avatar} color={avatarColors[idx % avatarColors.length]} />
                        <span style={{ fontSize: "0.87rem", fontWeight: 600 }} className="text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.8rem", color: "#6b7280" }}>{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${planBadge[u.plan]}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>{u.plan}</span>
                    </td>
                    <td className="px-4 py-3.5"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.72rem" }}>{(u as typeof coaches[0]).sport}</span></td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>{(u as typeof coaches[0]).students}</td>
                    <td className="px-4 py-3.5" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#059669" }}>{(u as typeof coaches[0]).revenue}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-gray-800">{(u as typeof coaches[0]).rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {(u as typeof coaches[0]).verified
                        ? <span className="flex items-center gap-1 text-emerald-600" style={{ fontSize: "0.75rem", fontWeight: 600 }}><Shield className="w-3.5 h-3.5" />Đã xác minh</span>
                        : <span className="flex items-center gap-1 text-amber-500" style={{ fontSize: "0.75rem", fontWeight: 600 }}><ShieldOff className="w-3.5 h-3.5" />Chờ duyệt</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full ${statusBadge[u.status]}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>{statusLabel[u.status]}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50">
          <span style={{ fontSize: "0.78rem" }} className="text-gray-400">{filtered.length} kết quả</span>
        </div>
      </div>
    </div>
  );
}