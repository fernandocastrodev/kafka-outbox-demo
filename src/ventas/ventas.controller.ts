import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('ventas')
@ApiTags('Ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Venta y evento outbox creados' })
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(createVentaDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Listado de ventas' })
  findAll() {
    return this.ventasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventasService.update(+id, updateVentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventasService.remove(+id);
  }
}
