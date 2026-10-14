import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateVentaDto {
  @IsString()
  @IsNotEmpty()
  producto!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total!: number;
}
