import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVentaDto {
  @ApiProperty({ example: 'teclado' })
  @IsString()
  @IsNotEmpty()
  producto!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiProperty({ example: 49.9, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total!: number;
}
