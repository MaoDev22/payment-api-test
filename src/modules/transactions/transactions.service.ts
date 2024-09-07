import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { TextEncoder } from 'util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Transaction, TransactionStatus } from './transaction.entity';
import { TransactionDetail } from './transaction-detail.entity';
import { Product } from '@app/modules/products/product.entity';
import { User } from '@app/modules/users/user.entity';
import { CreateTransactionDto } from './dto/transaction.dto';
import { WebhookEventDto } from './dto/webhook-response.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionDetail)
    private readonly transactionDetailRepository: Repository<TransactionDetail>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  private async createTokenTarjet({
    number,
    cvc,
    exp_month,
    exp_year,
    card_holder
  } : {
    number: String,
    cvc: String,
    exp_month: String,
    exp_year: String,
    card_holder: String
  }) {
    const urlPayment = this.configService.get<string>('URL_PAYMENT');
    const publicToken = this.configService.get<string>('PUBLIC_TOKEN');

    return await axios.post(`${urlPayment}/v1/tokens/cards`, {
      number,
      cvc,
      exp_month,
      exp_year,
      card_holder
    },{
      headers: {
        'Authorization': `Bearer ${publicToken}`,
        'Content-Type': 'application/json',
      }
    });
  }

  private async createPaymentSource({
    type,
    token,
    customer_email,
    acceptance_token,
  } : {
    type: String,
    token: String,
    customer_email: String,
    acceptance_token: String,
  }) {
    const urlPayment = this.configService.get<string>('URL_PAYMENT');
    const privateToken = this.configService.get<string>('PRIVATE_TOKEN');

    return await axios.post(`${urlPayment}/v1/payment_sources`, {
      type,
      token,
      customer_email,
      acceptance_token,
    },{
      headers: {
        'Authorization': `Bearer ${privateToken}`,
        'Content-Type': 'application/json',
      }
    });
  }

  private async generateIntegritySignature(
    referencia: String,
    monto: Number,
    moneda: String,
  ): Promise<String> {
    const integritySecret = this.configService.get<string>('INTEGRITY_TOKEN');
    let cadenaConcatenada = `${referencia}${monto}${moneda}${integritySecret}`;
  
    const encoder = new TextEncoder();
    const data = encoder.encode(cadenaConcatenada);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
    return hashHex;
  }

  private async createProviderTransaction({
    amount_in_cents,
    currency,
    customer_email,
    payment_method,
    reference,
    payment_source_id
  } : {
    amount_in_cents: Number,
    currency: String,
    customer_email: String,
    payment_method: { installments: Number },
    reference: String,
    payment_source_id: Number
  }) {
    const urlPayment = this.configService.get<string>('URL_PAYMENT');
    const privateToken = this.configService.get<string>('PRIVATE_TOKEN');
    const signature = await this.generateIntegritySignature(reference, amount_in_cents, currency);

    return await axios.post(`${urlPayment}/v1/transactions`, {
      amount_in_cents,
      currency,
      customer_email,
      payment_method,
      reference,
      payment_source_id,
      signature
    },{
      headers: {
        'Authorization': `Bearer ${privateToken}`,
        'Content-Type': 'application/json',
      }
    });
  }

  private async acceptanceToken() {
    const urlPayment = this.configService.get<string>('URL_PAYMENT');
    const publicToken = this.configService.get<string>('PUBLIC_TOKEN');

    return await axios.get(`${urlPayment}/v1/merchants/${publicToken}`);
  }

  async createTransaction(payload: CreateTransactionDto, user: User): Promise<{ message: string }> {
    return await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
      try {
        const transaction = new Transaction();
        transaction.status = TransactionStatus.PENDING;
        transaction.total_amount = payload.amount_in_cents;
        transaction.user = user;
    
        const savedTransaction = await transactionalEntityManager.save(transaction);

        const productIds = payload.products.map(product => product.id);
        const products = await this.productRepository.findBy({
          id: In(productIds),
        });

        if (products.length !== payload.products.length) {
          throw new Error('Some products were not found');
        }
    
        const transactionDetails = payload.products.map(productDto => {
          const product = products.find(p => p.id === productDto.id);
          const transactionDetail = new TransactionDetail();
          transactionDetail.amount = productDto.amount;
          transactionDetail.quantity = productDto.quantity;
          transactionDetail.product = product;
          transactionDetail.transaction = savedTransaction;
    
          return transactionalEntityManager.save(transactionDetail);
        });

        await Promise.all(transactionDetails);

        const { data: { data: { id } } } = await this.createTokenTarjet({
          number: payload.card_number,
          cvc: payload.cvv,
          exp_month: payload.exp_month,
          exp_year: payload.exp_year,
          card_holder: user.username
        });

        const { data: { data: { presigned_acceptance: { acceptance_token } } } } = await this.acceptanceToken();

        const { data: { data: { id: idPaymentResource } } } = await this.createPaymentSource({
          type: "CARD",
          token: id,
          customer_email: user.email,
          acceptance_token
        });

        const { data: { data: resultProviderTransaction } } = await this.createProviderTransaction({
          amount_in_cents: payload.amount_in_cents,
          currency: payload.currency,
          customer_email: user.email,
          payment_method: { installments: 1 },
          reference: "payment-"+savedTransaction.id,
          payment_source_id: idPaymentResource
        });

        savedTransaction.provider_transaction_id = resultProviderTransaction.id;
        await transactionalEntityManager.save(savedTransaction)

        return {
          message: 'Transaction created successfully',
          provider_transaction_id: resultProviderTransaction.id,
        };

      } catch (error) {
        throw new InternalServerErrorException("Internal server error");
      }
    });
  }

  async updateTransaction(body: WebhookEventDto) {
    try {
      const { transaction } = body.data;

      const transactionId = transaction.id;

      let transactionToUpdate = await this.transactionRepository.findOne({
        where: { provider_transaction_id: transactionId }
      });

      if (!transactionToUpdate) {
        throw new NotFoundException('Transaction not found');
      }

      transactionToUpdate.status = transaction.status;

      if (transaction.status === TransactionStatus.APPROVED) {
        const transactionDetails = await this.transactionDetailRepository.find({
          where: { transaction: { id: transactionToUpdate.id } },
          relations: ['product']
        });

        for (const detail of transactionDetails) {
          const product = await this.productRepository.findOne({
            where: { id: detail.product.id }
          });
          if (product) {
            product.quantity -= detail.quantity;
            await this.productRepository.save(product);
          } else {
            throw new InternalServerErrorException('Product not found');
          }
        }
      }

      await this.transactionRepository.save(transactionToUpdate);

      return {
        message: 'Payment updated successfully'
      };

    } catch (error) {
      throw new InternalServerErrorException('Error updating payment');
    }
  }
}
