import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Partitioners, Producer } from 'kafkajs';
import { PrismaService } from '../../prisma/prisma.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private readonly producer: Producer;

  constructor(private readonly prisma: PrismaService) {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'kafka-outbox-demo',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    });

    this.producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka Producer conectado');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  @Interval(7000)
  async publishPendingEvents() {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: 'PENDIENTE',
      },
      orderBy: {
        id: 'asc',
      },
    });

    this.logger.log(`Eventos pendientes encontrados: ${events.length}`);

    for (const event of events) {
      await this.producer.send({
        topic: process.env.KAFKA_VENTAS_TOPIC ?? 'ventas',
        messages: [
          {
            key: event.id.toString(),
            value: JSON.stringify({
              eventId: event.id,
              eventType: event.eventType,
              payload: event.payload,
            }),
          },
        ],
      });

      await this.prisma.outboxEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: 'PUBLICADO',
          publishedAt: new Date(),
        },
      });

      this.logger.log(`Evento ${event.id} publicado en Kafka`);
    }
  }
}
