import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Activity,
  Building2,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addGymOwnerCoach,
  getGymOwnerBookings,
  getGymOwnerCoaches,
  getGymOwnerOverview,
  getGymOwnerProfile,
  getGymOwnerTransactions,
  removeGymOwnerCoach,
  updateGymOwnerProfile,
} from "../api/gymOwner";
import { logoutAccount } from "../api/auth";
import type { GymBooking, GymCoach, GymOverview, GymProfile, GymTransactions } from "../types/gymOwner";
import { clearAuthSession, getAuthSession } from "../utils/authSession";

const TABS = [
  { id: "overview", label: "Tong quan", icon: LayoutDashboard },
  { id: "coaches", label: "Coach cua toi", icon: Dumbbell },
  { id: "bookings", label: "Lich & booking", icon: CalendarDays },
  { id: "wallet", label: "Doanh thu & vi", icon: WalletCards },
  { id: "profile", label: "Ho so phong tap", icon: Building2 },
  { id: "feedback", label: "Danh gia web", icon: Activity },
  { id: "settings", label: "Cai dat", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];
const BASE_PATH = "/dashboard/gym-owner";
const money = (value?: number | null) => `${(value ?? 0).toLocaleString("vi-VN")}d`;

function getTabFromPath(pathname: string): TabId {
  const suffix = pathname.slice(BASE_PATH.length).replace(/^\/+/, "");
  const tab = suffix.split("/")[0] as TabId;
  return TABS.some((item) => item.id === tab) ? tab : "overview";
}

export function GymOwnerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overview, setOverview] = useState<GymOverview | null>(null);
  const [coaches, setCoaches] = useState<GymCoach[]>([]);
  const [bookings, setBookings] = useState<GymBooking[]>([]);
  const [transactions, setTransactions] = useState<GymTransactions | null>(null);
  const [profile, setProfile] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const session = getAuthSession();
  const ownerName = session?.fullName?.trim() || session?.username || "Gym owner";

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewData, coachRows, bookingRows, transactionRows, profileData] = await Promise.all([
        getGymOwnerOverview(),
        getGymOwnerCoaches(),
        getGymOwnerBookings(),
        getGymOwnerTransactions(0, 12),
        getGymOwnerProfile(),
      ]);
      setOverview(overviewData);
      setCoaches(coachRows);
      setBookings(bookingRows);
      setTransactions(transactionRows);
      setProfile(profileData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong tai duoc dashboard phong tap");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const openTab = (id: TabId) => {
    setSidebarOpen(false);
    navigate(id === "overview" ? BASE_PATH : `${BASE_PATH}/${id}`);
  };

  const logout = async () => {
    try {
      await logoutAccount();
    } catch {
      // Local cleanup still matters when the API request fails.
    }
    clearAuthSession();
    navigate("/auth");
  };

  const currentTitle = useMemo(() => {
    switch (activeTab) {
      case "coaches":
        return "Coach cua toi";
      case "bookings":
        return "Lich & booking";
      case "wallet":
        return "Doanh thu & vi";
      case "profile":
        return "Ho so phong tap";
      case "feedback":
        return "Danh gia web";
      case "settings":
        return "Cai dat";
      default:
        return "Tong quan phong tap";
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:relative z-40 h-full w-64 shrink-0 bg-slate-950 text-white transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-extrabold">Gym Partner</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">CoachFinder</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="truncate text-sm font-bold">{ownerName}</div>
            <div className="truncate text-xs text-slate-400">{profile?.name || session?.email}</div>
            <span className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
              {profile?.status || "PENDING"}
            </span>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => openTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                activeTab === id ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" />
            Dang xuat
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-5">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold text-slate-950">{currentTitle}</h1>
            <p className="truncate text-xs text-slate-500">Quan ly coach, booking va dong tien cua phong tap.</p>
          </div>
          <button onClick={() => void loadAll()} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Lam moi
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Dang tai du lieu...</div>}
          {!loading && activeTab === "overview" && <OverviewTab overview={overview} bookings={bookings} />}
          {!loading && activeTab === "coaches" && <CoachesTab coaches={coaches} onChanged={loadAll} />}
          {!loading && activeTab === "bookings" && <BookingsTab bookings={bookings} />}
          {!loading && activeTab === "wallet" && <WalletTab overview={overview} transactions={transactions} />}
          {!loading && activeTab === "profile" && <ProfileTab profile={profile} onSaved={loadAll} />}
          {!loading && activeTab === "feedback" && (
            <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-lg font-extrabold text-slate-950">Danh gia web</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Feedback web hien dang mo cho hoc vien va coach. Chu phong tap se duoc dua vao dot feedback doi tac rieng khi can.
              </p>
            </div>
          )}
          {!loading && activeTab === "settings" && <SettingsTab ownerName={ownerName} onLogout={logout} />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab({ overview, bookings }: { overview: GymOverview | null; bookings: GymBooking[] }) {
  const kpis = [
    { label: "Coach active", value: overview?.activeCoachCount ?? 0 },
    { label: "Booking thang nay", value: overview?.monthBookingCount ?? 0 },
    { label: "Doanh thu net", value: money(overview?.monthSettledRevenue) },
    { label: "So du vi", value: money(overview?.wallet?.balance) },
  ];
  return (
    <div className="space-y-5">
      {overview?.profile?.status !== "APPROVED" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Phong tap dang o trang thai {overview?.profile?.status}. Admin can duyet truoc khi them coach va nhan payout theo phong tap.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</div>
            <div className="mt-3 text-2xl font-extrabold text-slate-950">{item.value}</div>
          </div>
        ))}
      </div>
      <BookingsTable rows={bookings.slice(0, 8)} />
    </div>
  );
}

function CoachesTab({ coaches, onChanged }: { coaches: GymCoach[]; onChanged: () => Promise<void> }) {
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);

  const addCoach = async () => {
    if (!keyword.trim()) return;
    setSaving(true);
    try {
      const numericId = Number(keyword.trim());
      await addGymOwnerCoach(Number.isFinite(numericId) && numericId > 0 ? { coachProfileId: numericId } : { emailOrUsername: keyword.trim() });
      setKeyword("");
      toast.success("Da them coach vao phong tap");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong them duoc coach");
    } finally {
      setSaving(false);
    }
  };

  const removeCoach = async (coachProfileId: number) => {
    try {
      await removeGymOwnerCoach(coachProfileId);
      toast.success("Da go coach khoi phong tap");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong go duoc coach");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Nhap email, username hoac coachProfileId" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-400" />
        </div>
        <button onClick={addCoach} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          <Plus className="h-4 w-4" />
          Them coach
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {coaches.map((coach) => (
          <div key={coach.id} className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-extrabold text-emerald-600">
              {(coach.coachName || "C").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-slate-950">{coach.coachName || "Coach"}</div>
              <div className="truncate text-sm text-slate-500">{coach.coachEmail || coach.categoryName || "Chua co email"}</div>
            </div>
            <div className="hidden text-right text-sm text-slate-500 md:block">
              <div>{money(coach.price)}</div>
              <div>{coach.rating ? `${coach.rating.toFixed(1)} sao` : "Chua co rating"}</div>
            </div>
            <button onClick={() => removeCoach(coach.coachProfileId)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!coaches.length && <div className="p-8 text-center text-sm text-slate-500">Chua co coach nao trong phong tap.</div>}
      </div>
    </div>
  );
}

function BookingsTab({ bookings }: { bookings: GymBooking[] }) {
  return <BookingsTable rows={bookings} />;
}

function BookingsTable({ rows }: { rows: GymBooking[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4 font-extrabold text-slate-950">Booking gan day</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Coach</th>
              <th className="px-5 py-3">Hoc vien</th>
              <th className="px-5 py-3">Ngay gio</th>
              <th className="px-5 py-3">Trang thai</th>
              <th className="px-5 py-3 text-right">Net payout</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((booking) => (
              <tr key={booking.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-bold text-slate-900">{booking.coachName || "-"}</td>
                <td className="px-5 py-3 text-slate-600">{booking.traineeName || "-"}</td>
                <td className="px-5 py-3 text-slate-600">{booking.startDate} {booking.startTime?.slice(0, 5)}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{booking.status}</span></td>
                <td className="px-5 py-3 text-right font-bold text-emerald-600">{money(booking.coachPayoutAmount)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Chua co booking.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WalletTab({ overview, transactions }: { overview: GymOverview | null; transactions: GymTransactions | null }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-bold text-slate-500">So du vi phong tap</div>
        <div className="mt-3 text-3xl font-extrabold text-slate-950">{money(overview?.wallet?.balance)}</div>
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          Payout booking cua coach thuoc phong tap se ve vi nay sau khi tru phi he thong.
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 font-extrabold text-slate-950">Giao dich gan day</div>
        {transactions?.content?.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
            <div>
              <div className="font-bold text-slate-900">{tx.type}</div>
              <div className="text-sm text-slate-500">{tx.description || tx.referenceId || tx.createdAt}</div>
            </div>
            <div className={`font-extrabold ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>{money(tx.amount)}</div>
          </div>
        ))}
        {!transactions?.content?.length && <div className="p-8 text-center text-sm text-slate-500">Chua co giao dich.</div>}
      </div>
    </div>
  );
}

function ProfileTab({ profile, onSaved }: { profile: GymProfile | null; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    address: profile?.address || "",
    hotline: profile?.hotline || "",
    description: profile?.description || "",
    logoUrl: profile?.logoUrl || "",
    coverUrl: profile?.coverUrl || "",
  });

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      address: profile?.address || "",
      hotline: profile?.hotline || "",
      description: profile?.description || "",
      logoUrl: profile?.logoUrl || "",
      coverUrl: profile?.coverUrl || "",
    });
  }, [profile]);

  const save = async () => {
    try {
      await updateGymOwnerProfile(form);
      toast.success("Da luu ho so phong tap");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong luu duoc ho so");
    }
  };

  return (
    <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <div className="text-lg font-extrabold text-slate-950">{profile?.name || "Ho so phong tap"}</div>
        <div className="text-sm text-slate-500">Trang thai duyet: {profile?.status || "PENDING"}</div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {([
          ["name", "Ten phong tap"],
          ["hotline", "Hotline"],
          ["address", "Dia chi"],
          ["logoUrl", "Logo URL"],
          ["coverUrl", "Cover URL"],
        ] as const).map(([key, label]) => (
          <label key={key} className={key === "address" ? "md:col-span-2" : ""}>
            <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
            <input value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
          </label>
        ))}
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-bold text-slate-700">Mo ta</span>
          <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={5} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
        </label>
      </div>
      <button onClick={save} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white">
        <Save className="h-4 w-4" />
        Luu ho so
      </button>
    </div>
  );
}

function SettingsTab({ ownerName, onLogout }: { ownerName: string; onLogout: () => void }) {
  return (
    <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-lg font-extrabold text-slate-950">Tai khoan</div>
      <p className="mt-1 text-sm text-slate-500">{ownerName}</p>
      <button onClick={onLogout} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
        <LogOut className="h-4 w-4" />
        Dang xuat
      </button>
    </div>
  );
}
