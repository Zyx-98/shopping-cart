# Project Title: NestJS Shopping Cart Platform

## 🚀 Overview

This project is a robust shopping cart platform built with **NestJS**, leveraging a **Clean Architecture** and **Domain-Driven Design (DDD)** principles. It employs a **domain event-driven approach** to handle complex business logic and ensure decoupling between different parts of the system. The primary goal is to create a scalable, maintainable, and testable application.

---

## ✨ Key Features

* **Clean Architecture**: Clearly separated layers for domain, application, infrastructure, and presentation logic.
* **Domain-Driven Design**: Focuses on the core domain and domain logic, using concepts like Aggregates, Entities, Value Objects, and Domain Events.
* **Event-Driven Approach**: Utilizes domain events and sagas for orchestrating complex workflows and ensuring eventual consistency.
* **Concurrency Control**: Implements strategies to manage concurrent requests and prevent data inconsistencies.
* **Monitoring & Performance**: Integrated monitoring tools and practices for identifying bottlenecks and ensuring system health.

---

## 🏗️ Project Structure

The project follows the principles of Clean Architecture, organizing code into distinct layers to achieve separation of concerns and improve maintainability.

### Core Layers (`server/src/core`)

This is the heart of the application, containing the business logic, independent of any framework or external agency.

* **`domain`**: This layer encapsulates the enterprise-wide business rules and concepts.
    * **Aggregates** (e.g., `OrderAggregate`, `CartAggregate`): Clusters of entities and value objects treated as a single unit.
    * **Entities** (e.g., `OrderLineEntity`, `CartItemEntity`): Objects with a distinct identity that runs through time and can change.
    * **Value Objects** (e.g., `PriceVO`, `EmailVO`, `OrderIdVO`): Immutable objects representing descriptive aspects of the domain.
    * **Domain Events** (e.g., `OrderCreatedEvent`, `PaymentFailedEvent`): Represent significant occurrences within the domain.
    * **Repositories (Interfaces)** (e.g., `OrderRepository`, `ProductRepository`): Abstractions for data persistence, defined in the domain but implemented in the infrastructure layer.
    * **Domain Services**: Encapsulate domain logic that doesn't naturally fit within an entity or value object.
    * **Ports** (e.g., `UnitOfWorkInterface`): Interfaces defining how the domain communicates with outer layers (infrastructure).

* **`application`**: This layer orchestrates the domain objects to perform specific use cases. It contains:
    * **Application Services**: Implement use cases by coordinating domain objects and repositories.
    * **Commands & Queries (CQRS)** (e.g., `PlaceOrderCommand`, `GetProductListQuery`): Separates operations that change state from those that read state.
    * **DTOs (Data Transfer Objects)** (e.g., `ProductDTO`, `CartDTO`): Carry data between layers, particularly between application and presentation.
    * **Mappers** (e.g., `CartMapper`, `OrderMapper`): Convert data between domain objects and DTOs.
    * **Sagas** (e.g., `OrderProcessingSaga`): Manage long-running transactions and coordinate domain events across multiple aggregates.
    * **Ports** (e.g., `CacheInterface`, `PaymentGateway`): Interfaces for infrastructure services needed by the application layer.

### Outer Layers

These layers handle interactions with external systems and frameworks.

* **`infrastructure`** (`server/src/infrastructure`): This layer contains implementations of interfaces defined in the core layers. It includes:
    * **Persistence**: Data access logic using TypeORM, including schema definitions, repositories implementations, and migrations.
    * **Authentication/Authorization**: Guards, strategies (JWT, local), and services for securing the application.
    * **Caching**: Redis implementation for caching services.
    * **Distributed Lock**: Redis-based distributed lock mechanism for concurrency control.
    * **Idempotency**: Services to ensure operations can be retried without unintended side effects.
    * **Metrics**: Integration with Prometheus for collecting application metrics.
    * **External Service Integrations**: Adapters for any external services (e.g., payment gateways).

* **`presentation`** (`server/src/presentation`): This layer is responsible for presenting data to the user and handling user input.
    * **REST Controllers**: Expose API endpoints (e.g., `AuthController`, `ProductController`).
    * **Request/Response DTOs**: Define the structure of data for API requests and responses.

### Supporting Infrastructure

* **`docker-compose.yml`**: Defines and configures the services required for the application environment, including Postgres, Redis, Prometheus, and Grafana.
* **`docs`**: Contains architecture diagrams (PlantUML, Excalidraw) and other documentation.
* **`gateway`**: Nginx configuration for reverse proxy and load balancing.
* **`grafana`**: Configuration for Grafana dashboards for visualizing metrics.
* **`prometheus`**: Configuration for the Prometheus monitoring system.
* **`postgres`**: Initialization scripts for the PostgreSQL database.
* **`server/bench`**: Contains benchmarking scripts and results (e.g., `order-process.js`) used for performance testing.

---

## 🔒 Concurrency Control (CCU)

Handling concurrent user requests effectively is crucial for an e-commerce platform. This project addresses CCU challenges through several mechanisms:

* **Optimistic/Pessimistic Locking**: While not explicitly detailed in the structure, the use of a robust ORM like TypeORM allows for implementing these strategies at the database entity level if needed.
* **Distributed Locks**: A Redis-based distributed lock (`RedisDistributedLockService`) is implemented to ensure that critical sections of code, especially those involving shared resources or complex state changes (e.g., inventory updates during order placement), are executed by only one process at a time across multiple instances of the application. The interface for this is defined in `server/src/core/application/port/distributed-lock.interface.ts`.
* **Idempotency**: To prevent issues from duplicate requests (e.g., due to network retries), an idempotency mechanism (`RedisIdempotencyService`, `IdempotentDecorator`) is in place. This ensures that operations can be safely retried without causing unintended side effects, crucial for payment processing and order creation. The interface is defined in `server/src/core/application/port/idempotency.interface.ts`.
* **Unit of Work (UoW)**: The `UnitOfWorkInterface` and its TypeORM implementation (`TypeOrmUnitOfWork`) ensure that operations involving multiple domain objects or database changes are atomic. This means either all changes are committed successfully, or none are, maintaining data consistency.
* **Domain Events & Sagas**: For complex, multi-step processes (e.g., order fulfillment), domain events and sagas (`OrderProcessingSaga`) are used to manage the workflow in an eventually consistent manner, reducing the scope and duration of locks.

---

## 📊 Monitoring and Bottleneck Identification

Continuous monitoring is essential for maintaining performance and identifying bottlenecks. This project integrates:

* **Prometheus**: A powerful open-source monitoring and alerting toolkit. It's configured via `prometheus/prometheus.yml` to scrape metrics from the application.
* **Grafana**: Used for visualizing the metrics collected by Prometheus. Pre-configured dashboards (`nestjs_app_dashboard.json`, `nestjs_shopping_app_dashboard.json`) provide insights into application performance, request rates, error rates, and resource usage. Grafana is set up to use Prometheus as a data source via `grafana/provisioning/datasources/prometheus.yml`.
* **Custom Application Metrics**: The `server/src/infrastructure/metric` module provides a dedicated `MetricController` to expose custom application metrics (e.g., business-specific KPIs, queue lengths) that Prometheus can scrape.
    * `MetricInterceptor`: Collects standard request/response metrics.
    * `MetricService`: Provides functionalities for registering and updating custom metrics.
* **Benchmarking**: The `server/bench` directory contains scripts (e.g., `order-process.js`) and past results (e.g., `order-process_*.png`) for performance testing critical user flows like order processing. This helps proactively identify performance regressions and bottlenecks under load.
* **Logging**: (Implied) NestJS's built-in logging, potentially enhanced with custom loggers, would be used for detailed tracing and error analysis.

By analyzing metrics from Prometheus in Grafana dashboards and conducting regular benchmarking, we can effectively identify performance bottlenecks, understand system behavior under load, and ensure the application remains responsive and reliable.

---

## 🚀 Getting Started

*(Add instructions on how to set up the development environment, install dependencies, and configure necessary services like databases, Redis, etc.)*

```sh
# Run in development mode
docker compose up -d

