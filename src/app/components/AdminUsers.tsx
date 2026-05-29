import { useState, useEffect } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Star,
  Eye,
  Ban,
  Crown,
  Zap,
  Package,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  deleteAdminUser,
  fetchAdminUser,
  fetchAdminUsers,
  AdminUser,
  fetchAdminOverview,
  DashboardOverview,
  updateAdminUserStatus,
} from "../api/admin";

// Thay thế mock learners và coaches bằng state quản lý dữ liệu từ API
// Tuy nhiên vẫn giữ dummy data mảng trống ban đầu
const learners: any[] = [];
const coaches: any[] = [];

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
    <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}
      style={{ fontSize: "0.72rem", fontWeight: 800 }}
    >
      {initials}
    </div>
  );
}

const avatarColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
];

export function AdminUsers() {
  const [tab, setTab] = useState<"all" | "learner" | "coach">("all");
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userActionError, setUserActionError] = useState("");

  const isLearner = tab !== "coach";

  // Thêm function tải data
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const role =
        tab === "learner" ? "TRAINEES" : tab === "coach" ? "COACHES" : undefined;
      const res = await fetchAdminUsers({
        role,
        keyword: search || undefined,
        status:
          filterStatus === "active"
            ? "ACTIVE"
            : filterStatus === "suspended"
              ? "INACTIVE"
              : undefined,
        size: 50,
      });
      if (res && res.content) {
        setUsers(tab === "all" ? res.content.filter((u) => u.role !== "ADMIN") : res.content);
      } else {
        setUsers([]);
      }
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const res = await fetchAdminOverview();
      if (res) {
        setStats(res);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    // Debounce cho search
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [tab, search, filterStatus, filterPlan]);

  // filtered array (chỉ sử dụng cho filter frontend nếu cần, hiện tại API đang filter)
  const formatMoney = (value?: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const filtered = users.map((u) => ({
    id: `U-${u.id}`,
    name: u.fullName || u.username || "N/A",
    email: u.email || "N/A",
    phone: u.phone || "N/A",
    plan: u.subscriptionPlanName || "Free",
    joined: new Date(u.createdAt).toLocaleDateString("vi-VN"),
    sessions: u.totalSessions || 0,
    spent: formatMoney(u.totalSpent),
    status: u.active ? "active" : "suspended",
    sport: "N/A",
    students: u.totalStudents || 0,
    revenue: formatMoney(u.totalRevenue),
    rating: 5.0,
    verified: u.active,
    avatar: (u.fullName?.[0] || u.username?.[0] || "U").toUpperCase(),
  }));

  const handleUpdateStatus = async (
    idToUpdate: number,
    currentActive: boolean,
  ) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn ${currentActive ? "khóa" : "mở khóa"} tài khoản này?`,
      )
    ) {
      try {
        await updateAdminUserStatus(idToUpdate, !currentActive);
        await loadUsers();
      } catch (e) {
        setUserActionError(e instanceof Error ? e.message : "Cập nhật trạng thái thất bại.");
      }
    }
  };

  const handleViewUser = async (id: number) => {
    setUserActionError("");
    try {
      const user = await fetchAdminUser(id);
      setSelectedUser(user);
    } catch (e) {
      setUserActionError(e instanceof Error ? e.message : "Không tải được chi tiết người dùng.");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?")) return;
    setUserActionError("");
    try {
      await deleteAdminUser(id);
      await loadUsers();
      await loadOverview();
    } catch (e) {
      setUserActionError(e instanceof Error ? e.message : "Không thể vô hiệu hóa tài khoản.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div
            style={{ fontWeight: 800, fontSize: "1.1rem" }}
            className="text-gray-900"
          >
            Quản lý người dùng
          </div>
          <div style={{ fontSize: "0.8rem" }} className="text-gray-400 mt-0.5">
            Danh sách học viên và huấn luyện viên trên nền tảng
          </div>
        </div>
        <button
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          style={{ fontSize: "0.82rem", fontWeight: 700 }}
        >
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      {userActionError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-600" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          {userActionError}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng học viên",
            value: stats?.totalTrainees?.toLocaleString() || "0",
            sub: "Trên hệ thống",
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Tổng HLV",
            value: stats?.totalCoaches?.toLocaleString() || "0",
            sub: "Trên hệ thống",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Tổng tài khoản",
            value: stats?.totalUsers?.toLocaleString() || "0",
            sub: "Mọi vai trò",
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Hoa hồng nền tảng",
            value: (stats?.platformCommission || 0).toLocaleString() + "đ",
            sub: "Doanh thu",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div
              style={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1 }}
              className={`${s.color} mb-0.5`}
            >
              {s.value}
            </div>
            <div
              style={{ fontWeight: 600, fontSize: "0.82rem" }}
              className="text-gray-700"
            >
              {s.label}
            </div>
            <div
              style={{ fontSize: "0.72rem" }}
              className="text-gray-400 mt-0.5"
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-50">
          {[
            {
              id: "all" as const,
              label: "Tất cả",
              count: (stats?.totalTrainees || 0) + (stats?.totalCoaches || 0),
            },
            {
              id: "learner" as const,
              label: "Học viên",
              count: tab === "learner" ? users.length : stats?.totalTrainees || 0,
            },
            {
              id: "coach" as const,
              label: "Huấn luyện viên",
              count: tab === "coach" ? users.length : stats?.totalCoaches || 0,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSearch("");
                setFilterPlan("all");
                setFilterStatus("all");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${tab === t.id ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              style={{ fontSize: "0.85rem", fontWeight: 600 }}
            >
              {t.label}
              <span
                className={`px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-gray-100 text-gray-600"}`}
                style={{ fontSize: "0.65rem", fontWeight: 700 }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, email, ID..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-all"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}
            >
              <option value="all">Tất cả gói</option>
              {isLearner
                ? ["Free", "Pro", "Premium"].map((p) => (
                    <option key={p}>{p}</option>
                  ))
                : ["Starter", "Pro Coach", "Elite Coach"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-gray-50 cursor-pointer"
              style={{ fontSize: "0.82rem" }}
            >
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
                  ? [
                      "ID",
                      "Họ tên",
                      "Email",
                      "SĐT",
                      "Gói",
                      "Ngày tham gia",
                      "Buổi học",
                      "Chi tiêu",
                      "Trạng thái",
                      "",
                    ]
                  : [
                      "ID",
                      "Họ tên",
                      "Email",
                      "Gói",
                      "Môn",
                      "Học viên",
                      "Doanh thu",
                      "Đánh giá",
                      "Verified",
                      "Trạng thái",
                      "",
                    ]
                ).map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left whitespace-nowrap"
                    style={{
                      fontSize: "0.73rem",
                      fontWeight: 700,
                      color: "#6b7280",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-12 text-gray-400"
                    style={{ fontSize: "0.88rem" }}
                  >
                    Không tìm thấy kết quả
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) =>
                  isLearner ? (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td
                        className="px-4 py-3.5 font-mono text-gray-400"
                        style={{ fontSize: "0.72rem" }}
                      >
                        {u.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={u.avatar}
                            color={avatarColors[idx % avatarColors.length]}
                          />
                          <span
                            style={{ fontSize: "0.87rem", fontWeight: 600 }}
                            className="text-gray-900"
                          >
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{ fontSize: "0.8rem", color: "#6b7280" }}
                      >
                        {u.email}
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{ fontSize: "0.8rem", color: "#6b7280" }}
                      >
                        {u.phone}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full ${planBadge[u.plan] || "bg-gray-100 text-gray-600"}`}
                          style={{ fontSize: "0.72rem", fontWeight: 700 }}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{ fontSize: "0.78rem", color: "#9ca3af" }}
                      >
                        {u.joined}
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {u.sessions}
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#059669",
                        }}
                      >
                        {u.spent}
                      </td>
                      <td
                        className="px-4 py-3.5 cursor-pointer"
                        onClick={() =>
                          handleUpdateStatus(
                            parseInt(u.id.split("-")[1]),
                            u.status === "active",
                          )
                        }
                      >
                        <span
                          className={`px-2 py-0.5 rounded-full ${statusBadge[u.status]}`}
                          style={{ fontSize: "0.7rem", fontWeight: 700 }}
                        >
                          {statusLabel[u.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => void handleViewUser(parseInt(u.id.split("-")[1]))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Xem chi tiet">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => void handleDeleteUser(parseInt(u.id.split("-")[1]))} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Vo hieu hoa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td
                        className="px-4 py-3.5 font-mono text-gray-400"
                        style={{ fontSize: "0.72rem" }}
                      >
                        {u.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={u.avatar}
                            color={avatarColors[idx % avatarColors.length]}
                          />
                          <span
                            style={{ fontSize: "0.87rem", fontWeight: 600 }}
                            className="text-gray-900"
                          >
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{ fontSize: "0.8rem", color: "#6b7280" }}
                      >
                        {u.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full ${planBadge[u.plan] || "bg-gray-100 text-gray-600"}`}
                          style={{ fontSize: "0.72rem", fontWeight: 700 }}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg"
                          style={{ fontSize: "0.72rem" }}
                        >
                          {u.sport}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {u.students}
                      </td>
                      <td
                        className="px-4 py-3.5"
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "#059669",
                        }}
                      >
                        {u.revenue}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span
                            style={{ fontSize: "0.85rem", fontWeight: 700 }}
                            className="text-gray-800"
                          >
                            {u.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {u.verified ? (
                          <span
                            className="flex items-center gap-1 text-emerald-600"
                            style={{ fontSize: "0.75rem", fontWeight: 600 }}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Đã xác minh
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-amber-500"
                            style={{ fontSize: "0.75rem", fontWeight: 600 }}
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                            Chờ duyệt
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3.5 cursor-pointer"
                        onClick={() =>
                          handleUpdateStatus(
                            parseInt(u.id.split("-")[1]),
                            u.status === "active",
                          )
                        }
                      >
                        <span
                          className={`px-2 py-0.5 rounded-full ${statusBadge[u.status]}`}
                          style={{ fontSize: "0.7rem", fontWeight: 700 }}
                        >
                          {statusLabel[u.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => void handleViewUser(parseInt(u.id.split("-")[1]))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Xem chi tiet">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => void handleDeleteUser(parseInt(u.id.split("-")[1]))} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Vo hieu hoa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50">
          <span style={{ fontSize: "0.78rem" }} className="text-gray-400">
            {filtered.length} kết quả
          </span>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-gray-900" style={{ fontSize: "1rem", fontWeight: 800 }}>{selectedUser.fullName || selectedUser.username}</div>
                <div className="text-gray-400" style={{ fontSize: "0.8rem" }}>USER-{selectedUser.id} Â· {selectedUser.role}</div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 rounded-xl bg-gray-50 p-4">
              {[
                ["Email", selectedUser.email],
                ["Phone", selectedUser.phone || "-"],
                ["Status", selectedUser.active ? "Active" : "Inactive"],
                ["Plan", selectedUser.subscriptionPlanName || "Free"],
                ["Created", new Date(selectedUser.createdAt).toLocaleString("vi-VN")],
                ["Sessions", String(selectedUser.totalSessions || 0)],
                ["Spent", formatMoney(selectedUser.totalSpent)],
                ["Revenue", formatMoney(selectedUser.totalRevenue)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-gray-500" style={{ fontSize: "0.78rem" }}>{label}</span>
                  <span className="text-gray-900 text-right" style={{ fontSize: "0.82rem", fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => void handleUpdateStatus(selectedUser.id, selectedUser.active)} className="flex-1 rounded-xl bg-gray-900 py-2.5 text-white" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                {selectedUser.active ? "Khoa tai khoan" : "Mo khoa"}
              </button>
              <button onClick={() => void handleDeleteUser(selectedUser.id)} className="flex-1 rounded-xl bg-red-50 py-2.5 text-red-600" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                Vo hieu hoa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
