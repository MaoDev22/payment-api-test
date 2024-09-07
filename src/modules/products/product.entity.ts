import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';

import { TransactionDetail } from '@app/modules/transactions/transaction-detail.entity';

@Entity()
@Unique(['name'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cover_image: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  quantity: number;

  @OneToMany(() => TransactionDetail, transactionDetail => transactionDetail.transaction)
  transactionDetail: TransactionDetail[];
}
