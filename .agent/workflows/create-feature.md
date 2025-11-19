---
description: Create a new feature module from scratch
---

# Create a New Feature Module

This workflow guides you through creating a complete feature module following the Hive Pattern architecture.

## Prerequisites

- Understand the module structure in `src/modules/ARCHITECTURE.md`
- Review code templates in `src/modules/AI_TEMPLATES.md`
- Have a clear feature name (e.g., `user`, `campaign`, `payment`)

## Steps

### 1. Create Directory Structure

// turbo

```bash
# Replace [feature] with your feature name (lowercase, singular)
FEATURE_NAME="[feature]"
mkdir -p src/modules/$FEATURE_NAME/{domain/$FEATURE_NAME,application/{commands,queries},infrastructure/$FEATURE_NAME,presentation/{controllers,dto}}
```

### 2. Create Domain Entity

Create `src/modules/[feature]/domain/[feature]/[feature].ts` using the **Domain Entity Template** from `AI_TEMPLATES.md`.

**Key points:**

- Use Zod schema for props validation
- Private constructor + static factory methods (`create`, `createNew`)
- Business logic methods belong here
- Use getters for all properties

### 3. Create Repository Interface

Create `src/modules/[feature]/domain/[feature]/[feature].repository.ts` using the **Repository Interface Template** from `AI_TEMPLATES.md`.

**Key points:**

- Define the contract (port)
- Return domain entities, not persistence types
- Keep it minimal (add methods as needed)

### 4. Create InMemory Repository (for testing)

Create `src/modules/[feature]/infrastructure/[feature]/in-memory-[feature].repository.ts` using the **InMemory Repository Template** from `AI_TEMPLATES.md`.

**Key points:**

- Use `Map<string, Entity>` for storage
- Add test-only helper methods (e.g., `findAll()`)
- Do NOT add these helpers to the interface

### 5. Create DI Tokens

Create `src/modules/[feature]/[feature].tokens.ts`:

```typescript
export const [FEATURE]_TOKENS = {
  [ENTITY]_REPOSITORY: Symbol('[ENTITY]_REPOSITORY'),
};
```

### 6. Create First Command

Create `src/modules/[feature]/application/commands/create-[feature]/create-[feature].command.ts` using the **Command Template** from `AI_TEMPLATES.md`.

**Key points:**

- Must extend `TypedCommand<void>`
- Must have `correlationId` in props
- Handler injects repository via DI token

### 7. Create First Query

Create `src/modules/[feature]/application/queries/get-[feature]/get-[feature].query.ts` using the **Query Template** from `AI_TEMPLATES.md`.

**Key points:**

- Must extend `TypedQuery<ResultType>`
- Must have `correlationId` in props
- Define explicit result type

### 8. Create DTOs

Create `src/modules/[feature]/presentation/dto/create-[feature].dto.ts` and response DTOs using the **DTO Template** from `AI_TEMPLATES.md`.

**Key points:**

- Use Zod schemas with `@ZodSchema` decorator
- Add `@ApiProperty` for Swagger docs
- Create separate response DTOs

### 9. Create Controller

Create `src/modules/[feature]/presentation/controllers/[feature].controller.ts` using the **Controller Template** from `AI_TEMPLATES.md`.

**Key points:**

- Use `@CorrelationId()` on every endpoint
- Add complete Swagger documentation
- Keep thin - only DTO transformation and bus execution

### 10. Create Module

Create `src/modules/[feature]/[feature].module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { [Feature]Controller } from './presentation/controllers/[feature].controller';
import { Create[Feature]CommandHandler } from './application/commands/create-[feature]/create-[feature].command';
import { Get[Feature]QueryHandler } from './application/queries/get-[feature]/get-[feature].query';
import { InMemory[Feature]Repository } from './infrastructure/[feature]/in-memory-[feature].repository';
import { [FEATURE]_TOKENS } from './[feature].tokens';
import { TypedCommandBus, TypedQueryBus } from '../shared/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [[Feature]Controller],
  providers: [
    TypedCommandBus,
    TypedQueryBus,
    Create[Feature]CommandHandler,
    Get[Feature]QueryHandler,
    {
      provide: [FEATURE]_TOKENS.[ENTITY]_REPOSITORY,
      useClass: InMemory[Feature]Repository,
    },
  ],
})
export class [Feature]Module {}
```

### 11. Register Module in App

Add to `src/app.module.ts`:

```typescript
import { [Feature]Module } from './modules/[feature]/[feature].module';

@Module({
  imports: [
    // ... other modules
    [Feature]Module,
  ],
})
```

### 12. Create Tests

Create tests for:

- Domain entity: `domain/[feature]/[feature].spec.ts`
- Command handler: `application/commands/create-[feature]/create-[feature].command.spec.ts`
- Query handler: `application/queries/get-[feature]/get-[feature].query.spec.ts`

Use templates from `AI_TEMPLATES.md` sections 8, 9, and 10.

### 13. Verify

// turbo

```bash
# Run linter
npm run lint

# Run tests
npm run test

# Start dev server
npm run start:dev
```

Visit `http://localhost:3000/api/docs` to see your new endpoints in Swagger.

## Next Steps

- Add more commands and queries as needed (see `add-command.md` and `add-query.md`)
- Replace InMemory repository with SQL repository when ready
- Add domain events if needed
- Add integration tests

## Common Issues

- **Import errors**: Check path aliases in `tsconfig.json`
- **DI errors**: Verify tokens are correctly defined and used
- **Validation errors**: Ensure Zod schemas match your data
- **Swagger not showing**: Check all `@Api*` decorators are present
