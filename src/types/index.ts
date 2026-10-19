export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  token?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  vehiclePlate?: string; // Plat nomor truk tangki (e.g. B 9123 TAB)
  volumeLiters?: number; // Kapasitas liter air (e.g. 5000, 8000)
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  syncedToSheets?: boolean;
}

export interface Category {
  id: string;
  type: TransactionType;
  name: string;
  color: string;
  icon?: string;
  isSystem?: boolean;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  searchQuery: string;
  vehiclePlate?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  profitMargin: number;
  totalDeliveries: number;
  totalVolumeLiters: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  type: TransactionType;
  totalAmount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyRecap {
  month: number; // 1-12
  year: number;
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categories: CategoryBreakdown[];
  transactions: Transaction[];
}

export interface SpreadsheetConfig {
  appsScriptUrl: string;
  spreadsheetName?: string;
  autoSync: boolean;
  lastSyncTime?: string;
  isConnected: boolean;
}

export interface BusinessProfile {
  appName: string;
  businessName: string;
  address: string;
  trucks: string;
  phone?: string;
}

export type ActivePage = 'dashboard' | 'transactions' | 'reports' | 'settings';

