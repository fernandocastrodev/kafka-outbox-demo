import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kafka Outbox Demo API')
    .setDescription(
      'API de ventas y stock que demuestra el patrón Transactional Outbox con Kafka.',
    )
    .setVersion('1.0')
    .addTag('Health', 'Estado de la API')
    .addTag('Ventas', 'Operaciones de venta y generación de eventos outbox')
    .addTag('Stock', 'Administración del inventario de productos')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
