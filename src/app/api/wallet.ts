import type {
  Wallet,
  WalletBankAccount,
  WalletBankAccountUpsertRequest,
  WalletTopUp,
  WalletTransaction,
  WalletWithdraw,
} from "../types/wallet";
import { apiRequest } from "./client";

export function getMyWallet() {
  return apiRequest<Wallet>("/api/v1/wallets/me");
}

export function getMyWalletTransactions() {
  return apiRequest<WalletTransaction[]>("/api/v1/wallets/me/transactions");
}

export function createWalletTopUp(amount: number) {
  return apiRequest<WalletTopUp>("/api/v1/wallets/top-up", {
    method: "POST",
    body: JSON.stringify({ amount }),
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

