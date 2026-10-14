import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVentaDto: CreateVentaDto) {
    return this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          producto: createVentaDto.producto,
          cantidad: createVentaDto.cantidad,
          total: createVentaDto.total,
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'VENTA_CREADA',
          payload: {
            ventaId: venta.id,
            producto: venta.producto,
            cantidad: venta.cantidad,
            total: venta.total.toString(),
          },
        },
      });

      return venta;
    });
  }

  findAll() {
    return this.prisma.venta.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.venta.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, updateVentaDto: UpdateVentaDto) {
    return this.prisma.venta.update({ where: { id }, data: updateVentaDto });
  }

  remove(id: number) {
    return this.prisma.venta.delete({ where: { id } });
  }
}
