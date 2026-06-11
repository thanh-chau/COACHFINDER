import type {
  Wallet,
  WalletBankAccount,
  WalletBankAccountUpsertRequest,
  WalletTopUp,
  WalletTopUpRequest,
  WalletTransactionFilters,
  WalletTransactionPage,
  WalletWithdraw,
} from "../types/wallet";
import { apiRequest } from "./client";

export function getMyWallet() {
  return apiRequest<Wallet>("/api/v1/wallets/me");
}

export function getMyWalletTransactions(filters: WalletTransactionFilters = {}) {
  const query = new URLSearchParams();
  if (filters.type) query.set("type", filters.type);
  if (filters.status) query.set("status", filters.status);
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  query.set("page", String(filters.page ?? 0));
  query.set("size", String(filters.size ?? 10));
  return apiRequest<WalletTransactionPage>(
    `/api/v1/wallets/me/transactions?${query.toString()}`,
  );
}

export function createWalletTopUp(request: WalletTopUpRequest) {
  return apiRequest<WalletTopUp>("/api/v1/wallets/top-up", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getWalletTopUpStatus(orderCode: number) {
  return apiRequest<WalletTopUp>(`/api/v1/wallets/top-up/${orderCode}`);
}

export function getMyBankAccount() {
  return apiRequest<WalletBankAccount>("/api/v1/wallets/bank-account");
}

export function saveMyBankAccount(request: WalletBankAccountUpsertRequest) {
  return apiRequest<WalletBankAccount>("/api/v1/wallets/bank-account", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function withdrawFromWallet(amount: number, note?: string) {
  return apiRequest<WalletWithdraw>("/api/v1/wallets/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount, note }),
  });
}
