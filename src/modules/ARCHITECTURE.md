# Architecture Guide

**Purpose**: This document explains the **Concepts** and **Structure** of the codebase.
**Audience**: AI Agents and Developers needing to understand "Why" and "Where".

---

## 1. High-Level Overview

We use a **Modular Monolith** architecture with strict isolation between modules.
*   **Pattern**: Hexagonal Architecture (Ports & Adapters) + DDD + CQRS.
*   **Goal**: Decoupled, testable, and scalable modules.

---

## 2. Module Structure (The Map)

Every feature module in `src/modules/[feature]` MUST follow this exact structure:

```text
src/modules/[feature-name]/
├── application/                 # Orchestration Layer (CQRS)
│   ├── commands/                # Write operations (void return)
│   │   └── [verb]-[noun]/       # e.g., create-campaign
│   │       ├── [verb]-[noun].command.ts
│   │       └── [verb]-[noun].command.spec.ts
│   └── queries/                 # Read operations (return data)
│       └── [verb]-[noun]/       # e.g., get-campaign
│           ├── [verb]-[noun].query.ts
│           └── [verb]-[noun].query.spec.ts
├── domain/                      # Business Logic Layer (Pure TS)
│   ├── [entity-name]/           # e.g., campaign
│   │   ├── [entity].ts          # The Entity class (Logic lives here)
│   │   ├── [entity].repository.ts # Repository Interface (Port)
│   │   └── [entity].errors.ts   # Entity-specific errors
│   └── events/                  # Domain Events
├── infrastructure/              # Adapter Layer (Implementation)
│   └── [entity-name]/
│       ├── sql-[entity].repository.ts # Prisma Implementation
│       ├── sql-[entity].mapper.ts     # Data Mapper (Domain <-> Prisma)
│       └── in-memory-[entity].repository.ts # For Testing
├── presentation/                # Interface Layer (Entry Points)
│   ├── controllers/             # HTTP Controllers
│   ├── dto/                     # Zod DTOs
│   ├── processors/              # BullMQ Processors
│   └── [feature].exception-filter.ts
├── [feature].module.ts          # NestJS Module Definition
└── [feature].tokens.ts          # Dependency Injection Tokens
```

---

## 3. The Layers Explained

### 1. Domain Layer (`domain/`)
*   **Role**: The "Brain". Contains pure business logic.
*   **Rules**:
    *   **NO** dependencies on outer layers (no NestJS, no Prisma, no HTTP).
    *   **Entities** encapsulate logic (methods like `approve()`, `publish()`).
    *   **Ports** (Repository Interfaces) are defined here.

### 2. Application Layer (`application/`)
*   **Role**: The "Orchestrator". Connects the outside world to the Domain.
*   **Rules**:
    *   **CQRS**: Split into `commands` (writes) and `queries` (reads).
    *   **Handlers**: Receive a Command/Query, load an Entity via Repository, call a Domain method, and save.
    *   **No Logic**: Do not put business rules here. Delegate to the Domain Entity.

### 3. Infrastructure Layer (`infrastructure/`)
*   **Role**: The "Plumber". Implements the Ports defined in Domain.
*   **Rules**:
    *   **Adapters**: Implement `I[Entity]Repository`.
    *   **Mappers**: Convert "Prisma Types" to "Domain Entities" and vice versa.
    *   **Tech**: Prisma, Redis, S3, etc. live here.

### 4. Presentation Layer (`presentation/`)
*   **Role**: The "Face". Handles HTTP, Cron, and Events.
*   **Rules**:
    *   **Controllers**: Thin. Parse DTOs (Zod) -> Execute Command/Query -> Return DTO.
    *   **No Logic**: Never put business logic in controllers.

---

## 4. The Hive Pattern (In-Proc Communication)

Modules must be isolated. They cannot import each other's code directly.
We use the **Hive Pattern** (In-Process Microservices) to communicate safely.

### The Problem
`RewardsModule` needs `User` data. Importing `UserService` directly creates a circular dependency and tight coupling.

### The Solution
1.  **Shared Interface**: `src/modules/shared/in-proc/user.in-proc.ts` defines the contract.
2.  **DI Token**: `IN_PROC_TOKENS.USER` identifies the dependency.
3.  **Implementation**: `UserModule` implements the interface (acting as a provider).
4.  **Injection**: `RewardsModule` injects the interface using the token.

### Example Usage
```typescript
// In RewardsModule
constructor(
  @Inject(IN_PROC_TOKENS.USER) private readonly userService: IUserInProc
) {}

async execute() {
  // Safe, decoupled call
  const user = await this.userService.getUserById("123");
}
```
