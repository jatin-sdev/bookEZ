import { registerUser, loginUser, refreshUserToken } from './auth.service';
import { db } from '../db';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken } from './auth.utils';

// Mock database
jest.mock('../db', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(() => ({
      values: jest.fn(),
    })),
  },
}));

// Mock bcrypt
jest.mock('bcrypt');

// Mock jwt
jest.mock('jsonwebtoken');

// Mock auth utils
jest.mock('./auth.utils', () => ({
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register new user with valid data', async () => {
      const mockHashedPassword = 'hashed_password_123';
      
      // Mock: No existing user
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock: Password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      
      // Mock: Insert operation
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      await registerUser('John Doe', 'john@example.com', 'password123');

      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockInsert.values).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john@example.com',
        passwordHash: mockHashedPassword,
        role: 'USER',
      });
    });

    it('should normalize email (trim and lowercase)', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      await registerUser('John Doe', '  JoHn@ExAmPlE.com  ', 'password123');

      expect(mockInsert.values).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
        })
      );
    });

    it('should reject duplicate email registration', async () => {
      // Mock: User already exists
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'john@example.com',
      });

      await expect(
        registerUser('John Doe', 'john@example.com', 'password123')
      ).rejects.toThrow('Email already in use');

      // Should not call hash or insert
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should set default role to USER', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      await registerUser('John Doe', 'john@example.com', 'password123');

      expect(mockInsert.values).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'USER',
        })
      );
    });

    it('should hash password using bcrypt with cost factor 10', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      await registerUser('John Doe', 'john@example.com', 'my_secret_password');

      expect(bcrypt.hash).toHaveBeenCalledWith('my_secret_password', 10);
    });
  });

  describe('loginUser', () => {
    it('should successfully login with correct credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        role: 'USER',
      };

      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (signAccessToken as jest.Mock).mockReturnValue('access_token_123');
      (signRefreshToken as jest.Mock).mockReturnValue('refresh_token_123');

      const result = await loginUser('john@example.com', 'password123');

      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    it('should return access and refresh tokens', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        passwordHash: 'hashed',
        role: 'ADMIN',
      };

      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (signAccessToken as jest.Mock).mockReturnValue('access_token');
      (signRefreshToken as jest.Mock).mockReturnValue('refresh_token');

      const result = await loginUser('john@example.com', 'password');

      expect(signAccessToken).toHaveBeenCalledWith({
        id: 'user-123',
        role: 'ADMIN',
      });
      expect(signRefreshToken).toHaveBeenCalledWith({ id: 'user-123' });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should reject login with non-existent email', async () => {
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        loginUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject login with incorrect password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        passwordHash: 'hashed_password',
        role: 'USER',
      };

      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Wrong password

      await expect(
        loginUser('john@example.com', 'wrong_password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should normalize email during login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        passwordHash: 'hashed',
        role: 'USER',
      };

      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (signAccessToken as jest.Mock).mockReturnValue('token');
      (signRefreshToken as jest.Mock).mockReturnValue('token');

      await loginUser('  JoHn@ExAmPlE.com  ', 'password');

      // Should query with normalized email
      expect(db.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
    });
  });

  describe('refreshUserToken', () => {
    beforeEach(() => {
      // Set mock environment variable
      process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    });

    it('should generate new tokens with valid refresh token', async () => {
      const mockPayload = { id: 'user-123' };
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        role: 'USER',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (signAccessToken as jest.Mock).mockReturnValue('new_access_token');
      (signRefreshToken as jest.Mock).mockReturnValue('new_refresh_token');

      const result = await refreshUserToken('old_refresh_token');

      expect(jwt.verify).toHaveBeenCalledWith('old_refresh_token', 'test_refresh_secret');
      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });
    });

    it('should return both new access and refresh tokens (rotation)', async () => {
      const mockPayload = { id: 'user-123' };
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        role: 'ADMIN',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (signAccessToken as jest.Mock).mockReturnValue('new_access');
      (signRefreshToken as jest.Mock).mockReturnValue('new_refresh');

      const result = await refreshUserToken('token');

      // Should generate BOTH new tokens (token rotation)
      expect(signAccessToken).toHaveBeenCalledWith({
        id: 'user-123',
        role: 'ADMIN',
      });
      expect(signRefreshToken).toHaveBeenCalledWith({ id: 'user-123' });
      expect(result.accessToken).toBe('new_access');
      expect(result.refreshToken).toBe('new_refresh');
    });

    it('should reject expired refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        refreshUserToken('expired_token')
      ).rejects.toThrow('jwt expired');

      expect(db.query.users.findFirst).not.toHaveBeenCalled();
    });

    it('should reject if user no longer exists', async () => {
      const mockPayload = { id: 'deleted-user-123' };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (db.query.users.findFirst as jest.Mock).mockResolvedValue(null); // User deleted

      await expect(
        refreshUserToken('valid_token')
      ).rejects.toThrow('User no longer exists');
    });
  });
});
