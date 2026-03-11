import { UserService } from '../services/UserService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user and return public user data', async () => {
      const result = await service.createUser({
        email: 'test@example.com',
        password: 'securepassword',
        name: 'Test User',
      });

      expect(result).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should normalize email to lowercase', async () => {
      const result = await service.createUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'password',
        name: 'User',
      });

      expect(result.email).toBe('test@example.com');
    });

    it('should throw if email already exists', async () => {
      await service.createUser({ email: 'dup@example.com', password: 'pass', name: 'A' });
      await expect(
        service.createUser({ email: 'dup@example.com', password: 'pass2', name: 'B' })
      ).rejects.toThrow('A user with this email already exists');
    });
  });

  describe('validateCredentials', () => {
    it('should return user on valid credentials', async () => {
      await service.createUser({ email: 'user@example.com', password: 'mypassword', name: 'User' });

      const result = await service.validateCredentials('user@example.com', 'mypassword');
      expect(result).not.toBeNull();
      expect(result!.email).toBe('user@example.com');
    });

    it('should return null on wrong password', async () => {
      await service.createUser({ email: 'user@example.com', password: 'correct', name: 'User' });
      const result = await service.validateCredentials('user@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      const result = await service.validateCredentials('nobody@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const created = await service.createUser({ email: 'a@b.com', password: 'p', name: 'A' });
      const found = service.getUserById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for unknown id', () => {
      expect(service.getUserById('nonexistent')).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user name', async () => {
      const user = await service.createUser({ email: 'u@e.com', password: 'p', name: 'Old Name' });
      const updated = service.updateUser(user.id, { name: 'New Name' });
      expect(updated!.name).toBe('New Name');
    });

    it('should return null for unknown id', () => {
      expect(service.updateUser('nonexistent', { name: 'X' })).toBeNull();
    });

    it('should throw if updated email conflicts with existing user', async () => {
      const user1 = await service.createUser({ email: 'u1@e.com', password: 'p', name: 'U1' });
      await service.createUser({ email: 'u2@e.com', password: 'p', name: 'U2' });
      expect(() => service.updateUser(user1.id, { email: 'u2@e.com' })).toThrow(
        'A user with this email already exists'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return true', async () => {
      const user = await service.createUser({ email: 'del@e.com', password: 'p', name: 'Del' });
      expect(service.deleteUser(user.id)).toBe(true);
      expect(service.getUserById(user.id)).toBeNull();
    });

    it('should return false for unknown id', () => {
      expect(service.deleteUser('nonexistent')).toBe(false);
    });
  });
});
