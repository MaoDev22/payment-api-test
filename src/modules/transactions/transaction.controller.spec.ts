import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import { AppModule } from '@app/app.module';
import { Transaction } from '@app/modules/transactions/transaction.entity';
import { TransactionDetail } from '@app/modules/transactions/transaction-detail.entity';
import { Product } from '@app/modules/products/product.entity';
import { JwtAuthGuard } from '@app/modules/auth/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';

import {
    mockTransactionRepository,
    mockTransactionDetailRepository,
    mockProductRepository,
    tockenCard,
    acceptanceToken,
    TransactionMock,
    createTransactionMock,
    transactionWebhookApproved
} from './mocks/transaction.mocks';

const mockConfigService = {
    get: jest.fn(),
};

describe('TransactionsController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard).useValue({
                canActivate: (context: any) => {
                    const request = context.switchToHttp().getRequest();
                    request.user = { id: 1, email: 'test@example.com', username: 'Marlon Torres Lozano', roles: ['user'] };
                    return true;
                },
            })
            .overrideGuard(RolesGuard).useValue({
                canActivate: jest.fn(() => true),
            })
            .overrideProvider(getRepositoryToken(Transaction)).useValue(mockTransactionRepository)
            .overrideProvider(getRepositoryToken(TransactionDetail)).useValue(mockTransactionDetailRepository)
            .overrideProvider(getRepositoryToken(Product)).useValue(mockProductRepository)
            .overrideProvider('ConfigService').useValue(mockConfigService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('/transactions (POST)', () => {
        it('should create a transaction successfully', async () => {
            var axiosMock = new MockAdapter(axios);
            const transactionId = "15113-1725583571-99550";

            axiosMock.onPost(process.env.URL_PAYMENT+'/v1/tokens/cards').reply(200, tockenCard);

            axiosMock.onPost(process.env.URL_PAYMENT+'/v1/payment_sources').reply(200, {
                "data": {
                    "id": 25992,
                },
            });

            axiosMock.onGet(process.env.URL_PAYMENT+'/v1/merchants/'+process.env.PUBLIC_TOKEN).reply(200, acceptanceToken);

            axiosMock.onPost(process.env.URL_PAYMENT+'/v1/transactions').reply(200, TransactionMock(transactionId));

            mockTransactionRepository.save.mockResolvedValue({ id: 1, ...createTransactionMock });

            return request(app.getHttpServer())
                .post('/transactions')
                .set('Authorization', 'Bearer example_token')
                .send(createTransactionMock)
                .expect(201)
                .expect({
                    message: 'Transaction created successfully',
                    provider_transaction_id: transactionId,
                });
        });
    });

    describe('/transactions/webhook (POST)', () => {
        it('should update a transaction successfully', async () => {
            mockTransactionRepository.findOne.mockResolvedValue({ id: 'mocked_transaction_id', status: 'PENDING' });
            mockTransactionRepository.save.mockResolvedValue({});
            mockTransactionDetailRepository.find.mockResolvedValue([]);
            mockProductRepository.findOne.mockResolvedValue({ id: 1, quantity: 10 });

            return request(app.getHttpServer())
                .post('/transactions/webhook')
                .send(transactionWebhookApproved)
                .expect(200)
                .expect({
                    message: 'Payment updated successfully',
                });
        });
    });
});
