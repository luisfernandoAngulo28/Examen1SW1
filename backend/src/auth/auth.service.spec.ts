import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('test-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access_token for valid credentials', async () => {
      const hash = await bcrypt.hash('123456', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'DESIGNER', passwordHash: hash, departmentId: null,
      });

      const result = await service.login('test@test.com', '123456');
      expect(result.access_token).toBe('test-token');
      expect(result.user.email).toBe('test@test.com');
      expect(jwt.sign).toHaveBeenCalledWith({ sub: '1', email: 'test@test.com', role: 'DESIGNER' });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('wrong@test.com', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', passwordHash: hash,
      });
      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user and return data', async () => {
      prisma.user.create.mockResolvedValue({
        id: '2', email: 'new@test.com', name: 'Nuevo', role: 'OFFICER',
      });

      const result = await service.register('new@test.com', '123456', 'Nuevo', 'OFFICER');
      expect(result.email).toBe('new@test.com');
      expect(result.role).toBe('OFFICER');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'new@test.com', name: 'Nuevo', role: 'OFFICER' }),
      });
    });

    it('should hash the password before storing', async () => {
      prisma.user.create.mockResolvedValue({ id: '2', email: 'a@b.com', name: 'A', role: 'DESIGNER' });
      await service.register('a@b.com', 'mypassword', 'A', 'DESIGNER');
      const call = prisma.user.create.mock.calls[0][0];
      expect(call.data.passwordHash).toBeDefined();
      expect(call.data.passwordHash).not.toBe('mypassword');
      const isValid = await bcrypt.compare('mypassword', call.data.passwordHash);
      expect(isValid).toBe(true);
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: '1', name: 'Test' }]);
      const result = await service.findAllUsers();
      expect(result).toHaveLength(1);
    });
  });
});
