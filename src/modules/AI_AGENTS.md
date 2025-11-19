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

---

## 👣 Workflow: Creating a New Feature

**For detailed step-by-step workflows, see [`.agent/workflows/`](../../.agent/workflows/):**

- **[`/create-feature`](../../.agent/workflows/create-feature.md)** - Complete guide to creating a new module from scratch
- **[`/add-command`](../../.agent/workflows/add-command.md)** - Add a new command to an existing module
- **[`/add-query`](../../.agent/workflows/add-query.md)** - Add a new query to an existing module
- **[`/run-tests`](../../.agent/workflows/run-tests.md)** - Run and debug tests

**Quick Overview:**

1. **Domain** → Create entity and repository interface
2. **Infrastructure** → Create mapper and repository implementation
3. **Application** → Create commands and queries
4. **Presentation** → Create DTOs and controller
5. **Wiring** → Define tokens and register in module

For detailed instructions with examples, follow the `/create-feature` workflow.

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

---

## 🧪 Testing Strategy

**EVERY feature MUST have comprehensive tests.**

### Test Structure

Tests should be co-located with the code they test:

```
application/commands/create-article/
├── create-article.command.ts
└── create-article.command.spec.ts
```

### Test Layers

1.  **Domain Tests** (`domain/[entity]/[entity].spec.ts`):
    - Test entity factory methods (`create()`, `createNew()`)
    - Test business logic methods (e.g., `publish()`, `approve()`)
    - Test validation rules (Zod schema)
    - **No mocks needed** - pure unit tests

2.  **Handler Tests** (`application/commands|queries/[name]/[name].spec.ts`):
    - Use direct instantiation with InMemoryRepository
    - No mocks - use real repository implementation
    - Test command/query execution
    - Test error handling

3.  **Integration Tests** (optional, `test/` directory):
    - Test full HTTP flow
    - Use `supertest` for API calls
    - Test with real database (or test container)

### Testing Best Practices

- **Use InMemoryRepositories**: Create `in-memory-[entity].repository.ts` using `Map<string, Entity>` for storage.
- **Type as Concrete Class**: In tests, type the repository as `InMemory[Entity]Repository`, not the interface. This allows access to test-only methods like `findAll()`.
- **Test-Only Methods**: Add helper methods (e.g., `findAll()`) to InMemory implementations for test assertions. These should NOT be in the interface.
- **Avoid Mocks for Repositories**: Use real InMemory implementations instead of `vi.fn()` mocks.
- **Direct Instantiation**: Instantiate handlers directly with dependencies (no NestJS testing module needed).
- **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it.
- **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification.
- **Descriptive Test Names**: Use `should [expected behavior] when [condition]`.

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('CreateArticleCommandHandler', () => {
  let handler: CreateArticleCommandHandler;
  let repository: InMemoryArticleRepository; // Use concrete type, not interface

  beforeEach(() => {
    repository = new InMemoryArticleRepository();
    handler = new CreateArticleCommandHandler(repository);
  });

  it('should create and save a new article', async () => {
    // Arrange
    const command = {
      props: {
        title: 'Test Article',
        content: 'Test content',
        correlationId: 'test-id',
      },
    };

    // Act
    await handler.execute(command);

    // Assert
    const articles = await repository.findAll(); // findAll() only exists on InMemory implementation
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Test Article');
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run tests with UI
npm run test:ui
```

```

```
