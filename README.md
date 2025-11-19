# NestJS Hive Pattern Template

A production-ready NestJS template implementing **Hexagonal Architecture (DDD)**, **CQRS**, and the **Hive Pattern** for building scalable, maintainable APIs.

## 🎯 Features

- **Hexagonal Architecture**: Clean separation of concerns with Domain, Application, Infrastructure, and Presentation layers
- **CQRS Pattern**: Type-safe Command and Query handlers with strict return type enforcement
- **Zod Validation**: Runtime type validation for DTOs and environment variables
- **OpenAPI/Swagger**: Fully documented API with interactive documentation at `/api/docs`
- **Custom Logger**: Structured logging with correlation ID tracking and module-based filtering
- **Strict TypeScript**: Enabled strict mode with comprehensive ESLint rules
- **Path Aliases**: Clean imports using `@/` prefix
- **Docker Support**: Ready-to-use Dockerfile and docker-compose.yml
- **Health Checks**: Built-in health check endpoint

## 🏗️ Architecture

This template follows a strict **Hexagonal Architecture** pattern:

```
src/modules/[feature]/
├── domain/              # Business logic (pure TypeScript)
│   ├── [entity].ts      # Domain entities with business rules
│   └── [entity].repository.ts  # Repository interfaces (ports)
├── application/         # Use cases (CQRS)
│   ├── commands/        # Write operations (return void)
│   └── queries/         # Read operations (return data)
├── infrastructure/      # External adapters
│   ├── sql-[entity].repository.ts  # Prisma implementation
│   └── sql-[entity].mapper.ts      # Domain <-> Persistence mapping
├── presentation/        # Entry points
│   ├── controllers/     # HTTP endpoints
│   └── dto/            # Zod DTOs with Swagger decorators
├── [feature].module.ts  # NestJS module
└── [feature].tokens.ts  # DI tokens
```

For detailed architecture documentation, see [`src/modules/ARCHITECTURE.md`](src/modules/ARCHITECTURE.md).

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
IS_LOCAL=true
```

Environment variables are validated on startup using Zod. See [`src/config/index.ts`](src/config/index.ts) for the schema.

### Development

```bash
# Start in watch mode
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

### Docker

```bash
# Start with docker-compose
docker-compose up

# Build and run
docker build -t nest-hive-template .
docker run -p 3000:3000 nest-hive-template
```

## 📚 API Documentation

Once the application is running, visit:

- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 🤖 AI Agent Guidelines

This template includes comprehensive documentation to ensure consistent code generation and help developers understand the architecture:

- **[`GETTING_STARTED.md`](GETTING_STARTED.md)**: Step-by-step tutorial for creating your first feature
- **[`.ai-context.md`](.ai-context.md)**: Quick reference for AI agents with links to detailed docs
- **[`.agent/workflows/`](.agent/workflows/)**: Executable workflows for common tasks
  - `/create-feature` - Create a new module from scratch
  - `/add-command` - Add a command to existing module
  - `/add-query` - Add a query to existing module
  - `/run-tests` - Run and debug tests
- **[`AI_AGENTS.md`](src/modules/AI_AGENTS.md)**: Critical rules, naming conventions, and workflow overview
- **[`AI_TEMPLATES.md`](src/modules/AI_TEMPLATES.md)**: Copy-paste code templates for all components
- **[`ARCHITECTURE.md`](src/modules/ARCHITECTURE.md)**: High-level architectural concepts and the Hive Pattern

### Key Rules

1. **Correlation ID**: Every endpoint must use `@CorrelationId()`
2. **Logging**: Use injected `BaseLogger`, never `console.log`
3. **CQRS**: Commands return `void`, Queries return data
4. **Validation**: Use Zod with `@ZodSchema`, never `class-validator`
5. **Documentation**: All endpoints must have Swagger decorators

For complete rules and templates, see the documentation files above.

## 📦 Example Module

The template includes a complete `Article` module demonstrating:

- Domain entity with business logic
- In-memory repository for testing
- Command handler (CreateArticle)
- Query handler (GetArticle)
- Controller with Swagger documentation
- Zod DTOs with validation

## 🛠️ Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5 (strict mode)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **Database**: Prisma (mocked in template)
- **Architecture**: CQRS + Hexagonal

## 📝 Creating a New Feature

Follow the step-by-step workflow in [`.agent/workflows/create-feature.md`](.agent/workflows/create-feature.md), or see [`GETTING_STARTED.md`](GETTING_STARTED.md) for a complete tutorial.

**Quick overview:**

1. Domain Layer: Create entity and repository interface
2. Infrastructure Layer: Implement repository and mapper
3. Application Layer: Create commands and queries
4. Presentation Layer: Create DTOs and controller
5. Module: Wire everything together

For AI agents, simply use the `/create-feature` workflow command.

## 🔒 Code Quality

- **Strict TypeScript**: No implicit `any`, strict null checks
- **ESLint**: Enforces explicit return types, bans `console.log`
- **Zod Validation**: Runtime type safety for DTOs and env vars
- **Type-Safe CQRS**: Compile-time enforcement of command/query contracts

## 📄 License

MIT

## 🙏 Acknowledgments

Built with [NestJS](https://nestjs.com/) - A progressive Node.js framework
