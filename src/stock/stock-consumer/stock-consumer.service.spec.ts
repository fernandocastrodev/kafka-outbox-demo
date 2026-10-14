import { Test, TestingModule } from '@nestjs/testing';
import { StockConsumerService } from './stock-consumer.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('StockConsumerService', () => {
  let service: StockConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockConsumerService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            processedEvent: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<StockConsumerService>(StockConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
