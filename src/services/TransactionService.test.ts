import { TransactionService } from '../services/TransactionService';

describe('TransactionService', () => {
  let service: TransactionService;
  const userId = 'user-1';
  const accountId = 'account-1';

  beforeEach(() => {
    service = new TransactionService();
  });

  describe('createTransaction', () => {
    it('should create a transaction with defaults', () => {
      const tx = service.createTransaction({
        accountId,
        userId,
        amount: 50,
        type: 'expense',
        category: 'Food',
        description: 'Lunch',
      });

      expect(tx.id).toBeDefined();
      expect(tx.amount).toBe(50);
      expect(tx.type).toBe('expense');
      expect(tx.category).toBe('Food');
      expect(tx.date).toBeInstanceOf(Date);
    });

    it('should use provided date', () => {
      const date = new Date('2024-01-15');
      const tx = service.createTransaction({
        accountId,
        userId,
        amount: 100,
        type: 'income',
        category: 'Salary',
        description: 'Monthly salary',
        date,
      });

      expect(tx.date).toEqual(date);
    });

    it('should throw for amount <= 0', () => {
      expect(() =>
        service.createTransaction({
          accountId,
          userId,
          amount: 0,
          type: 'expense',
          category: 'Food',
          description: 'Test',
        })
      ).toThrow('Transaction amount must be greater than zero');
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', () => {
      const tx = service.createTransaction({
        accountId, userId, amount: 10, type: 'expense', category: 'Food', description: 'Test',
      });
      expect(service.getTransactionById(tx.id)).toMatchObject({ id: tx.id });
    });

    it('should return null for unknown id', () => {
      expect(service.getTransactionById('unknown')).toBeNull();
    });
  });

  describe('getTransactions', () => {
    beforeEach(() => {
      service.createTransaction({ accountId, userId, amount: 100, type: 'income', category: 'Salary', description: 'A' });
      service.createTransaction({ accountId, userId, amount: 50, type: 'expense', category: 'Food', description: 'B' });
      service.createTransaction({ accountId, userId: 'user-2', amount: 20, type: 'expense', category: 'Transport', description: 'C' });
    });

    it('should filter by userId', () => {
      const txs = service.getTransactions({ userId });
      expect(txs).toHaveLength(2);
    });

    it('should filter by type', () => {
      const txs = service.getTransactions({ userId, type: 'expense' });
      expect(txs).toHaveLength(1);
      expect(txs[0].type).toBe('expense');
    });

    it('should filter by category', () => {
      const txs = service.getTransactions({ userId, category: 'Salary' });
      expect(txs).toHaveLength(1);
    });

    it('should return all transactions with empty filter', () => {
      expect(service.getTransactions()).toHaveLength(3);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', () => {
      const tx = service.createTransaction({
        accountId, userId, amount: 10, type: 'expense', category: 'X', description: 'Y',
      });
      expect(service.deleteTransaction(tx.id)).toBe(true);
      expect(service.getTransactionById(tx.id)).toBeNull();
    });

    it('should return false for unknown id', () => {
      expect(service.deleteTransaction('unknown')).toBe(false);
    });
  });

  describe('getSummaryByUserId', () => {
    it('should calculate income, expenses, and net balance', () => {
      service.createTransaction({ accountId, userId, amount: 1000, type: 'income', category: 'Salary', description: 'A' });
      service.createTransaction({ accountId, userId, amount: 200, type: 'expense', category: 'Food', description: 'B' });
      service.createTransaction({ accountId, userId, amount: 100, type: 'expense', category: 'Transport', description: 'C' });

      const summary = service.getSummaryByUserId(userId);
      expect(summary.totalIncome).toBe(1000);
      expect(summary.totalExpenses).toBe(300);
      expect(summary.netBalance).toBe(700);
    });
  });

  describe('getSpendingByCategory', () => {
    it('should aggregate expenses by category', () => {
      service.createTransaction({ accountId, userId, amount: 50, type: 'expense', category: 'Food', description: 'A' });
      service.createTransaction({ accountId, userId, amount: 30, type: 'expense', category: 'Food', description: 'B' });
      service.createTransaction({ accountId, userId, amount: 100, type: 'expense', category: 'Transport', description: 'C' });
      service.createTransaction({ accountId, userId, amount: 500, type: 'income', category: 'Salary', description: 'D' });

      const spending = service.getSpendingByCategory(userId);
      expect(spending['Food']).toBe(80);
      expect(spending['Transport']).toBe(100);
      expect(spending['Salary']).toBeUndefined();
    });
  });
});
