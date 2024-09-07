## Description

This project is a web application designed to manage transactions, products, and user roles. It features a robust back-end powered by TypeORM with a PostgreSQL database, and a front-end developed using React. The application allows users to manage their roles, products, and transactions efficiently.

## Installation

```bash
$ npm install
```

## Enviroments
```bash
#JWT
SECRET_KEY=EXAMPLE_SECRET
EXPIRES_IN=6h

#DATABASE
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

#PAYMENT PLATFORM
URL_PAYMENT=
PUBLIC_TOKEN=
PRIVATE_TOKEN=
INTEGRITY_TOKEN=
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Register User

- **Endpoint:** `POST /users/register`
- **Description:** Registra un nuevo usuario en el sistema. El password proporcionado será encriptado antes de ser almacenado en la base de datos.

#### Request

- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string@example.com"
  }

### Login User

- **Endpoint:** `POST /users/login`
- **Descripción:** Autentica a un usuario en el sistema. Verifica las credenciales proporcionadas y devuelve un token de autenticación si las credenciales son válidas.

#### Request

- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "email": "string@example.com",
    "password": "string"
  }


### Validate Token

- **Endpoint:** `POST /auth/validate-token/`
- **Descripción:** Valida el token JWT proporcionado en el encabezado de la solicitud. Este endpoint está protegido por autenticación JWT y control de roles, asegurando que solo los usuarios con los roles adecuados puedan acceder.

#### Request

- **Content-Type:** `application/json`
- **Headers:**
  - `Authorization` (String, required): El token JWT debe ser proporcionado en el encabezado de autorización en formato `Bearer <token>`.

#### Response

- **Content-Type:** `application/json`
- **Status Code:** 200 OK
- **Body:**
  ```json
  {
    "message": "The token is valid"
  }


### Create Transaction

- **Endpoint:** `POST /transactions/`
- **Descripción:** Crea una nueva transacción. Este endpoint está protegido por autenticación JWT y control de roles, asegurando que solo los usuarios con los roles adecuados puedan acceder.

#### Request

- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "cvv": "123",
    "card_number": "4111111111111111",
    "exp_month": "12",
    "exp_year": "2024",
    "amount_in_cents": 10000,
    "currency": "USD",
    "products": [
      {
        "id": 1,
        "quantity": 2
      }
    ]
  }

### Update Transaction

- **Endpoint:** `POST /transactions/webhook`
- **Descripción:** Actualiza una transacción con la información recibida de un webhook. Este endpoint no requiere autenticación y responde a eventos de webhook que envían datos sobre una transacción.

#### Request

- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "event": "event_name",
    "data": {
      "transaction": {
        "id": "transaction_id",
        "created_at": "2024-01-01T00:00:00Z",
        "finalized_at": "2024-01-02T00:00:00Z",
        "amount_in_cents": 10000,
        "reference": "reference_id",
        "customer_email": "customer@example.com",
        "currency": "USD",
        "payment_method_type": "credit_card",
        "payment_method": {
          "type": "card",
          "extra": {
            "bin": "123456",
            "name": "John Doe",
            "brand": "Visa",
            "exp_year": "2024",
            "card_type": "debit",
            "exp_month": "12",
            "last_four": "1234",
            "card_holder": "John Doe",
            "is_three_ds": true,
            "unique_code": "unique_code",
            "three_ds_auth": {
              "three_ds_auth": {
                "current_step": "authentication_step",
                "current_step_status": "success"
              }
            }
          },
          "installments": 1
        },
        "status": "completed",
        "status_message": "Transaction successful",
        "shipping_address": {},
        "redirect_url": "https://example.com",
        "payment_source_id": 12345,
        "payment_link_id": "link_id",
        "customer_data": {},
        "billing_data": {}
      }
    },
    "sent_at": "2024-01-01T00:00:00Z",
    "timestamp": 1672531200,
    "signature": {
      "checksum": "checksum_value",
      "properties": ["property1", "property2"]
    },
    "environment": "production"
  }


## Data Model Design

### Product Table
- **id** (Primary Key, Integer)
- **cover_image** (String)
- **name** (String, Unique)
- **description** (String)
- **amount** (Decimal)
- **currency** (String)
- **quantity** (Integer)

**Relationships**:
- `transactionDetail`: One-to-Many relationship with `TransactionDetail`

### Role Table
- **id** (Primary Key, Integer)
- **name** (String, Unique)

**Relationships**:
- `assignedRoles`: One-to-Many relationship with `AssignedRole`

### AssignedRole Table
- **id** (Primary Key, Integer)
- **user_id** (Foreign Key to `User` Table)
- **role_id** (Foreign Key to `Role` Table)

**Relationships**:
- `user`: Many-to-One relationship with `User`
- `role`: Many-to-One relationship with `Role`

### Transaction Table
- **id** (Primary Key, Integer)
- **status** (Enum: `PENDING`, `VOID`, `ERROR`, `APPROVED`)
- **total_amount** (Decimal)
- **provider_transaction_id** (String, Optional)
- **user_id** (Foreign Key to `User` Table)

**Relationships**:
- `user`: Many-to-One relationship with `User`
- `transactionDetail`: One-to-Many relationship with `TransactionDetail`

### TransactionDetail Table
- **id** (Primary Key, Integer)
- **product_id** (Foreign Key to `Product` Table)
- **transaction_id** (Foreign Key to `Transaction` Table)
- **amount** (Decimal)
- **quantity** (Integer)

**Relationships**:
- `product`: Many-to-One relationship with `Product`
- `transaction`: Many-to-One relationship with `Transaction`

### User Table
- **id** (Primary Key, Integer)
- **username** (String)
- **password** (String)
- **email** (String, Unique)

**Relationships**:
- `assignedRoles`: One-to-Many relationship with `AssignedRole`
