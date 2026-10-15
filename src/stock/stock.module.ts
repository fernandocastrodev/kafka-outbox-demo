import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockConsumerService } from './stock-consumer/stock-consumer.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [PrismaModule],
  controllers: [StockController],
  providers: [StockConsumerService, StockService],
})
export class StockModule {}
