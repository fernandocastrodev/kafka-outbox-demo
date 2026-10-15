import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStockDto } from './dto/create-stock.dto';
import { StockService } from './stock.service';

@Controller('stock')
@ApiTags('Stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Producto creado con su stock inicial' })
  @ApiConflictResponse({ description: 'El producto ya existe' })
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Listado de existencias' })
  findAll() {
    return this.stockService.findAll();
  }
}
