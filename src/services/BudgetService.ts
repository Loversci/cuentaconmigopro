import { v4 as uuidv4 } from 'uuid';
import { Budget, BudgetPeriod } from '../types';

export interface CreateBudgetInput {
  userId: string;
  name: string;
  category: string;
  limit: number;
  currency?: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
}

export interface UpdateBudgetInput {
  name?: string;
  limit?: number;
  currency?: string;
}

export class BudgetService {
  private budgets: Map<string, Budget> = new Map();

  createBudget(input: CreateBudgetInput): Budget {
    if (input.limit <= 0) {
      throw new Error('Budget limit must be greater than zero');
    }
    if (input.startDate >= input.endDate) {
      throw new Error('Budget start date must be before end date');
    }

    const now = new Date();
    const budget: Budget = {
      id: uuidv4(),
      userId: input.userId,
      name: input.name.trim(),
      category: input.category.trim(),
      limit: input.limit,
      spent: 0,
      currency: input.currency ?? 'USD',
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      createdAt: now,
      updatedAt: now,
    };

    this.budgets.set(budget.id, budget);
    return { ...budget };
  }

  getBudgetById(id: string): Budget | null {
    return this.budgets.get(id) ?? null;
  }

  getBudgetsByUserId(userId: string): Budget[] {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId)
      .map(budget => ({ ...budget }));
  }

  updateBudget(id: string, input: UpdateBudgetInput): Budget | null {
    const budget = this.budgets.get(id);
    if (!budget) {
      return null;
    }

    if (input.name !== undefined) {
      budget.name = input.name.trim();
    }
    if (input.limit !== undefined) {
      if (input.limit <= 0) {
        throw new Error('Budget limit must be greater than zero');
      }
      budget.limit = input.limit;
    }
    if (input.currency !== undefined) {
      budget.currency = input.currency;
    }

    budget.updatedAt = new Date();
    this.budgets.set(id, budget);
    return { ...budget };
  }

  recordSpending(id: string, amount: number): Budget | null {
    if (amount <= 0) {
      throw new Error('Spending amount must be greater than zero');
    }

    const budget = this.budgets.get(id);
    if (!budget) {
      return null;
    }

    budget.spent += amount;
    budget.updatedAt = new Date();
    this.budgets.set(id, budget);
    return { ...budget };
  }

  deleteBudget(id: string): boolean {
    return this.budgets.delete(id);
  }

  getRemainingAmount(id: string): number | null {
    const budget = this.budgets.get(id);
    if (!budget) {
      return null;
    }
    return Math.max(0, budget.limit - budget.spent);
  }

  isOverBudget(id: string): boolean | null {
    const budget = this.budgets.get(id);
    if (!budget) {
      return null;
    }
    return budget.spent > budget.limit;
  }

  getActiveBudgets(userId: string): Budget[] {
    const now = new Date();
    return this.getBudgetsByUserId(userId).filter(
      budget => budget.startDate <= now && budget.endDate >= now
    );
  }
}
