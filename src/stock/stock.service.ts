import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStockDto: CreateStockDto) {
    const existing = await this.prisma.stock.findUnique({
      where: { producto: createStockDto.producto },
    });
    if (existing) {
      throw new ConflictException('El producto ya existe');
    }
    return this.prisma.stock.create({ data: createStockDto });
  }

  findAll() {
    return this.prisma.stock.findMany({ orderBy: { producto: 'asc' } });
  }
}
