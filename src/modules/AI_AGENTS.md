# AI Agent Guidelines

**Role**: The "Rulebook".
**Context**: NestJS + Hexagonal Architecture (DDD) + CQRS.

---

## 🗺️ Documentation Map

- **`AI_AGENTS.md`** (This File): **Rules & Workflow**. Follow these strictly.
- **`ARCHITECTURE.md`**: **Concepts & Structure**. Read this to understand "Why" and "Where".
- **`AI_TEMPLATES.md`**: **Code Snippets**. Copy-paste these for implementation.

---

## 🛑 CRITICAL RULES (The "Must Haves")

**Violation of these rules = Broken Code.**

1.  **Correlation ID is GOD**:
    - Every Controller Endpoint MUST have `@CorrelationId()`.
    - Every Command/Query `props` MUST have `correlationId: string`.
    - Every Log MUST include `correlationId` (via context or explicit field).

2.  **Logging**:
    - NEVER use `console.log`, `console.info`, or `console.debug`.
    - ALWAYS use the injected `BaseLogger` (via `@InjectLogger()` or constructor injection).
    - Use `logger.log()`, `logger.error()`, `logger.warn()`, `logger.debug()`.

3.  **CQRS Strictness**:
    - **Commands**: MUST return `void`. MUST extend `TypedCommand<void>`.
    - **Queries**: MUST return data. MUST extend `TypedQuery<Result>`.
    - **Props**: MUST use a `props` object.

4.  **Database & Performance**:
    - **Labels**: EVERY Prisma query MUST use `.withLabel('context.operation')`.
    - **No Direct Models**: Repositories MUST return Domain Entities, NOT Prisma types.
    - **Mappers**: ALWAYS use a Mapper class (Domain <-> Persistence).

5.  **Dependency Injection**:
    - **Symbols**: Use `Symbol('MY_TOKEN')` for all DI tokens.
    - **Tokens File**: Define tokens in `[module].tokens.ts`.

6.  **Domain Logic**:
    - **Entities**: Logic belongs here. Use Factory methods (`create()`). Private constructors.
    - **Controllers**: ZERO business logic. Only DTO transformation and Bus execution.
    - **Validation**: NEVER use `class-validator`. ALWAYS use `zod` with `@ZodSchema`.
    - **Documentation**: EVERY Controller and DTO MUST use `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`).

---

## ️ Naming Conventions

- **Commands**: `Verb[Noun]Command` (e.g., `CreateUserCommand`, `PublishArticleCommand`).
- **Queries**: `Get[Noun]Query` or `Find[Noun]Query` (e.g., `GetUserByIdQuery`).
- **Tokens**: `SCREAMING_SNAKE_CASE` (e.g., `ARTICLE_REPOSITORY`).

---

## 👣 Workflow: Creating a New Feature

**Refer to `ARCHITECTURE.md` for the folder structure.**

1.  **Domain (The What)**:
    - Create Entity (`domain/[entity].ts`) with Zod factory.
    - Create Repository Interface (`domain/[entity].repository.ts`).

2.  **Infrastructure (The How)**:
    - Create Mapper (`infrastructure/sql-[entity].mapper.ts`).
    - Create Repository Implementation (`infrastructure/sql-[entity].repository.ts`).

3.  **Application (The Actions)**:
    - Create Commands (`application/commands/`).
    - Create Queries (`application/queries/`).

4.  **Presentation (The Interface)**:
    - Create Zod DTOs (`presentation/dto/`) with `@ApiProperty`.
    - Create Controller (`presentation/controllers/`) with `@ApiOperation` and `@ApiResponse`.

5.  **Wiring (The Glue)**:
    - Define Tokens (`[feature].tokens.ts`).
    - Register in Module (`[feature].module.ts`).

---

## 📚 OpenAPI/Swagger Documentation

**EVERY endpoint MUST be fully documented.**

### Controllers

1.  **@ApiTags**: Group related endpoints (e.g., `@ApiTags('Articles')`).
2.  **@ApiOperation**: Describe what the endpoint does (e.g., `@ApiOperation({ summary: 'Create a new article' })`).
3.  **@ApiResponse**: Document ALL possible responses:
    - Success: `@ApiResponse({ status: 200, description: 'Success message', type: ResponseDto })`
    - Errors: `@ApiResponse({ status: 404, description: 'Not found' })`
4.  **@ApiBody**: Specify request body DTO (e.g., `@ApiBody({ type: CreateArticleDto })`).

### DTOs

1.  **Input DTOs**: Use `@ApiProperty` with examples and descriptions:

    ```typescript
    @ApiProperty({ example: 'My Title', description: 'The article title' })
    title!: string;
    ```

2.  **Response DTOs**: Create dedicated response DTOs (e.g., `ArticleResponseDto`) with `@ApiProperty` on each field.

### Best Practices

- **Consistent Naming**: Response DTOs should be named `[Entity]ResponseDto`.
- **Examples**: Always provide realistic examples in `@ApiProperty`.
- **Descriptions**: Add descriptions for non-obvious fields.
- **Type Safety**: Return explicit DTO types from controllers, not inline types.
