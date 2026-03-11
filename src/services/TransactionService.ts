import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType } from '../types';

export interface CreateTransactionInput {
  accountId: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date?: Date;
}

export interface TransactionFilter {
  userId?: string;
  accountId?: string;
  type?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export class TransactionService {
  private transactions: Map<string, Transaction> = new Map();

  createTransaction(input: CreateTransactionInput): Transaction {
    if (input.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero');
    }

    const transaction: Transaction = {
      id: uuidv4(),
      accountId: input.accountId,
      userId: input.userId,
      amount: input.amount,
      type: input.type,
      category: input.category.trim(),
      description: input.description.trim(),
      date: input.date ?? new Date(),
      createdAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    return { ...transaction };
  }

  getTransactionById(id: string): Transaction | null {
    return this.transactions.get(id) ?? null;
  }

  getTransactions(filter: TransactionFilter = {}): Transaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => {
        if (filter.userId && tx.userId !== filter.userId) return false;
        if (filter.accountId && tx.accountId !== filter.accountId) return false;
        if (filter.type && tx.type !== filter.type) return false;
        if (filter.category && tx.category !== filter.category) return false;
        if (filter.startDate && tx.date < filter.startDate) return false;
        if (filter.endDate && tx.date > filter.endDate) return false;
        return true;
      })
      .map(tx => ({ ...tx }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  deleteTransaction(id: string): boolean {
    return this.transactions.delete(id);
  }

  getSummaryByUserId(userId: string): { totalIncome: number; totalExpenses: number; netBalance: number } {
    const userTransactions = this.getTransactions({ userId });

    const totalIncome = userTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = userTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  }

  getSpendingByCategory(userId: string, startDate?: Date, endDate?: Date): Record<string, number> {
    const transactions = this.getTransactions({
      userId,
      type: 'expense',
      startDate,
      endDate,
    });

    return transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  }
}
