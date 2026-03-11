export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: string;
  limit: number;
  spent: number;
  currency: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
