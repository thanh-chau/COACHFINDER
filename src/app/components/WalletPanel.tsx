import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
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
import type { Wallet, WalletBankAccount, WalletTopUp, WalletTransaction } from "../types/wallet";

type WalletPanelMode = "learner" | "coach";

interface WalletPanelProps {
  mode: WalletPanelMode;
  allowTopUp?: boolean;
  allowWithdraw?: boolean;
  allowBankAccount?: boolean;
}

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
    BOOKING_PAYMENT: "Thanh toán lịch tập",
    BOOKING_COACH_PAYOUT: "Doanh thu buổi tập",
    BOOKING_COMMISSION: "Hoa hồng nền tảng",
    SUBSCRIPTION_PAYMENT: "Thanh toán gói",
    REFUND: "Hoàn tiền",
  };
  return labels[type] ?? type.replaceAll("_", " ");
}

function statusLabel(status: string | null) {
  if (!status) return "Hoàn tất";
  const labels: Record<string, string> = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    COMPLETED: "Hoàn tất",
    PAID: "Đã thanh toán",
    CANCELLED: "Đã hủy",
  };
  return labels[status] ?? status;
}

function isCredit(tx: WalletTransaction) {
  return tx.amount >= 0;
}

function getSubscriptionCallbackUrl(mode: WalletPanelMode) {
  const path = mode === "coach"
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
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [bankAccount, setBankAccount] = useState<WalletBankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [topUpAmount, setTopUpAmount] = useState("200000");
  const [topUp, setTopUp] = useState<WalletTopUp | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const [bankForm, setBankForm] = useState({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branch: "",
  });
  const [bankSaving, setBankSaving] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("500000");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const currency = wallet?.currency || "VND";
  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);
  const title = mode === "coach"
    ? allowTopUp && allowWithdraw
      ? "Ví HLV & thanh toán"
      : allowTopUp
        ? "Ví thanh toán HLV"
        : "Ví & rút tiền"
    : "Ví thanh toán";

  const loadWallet = async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [walletData, txData, bankData] = await Promise.all([
        getMyWallet(),
        getMyWalletTransactions(),
        allowBankAccount ? getMyBankAccount().catch(() => null) : Promise.resolve(null),
      ]);

      setWallet(walletData);
      setTransactions(txData);
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

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionNotice("Số tiền nạp không hợp lệ.");
      return;
    }

    setTopUpLoading(true);
    setActionNotice(null);
    try {
      const callbackUrl = getSubscriptionCallbackUrl(mode);
      const result = await createWalletTopUp({
        amount,
        returnUrl: callbackUrl,
        cancelUrl: callbackUrl,
      });
      setTopUp(result);
      setActionNotice("Đã tạo yêu cầu nạp tiền.");
      await loadWallet();
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : "Không tạo được yêu cầu nạp tiền.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleCheckTopUp = async () => {
    if (!topUp?.orderCode) return;
    setTopUpLoading(true);
    try {
      const status = await getWalletTopUpStatus(topUp.orderCode);
      setTopUp(status);
      setActionNotice(`Trạng thái nạp tiền: ${statusLabel(status.status)}.`);
      await loadWallet();
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : "Không kiểm tra được trạng thái nạp tiền.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankForm.bankCode || !bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolderName) {
      setActionNotice("Vui lòng nhập đủ thông tin ngân hàng.");
      return;
    }

    setBankSaving(true);
    setActionNotice(null);
    try {
      const saved = await saveMyBankAccount({
        bankCode: bankForm.bankCode.trim(),
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        accountHolderName: bankForm.accountHolderName.trim(),
        branch: bankForm.branch.trim() || undefined,
      });
      setBankAccount(saved);
      setActionNotice("Đã lưu tài khoản ngân hàng.");
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : "Không lưu được tài khoản ngân hàng.");
    } finally {
      setBankSaving(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount < 500000) {
      setActionNotice("Số tiền rút tối thiểu là 500.000đ.");
      return;
    }
    if (wallet && amount > wallet.balance) {
      setActionNotice("Số tiền rút vượt quá số dư ví.");
      return;
    }
    if (allowBankAccount && !bankAccount) {
      setActionNotice("Vui lòng lưu tài khoản ngân hàng trước khi rút tiền.");
      return;
    }

    setWithdrawLoading(true);
    setActionNotice(null);
    try {
      await withdrawFromWallet(amount, withdrawNote.trim() || undefined);
      setActionNotice("Đã gửi yêu cầu rút tiền. Admin sẽ xử lý yêu cầu này.");
      await loadWallet();
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : "Không gửi được yêu cầu rút tiền.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-gray-900" style={{ fontWeight: 800, fontSize: "1.08rem" }}>
            {title}
          </h2>
          <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
            Dữ liệu lấy từ `/api/v1/wallets/*`, không dùng số dư mẫu.
          </p>
        </div>
        <button
          onClick={() => loadWallet()}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          style={{ fontSize: "0.8rem", fontWeight: 700 }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-2" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {actionNotice && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700 flex items-start gap-2" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {actionNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 p-5 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-emerald-100" style={{ fontSize: "0.68rem", fontWeight: 800 }}>
                {wallet?.role || (mode === "coach" ? "COACHES" : "TRAINEES")}
              </span>
            </div>
            <div className="text-emerald-100" style={{ fontSize: "0.72rem", fontWeight: 700 }}>
              Số dư khả dụng
            </div>
            <div className="mt-1 text-white" style={{ fontSize: "1.65rem", fontWeight: 900, lineHeight: 1.1 }}>
              {loading ? "Đang tải..." : formatMoney(wallet?.balance ?? 0, currency)}
            </div>
            <div className="mt-4 border-t border-white/10 pt-3 text-emerald-100" style={{ fontSize: "0.75rem" }}>
              {wallet?.ownerName || "Tài khoản hiện tại"}
            </div>
            {wallet?.updatedAt && (
              <div className="mt-1 text-emerald-200/70" style={{ fontSize: "0.68rem" }}>
                Cập nhật {formatDate(wallet.updatedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">
              Giao dịch gần đây
            </div>
            <span className="text-gray-400" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {transactions.length} giao dịch
            </span>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 py-8" style={{ fontSize: "0.85rem" }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải giao dịch...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-gray-400" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Chưa có giao dịch ví.
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit(tx) ? "bg-emerald-100" : "bg-rose-100"}`}>
                    {isCredit(tx) ? <ArrowDownToLine className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-rose-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-gray-900" style={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      {tx.description || typeLabel(tx.type)}
                    </div>
                    <div className="truncate text-gray-400" style={{ fontSize: "0.7rem" }}>
                      {typeLabel(tx.type)} · {statusLabel(tx.withdrawalStatus)} · {formatDate(tx.createdAt)}
                    </div>
                  </div>
                  <div className={`text-right ${isCredit(tx) ? "text-emerald-600" : "text-rose-600"}`} style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                    {isCredit(tx) ? "+" : "-"}{formatMoney(Math.abs(tx.amount), currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allowTopUp && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-4 h-4 text-emerald-500" />
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">Nạp tiền vào ví</div>
            </div>
            <div className="flex gap-2 mb-3">
              {[100000, 200000, 500000, 1000000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(String(amount))}
                  className={`rounded-lg border px-3 py-1.5 ${Number(topUpAmount) === amount ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}
                  style={{ fontSize: "0.73rem", fontWeight: 700 }}
                >
                  {formatMoney(amount, currency)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-100"
                style={{ fontSize: "0.85rem", fontWeight: 700 }}
              />
              <button
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-white disabled:opacity-60"
                style={{ fontSize: "0.82rem", fontWeight: 800 }}
              >
                {topUpLoading ? "Đang tạo..." : "Nạp"}
              </button>
            </div>
            {topUp && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <div className="text-emerald-800" style={{ fontWeight: 800, fontSize: "0.82rem" }}>
                  Mã nạp tiền #{topUp.orderCode} · {statusLabel(topUp.status)}
                </div>
                <div className="text-emerald-700 mt-1" style={{ fontSize: "0.76rem" }}>
                  {formatMoney(topUp.amount, topUp.currency)} · {topUp.description}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {topUp.checkoutUrl && (
                    <a
                      href={topUp.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-emerald-700 border border-emerald-200"
                      style={{ fontSize: "0.75rem", fontWeight: 800 }}
                    >
                      Thanh toán <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={handleCheckTopUp}
                    disabled={topUpLoading}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-60"
                    style={{ fontSize: "0.75rem", fontWeight: 800 }}
                  >
                    Kiểm tra trạng thái
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {allowBankAccount && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">Tài khoản nhận tiền</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["bankCode", "Mã ngân hàng"],
                ["bankName", "Tên ngân hàng"],
                ["accountNumber", "Số tài khoản"],
                ["accountHolderName", "Tên chủ tài khoản"],
                ["branch", "Chi nhánh"],
              ].map(([key, label]) => (
                <label key={key} className={key === "branch" ? "sm:col-span-2" : ""}>
                  <span className="block text-gray-500 mb-1" style={{ fontSize: "0.72rem", fontWeight: 700 }}>{label}</span>
                  <input
                    value={bankForm[key as keyof typeof bankForm]}
                    onChange={(event) => setBankForm((current) => ({ ...current, [key]: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-100"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  />
                </label>
              ))}
            </div>
            <button
              onClick={handleSaveBank}
              disabled={bankSaving}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-white disabled:opacity-60"
              style={{ fontSize: "0.82rem", fontWeight: 800 }}
            >
              {bankSaving ? "Đang lưu..." : bankAccount ? "Cập nhật tài khoản" : "Lưu tài khoản"}
            </button>
          </div>
        )}

        {allowWithdraw && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }} className="text-gray-900">Yêu cầu rút tiền</div>
            </div>
            <label className="block mb-3">
              <span className="block text-gray-500 mb-1" style={{ fontSize: "0.72rem", fontWeight: 700 }}>Số tiền rút</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
                style={{ fontSize: "0.86rem", fontWeight: 700 }}
              />
            </label>
            <label className="block mb-4">
              <span className="block text-gray-500 mb-1" style={{ fontSize: "0.72rem", fontWeight: 700 }}>Ghi chú</span>
              <input
                value={withdrawNote}
                onChange={(event) => setWithdrawNote(event.target.value)}
                placeholder="Ví dụ: rút thu nhập tháng này"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-rose-100"
                style={{ fontSize: "0.82rem", fontWeight: 600 }}
              />
            </label>
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-white disabled:opacity-60"
              style={{ fontSize: "0.82rem", fontWeight: 800 }}
            >
              {withdrawLoading ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
            </button>
            <p className="mt-3 text-gray-400" style={{ fontSize: "0.74rem", lineHeight: 1.6 }}>
              Yêu cầu rút tiền dùng `/api/v1/wallets/withdraw`; admin sẽ duyệt ở màn hình tài chính.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
