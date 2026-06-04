import { useCallback, useEffect, useState, useTransition } from "react";
import { useLocation, useNavigate } from "react-router";
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
import { NotificationBell } from "../components/NotificationBell";
import { clearAuthSession, getAuthSession } from "../utils/authSession";
import { logoutAccount } from "../api/auth";
import { DashboardOverview, fetchAdminOverview } from "../api/admin";
import {
  fetchAdminPlatformSettings,
  updateAdminCommissionRates,
  updateAdminSubscriptionPrices,
} from "../api/platformSettings";
import { getNotificationUnreadCount } from "../api/notifications";
import type {
  AdminCommissionSettings,
  AdminPlatformInfo,
  AdminSubscriptionPrices,
} from "../types/platformSettings";

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

const ADMIN_TAB_IDS = [
  "overview",
  "users",
  "transactions",
  "subscriptions",
  "finance",
  "settings",
];

const ADMIN_DASHBOARD_PATH = "/dashboard/admin";
const ADMIN_NAV_IDS = new Set(ADMIN_TAB_IDS);

function getAdminViewFromPath(pathname: string) {
  const suffix = pathname.slice(ADMIN_DASHBOARD_PATH.length).replace(/^\/+/, "");
  const view = decodeURIComponent(suffix.split("/")[0] || "overview");
  return ADMIN_NAV_IDS.has(view) ? view : "overview";
}
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
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(() => getAdminViewFromPath(location.pathname));
  const [mountedTabs, setMountedTabs] = useState<Record<string, boolean>>(() => ({ overview: true, [getAdminViewFromPath(location.pathname)]: true }));
  const [, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const session = getAuthSession();
  const adminName = session?.fullName?.trim() || session?.username || "Quản trị viên";
  const adminInitials = adminName
    .split(/\s+/)
    .slice(-2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();
  const logout = async () => {
    try {
      await logoutAccount();
    } catch {
      // Local session cleanup is still required if the server logout request fails.
    }
    clearAuthSession();
    navigate("/auth");
  };

  useEffect(() => {
    fetchAdminOverview()
      .then(setOverview)
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    getNotificationUnreadCount()
      .then((result) => setNotificationCount(result.unreadCount))
      .catch(() => setNotificationCount(0));
  }, []);

  useEffect(() => {
    const timers = ADMIN_TAB_IDS
      .filter((id) => id !== "overview")
      .map((id, index) =>
        window.setTimeout(() => {
          startTransition(() => {
            setMountedTabs((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
          });
        }, 500 + index * 250),
      );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [startTransition]);

  const mountTab = useCallback((id: string) => {
    startTransition(() => {
      setMountedTabs((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    });
  }, [startTransition]);

  useEffect(() => {
    const nextView = getAdminViewFromPath(location.pathname);
    setActiveNav(nextView);
    mountTab(nextView);
  }, [location.pathname, mountTab]);

  const navigateTab = useCallback((id: string) => {
    const nextView = ADMIN_NAV_IDS.has(id) ? id : "overview";
    setActiveNav(nextView);
    setSidebarOpen(false);
    navigate(nextView === "overview" ? ADMIN_DASHBOARD_PATH : `${ADMIN_DASHBOARD_PATH}/${nextView}`);
    window.requestAnimationFrame(() => mountTab(nextView));
  }, [mountTab, navigate]);

  const formatCompactMoney = (value?: number) => {
    const amount = value || 0;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M đ`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}K đ`;
    return `${amount.toLocaleString("vi-VN")}đ`;
  };

  const dynamicNavItems = navItems.map((item) => {
    if (item.id === "users") {
      return { ...item, badge: overview ? String((overview.totalTrainees || 0) + (overview.totalCoaches || 0)) : undefined };
    }
    if (item.id === "transactions") {
      return { ...item, badge: undefined };
    }
    return item;
  });

  const dynamicQuickStats = [
    {
      label: "Doanh thu hôm nay",
      value: formatCompactMoney(overview?.todayRevenue),
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      label: "Giao dịch hôm nay",
      value: (overview?.todayTransactions || 0).toLocaleString("vi-VN"),
      icon: Activity,
      color: "text-blue-400",
    },
    {
      label: "Tổng người dùng",
      value: ((overview?.totalTrainees || 0) + (overview?.totalCoaches || 0)).toLocaleString("vi-VN"),
      icon: Users,
      color: "text-violet-400",
    },
  ];

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
      sub: "Dữ liệu người dùng từ hệ thống",
    },
    transactions: {
      title: "Giao dịch học phí",
      sub: "Dữ liệu giao dịch học phí từ hệ thống",
    },
    subscriptions: {
      title: "Gói đăng ký",
      sub: "Dữ liệu gói đăng ký từ hệ thống",
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
              Coach<span className="text-rose-400">Finder</span>
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
              {adminInitials}
            </div>
            <div className="min-w-0">
              <div
                style={{ fontWeight: 700, fontSize: "0.85rem" }}
                className="text-white truncate"
              >
                {adminName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 animate-pulse" />
                <span
                  style={{ fontSize: "0.68rem" }}
                  className="text-rose-300"
                >
                  {session?.email || "Tài khoản quản trị"}
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
          {dynamicQuickStats.map((s) => (
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
          {dynamicNavItems.map(({ icon: Icon, label, id, badge }) => (
            <button
              key={id}
              onMouseEnter={() => mountTab(id)}
              onFocus={() => mountTab(id)}
              onClick={() => navigateTab(id)}
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
            onMouseEnter={() => mountTab("settings")}
            onFocus={() => mountTab("settings")}
            onClick={() => navigateTab("settings")}
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
            onClick={logout}
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
            <NotificationBell />
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
            <div className={activeNav === "overview" ? "block" : "hidden"}>
              {mountedTabs["overview"] && <AdminOverview />}
            </div>
            <div className={activeNav === "users" ? "block" : "hidden"}>
              {mountedTabs["users"] && <AdminUsers />}
            </div>
            <div className={activeNav === "transactions" ? "block" : "hidden"}>
              {mountedTabs["transactions"] && <AdminTransactions />}
            </div>
            <div className={activeNav === "subscriptions" ? "block" : "hidden"}>
              {mountedTabs["subscriptions"] && <AdminSubscriptions />}
            </div>
            <div className={activeNav === "finance" ? "block" : "hidden"}>
              {mountedTabs["finance"] && <AdminFinance />}
            </div>
            <div className={activeNav === "settings" ? "block" : "hidden"}>
              {mountedTabs["settings"] && <AdminSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const [commission, setCommission] = useState<AdminCommissionSettings>({
    starter: 0,
    proCoach: 0,
    eliteCoach: 0,
  });
  const [prices, setPrices] = useState<AdminSubscriptionPrices>({
    trainee: { free: 0, pro: 0, premium: 0 },
    coach: { starter: 0, proCoach: 0, eliteCoach: 0 },
  });
  const [platformInfo, setPlatformInfo] = useState<AdminPlatformInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCommission, setSavingCommission] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchAdminPlatformSettings()
      .then((settings) => {
        if (!mounted) return;
        setCommission(settings.commissionRates);
        setPrices(settings.subscriptionPrices);
        setPlatformInfo(settings.platformInfo);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Không tải được cài đặt nền tảng.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatNumber = (value?: number | null) => (value ?? 0).toLocaleString("vi-VN");

  const saveCommission = async () => {
    setSavingCommission(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateAdminCommissionRates(commission);
      setCommission(updated);
      setMessage("Đã lưu tỉ lệ hoa hồng.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu tỉ lệ hoa hồng thất bại.");
    } finally {
      setSavingCommission(false);
    }
  };

  const savePrices = async () => {
    setSavingPrices(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateAdminSubscriptionPrices(prices);
      setPrices(updated);
      setMessage("Đã lưu giá gói đăng ký.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu giá gói thất bại.");
    } finally {
      setSavingPrices(false);
    }
  };

  const commissionRows = [
    { label: "Starter", key: "starter" as const, value: commission.starter, color: "border-gray-200", accent: "text-gray-600" },
    { label: "Pro Coach", key: "proCoach" as const, value: commission.proCoach, color: "border-blue-200", accent: "text-blue-600" },
    { label: "Elite Coach", key: "eliteCoach" as const, value: commission.eliteCoach, color: "border-violet-200", accent: "text-violet-600" },
  ];

  const traineePriceRows = [
    { label: "Free", key: "free" as const, value: prices.trainee.free },
    { label: "Pro", key: "pro" as const, value: prices.trainee.pro },
    { label: "Premium", key: "premium" as const, value: prices.trainee.premium },
  ];

  const coachPriceRows = [
    { label: "Starter", key: "starter" as const, value: prices.coach.starter },
    { label: "Pro Coach", key: "proCoach" as const, value: prices.coach.proCoach },
    { label: "Elite Coach", key: "eliteCoach" as const, value: prices.coach.eliteCoach },
  ];

  const platformRows = platformInfo
    ? [
        { label: "Tên nền tảng", value: platformInfo.platformName },
        { label: "Phiên bản", value: platformInfo.version },
        { label: "Môi trường", value: platformInfo.environment },
        { label: "Múi giờ", value: platformInfo.timezone },
        { label: "Tổng người dùng", value: formatNumber(platformInfo.totalUsers) },
        { label: "Uptime tháng này", value: `${platformInfo.monthlyUptime}%` },
        { label: "Số dư ví admin", value: `${formatNumber(platformInfo.adminWalletBalance)}đ` },
        {
          label: "Cập nhật gần nhất",
          value: platformInfo.lastUpdatedAt
            ? new Date(platformInfo.lastUpdatedAt).toLocaleString("vi-VN")
            : "-",
        },
      ]
    : [{ label: "Trạng thái", value: loading ? "Đang tải" : "Chưa có dữ liệu" }];

  return (
    <div className="space-y-5 max-w-3xl">
      <div style={{ fontWeight: 800, fontSize: "1.1rem" }} className="text-gray-900">
        Cài đặt nền tảng
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-gray-500" style={{ fontSize: "0.85rem" }}>
          Đang tải cài đặt...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Tỉ lệ hoa hồng</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">Điều chỉnh hoa hồng theo gói HLV</div>
        </div>
        <div className="p-5 space-y-4">
          {commissionRows.map((row) => (
            <div key={row.key} className={`flex items-center justify-between p-4 rounded-xl border-2 ${row.color} bg-gray-50`}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }} className="text-gray-800">{row.label}</div>
                <div style={{ fontSize: "0.75rem" }} className="text-gray-500">Hoa hồng trên mỗi giao dịch</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={row.value}
                  min={0}
                  max={100}
                  disabled={loading || savingCommission}
                  onChange={(event) => setCommission(prev => ({ ...prev, [row.key]: Number(event.target.value) }))}
                  className={`w-20 text-center py-2 px-3 border-2 rounded-xl outline-none font-bold ${row.color} bg-white disabled:opacity-60`}
                  style={{ fontSize: "1rem" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className={row.accent}>%</span>
              </div>
            </div>
          ))}
          <button
            onClick={saveCommission}
            disabled={loading || savingCommission}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors"
            style={{ fontSize: "0.85rem", fontWeight: 700 }}
          >
            {savingCommission ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900">Giá gói đăng ký</div>
          <div style={{ fontSize: "0.78rem" }} className="text-gray-400 mt-0.5">Cập nhật giá gói học viên và HLV</div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700 mb-3">Gói học viên</div>
              {traineePriceRows.map((row) => (
                <PriceInputRow
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  disabled={loading || savingPrices}
                  onChange={(value) => setPrices(prev => ({ ...prev, trainee: { ...prev.trainee, [row.key]: value } }))}
                />
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }} className="text-gray-700 mb-3">Gói HLV</div>
              {coachPriceRows.map((row) => (
                <PriceInputRow
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  disabled={loading || savingPrices}
                  onChange={(value) => setPrices(prev => ({ ...prev, coach: { ...prev.coach, [row.key]: value } }))}
                />
              ))}
            </div>
          </div>
          <button
            onClick={savePrices}
            disabled={loading || savingPrices}
            className="mt-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors"
            style={{ fontSize: "0.85rem", fontWeight: 700 }}
          >
            {savingPrices ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-gray-900 mb-4">Thông tin nền tảng</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {platformRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
              <span style={{ fontSize: "0.82rem" }} className="text-gray-500">{row.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }} className="text-gray-800 text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceInputRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }} className="text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          min={0}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-28 text-right py-1.5 px-3 border-2 border-gray-200 rounded-xl outline-none text-gray-800 bg-gray-50 disabled:opacity-60"
          style={{ fontSize: "0.85rem" }}
        />
        <span style={{ fontSize: "0.8rem" }} className="text-gray-400">d/th</span>
      </div>
    </div>
  );
}

// ── Settings placeholder ───────────────────────────────────────────────────────
function AdminSettingsPlaceholder() {
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

