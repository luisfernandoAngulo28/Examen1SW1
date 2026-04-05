import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesService } from './policies.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PoliciesService', () => {
  let service: PoliciesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      policy: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      policyNode: { findMany: jest.fn(), deleteMany: jest.fn(), create: jest.fn() },
      policyEdge: { deleteMany: jest.fn(), create: jest.fn() },
      formTemplate: { deleteMany: jest.fn() },
      formSubmission: { deleteMany: jest.fn() },
      task: { deleteMany: jest.fn() },
      case: { count: jest.fn().mockResolvedValue(0) },
      $transaction: jest.fn((fn) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PoliciesService>(PoliciesService);
  });

  describe('findAll', () => {
    it('should return all policies ordered by createdAt desc', async () => {
      prisma.policy.findMany.mockResolvedValue([
        { id: '1', name: 'Policy A' },
        { id: '2', name: 'Policy B' },
      ]);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(prisma.policy.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    });
  });

  describe('findOne', () => {
    it('should return policy with nodes and edges', async () => {
      prisma.policy.findUnique.mockResolvedValue({
        id: '1', name: 'Test', nodes: [], edges: [],
      });

      const result = await service.findOne('1');
      expect(result?.name).toBe('Test');
      expect(prisma.policy.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.objectContaining({ nodes: expect.any(Object), edges: true }),
      });
    });
  });

  describe('create', () => {
    it('should create a new policy', async () => {
      prisma.policy.create.mockResolvedValue({ id: '1', name: 'New', createdBy: 'user1' });

      const result = await service.create('New', 'user1');
      expect(result.name).toBe('New');
      expect(prisma.policy.create).toHaveBeenCalledWith({ data: { name: 'New', createdBy: 'user1' } });
    });
  });

  describe('update', () => {
    it('should update policy name', async () => {
      prisma.policy.update.mockResolvedValue({ id: '1', name: 'Updated', status: 'ACTIVE' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should set policy status to INACTIVE', async () => {
      prisma.policy.update.mockResolvedValue({ id: '1', status: 'INACTIVE' });

      await service.remove('1');
      expect(prisma.policy.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'INACTIVE' },
      });
    });
  });

  describe('saveGraph', () => {
    it('should save nodes and edges in a transaction', async () => {
      prisma.policyNode.findMany.mockResolvedValue([]);
      prisma.policyNode.create.mockResolvedValue({ id: 'n1' });
      prisma.policyEdge.create.mockResolvedValue({ id: 'e1' });
      prisma.policy.findUnique.mockResolvedValue({ id: '1', nodes: [{ id: 'n1' }], edges: [{ id: 'e1' }] });

      const nodes = [{ id: 'n1', departmentId: 'd1', title: 'Step 1', positionX: 0, positionY: 0 }];
      const edges = [{ fromNodeId: 'n1', toNodeId: 'n2', flowType: 'SEQUENTIAL' }];

      await service.saveGraph('1', nodes, edges);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.policyNode.create).toHaveBeenCalled();
      expect(prisma.policyEdge.create).toHaveBeenCalled();
    });
  });
});
