import { IsString, IsNumber, ValidateNested, IsIn, Matches } from 'class-validator';
import { Type } from 'class-transformer';

import { ProductDto } from '@app/modules/products/dto/product.dto';
import IsFutureDate from '@app/common/validators/IsFutureDate';

export class CreateTransactionDto {
  @IsString()
  @Matches(/^\S*$/, { message: 'CVV should not contain spaces' })
  readonly cvv: string;

  @IsString()
  @Matches(/^\S*$/, { message: 'Card number should not contain spaces' })
  readonly card_number: string;

  @IsString()
  readonly exp_month: string;

  @IsString()
  readonly exp_year: string;

  @IsString()
  @IsFutureDate({ message: 'The expiration date should be in the future' })
  get expirationDate(): string {
    return `${this.exp_year}-${this.exp_month}`;
  }

  @IsNumber()
  readonly amount_in_cents: number;

  @IsString()
  @IsIn(['COP', 'USD'])
  readonly currency: 'COP' | 'USD';

  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  readonly products: ProductDto[];
}
