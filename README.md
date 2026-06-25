# E-Commerce Backend API

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

A production-grade, highly-testable Node.js & TypeScript REST API serving as the backend for an e-commerce platform. It features complete shopping cart operations, an orchestrated checkout pipeline, and a flexible, rule-based global discount and analytics engine.

---

## 🚀 Features

- **Robust Cart Management**: Add, update, and remove items with real-time stock validation and strict quantity bounds.
- **Orchestrated Checkout**: Atomic checkout process that locks purchase prices, validates discount codes, and securely processes the cart into an immutable order.
- **Dynamic Coupon Engine**: Configurable Nth-order coupon generation engine built for global marketing and admin distribution.
- **Business Analytics**: Aggregates vital metrics (total revenue, items purchased, and discounts allocated) accurately excluding cancelled or pending transactions.
- **In-Memory Store**: Lightning-fast, `Map`-based in-memory repository layer fully decoupled from business logic via strictly-typed interfaces.
- **Centralized Error Handling**: Unified interception of domain exceptions mapped gracefully to standard HTTP status codes.
- **Input Validation**: Request payloads are securely validated and scrubbed via Zod schemas at the middleware boundary.
- **Interactive Documentation**: Out-of-the-box Swagger OpenAPI portal and Postman collection available.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Validation**: Zod
- **Testing**: Vitest
- **Linting & Formatting**: ESLint, Prettier
- **Documentation**: Swagger UI Express, Postman

---

## 🏛 Architecture Overview

The application follows Domain-Driven Design (DDD) principles utilizing a layered architecture:

1. **Controllers (`src/controllers`)**: Strictly thin. Their sole responsibility is to extract HTTP parameters (body/params), invoke the service layer, and return HTTP responses.
2. **Services (`src/services`)**: The brain of the application. Contains all business logic, validation rules, cross-domain orchestration, and transaction safety checks.
3. **Repositories (`src/repositories`)**: Isolates the data persistence layer. Repositories implement specific interfaces (e.g., `ICartRepository`), ensuring the rest of the application remains agnostic to the underlying database structure.
4. **Validators (`src/validators`)**: Type-safe Zod schemas ensuring runtime safety for all incoming data at the router level.

## 📁 Folder Structure

```text
src/
├── config/           # App configuration and Swagger specs
├── controllers/      # HTTP route handlers (Thin controllers)
├── errors/           # Custom AppError classes
├── middleware/       # Express middlewares (Zod Validator, Error Handler)
├── models/           # Types and Interfaces representing Domain Entities
├── repositories/     # Data access layer strictly performing CRUD
├── routes/           # Express router configuration
├── services/         # Fat services containing core business logic
├── store/            # In-memory database initialization and seed data
├── types/            # Global TypeScript typings
├── app.ts            # Express application initialization
└── server.ts         # Application entry point
tests/                # Comprehensive unit test suites
docs/                 # Postman collections
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v8 or higher)

### 2. Installation
Clone the repository and install the dependencies:

```bash
npm install
```

### 3. Environment Setup

This application is 100% environment-driven. There are no hardcoded URLs, ports, or business logic configuration.

Copy the example environment variables file:

```bash
cp .env.example .env
```

Configuring `.env` is the **only required step** before deployment. Variables include:
- `PORT`: Server port
- `NODE_ENV`: 'development' or 'production'
- `API_PREFIX`: Route prefix (e.g., `/api`)
- `NTH_ORDER`: The threshold for generating global discounts
- `DISCOUNT_PERCENTAGE`: The percentage given by discounts
- `FRONTEND_URL`: CORS origin configuration

### 4. Running the Application

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

---

## 📜 Available Scripts

- `npm run dev`: Starts the server in watch mode using `tsx`.
- `npm start`: Runs the compiled output from the `dist` directory.
- `npm run build`: Compiles the TypeScript source code.
- `npm run test`: Executes the Vitest test suite once.
- `npm run test:watch`: Runs Vitest in watch mode.
- `npm run lint`: Scans the codebase for ESLint warnings/errors.
- `npm run format`: Prettifies the entire codebase.

---

## 🌐 API Endpoints

### Documentation
- **Swagger UI**: Visit `http://localhost:3000/api-docs` after starting the server.
- **Postman**: Import `docs/ecommerce-store.postman_collection.json`.

### Core Routes
- `GET /api/health` - Check API operational status.

### Cart API (`/api/cart`)
- `GET /:customerId` - Retrieve the active cart.
- `POST /items` - Add a new item or increase quantity.
- `PATCH /items/:productId` - Update specific item quantity.
- `DELETE /items/:productId` - Remove an item entirely.

### Checkout API (`/api/checkout`)
- `POST /` - Process the cart into a completed order (accepts an optional `discountCode`).

### Admin API (`/api/admin`)
- `GET /stats` - Retrieve overarching store metrics and analytics.
- `POST /discounts/generate` - Automatically generate a coupon if the Nth-order rule is globally satisfied.

---

## 🧪 Running Tests

This project boasts over **30 comprehensive unit tests** isolating all business rules across the Cart, Checkout, Discount, and Analytics services. 

To execute the test suite:

```bash
npm run test
```

Expected Output:
```text
✓ tests/services/CartService.test.ts (12 tests)
✓ tests/services/CheckoutService.test.ts (7 tests)
✓ tests/services/DiscountService.test.ts (11 tests)
✓ tests/services/AnalyticsService.test.ts (2 tests)

Test Files  4 passed (4)
     Tests  32 passed (32)
```

---

## 💭 Assumptions

- **In-Memory Volatility**: The data arrays (Maps) will reset completely when the Node.js server restarts.
- **Authentication**: Customer IDs are assumed to be securely intercepted via Bearer tokens in a production scenario. For this assignment, they are explicitly passed via route parameters or the JSON body.
- **Global Coupon Constraints**: The Nth-order rule was interpreted to evaluate the global, overarching store order count. Coupons generated this way can be applied by any customer who receives the code.

## 🚀 Future Improvements

1. **Database Integration**: Swap out the in-memory Maps for a true persistence layer (e.g., PostgreSQL via Prisma or TypeORM) by simply injecting a new class implementing the Repository interfaces.
2. **Concurrency Handling**: Implement database-level transactions or distributed locks to prevent race conditions during high-traffic checkouts.
3. **Authentication & Authorization**: Integrate JWT authentication to extract the `customerId` gracefully without requiring it in the request payload.
4. **Enhanced Analytics**: Delegate the synchronous analytics processing to an asynchronous Event Bus (e.g., RabbitMQ, Kafka) to prevent slowing down the primary checkout request thread.
