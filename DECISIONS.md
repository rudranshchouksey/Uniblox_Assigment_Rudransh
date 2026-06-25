# Architecture Decisions Record (ADR)

This document outlines the core engineering decisions made during the development of the E-Commerce Backend API. The focus is on clean architecture, trade-offs, and future scalability.

---

## Decision: In-Memory Storage

**Context:**
The assignment explicitly required an application that can be evaluated quickly without relying on external infrastructure.

**Options Considered:**
* SQLite (File-based database)
* JSON file persistence
* In-memory storage (Data structures)

**Choice:**
In-memory storage via Node.js memory heaps.

**Why:**
It strictly satisfies the requirement for "in-memory storage only" and removes all external dependency bottlenecks (like Docker or database installation). It guarantees the reviewer can instantly boot up the application (`npm run dev`) and evaluate the core logic without any friction.

---

## Decision: Repository Pattern

**Context:**
Business logic needs to fetch and persist data, but tying business logic directly to in-memory maps creates rigid coupling.

**Options Considered:**
* Active Record pattern (Models save themselves)
* Direct data access within service methods
* Repository pattern via strictly typed Interfaces

**Choice:**
Repository pattern via strictly typed Interfaces (e.g., `ICartRepository`, `IOrderRepository`).

**Why:**
This is vital for future scalability. By programming against interfaces, the `CheckoutService` has absolutely no knowledge that the data lives in memory. If the project scales to a PostgreSQL database using Prisma or TypeORM tomorrow, we only need to write a `PostgresOrderRepository` and inject it. Zero business logic needs to be rewritten.

---

## Decision: Layered Architecture

**Context:**
The application required a structured flow of data to prevent spaghetti code inside Express routes.

**Options Considered:**
* Fat Controllers (Logic and routing merged)
* Layered Architecture (Domain-Driven approach: Router -> Controller -> Service -> Repository)

**Choice:**
Layered Architecture.

**Why:**
It enforces the Single Responsibility Principle. 
- **Controllers** are exceptionally thin—they only unwrap HTTP payloads and format responses.
- **Services** are fat—they contain pure TypeScript business logic without HTTP overhead.
This separation allows the business logic (Services) to be rigorously unit tested without having to mock the Express `Request` and `Response` objects.

---

## Decision: Zod Validation Middleware

**Context:**
Incoming request payloads (like `customerId`, `productId`, `quantity`) must be validated to prevent runtime errors and ensure data integrity.

**Options Considered:**
* Manual `if/else` checks inside controllers
* `class-validator` / `class-transformer`
* `Zod` validation schema

**Choice:**
Zod validation via a centralized Express middleware (`src/middleware/validate.ts`).

**Why:**
Zod integrates flawlessly with TypeScript. It provides a single source of truth for both runtime schema validation and static type inference. Shifting validation to the middleware layer ensures that invalid requests are blocked instantly (Fail-Fast principle) and throw a centralized 400 error before ever reaching the Controller.

---

## Decision: Map vs Array Storage

**Context:**
The specific data structure implementation for the in-memory repositories dictates performance.

**Options Considered:**
* Native JavaScript Arrays (`[]`)
* Native JavaScript Maps (`new Map()`)

**Choice:**
Map data structures, utilizing entity IDs (UUIDs) as keys.

**Why:**
While arrays require O(N) time complexity to traverse and find/update an element, Maps offer O(1) constant time complexity for primary key lookups, updates, and deletions. This mimics the performance of traditional database B-Tree indexing, making the application significantly more performant and authentic to how real databases operate.

---

## Decision: Analytics Calculation Strategy

**Context:**
The Admin API requires aggregating platform-wide data (Total Revenue, Items Purchased, etc.).

**Options Considered:**
* Event-driven pre-calculation (updating stats incrementally on every checkout)
* Dynamic synchronous calculation (Looping over historical orders on-the-fly)

**Choice:**
Dynamic synchronous calculation inside `AnalyticsService.ts`.

**Why:**
Given the in-memory constraint and small expected data payload for a take-home assignment, performing a synchronous aggregation loop across all `COMPLETED` orders is highly performant and drastically reduces complexity. In a future production iteration scaling to millions of records, this logic would transition into optimized SQL aggregations (e.g., `SUM()`, `COUNT()`) or an asynchronous OLAP data pipeline.

---

## Decision: Service Layer Separation

**Context:**
Handling complex operations that span multiple domains—for example, the `CheckoutService` needing to validate a coupon.

**Options Considered:**
* `CheckoutService` queries the `DiscountRepository` directly to validate coupons.
* `CheckoutService` injects the `DiscountService` to request validation.

**Choice:**
`CheckoutService` injects and interacts with the `DiscountService`.

**Why:**
It maintains strict domain boundaries. The `CheckoutService` shouldn't concern itself with *how* a discount is validated (e.g., checking expiration dates, usage flags). By delegating this to the `DiscountService`, we achieve high cohesion. It also makes unit testing significantly easier, as we can easily mock the `DiscountService` when testing the Checkout orchestration flow.
