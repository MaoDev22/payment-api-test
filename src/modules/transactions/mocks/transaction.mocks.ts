import { Transaction } from '@app/modules/transactions/transaction.entity';
import { TransactionDetail } from '@app/modules/transactions/transaction-detail.entity';
import { CreateTransactionDto } from '@app/modules/transactions/dto/transaction.dto';
import { WebhookEventDto } from '@app/modules/transactions/dto/webhook-response.dto';

export const mockTransactionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    manager: {
        transaction: jest.fn().mockImplementation((callback) => {
            const transactionalEntityManager = {
                save: jest.fn().mockImplementation((entity) => {
                    if (entity instanceof Transaction) {
                        return { id: 1, ...entity };
                    } else if (entity instanceof TransactionDetail) {
                        return { id: Math.floor(Math.random() * 1000), ...entity };
                    }
                    return entity;
                }),
            };
            return callback(transactionalEntityManager);
        }),
    },
};

export const mockTransactionDetailRepository = {
    find: jest.fn(),
};

export const mockProductRepository = {
    findBy: jest.fn().mockResolvedValue([
        {
            id: 1,
            cover_image: 'https://res.cloudinary.com/dx1xp5trd/image/upload/c_fit,w_250,q_100/v1725304387/view-cats-dogs-being-friends_qpymz6.jpg',
            name: 'Correas',
            description: 'Ejemplo descripcion del producto',
            amount: 2490000,
            currency: 'COP',
            quantity: 46
        },
        {
            id: 2,
            cover_image: 'https://res.cloudinary.com/dx1xp5trd/image/upload/c_fit,w_250,q_100/v1725304386/cute-little-dog-impersonating-business-person_afiszi.jpg',
            name: 'Cama',
            description: 'Ejemplo descripcion del producto',
            amount: 2490000,
            currency: 'COP',
            quantity: 196
        }
    ]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
};

export const tockenCard = {
    "data": {
        "status": "CREATED",
        "data": {
            "id": "tok_stagtest_5113_7f1e91be11A3654af20cc17C42480d5F",
            "created_at": "2024-09-06T01:51:28.625+00:00",
            "brand": "VISA",
            "name": "VISA-4242",
            "last_four": "4242",
            "bin": "424242",
            "exp_year": "29",
            "exp_month": "12",
            "card_holder": "Marlon Torres",
            "created_with_cvc": true,
            "expires_at": "2025-03-05T01:51:26.000Z",
            "validity_ends_at": "2024-09-08T01:51:28.625+00:00"
        }
    }
}

export const acceptanceToken = {
    "data": {
        "presigned_acceptance": {
            "acceptance_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MjQzLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvcmVnbGFtZW50by1Vc3Vhcmlvcy1Db2xvbWJpYS5wZGYiLCJmaWxlX2hhc2giOiJkMWVkMDI3NjhlNDEzZWEyMzFmNzAwMjc0N2Y0N2FhOSIsImppdCI6IjE3MjU1ODczOTItNzc3MzciLCJlbWFpbCI6IiIsImV4cCI6MTcyNTU5MDk5Mn0.npAnaP4Fy3dMQ500Agyk4gUHAeEksADRkz7iWnr9VpU",
            "permalink": "https://wompi.com/assets/downloadble/reglamento-Usuarios-Colombia.pdf",
            "type": "END_USER_POLICYYY"
        }
    },
}

export const TransactionMock = (transactionId) => ({
    "data": {
        "id": transactionId,
        "created_at": "2024-09-06T00:46:15.524Z",
        "finalized_at": null,
        "amount_in_cents": 2490000,
        "reference": "sk8-438k4-xmxm392-sn9m",
        "customer_email": "maodev22@gmail.com",
        "currency": "COP",
        "payment_method_type": "CARD",
        "payment_method": {
            "type": "CARD",
            "extra": {
                "bin": "424242",
                "name": "VISA-4242",
                "brand": "VISA",
                "exp_year": "29",
                "card_type": "CREDIT",
                "exp_month": "12",
                "last_four": "4242",
                "card_holder": "Marlon Torres",
                "is_three_ds": false
            },
            "installments": 1
        },
        "status": "PENDING",
        "status_message": null,
        "billing_data": null,
        "shipping_address": null,
        "redirect_url": null,
        "payment_source_id": 25990,
        "payment_link_id": null,
        "customer_data": null,
        "bill_id": null,
        "taxes": [],
        "tip_in_cents": null
    },
    "meta": {}
})

export const createTransactionMock: CreateTransactionDto = {
    amount_in_cents: 1000,
    currency: 'USD',
    card_number: '4111111111111111',
    cvv: '123',
    exp_month: '12',
    exp_year: '44',
    expirationDate: '44-12',
    products: [
        {
            id: 1,
            cover_image: 'https://res.cloudinary.com/dx1xp5trd/image/upload/c_fit,w_250,q_100/v1725304387/view-cats-dogs-being-friends_qpymz6.jpg',
            name: 'Correas',
            description: 'Ejemplo descripcion del producto',
            amount: 2490000,
            currency: 'COP',
            quantity: 46
        },
        {
            id: 2,
            cover_image: 'https://res.cloudinary.com/dx1xp5trd/image/upload/c_fit,w_250,q_100/v1725304386/cute-little-dog-impersonating-business-person_afiszi.jpg',
            name: 'Cama',
            description: 'Ejemplo descripcion del producto',
            amount: 2490000,
            currency: 'COP',
            quantity: 196
        }
    ]
};

export const transactionWebhookApproved: WebhookEventDto = {
    "event": "transaction.updated",
    "data": {
        "transaction": {
            "id": "15113-1725670300-34007",
            "created_at": "2024-09-07T00:51:44.025Z",
            "finalized_at": "2024-09-07T00:51:44.000Z",
            "amount_in_cents": 4980000,
            "reference": "payment-27",
            "customer_email": "marlon@gmail.com",
            "currency": "COP",
            "payment_method_type": "CARD",
            "payment_method": {
                "type": "CARD",
                "extra": {
                    "bin": "424242",
                    "name": "VISA-4242",
                    "brand": "VISA",
                    "exp_year": "29",
                    "card_type": "CREDIT",
                    "exp_month": "12",
                    "last_four": "4242",
                    "card_holder": "Marlon Torres Lozano",
                    "is_three_ds": false,
                    "unique_code": "8482748a7e81f67e29569f18c9aa5fee315998be39bbc3717f62112ddbb77497",
                    "three_ds_auth": {
                        "three_ds_auth": {
                            "current_step": "AUTHENTICATION",
                            "current_step_status": "COMPLETED"
                        }
                    },
                    "external_identifier": "JJHVeewWdI",
                    "processor_response_code": "00"
                },
                "installments": 1
            },
            "status": "APPROVED",
            "status_message": null,
            "shipping_address": null,
            "redirect_url": null,
            "payment_source_id": 26009,
            "payment_link_id": null,
            "customer_data": null,
            "billing_data": null
        }
    },
    "sent_at": "2024-09-07T00:51:44.276Z",
    "timestamp": 1725670304,
    "signature": {
        "checksum": "65c2cfe1bd2b3ab93ac10fc7c43ce64b14c59ef705fbb30d490beba1d53c4a6a",
        "properties": [
            "transaction.id",
            "transaction.status",
            "transaction.amount_in_cents"
        ]
    },
    "environment": "stagtest"
};
