import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockConsumerService } from './stock-consumer/stock-consumer.service';

@Module({
  imports: [PrismaModule],
  providers: [StockConsumerService],
})
export class StockModule {}
