import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  createWalletTopUp,
  getMyBankAccount,
  getMyWallet,
  getMyWalletTransactions,
  getWalletTopUpStatus,
  saveMyBankAccount,
  withdrawFromWallet,
} from "../api/wallet";
import type {
  Wallet,
  WalletBankAccount,
  WalletHistoryItem,
  WalletTopUp,
} from "../types/wallet";

type WalletPanelMode = "learner" | "coach";

interface WalletPanelProps {
  mode: WalletPanelMode;
  allowTopUp?: boolean;
  allowWithdraw?: boolean;
  allowBankAccount?: boolean;
}

const TRANSACTION_TYPES = [
  "TOP_UP",
  "WITHDRAWAL",
  "SUBSCRIPTION_PURCHASE",
  "SUBSCRIPTION_REVENUE",
  "BOOKING_PAYMENT",
  "BOOKING_COMMISSION",
  "BOOKING_COACH_PAYOUT",
  "REFUND",
  "ADJUSTMENT",
];

const STATUSES = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "REJECTED",
];

const formatMoney = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value: string) => new Date(value).toLocaleString("vi-VN");

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    TOP_UP: "Nạp tiền",
    WITHDRAWAL: "Rút tiền",
    SUBSCRIPTION_PURCHASE: "Mua gói dịch vụ",
    SUBSCRIPTION_REVENUE: "Doanh thu gói",
    BOOKING_PAYMENT: "Thanh toán lịch tập",
    BOOKING_COMMISSION: "Hoa hồng nền tảng",
    BOOKING_COACH_PAYOUT: "Doanh thu buổi tập",
    REFUND: "Hoàn tiền",
    ADJUSTMENT: "Điều chỉnh số dư",
  };
  return labels[type] ?? type.replaceAll("_", " ");
}

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    PENDING: "Chờ thanh toán",
    PROCESSING: "Đang xử lý",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    CANCELLED: "Đã hủy",
    EXPIRED: "Hết hạn",
    REJECTED: "Từ chối",
  };
  return status ? labels[status] ?? status : "Thành công";
}

function statusClass(status: string) {
  if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700";
  if (status === "PENDING" || status === "PROCESSING")
    return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function isCredit(transaction: WalletHistoryItem) {
  return transaction.amount >= 0;
}

function callbackUrl(mode: WalletPanelMode) {
  const path =
    mode === "coach"
      ? "/dashboard/coach/subscription"
      : "/dashboard/learner/subscription";
  return `${window.location.origin}${path}`;
}

export function WalletPanel({
  mode,
  allowTopUp = mode === "learner",
  allowWithdraw = mode === "coach",
  allowBankAccount = mode === "coach",
}: WalletPanelProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recent, setRecent] = useState<WalletHistoryItem[]>([]);
  const [bankAccount, setBankAccount] = useState<WalletBankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<WalletHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    from: "",
    to: "",
  });

  const [topUpAmount, setTopUpAmount] = useState("200000");
  const [topUp, setTopUp] = useState<WalletTopUp | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("500000");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branch: "",
  });

  const currency = wallet?.currency || "VND";
  const title = mode === "coach" ? "Ví HLV và thanh toán" : "Ví thanh toán";
  const recentRows = useMemo(() => recent.slice(0, 8), [recent]);

  const loadWallet = async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError(null);
    try {
      const [walletData, transactionPage, bankData] = await Promise.all([
        getMyWallet(),
        getMyWalletTransactions({ page: 0, size: 8 }),
        allowBankAccount
          ? getMyBankAccount().catch(() => null)
          : Promise.resolve(null),
      ]);
      setWallet(walletData);
      setRecent(transactionPage.content ?? []);
      setHistoryTotal(transactionPage.totalElements ?? 0);
      setBankAccount(bankData);
      if (bankData) {
        setBankForm({
          bankCode: bankData.bankCode || "",
          bankName: bankData.bankName || "",
          accountNumber: bankData.accountNumber || "",
          accountHolderName: bankData.accountHolderName || "",
          branch: bankData.branch || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu ví.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadWallet(true);
  }, []);

  useEffect(() => {
    if (!historyOpen) return;
    setHistoryLoading(true);
    setError(null);
    getMyWalletTransactions({
      type: filters.type || undefined,
      status: filters.status || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: historyPage,
      size: 10,
    })
      .then((result) => {
        setHistory(result.content ?? []);
        setHistoryTotal(result.totalElements ?? 0);
        setHistoryTotalPages(Math.max(result.totalPages ?? 1, 1));
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Không tải được lịch sử giao dịch.",
        ),
      )
      .finally(() => setHistoryLoading(false));
  }, [historyOpen, historyPage, filters]);

  const changeFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setHistoryPage(0);
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice("Số tiền nạp không hợp lệ.");
      return;
    }
    setTopUpLoading(true);
    setNotice(null);
    try {
      const url = callbackUrl(mode);
      setTopUp(
        await createWalletTopUp({ amount, returnUrl: url, cancelUrl: url }),
      );
      setNotice("Đã tạo yêu cầu nạp tiền.");
      await loadWallet();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không tạo được yêu cầu.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleCheckTopUp = async () => {
    if (!topUp) return;
    setTopUpLoading(true);
    try {
      const result = await getWalletTopUpStatus(topUp.orderCode);
      setTopUp(result);
      setNotice(`Trạng thái nạp tiền: ${statusLabel(result.status)}.`);
      await loadWallet();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không kiểm tra được trạng thái.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleSaveBank = async () => {
    if (
      !bankForm.bankCode ||
      !bankForm.bankName ||
      !bankForm.accountNumber ||
      !bankForm.accountHolderName
    ) {
      setNotice("Vui lòng nhập đủ thông tin ngân hàng.");
      return;
    }
    setBankSaving(true);
    try {
      const saved = await saveMyBankAccount({
        ...bankForm,
        branch: bankForm.branch || undefined,
      });
      setBankAccount(saved);
      setNotice("Đã lưu tài khoản ngân hàng.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không lưu được tài khoản.");
    } finally {
      setBankSaving(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount < 1000) {
      setNotice("Số tiền rút tối thiểu là 1.000đ.");
      return;
    }
    if (wallet && amount > wallet.balance) {
      setNotice("Số tiền rút vượt quá số dư ví.");
      return;
    }
    if (allowBankAccount && !bankAccount) {
      setNotice("Vui lòng lưu tài khoản ngân hàng trước khi rút tiền.");
      return;
    }
    setWithdrawLoading(true);
    try {
      await withdrawFromWallet(amount, withdrawNote.trim() || undefined);
      setNotice("Đã gửi yêu cầu rút tiền để admin xử lý.");
      await loadWallet();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không gửi được yêu cầu.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            Quản lý số dư và toàn bộ hoạt động liên quan đến tiền.
          </p>
        </div>
        <button
          onClick={() => loadWallet()}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {notice && (
        <div className="flex gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 p-5 text-white">
          <WalletIcon className="h-7 w-7 text-emerald-200" />
          <div className="mt-6 text-xs font-bold text-emerald-100">
            Số dư khả dụng
          </div>
          <div className="mt-1 text-2xl font-black">
            {loading ? "Đang tải..." : formatMoney(wallet?.balance ?? 0, currency)}
          </div>
          <div className="mt-5 border-t border-white/10 pt-3 text-sm text-emerald-100">
            {wallet?.ownerName || "Tài khoản hiện tại"}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-extrabold text-gray-900">Giao dịch gần đây</div>
            <button
              onClick={() => setHistoryOpen((value) => !value)}
              className="text-sm font-bold text-blue-600"
            >
              {historyOpen ? "Thu gọn" : `Xem tất cả (${historyTotal})`}
            </button>
          </div>
          {loading ? (
            <Loader2 className="mx-auto my-10 h-5 w-5 animate-spin text-gray-400" />
          ) : recentRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Chưa có giao dịch.
            </div>
          ) : (
            <div className="space-y-2">
              {recentRows.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {historyOpen && (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h3 className="font-extrabold text-gray-900">
              Toàn bộ lịch sử giao dịch
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <select
                value={filters.type}
                onChange={(event) => changeFilter("type", event.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >
                <option value="">Tất cả loại</option>
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabel(type)}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(event) => changeFilter("status", event.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filters.from}
                onChange={(event) => changeFilter("from", event.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
              <input
                type="date"
                value={filters.to}
                onChange={(event) => changeFilter("to", event.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Giao dịch</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3 text-right">Số tiền</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Không có giao dịch phù hợp.
                    </td>
                  </tr>
                ) : (
                  history.map((transaction) => (
                    <TransactionTableRows
                      key={transaction.id}
                      transaction={transaction}
                      currency={currency}
                      expanded={expandedId === transaction.id}
                      onToggle={() =>
                        setExpandedId((current) =>
                          current === transaction.id ? null : transaction.id,
                        )
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <span className="text-xs text-gray-400">
              {historyTotal} giao dịch · Trang {historyPage + 1}/{historyTotalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryPage((value) => Math.max(0, value - 1))}
                disabled={historyPage === 0}
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setHistoryPage((value) =>
                    Math.min(historyTotalPages - 1, value + 1),
                  )
                }
                disabled={historyPage >= historyTotalPages - 1}
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {allowTopUp && (
          <ActionCard title="Nạp tiền vào ví" icon={<Banknote className="h-4 w-4" />}>
            <input
              type="number"
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
            <button
              onClick={handleTopUp}
              disabled={topUpLoading}
              className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {topUpLoading ? "Đang xử lý..." : "Nạp tiền"}
            </button>
            {topUp && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                <div className="font-bold">
                  #{topUp.orderCode} · {statusLabel(topUp.status)}
                </div>
                <div>{formatMoney(topUp.amount, topUp.currency)}</div>
                <div className="mt-2 flex gap-2">
                  {topUp.checkoutUrl && (
                    <a
                      href={topUp.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 font-bold"
                    >
                      Thanh toán <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    onClick={handleCheckTopUp}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white"
                  >
                    Kiểm tra
                  </button>
                </div>
              </div>
            )}
          </ActionCard>
        )}

        {allowBankAccount && (
          <ActionCard
            title="Tài khoản nhận tiền"
            icon={<CreditCard className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["bankCode", "Mã ngân hàng"],
                ["bankName", "Tên ngân hàng"],
                ["accountNumber", "Số tài khoản"],
                ["accountHolderName", "Tên chủ tài khoản"],
                ["branch", "Chi nhánh"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={bankForm[key as keyof typeof bankForm]}
                  onChange={(event) =>
                    setBankForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={label}
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                />
              ))}
            </div>
            <button
              onClick={handleSaveBank}
              disabled={bankSaving}
              className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white"
            >
              {bankSaving ? "Đang lưu..." : "Lưu tài khoản"}
            </button>
          </ActionCard>
        )}

        {allowWithdraw && (
          <ActionCard
            title="Yêu cầu rút tiền"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            <input
              type="number"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
            <input
              value={withdrawNote}
              onChange={(event) => setWithdrawNote(event.target.value)}
              placeholder="Ghi chú"
              className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="mt-3 w-full rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white"
            >
              {withdrawLoading ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
            </button>
          </ActionCard>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-extrabold text-gray-900">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

function TransactionRow({
  transaction,
  currency,
}: {
  transaction: WalletHistoryItem;
  currency: string;
}) {
  const credit = isCredit(transaction);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          credit ? "bg-emerald-100" : "bg-rose-100"
        }`}
      >
        {credit ? (
          <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-rose-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-gray-900">
          {transaction.description || typeLabel(transaction.type)}
        </div>
        <div className="truncate text-xs text-gray-400">
          {typeLabel(transaction.type)} · {statusLabel(transaction.status)} ·{" "}
          {formatDate(transaction.createdAt)}
        </div>
      </div>
      <div
        className={`text-sm font-extrabold ${
          credit ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {credit ? "+" : "-"}
        {formatMoney(Math.abs(transaction.amount), currency)}
      </div>
    </div>
  );
}

function TransactionTableRows({
  transaction,
  currency,
  expanded,
  onToggle,
}: {
  transaction: WalletHistoryItem;
  currency: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const credit = isCredit(transaction);
  return (
    <>
      <tr>
        <td className="px-5 py-4">
          <div className="font-bold text-gray-900">
            {typeLabel(transaction.type)}
          </div>
          <div className="text-xs text-gray-400">
            {transaction.description || transaction.referenceId || "-"}
          </div>
        </td>
        <td className="px-5 py-4">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
              transaction.status,
            )}`}
          >
            {statusLabel(transaction.status)}
          </span>
        </td>
        <td className="px-5 py-4 text-sm text-gray-500">
          {formatDate(transaction.createdAt)}
        </td>
        <td
          className={`px-5 py-4 text-right font-extrabold ${
            credit ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {credit ? "+" : "-"}
          {formatMoney(Math.abs(transaction.amount), currency)}
        </td>
        <td className="px-5 py-4">
          <button onClick={onToggle} className="rounded-lg p-1 hover:bg-gray-100">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-5 py-4">
            <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
              <Detail label="Nguồn" value={transaction.source} />
              <Detail
                label="Tham chiếu"
                value={`${transaction.referenceType || "-"} #${
                  transaction.referenceId || "-"
                }`}
              />
              <Detail
                label="Số dư trước"
                value={
                  transaction.balanceBefore == null
                    ? "-"
                    : formatMoney(transaction.balanceBefore, currency)
                }
              />
              <Detail
                label="Số dư sau"
                value={
                  transaction.balanceAfter == null
                    ? "-"
                    : formatMoney(transaction.balanceAfter, currency)
                }
              />
              <Detail
                label="Gói dịch vụ"
                value={
                  transaction.subscriptionPlanCode
                    ? `${transaction.subscriptionPlanCode} · ${
                        transaction.subscriptionBillingCycle || "-"
                      }`
                    : "-"
                }
              />
              <Detail
                label="Ngân hàng"
                value={
                  transaction.bankName
                    ? `${transaction.bankName} · ${
                        transaction.bankAccountNumber || "-"
                      }`
                    : "-"
                }
              />
              <Detail
                label="Người xử lý"
                value={transaction.processedByName || "-"}
              />
              <Detail label="Ghi chú admin" value={transaction.adminNote || "-"} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-bold text-gray-400">{label}</div>
      <div className="mt-1 break-words text-gray-700">{value}</div>
    </div>
  );
}
