export interface AdminCommissionSettings {
  starter: number;
  proCoach: number;
  eliteCoach: number;
}

export interface AdminSubscriptionPrices {
  trainee: {
    free: number;
    pro: number;
    premium: number;
  };
  coach: {
    starter: number;
    proCoach: number;
    eliteCoach: number;
  };
}

export interface AdminPlatformInfo {
  platformName: string;
  version: string;
  environment: string;
  timezone: string;
  totalUsers: number;
  monthlyUptime: number;
  adminWalletBalance: number;
  lastUpdatedAt: string;
}

export interface AdminPlatformSettings {
  commissionRates: AdminCommissionSettings;
  subscriptionPrices: AdminSubscriptionPrices;
  platformInfo: AdminPlatformInfo;
}

