// Shared Moneta domain types — mirror the v1 localStorage schema so the
// v1→v2 migration script (task 9) is a near-identity transform.

export type Currency = 'NTD' | 'USD' | 'IDR';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type GoalStatus = 'active' | 'completed';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Wallet {
  id: string;
  name: string;
  currency: Currency;
  platform: string;
  balance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  walletId?: string;
  sourceWalletId?: string;
  targetWalletId?: string;
  targetAmount?: number;
  categoryId?: string;
  date: string;
  description?: string;
  receiptPhoto?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  currency: Currency;
  createdAt: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: Currency;
  deadline: string | null;
  linkedWalletId: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  walletId?: string;
  targetWalletId?: string;
  targetAmount?: number;
  categoryId?: string;
  description?: string;
  frequency: RecurringFrequency;
  nextDate: string;
  isPaused?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversionRates {
  usdToNtd: number;
  usdToIdr: number;
  ntdToIdr: number;
}

export interface Settings {
  baseCurrency: Currency;
  language: 'en' | 'zh' | 'id';
  themeMode: 'dark' | 'light';
  biometricEnabled: boolean;
  notifReminderEnabled: boolean;
  notifQuickActionsEnabled: boolean;
}
