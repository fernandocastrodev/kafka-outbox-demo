import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockDto {
  @ApiProperty({ example: 'teclado', description: 'Nombre único del producto' })
  @IsString()
  @IsNotEmpty()
  producto!: string;

  @ApiProperty({ example: 20, minimum: 0 })
  @IsInt()
  @Min(0)
  cantidad!: number;
}
