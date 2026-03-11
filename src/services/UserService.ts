import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User } from '../types';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export class UserService {
  private users: Map<string, User> = new Map();
  private readonly SALT_ROUNDS = 10;

  async createUser(input: CreateUserInput): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = this.findByEmail(input.email);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    return this.toPublicUser(user);
  }

  async validateCredentials(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return this.toPublicUser(user);
  }

  getUserById(id: string): Omit<User, 'passwordHash'> | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    return this.toPublicUser(user);
  }

  updateUser(id: string, input: UpdateUserInput): Omit<User, 'passwordHash'> | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    if (input.email) {
      const existing = this.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new Error('A user with this email already exists');
      }
      user.email = input.email.toLowerCase().trim();
    }

    if (input.name !== undefined) {
      user.name = input.name.trim();
    }

    user.updatedAt = new Date();
    this.users.set(id, user);
    return this.toPublicUser(user);
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  private findByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }
    return undefined;
  }

  private toPublicUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
