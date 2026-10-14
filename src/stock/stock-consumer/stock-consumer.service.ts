import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka, Partitioners, Producer } from 'kafkajs';
import { PrismaService } from '../../prisma/prisma.service';

interface VentaCreadaEvent {
  eventId: number;
  eventType: 'VENTA_CREADA';
  payload: {
    ventaId: number;
    producto: string;
    cantidad: number;
    total: string;
  };
}

@Injectable()
export class StockConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StockConsumerService.name);
  private readonly consumer: Consumer;
  private readonly producer: Producer;

  constructor(private readonly prisma: PrismaService) {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_STOCK_CLIENT_ID ?? 'stock-service',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    });
    this.consumer = kafka.consumer({
      groupId: process.env.KAFKA_STOCK_GROUP_ID ?? 'stock-service-group',
    });
    this.producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({
      topic: process.env.KAFKA_VENTAS_TOPIC ?? 'ventas',
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        let event: VentaCreadaEvent;
        try {
          event = this.parseEvent(message.value.toString());
        } catch (error) {
          this.logger.error('Se recibió un evento de venta inválido', error);
          return;
        }

        const alreadyProcessed = await this.prisma.processedEvent.findUnique({
          where: { eventId: event.eventId },
        });
        if (alreadyProcessed) {
          this.logger.warn(
            `Evento ${event.eventId} ya fue procesado. Se ignora.`,
          );
          return;
        }

        const maxRetries = 3;
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            await this.prisma.$transaction(async (tx) => {
              const updated = await tx.stock.updateMany({
                where: {
                  producto: event.payload.producto,
                  cantidad: { gte: event.payload.cantidad },
                },
                data: { cantidad: { decrement: event.payload.cantidad } },
              });
              if (updated.count === 0) {
                throw new Error(
                  `Stock inexistente o insuficiente para ${event.payload.producto}`,
                );
              }
              await tx.processedEvent.create({
                data: {
                  eventId: event.eventId,
                  consumer:
                    process.env.KAFKA_STOCK_GROUP_ID ?? 'stock-service-group',
                },
              });
            });
            this.logger.log(
              `Stock actualizado y evento ${event.eventId} registrado`,
            );
            return;
          } catch (error) {
            lastError = error;
            this.logger.warn(
              `Intento ${attempt}/${maxRetries} falló para evento ${event.eventId}`,
            );
            if (attempt < maxRetries) {
              await new Promise((resolve) =>
                setTimeout(resolve, attempt * 1000),
              );
            }
          }
        }
        await this.sendToDlq(event, lastError);
      },
    });
    this.logger.log('Stock Consumer conectado a Kafka');
  }

  private parseEvent(value: string): VentaCreadaEvent {
    const event: unknown = JSON.parse(value);
    if (!this.isVentaCreadaEvent(event)) {
      throw new Error('Evento de venta inválido');
    }
    return event;
  }

  private isVentaCreadaEvent(event: unknown): event is VentaCreadaEvent {
    if (typeof event !== 'object' || event === null) return false;
    const candidate = event as Partial<VentaCreadaEvent>;
    const payload = candidate.payload;
    return (
      Number.isInteger(candidate.eventId) &&
      candidate.eventType === 'VENTA_CREADA' &&
      typeof payload === 'object' &&
      payload !== null &&
      Number.isInteger(payload.ventaId) &&
      typeof payload.producto === 'string' &&
      payload.producto.length > 0 &&
      Number.isInteger(payload.cantidad) &&
      payload.cantidad > 0 &&
      typeof payload.total === 'string'
    );
  }

  private async sendToDlq(event: VentaCreadaEvent, error: unknown) {
    await this.producer.send({
      topic: process.env.KAFKA_DLQ_TOPIC ?? 'ventas-dlq',
      messages: [
        {
          key: event.eventId.toString(),
          value: JSON.stringify({
            originalEvent: event,
            error: error instanceof Error ? error.message : String(error),
            failedAt: new Date().toISOString(),
          }),
        },
      ],
    });
    this.logger.warn(`Evento ${event.eventId} enviado a ventas-dlq`);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }
}
