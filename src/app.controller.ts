import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller('health')
@ApiTags('Health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    description: 'La API está activa',
    example: {
      status: 'ok',
      service: 'kafka-outbox-demo',
      pattern: 'transactional-outbox',
      message: 'La API está activa y lista para recibir solicitudes',
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
