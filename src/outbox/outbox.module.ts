import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxPublisherService } from './outbox-publisher/outbox-publisher.service';

@Module({
  imports: [PrismaModule],
  providers: [OutboxPublisherService],
})
export class OutboxModule {}
