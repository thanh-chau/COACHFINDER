export type SubscriptionPlanCode = "FREE" | "PRO" | "PREMIUM";
export type SubscriptionBillingCycle = "MONTHLY" | "YEARLY";

export interface CurrentSubscription {
  planCode: SubscriptionPlanCode;
  displayName: string;
  statusLabel: string;
  note: string;
  monthlyPrice: number;
  billingPrice: number;
  displayPrice: string;
  billingLabel: string;
  billingCycle: SubscriptionBillingCycle;
  streakDays: number;
  startedAt: string | null;
  expiresAt: string | null;
}

export interface SubscriptionFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlanCard {
  planCode: SubscriptionPlanCode;
  displayName: string;
  description: string;
  monthlyPrice: number;
  billingPrice: number;
  displayPrice: string;
  billingLabel: string;
  highlighted: boolean;
  ribbonText: string | null;
  current: boolean;
  exactCurrent: boolean;
  actionLabel: string;
  actionType: string;
  features: SubscriptionFeature[];
}

export interface SubscriptionCatalog {
  audience: string;
  pageTitle: string;
  pageSubtitle: string;
  selectedBillingCycle: SubscriptionBillingCycle;
  yearlyDiscountMonths: number;
  currentSubscription: CurrentSubscription;
  plans: SubscriptionPlanCard[];
}

export interface SubscriptionChange {
  message: string;
  subscription: CurrentSubscription;
  chargedAmount: number;
  walletBalanceAfter: number;
}

export interface ChangeSubscriptionPlanRequest {
  planCode: SubscriptionPlanCode;
  billingCycle: SubscriptionBillingCycle;
}

