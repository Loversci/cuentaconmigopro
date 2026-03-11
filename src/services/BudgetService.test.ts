import { BudgetService } from '../services/BudgetService';

describe('BudgetService', () => {
  let service: BudgetService;
  const userId = 'user-1';
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-01-31');

  beforeEach(() => {
    service = new BudgetService();
  });

  describe('createBudget', () => {
    it('should create a budget with defaults', () => {
      const budget = service.createBudget({
        userId,
        name: 'Food Budget',
        category: 'Food',
        limit: 500,
        period: 'monthly',
        startDate,
        endDate,
      });

      expect(budget.id).toBeDefined();
      expect(budget.name).toBe('Food Budget');
      expect(budget.limit).toBe(500);
      expect(budget.spent).toBe(0);
      expect(budget.currency).toBe('USD');
    });

    it('should create budget with custom currency', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly',
        startDate, endDate, currency: 'EUR',
      });
      expect(budget.currency).toBe('EUR');
    });

    it('should throw for limit <= 0', () => {
      expect(() => service.createBudget({
        userId, name: 'B', category: 'C', limit: 0, period: 'monthly', startDate, endDate,
      })).toThrow('Budget limit must be greater than zero');
    });

    it('should throw if startDate >= endDate', () => {
      expect(() => service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly',
        startDate: endDate, endDate: startDate,
      })).toThrow('Budget start date must be before end date');
    });
  });

  describe('getBudgetById', () => {
    it('should return budget by id', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      expect(service.getBudgetById(budget.id)).toMatchObject({ id: budget.id });
    });

    it('should return null for unknown id', () => {
      expect(service.getBudgetById('unknown')).toBeNull();
    });
  });

  describe('getBudgetsByUserId', () => {
    it('should return all budgets for a user', () => {
      service.createBudget({ userId, name: 'A', category: 'Food', limit: 100, period: 'monthly', startDate, endDate });
      service.createBudget({ userId, name: 'B', category: 'Transport', limit: 200, period: 'monthly', startDate, endDate });
      service.createBudget({ userId: 'other', name: 'C', category: 'Food', limit: 100, period: 'monthly', startDate, endDate });

      expect(service.getBudgetsByUserId(userId)).toHaveLength(2);
    });
  });

  describe('updateBudget', () => {
    it('should update budget fields', () => {
      const budget = service.createBudget({
        userId, name: 'Old', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      const updated = service.updateBudget(budget.id, { name: 'New', limit: 200 });
      expect(updated!.name).toBe('New');
      expect(updated!.limit).toBe(200);
    });

    it('should throw for invalid limit', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      expect(() => service.updateBudget(budget.id, { limit: -10 })).toThrow(
        'Budget limit must be greater than zero'
      );
    });

    it('should return null for unknown id', () => {
      expect(service.updateBudget('unknown', { name: 'X' })).toBeNull();
    });
  });

  describe('recordSpending', () => {
    it('should increment spent amount', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 500, period: 'monthly', startDate, endDate,
      });
      service.recordSpending(budget.id, 100);
      const updated = service.recordSpending(budget.id, 50);
      expect(updated!.spent).toBe(150);
    });

    it('should throw for amount <= 0', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      expect(() => service.recordSpending(budget.id, 0)).toThrow(
        'Spending amount must be greater than zero'
      );
    });

    it('should return null for unknown id', () => {
      expect(service.recordSpending('unknown', 50)).toBeNull();
    });
  });

  describe('getRemainingAmount', () => {
    it('should return remaining budget', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 500, period: 'monthly', startDate, endDate,
      });
      service.recordSpending(budget.id, 200);
      expect(service.getRemainingAmount(budget.id)).toBe(300);
    });

    it('should return 0 when over budget', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      service.recordSpending(budget.id, 150);
      expect(service.getRemainingAmount(budget.id)).toBe(0);
    });

    it('should return null for unknown id', () => {
      expect(service.getRemainingAmount('unknown')).toBeNull();
    });
  });

  describe('isOverBudget', () => {
    it('should return false when within budget', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      service.recordSpending(budget.id, 50);
      expect(service.isOverBudget(budget.id)).toBe(false);
    });

    it('should return true when over budget', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      service.recordSpending(budget.id, 150);
      expect(service.isOverBudget(budget.id)).toBe(true);
    });

    it('should return null for unknown id', () => {
      expect(service.isOverBudget('unknown')).toBeNull();
    });
  });

  describe('getActiveBudgets', () => {
    it('should return only currently active budgets', () => {
      const now = new Date();
      const pastStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const futureEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const pastEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      service.createBudget({ userId, name: 'Active', category: 'C', limit: 100, period: 'monthly', startDate: pastStart, endDate: futureEnd });
      service.createBudget({ userId, name: 'Expired', category: 'C', limit: 100, period: 'monthly', startDate: pastStart, endDate: pastEnd });

      const active = service.getActiveBudgets(userId);
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('Active');
    });
  });

  describe('deleteBudget', () => {
    it('should delete budget and return true', () => {
      const budget = service.createBudget({
        userId, name: 'B', category: 'C', limit: 100, period: 'monthly', startDate, endDate,
      });
      expect(service.deleteBudget(budget.id)).toBe(true);
      expect(service.getBudgetById(budget.id)).toBeNull();
    });

    it('should return false for unknown id', () => {
      expect(service.deleteBudget('unknown')).toBe(false);
    });
  });
});
