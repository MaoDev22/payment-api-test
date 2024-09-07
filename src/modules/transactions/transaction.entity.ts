import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import { TransactionDetail } from '@app/modules/transactions/transaction-detail.entity';
import { User } from '@app/modules/users/user.entity';

export enum TransactionStatus {
    PENDING = 'PENDING',
    VOID = 'VOID',
    ERROR = 'ERROR',
    APPROVED = 'APPROVED',
}

@Entity()   
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: string;

    @Column()
    total_amount: number;

    @Column({
        nullable: true,
    })
    provider_transaction_id: string;

    @ManyToOne(() => User, user => user.assignedRoles, { eager: true, nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => TransactionDetail, transactionDetail => transactionDetail.transaction)
    transactionDetail: TransactionDetail[];
}
