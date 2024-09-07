import { IsString, IsNumber } from 'class-validator';

export class ProductDto {
    @IsNumber()
    readonly id: number;

    @IsString()
    readonly cover_image: string;
  
    @IsString()
    readonly name: string;
  
    @IsString()
    readonly description: string;
  
    @IsNumber()
    readonly amount: number;
  
    @IsString()
    readonly currency: string;
  
    @IsNumber()
    readonly quantity: number;
  }