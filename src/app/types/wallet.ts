export interface Wallet {
  walletId: number;
  userId: number;
  ownerName: string;
  role: "TRAINEES" | "COACHES" | "ADMIN";
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  subscriptionPlanCode: string | null;
  subscriptionBillingCycle: string | null;
  bankCode: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolderName: string | null;
  bankBranch: string | null;
  withdrawalStatus: string | null;
  adminNote: string | null;
  processedByUserId: number | null;
  processedByName: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface WalletHistoryItem
  extends Omit<WalletTransaction, "id" | "balanceBefore" | "balanceAfter"> {
  id: string;
  source: "WALLET_TRANSACTION" | "TOP_UP_ORDER";
  balanceBefore: number | null;
  balanceAfter: number | null;
  status: string;
}

export interface WalletTransactionPage {
  content: WalletHistoryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface WalletTransactionFilters {
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface WalletTopUp {
  orderCode: number;
  amount: number;
  description: string;
  status: string;
  paymentLinkId: string | null;
  checkoutUrl: string | null;
  qrCode: string | null;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  walletBalance: number;
}

export interface WalletTopUpRequest {
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface WalletBankAccount {
  id: number;
  userId: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branch: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBankAccountUpsertRequest {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branch?: string;
}

export interface WalletWithdraw {
  transactionId: number;
  userId: number;
  ownerName: string;
  role: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  description: string | null;
  withdrawalStatus: string;
  createdAt: string;
}
