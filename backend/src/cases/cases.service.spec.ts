import { Test, TestingModule } from '@nestjs/testing';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CasesService', () => {
  let service: CasesService;
  let prisma: any;
  let events: any;

  beforeEach(async () => {
    prisma = {
      case: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      task: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
      policy: { findUnique: jest.fn() },
      policyNode: { findUnique: jest.fn() },
      policyEdge: { findMany: jest.fn() },
      eventLog: { create: jest.fn() },
    };
    events = {
      emitCaseStarted: jest.fn(),
      emitCaseCompleted: jest.fn(),
      emitTaskCompleted: jest.fn(),
      emitTaskAssigned: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventsGateway, useValue: events },
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);
  });

  describe('findAll', () => {
    it('should return all cases', async () => {
      prisma.case.findMany.mockResolvedValue([{ id: '1', status: 'IN_PROGRESS' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by policyId', async () => {
      prisma.case.findMany.mockResolvedValue([]);
      await service.findAll('policy-1');
      expect(prisma.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { policyId: 'policy-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return case with details', async () => {
      prisma.case.findUnique.mockResolvedValue({ id: '1', tasks: [], eventLogs: [], policy: {} });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException for missing case', async () => {
      prisma.case.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('startCase', () => {
    it('should throw NotFoundException for missing policy', async () => {
      prisma.policy.findUnique.mockResolvedValue(null);
      await expect(service.startCase('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive policy', async () => {
      prisma.policy.findUnique.mockResolvedValue({ id: '1', status: 'INACTIVE', nodes: [], edges: [] });
      await expect(service.startCase('1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for policy with no nodes', async () => {
      prisma.policy.findUnique.mockResolvedValue({ id: '1', status: 'ACTIVE', nodes: [], edges: [] });
      await expect(service.startCase('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeTask', () => {
    it('should throw NotFoundException for missing task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(service.completeTask('bad-id', 'user1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for already completed task', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: '1', status: 'DONE' });
      await expect(service.completeTask('1', 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findTasksByUser', () => {
    it('should return tasks assigned or unassigned pending', async () => {
      prisma.task.findMany.mockResolvedValue([{ id: '1', status: 'PENDING' }]);
      const result = await service.findTasksByUser('user1');
      expect(result).toHaveLength(1);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ assignedUserId: 'user1' }, { assignedUserId: null, status: 'PENDING' }] },
        }),
      );
    });
  });

  describe('assignTask', () => {
    it('should throw NotFoundException for missing task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(service.assignTask('bad-id', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelCase', () => {
    it('should throw NotFoundException for missing case', async () => {
      prisma.case.findUnique.mockResolvedValue(null);
      await expect(service.cancelCase('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
