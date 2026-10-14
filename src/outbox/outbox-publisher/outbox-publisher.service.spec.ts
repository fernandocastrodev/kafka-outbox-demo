import { Test, TestingModule } from '@nestjs/testing';
import { OutboxPublisherService } from './outbox-publisher.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OutboxPublisherService', () => {
  let service: OutboxPublisherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxPublisherService,
        {
          provide: PrismaService,
          useValue: {
            outboxEvent: { findMany: jest.fn(), update: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<OutboxPublisherService>(OutboxPublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
