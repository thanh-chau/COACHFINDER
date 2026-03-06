import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  ChevronDown,
  TrendingUp,
  Package,
  AlertCircle,
  Zap,
  Search,
  Activity,
} from "lucide-react";
import { AdminOverview } from "../components/AdminOverview";
import { AdminTransactions } from "../components/AdminTransactions";
import { AdminSubscriptions } from "../components/AdminSubscriptions";
import { AdminUsers } from "../components/AdminUsers";
import { AdminFinance } from "../components/AdminFinance";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", id: "overview" },
  {
    icon: Users,
    label: "Người dùng",
    id: "users",
    badge: "12",
  },
  {
    icon: DollarSign,
    label: "Giao dịch học phí",
    id: "transactions",
    badge: "Mới",
  },
  {
    icon: CreditCard,
    label: "Gói đăng ký",
    id: "subscriptions",
  },
  {
    icon: BarChart2,
    label: "Báo cáo tài chính",
    id: "finance",
  },
];

const quickStats = [
  {
    label: "Doanh thu hôm nay",
    value: "28.4M đ",
    icon: DollarSign,
    color: "text-emerald-400",
  },
  {
    label: "Giao dịch hôm nay",
    value: "342",
    icon: Activity,
    color: "text-blue-400",
  },
  {
    label: "Người dùng online",
    value: "1,247",
    icon: Users,
    color: "text-violet-400",
  },
];

export function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const pageTitles: Record<
    string,
    { title: string; sub: string }
  > = {
    overview: {
      title: "Tổng quan hệ thống",
      sub: "Thứ Sáu, 6 tháng 3, 2026 · CoachFinder Admin",
    },
    users: {
      title: "Quản lý người dùng",
      sub: "12,453 học viên · 2,847 HLV · 12 chờ duyệt",
    },
    transactions: {
      title: "Giao dịch học phí",
      sub: "8,234 giao dịch tháng 3 · Hoa hồng: 67.8M đ",
    },
    subscriptions: {
      title: "Gói đăng ký",
      sub: "Free/Pro/Premium · Starter/Pro Coach/Elite Coach",
    },
    finance: {
      title: "Báo cáo tài chính",
      sub: "Tháng 3/2026 · Tổng doanh thu: 220M đ",
    },
    settings: {
      title: "Cài đặt nền tảng",
      sub: "Cấu hình hệ thống & thông số",
    },
  };

  const current = pageTitles[activeNav] ?? pageTitles.overview;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`
        fixed lg:relative z-40 flex flex-col h-full transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          width: 256,
          minWidth: 256,
          background:
            "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/50">
            <Shield className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
              }}
              className="text-white"
            >
              Coach<span className="text-rose-400">Hub</span>
            </div>
            <div
              style={{ fontSize: "0.62rem", fontWeight: 600 }}
              className="text-rose-300 uppercase tracking-wider"
            >
              Admin Panel
            </div>
          </div>
          <button
            className="ml-auto lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin card */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-3.5 py-3 border border-white/[0.06]">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shrink-0"
              style={{ fontSize: "0.75rem", fontWeight: 800 }}
            >
              AD
            </div>
            <div className="min-w-0">
              <div
                style={{ fontWeight: 700, fontSize: "0.85rem" }}
                className="text-white truncate"
              >
                Super Admin
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 animate-pulse" />
                <span
                  style={{ fontSize: "0.68rem" }}
                  className="text-rose-300"
                >
                  admin@coachfinder.vn
                </span>
              </div>
            </div>
            <span
              className="ml-auto bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md"
              style={{ fontSize: "0.6rem", fontWeight: 700 }}
            >
              ROOT
            </span>
          </div>
        </div>

        {/* Quick stats in sidebar */}
        <div className="px-4 py-3 border-b border-white/[0.06] space-y-1.5">
          {quickStats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/5"
            >
              <div className="flex items-center gap-2">
                <s.icon
                  className={`w-3.5 h-3.5 ${s.color} shrink-0`}
                />
                <span
                  style={{ fontSize: "0.68rem" }}
                  className="text-gray-400"
                >
                  {s.label}
                </span>
              </div>
              <span
                style={{ fontSize: "0.75rem", fontWeight: 700 }}
                className="text-white"
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <div
            style={{ fontSize: "0.62rem", fontWeight: 700 }}
            className="text-gray-500 uppercase tracking-widest px-3.5 mb-2"
          >
            Quản lý
          </div>
          {navItems.map(({ icon: Icon, label, id, badge }) => (
            <button
              key={id}
              onClick={() => {
                setActiveNav(id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                activeNav === id
                  ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-900/30"
                  : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span
                style={{
                  fontSize: "0.84rem",
                  fontWeight: activeNav === id ? 600 : 500,
                }}
              >
                {label}
              </span>
              {badge && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 ${
                    activeNav === id
                      ? "bg-white/25 text-white"
                      : isNaN(Number(badge))
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                  }`}
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}

          <div
            style={{ fontSize: "0.62rem", fontWeight: 700 }}
            className="text-gray-500 uppercase tracking-widest px-3.5 mt-5 mb-2"
          >
            Hệ thống
          </div>
          <button
            onClick={() => setActiveNav("settings")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${activeNav === "settings" ? "bg-gradient-to-r from-rose-500 to-red-600 text-white" : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"}`}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            <span
              style={{
                fontSize: "0.84rem",
                fontWeight:
                  activeNav === "settings" ? 600 : 500,
              }}
            >
              Cài đặt
            </span>
          </button>
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span
              style={{ fontSize: "0.84rem", fontWeight: 500 }}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-3.5 flex items-center gap-4 shrink-0 sticky top-0 z-20">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "-0.01em",
              }}
              className="text-gray-900 truncate"
            >
              {current.title}
            </div>
            <div
              style={{ fontSize: "0.78rem" }}
              className="text-gray-400 truncate"
            >
              {current.sub}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div
              className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
              style={{ width: 220 }}
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                placeholder="Tìm kiếm..."
                className="bg-transparent outline-none w-full text-gray-600 placeholder-gray-400"
                style={{ fontSize: "0.82rem" }}
              />
            </div>
            {/* Alerts */}
            <button className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors">
              <Bell className="w-[18px] h-[18px] text-gray-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            {/* Admin badge */}
            <div className="hidden sm:flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <span
                style={{ fontSize: "0.78rem", fontWeight: 700 }}
                className="text-rose-600"
              >
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6 max-w-[1440px] mx-auto w-full">
            {activeNav === "overview" && <AdminOverview />}
            {activeNav === "users" && <AdminUsers />}
            {activeNav === "transactions" && (
              <AdminTransactions />
            )}
            {activeNav === "subscriptions" && (
              <AdminSubscriptions />
            )}
            {activeNav === "finance" && <AdminFinance />}
            {activeNav === "settings" && <AdminSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings placeholder ───────────────────────────────────────────────────────
function AdminSettings() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div
        style={{ fontWeight: 800, fontSize: "1.1rem" }}
        className="text-gray-900"
      >
        Cài đặt nền tảng
      </div>

      {/* Commission settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div
            style={{ fontWeight: 700, fontSize: "0.95rem" }}
            className="text-gray-900"
          >
            Tỉ lệ hoa hồng
          </div>
          <div
            style={{ fontSize: "0.78rem" }}
            className="text-gray-400 mt-0.5"
          >
            Điều chỉnh hoa hồng theo gói HLV
          </div>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              plan: "Starter",
              rate: 20,
              color: "border-gray-200",
              accent: "text-gray-600",
            },
            {
              plan: "Pro Coach",
              rate: 12,
              color: "border-blue-200",
              accent: "text-blue-600",
            },
            {
              plan: "Elite Coach",
              rate: 0,
              color: "border-violet-200",
              accent: "text-violet-600",
            },
          ].map((p) => (
            <div
              key={p.plan}
              className={`flex items-center justify-between p-4 rounded-xl border-2 ${p.color} bg-gray-50`}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                  className="text-gray-800"
                >
                  {p.plan}
                </div>
                <div
                  style={{ fontSize: "0.75rem" }}
                  className="text-gray-500"
                >
                  Hoa hồng hiện tại trên mỗi giao dịch
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  defaultValue={p.rate}
                  min={0}
                  max={50}
                  className={`w-20 text-center py-2 px-3 border-2 rounded-xl outline-none font-bold ${p.color} bg-white`}
                  style={{
                    fontSize: "1rem",
                    color:
                      p.accent
                        .replace("text-", "")
                        .replace("-600", "") === "gray"
                        ? "#4b5563"
                        : undefined,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                  className={p.accent}
                >
                  %
                </span>
              </div>
            </div>
          ))}
          <button
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            style={{ fontSize: "0.85rem", fontWeight: 700 }}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Plan pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div
            style={{ fontWeight: 700, fontSize: "0.95rem" }}
            className="text-gray-900"
          >
            Giá gói đăng ký
          </div>
          <div
            style={{ fontSize: "0.78rem" }}
            className="text-gray-400 mt-0.5"
          >
            Cập nhật giá gói học viên và HLV
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div
                style={{ fontWeight: 700, fontSize: "0.85rem" }}
                className="text-gray-700 mb-3"
              >
                Gói học viên
              </div>
              {[
                { name: "Free", price: 0 },
                { name: "Pro", price: 199000 },
                { name: "Premium", price: 499000 },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between mb-3"
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                    className="text-gray-700"
                  >
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      defaultValue={p.price}
                      className="w-28 text-right py-1.5 px-3 border-2 border-gray-200 rounded-xl outline-none text-gray-800 bg-gray-50"
                      style={{ fontSize: "0.85rem" }}
                    />
                    <span
                      style={{ fontSize: "0.8rem" }}
                      className="text-gray-400"
                    >
                      đ/th
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: "0.85rem" }}
                className="text-gray-700 mb-3"
              >
                Gói HLV
              </div>
              {[
                { name: "Starter", price: 0 },
                { name: "Pro Coach", price: 499000 },
                { name: "Elite Coach", price: 1490000 },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between mb-3"
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                    className="text-gray-700"
                  >
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      defaultValue={p.price}
                      className="w-28 text-right py-1.5 px-3 border-2 border-gray-200 rounded-xl outline-none text-gray-800 bg-gray-50"
                      style={{ fontSize: "0.85rem" }}
                    />
                    <span
                      style={{ fontSize: "0.8rem" }}
                      className="text-gray-400"
                    >
                      đ/th
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="mt-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            style={{ fontSize: "0.85rem", fontWeight: 700 }}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Platform info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div
          style={{ fontWeight: 700, fontSize: "0.95rem" }}
          className="text-gray-900 mb-4"
        >
          Thông tin nền tảng
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Tên nền tảng", value: "CoachFinder" },
            { label: "Phiên bản", value: "v2.4.1" },
            { label: "Môi trường", value: "Production" },
            {
              label: "Múi giờ",
              value: "Asia/Ho_Chi_Minh (UTC+7)",
            },
            { label: "Tổng người dùng", value: "15,300" },
            { label: "Uptime tháng này", value: "99.98%" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <span
                style={{ fontSize: "0.82rem" }}
                className="text-gray-500"
              >
                {f.label}
              </span>
              <span
                style={{ fontSize: "0.85rem", fontWeight: 700 }}
                className="text-gray-800"
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}