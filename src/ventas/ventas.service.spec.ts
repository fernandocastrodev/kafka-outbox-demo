import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VentasService', () => {
  let service: VentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            venta: {
              findMany: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
