import { v4 as uuidv4 } from 'uuid';
import { Account, AccountType } from '../types';

export interface CreateAccountInput {
  userId: string;
  name: string;
  type: AccountType;
  initialBalance?: number;
  currency?: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  currency?: string;
}

export class AccountService {
  private accounts: Map<string, Account> = new Map();

  createAccount(input: CreateAccountInput): Account {
    const now = new Date();
    const account: Account = {
      id: uuidv4(),
      userId: input.userId,
      name: input.name.trim(),
      type: input.type,
      balance: input.initialBalance ?? 0,
      currency: input.currency ?? 'USD',
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.id, account);
    return { ...account };
  }

  getAccountById(id: string): Account | null {
    return this.accounts.get(id) ?? null;
  }

  getAccountsByUserId(userId: string): Account[] {
    return Array.from(this.accounts.values())
      .filter(account => account.userId === userId)
      .map(account => ({ ...account }));
  }

  updateAccount(id: string, input: UpdateAccountInput): Account | null {
    const account = this.accounts.get(id);
    if (!account) {
      return null;
    }

    if (input.name !== undefined) {
      account.name = input.name.trim();
    }
    if (input.type !== undefined) {
      account.type = input.type;
    }
    if (input.currency !== undefined) {
      account.currency = input.currency;
    }

    account.updatedAt = new Date();
    this.accounts.set(id, account);
    return { ...account };
  }

  updateBalance(id: string, newBalance: number): Account | null {
    const account = this.accounts.get(id);
    if (!account) {
      return null;
    }

    account.balance = newBalance;
    account.updatedAt = new Date();
    this.accounts.set(id, account);
    return { ...account };
  }

  deleteAccount(id: string): boolean {
    return this.accounts.delete(id);
  }

  getTotalBalanceByUserId(userId: string): number {
    return this.getAccountsByUserId(userId)
      .reduce((total, account) => total + account.balance, 0);
  }
}
