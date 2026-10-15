import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'kafka-outbox-demo',
      pattern: 'transactional-outbox',
      message: 'La API está activa y lista para recibir solicitudes',
    };
  }
}
