import { AccountService } from '../services/AccountService';

describe('AccountService', () => {
  let service: AccountService;
  const userId = 'user-123';

  beforeEach(() => {
    service = new AccountService();
  });

  describe('createAccount', () => {
    it('should create an account with default balance and currency', () => {
      const account = service.createAccount({ userId, name: 'Checking', type: 'checking' });

      expect(account.userId).toBe(userId);
      expect(account.name).toBe('Checking');
      expect(account.type).toBe('checking');
      expect(account.balance).toBe(0);
      expect(account.currency).toBe('USD');
      expect(account.id).toBeDefined();
    });

    it('should create account with specified initial balance and currency', () => {
      const account = service.createAccount({
        userId,
        name: 'Savings',
        type: 'savings',
        initialBalance: 1000,
        currency: 'EUR',
      });

      expect(account.balance).toBe(1000);
      expect(account.currency).toBe('EUR');
    });
  });

  describe('getAccountById', () => {
    it('should return account by id', () => {
      const created = service.createAccount({ userId, name: 'A', type: 'cash' });
      expect(service.getAccountById(created.id)).toMatchObject({ id: created.id });
    });

    it('should return null for unknown id', () => {
      expect(service.getAccountById('unknown')).toBeNull();
    });
  });

  describe('getAccountsByUserId', () => {
    it('should return all accounts for a user', () => {
      service.createAccount({ userId, name: 'A1', type: 'checking' });
      service.createAccount({ userId, name: 'A2', type: 'savings' });
      service.createAccount({ userId: 'other', name: 'Other', type: 'cash' });

      const accounts = service.getAccountsByUserId(userId);
      expect(accounts).toHaveLength(2);
    });

    it('should return empty array for unknown user', () => {
      expect(service.getAccountsByUserId('nobody')).toHaveLength(0);
    });
  });

  describe('updateAccount', () => {
    it('should update account fields', () => {
      const account = service.createAccount({ userId, name: 'Old', type: 'checking' });
      const updated = service.updateAccount(account.id, { name: 'New', type: 'savings' });

      expect(updated!.name).toBe('New');
      expect(updated!.type).toBe('savings');
    });

    it('should return null for unknown id', () => {
      expect(service.updateAccount('unknown', { name: 'X' })).toBeNull();
    });
  });

  describe('updateBalance', () => {
    it('should update account balance', () => {
      const account = service.createAccount({ userId, name: 'A', type: 'checking' });
      const updated = service.updateBalance(account.id, 500);
      expect(updated!.balance).toBe(500);
    });

    it('should return null for unknown id', () => {
      expect(service.updateBalance('unknown', 100)).toBeNull();
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and return true', () => {
      const account = service.createAccount({ userId, name: 'A', type: 'cash' });
      expect(service.deleteAccount(account.id)).toBe(true);
      expect(service.getAccountById(account.id)).toBeNull();
    });

    it('should return false for unknown id', () => {
      expect(service.deleteAccount('unknown')).toBe(false);
    });
  });

  describe('getTotalBalanceByUserId', () => {
    it('should return total balance across all user accounts', () => {
      service.createAccount({ userId, name: 'A', type: 'checking', initialBalance: 100 });
      service.createAccount({ userId, name: 'B', type: 'savings', initialBalance: 200 });

      expect(service.getTotalBalanceByUserId(userId)).toBe(300);
    });

    it('should return 0 for user with no accounts', () => {
      expect(service.getTotalBalanceByUserId('nobody')).toBe(0);
    });
  });
});
