<div align="center">

# Kafka Outbox Demo

Transacciones confiables entre una API de ventas, PostgreSQL y Apache Kafka mediante el patrón Transactional Outbox.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-4-231F20?logo=apachekafka&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)

</div>

## Arquitectura

```text
POST /ventas
     │
     ▼
┌──────────────────────────────┐
│ Transacción PostgreSQL       │
│  1. Crea la venta            │
│  2. Crea el evento outbox    │
└──────────────┬───────────────┘
               │ publicador periódico
               ▼
         Kafka: ventas
               │
               ▼
┌──────────────────────────────┐
│ Consumidor de stock          │
│  1. Verifica idempotencia    │
│  2. Descuenta stock          │
│  3. Registra evento procesado│
└──────────────┬───────────────┘
               │ después de 3 fallos
               ▼
        Kafka: ventas-dlq
```

La venta y su evento se guardan en una misma transacción. El publicador envía eventos pendientes a Kafka y los marca como publicados. El consumidor actualiza stock de forma atómica, evita procesar dos veces el mismo evento y deriva los fallos persistentes a una DLQ.

## Requisitos

- Node.js 20.19 o superior
- pnpm
- Docker Desktop con Docker Compose

## Puesta en marcha

```bash
pnpm install
```

Copia `.env.example` como `.env`. Luego inicia PostgreSQL y Kafka, aplica las migraciones y levanta la API:

```bash
docker compose up -d
pnpm exec prisma migrate deploy
pnpm run start:dev
```

La API queda disponible en `http://localhost:3000`.

## Probar el flujo

Primero crea stock para un producto desde Prisma Studio:

```bash
pnpm exec prisma studio
```

Agrega, por ejemplo, un registro `Stock` con `producto = teclado` y `cantidad = 20`. Después crea una venta:

```bash
curl -X POST http://localhost:3000/ventas \
  -H "Content-Type: application/json" \
  -d '{"producto":"teclado","cantidad":2,"total":49.90}'
```

El publicador revisa el outbox cada 7 segundos. Luego del procesamiento, la venta queda registrada, el evento pasa a `PUBLICADO`, el stock baja a 18 y el identificador queda en `processed_events`.

## Endpoints

| Método   | Ruta          | Descripción                            |
| -------- | ------------- | -------------------------------------- |
| `POST`   | `/ventas`     | Crea una venta y su evento outbox      |
| `GET`    | `/ventas`     | Lista las ventas más recientes primero |
| `GET`    | `/ventas/:id` | Obtiene una venta                      |
| `PATCH`  | `/ventas/:id` | Actualiza una venta                    |
| `DELETE` | `/ventas/:id` | Elimina una venta                      |

Ejemplo del cuerpo de una venta:

```json
{
  "producto": "teclado",
  "cantidad": 2,
  "total": 49.9
}
```

## Configuración

| Variable                | Valor predeterminado  | Uso                        |
| ----------------------- | --------------------- | -------------------------- |
| `DATABASE_URL`          | requerida             | Conexión a PostgreSQL      |
| `PORT`                  | `3000`                | Puerto HTTP                |
| `KAFKA_BROKERS`         | `localhost:9092`      | Brokers separados por coma |
| `KAFKA_CLIENT_ID`       | `kafka-outbox-demo`   | Cliente del publicador     |
| `KAFKA_STOCK_CLIENT_ID` | `stock-service`       | Cliente del consumidor     |
| `KAFKA_STOCK_GROUP_ID`  | `stock-service-group` | Grupo del consumidor       |
| `KAFKA_VENTAS_TOPIC`    | `ventas`              | Tópico principal           |
| `KAFKA_DLQ_TOPIC`       | `ventas-dlq`          | Dead-letter topic          |

## Calidad

```bash
pnpm run build
pnpm run lint
pnpm test --runInBand
pnpm run test:e2e --runInBand
```

Para detener la infraestructura:

```bash
docker compose down
```

Usa `docker compose down -v` solamente si también quieres eliminar los datos locales de PostgreSQL.

## Decisiones del diseño

- **Transactional Outbox:** evita guardar una venta sin conservar el evento que debe publicarse.
- **Entrega al menos una vez:** un fallo entre publicar y marcar como publicado puede generar duplicados.
- **Consumidor idempotente:** `processed_events.eventId` es único y protege el stock ante duplicados.
- **Actualización atómica:** el stock solo se descuenta si existe cantidad suficiente.
- **DLQ:** después de tres intentos fallidos, el evento y el error se guardan en `ventas-dlq`.

## Alcance

Este repositorio es una demostración local del patrón Outbox. Para producción conviene agregar autenticación, validación HTTP, observabilidad, reintentos con backoff administrado, métricas de lag, health checks y una estrategia de reclamación de eventos outbox concurrentes.
