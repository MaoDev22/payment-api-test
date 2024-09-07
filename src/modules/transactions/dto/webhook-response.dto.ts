import { IsString, IsNumber, IsOptional, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class ThreeDSAuthInnerDto {
  @IsString()
  current_step: string;

  @IsString()
  current_step_status: string;
}

class ThreeDSAuthDto {
  @ValidateNested()
  @Type(() => ThreeDSAuthInnerDto)
  @IsOptional()
  three_ds_auth?: ThreeDSAuthInnerDto;
}

class PaymentMethodExtraDto {
  @IsString()
  @IsOptional()
  bin?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  exp_year?: string;

  @IsString()
  @IsOptional()
  card_type?: string;

  @IsString()
  @IsOptional()
  exp_month?: string;

  @IsString()
  @IsOptional()
  last_four?: string;

  @IsString()
  @IsOptional()
  card_holder?: string;

  @IsOptional()
  is_three_ds?: boolean;

  @IsString()
  @IsOptional()
  unique_code?: string;

  @ValidateNested()
  @Type(() => ThreeDSAuthDto)
  @IsOptional()
  three_ds_auth?: ThreeDSAuthDto;

  @IsString()
  @IsOptional()
  external_identifier?: string;

  @IsString()
  @IsOptional()
  processor_response_code?: string;
}

class PaymentMethodDto {
  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => PaymentMethodExtraDto)
  @IsOptional()
  extra?: PaymentMethodExtraDto;

  @IsNumber()
  installments: number;
}

class TransactionDto {
  @IsString()
  id: string;

  @IsString()
  created_at: string;

  @IsString()
  @IsOptional()
  finalized_at?: string;

  @IsNumber()
  amount_in_cents: number;

  @IsString()
  reference: string;

  @IsString()
  customer_email: string;

  @IsString()
  @IsIn(['COP', 'USD'])
  currency: string;

  @IsString()
  payment_method_type: string;

  @ValidateNested()
  @Type(() => PaymentMethodDto)
  payment_method: PaymentMethodDto;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  status_message?: string;

  @IsOptional()
  shipping_address?: any;

  @IsOptional()
  redirect_url?: string;

  @IsNumber()
  payment_source_id: number;

  @IsOptional()
  payment_link_id?: any;

  @IsOptional()
  customer_data?: any;

  @IsOptional()
  billing_data?: any;
}

class SignatureDto {
  @IsString()
  checksum: string;

  @IsString({ each: true })
  properties: string[];
}

class DataDto {
  @ValidateNested()
  @Type(() => TransactionDto)
  transaction: TransactionDto;
}

export class WebhookEventDto {
  @IsString()
  event: string;

  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto;

  @IsString()
  sent_at: string;

  @IsNumber()
  timestamp: number;

  @ValidateNested()
  @Type(() => SignatureDto)
  signature: SignatureDto;

  @IsString()
  environment: string;
}
