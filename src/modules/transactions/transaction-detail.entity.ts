import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Transaction } from '@app/modules/transactions/transaction.entity';
import { Product } from '@app/modules/products/product.entity';

@Entity()
export class TransactionDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, product => product.transactionDetail, { eager: true, nullable: false })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Transaction, transaction => transaction.transactionDetail, { eager: true, nullable: false })
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @Column()
    amount: number;

    @Column()
    quantity: number;
}
