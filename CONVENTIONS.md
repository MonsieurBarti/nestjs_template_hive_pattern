# Naming and Code Conventions

This document defines the naming conventions, file structure, and code style standards for the NestJS Hive Pattern Template.

## 📁 File Naming

### General Rules

- **Lowercase with hyphens**: All files use kebab-case
- **Descriptive names**: File names should clearly indicate their purpose
- **Consistent suffixes**: Use standard suffixes for file types

### File Naming Patterns

| File Type            | Pattern                            | Example                           |
| -------------------- | ---------------------------------- | --------------------------------- |
| Entity               | `[entity].ts`                      | `article.ts`                      |
| Repository Interface | `[entity].repository.ts`           | `article.repository.ts`           |
| SQL Repository       | `sql-[entity].repository.ts`       | `sql-article.repository.ts`       |
| InMemory Repository  | `in-memory-[entity].repository.ts` | `in-memory-article.repository.ts` |
| Mapper               | `sql-[entity].mapper.ts`           | `sql-article.mapper.ts`           |
| Command              | `[verb]-[noun].command.ts`         | `create-article.command.ts`       |
| Query                | `[verb]-[noun].query.ts`           | `get-article.query.ts`            |
| Controller           | `[feature].controller.ts`          | `article.controller.ts`           |
| Module               | `[feature].module.ts`              | `article.module.ts`               |
| Tokens               | `[feature].tokens.ts`              | `article.tokens.ts`               |
| DTO                  | `[action]-[entity].dto.ts`         | `create-article.dto.ts`           |
| Response DTO         | `[entity]-response.dto.ts`         | `article-response.dto.ts`         |
| Test                 | `[filename].spec.ts`               | `article.spec.ts`                 |
| Error                | `[entity].errors.ts`               | `article.errors.ts`               |
| Event                | `[entity]-[action].event.ts`       | `article-published.event.ts`      |

---

## 🏗️ Directory Structure

### Module Structure (Mandatory)

```
src/modules/[feature]/
├── domain/
│   └── [entity]/
│       ├── [entity].ts
│       ├── [entity].repository.ts
│       ├── [entity].errors.ts
│       └── [entity].spec.ts
├── application/
│   ├── commands/
│   │   └── [verb]-[noun]/
│   │       ├── [verb]-[noun].command.ts
│   │       └── [verb]-[noun].command.spec.ts
│   └── queries/
│       └── [verb]-[noun]/
│           ├── [verb]-[noun].query.ts
│           └── [verb]-[noun].query.spec.ts
├── infrastructure/
│   └── [entity]/
│       ├── in-memory-[entity].repository.ts
│       ├── sql-[entity].repository.ts
│       └── sql-[entity].mapper.ts
├── presentation/
│   ├── controllers/
│   │   └── [feature].controller.ts
│   └── dto/
│       ├── [action]-[entity].dto.ts
│       └── [entity]-response.dto.ts
├── [feature].module.ts
└── [feature].tokens.ts
```

### Rules

- ✅ **Always co-locate tests** with the code they test
- ✅ **Group by feature**, not by layer
- ✅ **One entity per domain folder**
- ✅ **One command/query per folder**

---

## 🔤 Naming Conventions

### TypeScript Classes

| Type                      | Convention                                              | Example                        |
| ------------------------- | ------------------------------------------------------- | ------------------------------ |
| Entity                    | PascalCase, singular noun                               | `Article`, `User`              |
| Repository Interface      | `I[Entity]Repository`                                   | `IArticleRepository`           |
| Repository Implementation | `Sql[Entity]Repository` or `InMemory[Entity]Repository` | `SqlArticleRepository`         |
| Command                   | `[Verb][Noun]Command`                                   | `CreateArticleCommand`         |
| Command Handler           | `[Verb][Noun]CommandHandler`                            | `CreateArticleCommandHandler`  |
| Query                     | `[Verb][Noun]Query`                                     | `GetArticleQuery`              |
| Query Handler             | `[Verb][Noun]QueryHandler`                              | `GetArticleQueryHandler`       |
| DTO                       | `[Action][Entity]Dto`                                   | `CreateArticleDto`             |
| Response DTO              | `[Entity]ResponseDto`                                   | `ArticleResponseDto`           |
| Error                     | `[Entity][Reason]Error`                                 | `ArticleNotFoundError`         |
| Event                     | `[Entity][Action]Event`                                 | `ArticlePublishedEvent`        |
| Event Handler             | `[Entity][Action]EventHandler`                          | `ArticlePublishedEventHandler` |
| Controller                | `[Feature]Controller`                                   | `ArticleController`            |
| Module                    | `[Feature]Module`                                       | `ArticleModule`                |
| Mapper                    | `Sql[Entity]Mapper`                                     | `SqlArticleMapper`             |

### Variables and Properties

| Type                  | Convention                     | Example                          |
| --------------------- | ------------------------------ | -------------------------------- |
| Variables             | camelCase                      | `articleId`, `userName`          |
| Constants             | SCREAMING_SNAKE_CASE           | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Private properties    | `_camelCase` (with underscore) | `_id`, `_createdAt`              |
| DI Tokens             | SCREAMING_SNAKE_CASE           | `ARTICLE_REPOSITORY`             |
| Environment variables | SCREAMING_SNAKE_CASE           | `DATABASE_URL`, `PORT`           |

### Functions and Methods

| Type            | Convention                 | Example                                   |
| --------------- | -------------------------- | ----------------------------------------- |
| Methods         | camelCase, verb-based      | `save()`, `findById()`, `publish()`       |
| Factory methods | `create`, `createNew`      | `Article.create()`, `Article.createNew()` |
| Getters         | camelCase, no `get` prefix | `get id()`, `get title()`                 |
| Boolean methods | `is`, `has`, `can` prefix  | `isPublished()`, `hasAccess()`            |

### Database Naming

| Type         | Convention         | Example                     |
| ------------ | ------------------ | --------------------------- |
| Table names  | snake_case, plural | `articles`, `user_profiles` |
| Column names | snake_case         | `created_at`, `user_id`     |
| Foreign keys | `[table]_id`       | `article_id`, `author_id`   |

---

## 📝 Code Style

### TypeScript

#### Explicit Return Types (Mandatory)

```typescript
// ✅ Good - explicit return type
public async findById(id: string): Promise<Article | null> {
  // ...
}

// ❌ Bad - implicit return type
public async findById(id: string) {
  // ...
}
```

#### No Implicit Any (Mandatory)

```typescript
// ✅ Good - explicit type
function process(data: ArticleData): void {
  // ...
}

// ❌ Bad - implicit any
function process(data) {
  // ...
}
```

#### Private Constructor Pattern

```typescript
// ✅ Good - private constructor with factory
export class Article {
  private constructor(props: ArticleProps) {
    // ...
  }

  public static create(props: ArticleProps): Article {
    return new Article(props);
  }
}

// ❌ Bad - public constructor
export class Article {
  constructor(props: ArticleProps) {
    // ...
  }
}
```

#### Readonly Properties

```typescript
// ✅ Good - readonly for immutable properties
export class Article {
  private readonly _id: string;
  private readonly _createdAt: Date;

  // ...
}

// ❌ Bad - mutable properties that shouldn't change
export class Article {
  private _id: string;
  private _createdAt: Date;

  // ...
}
```

### Dependency Injection

#### Use Symbols for Tokens

```typescript
// ✅ Good - Symbol tokens
export const ARTICLE_TOKENS = {
  ARTICLE_REPOSITORY: Symbol('ARTICLE_REPOSITORY'),
};

// ❌ Bad - string tokens
export const ARTICLE_TOKENS = {
  ARTICLE_REPOSITORY: 'ARTICLE_REPOSITORY',
};
```

#### Inject via Constructor

```typescript
// ✅ Good - constructor injection
@CommandHandler(CreateArticleCommand)
export class CreateArticleCommandHandler {
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly repository: IArticleRepository,
  ) {}
}

// ❌ Bad - property injection
@CommandHandler(CreateArticleCommand)
export class CreateArticleCommandHandler {
  @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
  private readonly repository: IArticleRepository;
}
```

### Validation

#### Use Zod Schemas

```typescript
// ✅ Good - Zod schema
export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export type CreateArticleDtoType = z.infer<typeof CreateArticleSchema>;

@ZodSchema(CreateArticleSchema)
export class CreateArticleDto implements CreateArticleDtoType {
  @ApiProperty({ example: 'My Title' })
  title!: string;

  @ApiProperty({ example: 'Content here' })
  content!: string;
}

// ❌ Bad - class-validator
export class CreateArticleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}
```

### Error Handling

#### Custom Domain Errors

```typescript
// ✅ Good - custom domain error
export class ArticleNotFoundError extends BaseDomainError {
  constructor(id: string) {
    super(`Article with ID ${id} not found`);
    this.name = 'ArticleNotFoundError';
  }
}

// Usage
if (!article) {
  throw new ArticleNotFoundError(id);
}

// ❌ Bad - generic error
if (!article) {
  throw new Error('Not found');
}
```

### Logging

#### Use Injected Logger

```typescript
// ✅ Good - injected logger
@CommandHandler(CreateArticleCommand)
export class CreateArticleCommandHandler {
  constructor(
    @InjectLogger(CreateArticleCommandHandler.name)
    private readonly logger: BaseLogger,
  ) {}

  async execute(command: CreateArticleCommand): Promise<void> {
    this.logger.log({
      message: 'Creating article',
      correlationId: command.props.correlationId,
    });
  }
}

// ❌ Bad - console.log
async execute(command: CreateArticleCommand): Promise<void> {
  console.log('Creating article');
}
```

### Documentation

#### Swagger Decorators (Mandatory)

```typescript
// ✅ Good - complete Swagger docs
@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateArticleDto,
    @CorrelationId() correlationId: string,
  ): Promise<void> {
    // ...
  }
}

// ❌ Bad - no documentation
@Controller('articles')
export class ArticleController {
  @Post()
  async create(@Body() dto: CreateArticleDto): Promise<void> {
    // ...
  }
}
```

---

## 🧪 Testing Conventions

### Test File Naming

- Co-locate tests with source files
- Use `.spec.ts` suffix
- Mirror the source file name

```
article.ts → article.spec.ts
create-article.command.ts → create-article.command.spec.ts
```

### Test Structure

```typescript
describe('Article Entity', () => {
  describe('createNew', () => {
    it('should create article with generated ID', () => {
      // Arrange
      const title = 'Test Title';
      const content = 'Test Content';

      // Act
      const article = Article.createNew(title, content);

      // Assert
      expect(article.id).toBeDefined();
      expect(article.title).toBe(title);
    });
  });
});
```

### Test Naming

- Use `should [expected behavior] when [condition]` pattern
- Be descriptive and specific

```typescript
// ✅ Good
it('should throw ArticleNotFoundError when article does not exist', () => {});
it('should publish article when status is draft', () => {});

// ❌ Bad
it('works', () => {});
it('test 1', () => {});
```

---

## 📦 Import Organization

### Import Order

1. Node.js built-in modules
2. External dependencies
3. NestJS modules
4. Internal shared modules
5. Feature modules
6. Relative imports

```typescript
// 1. Node.js built-in
import { randomUUID } from 'crypto';

// 2. External dependencies
import { z } from 'zod';

// 3. NestJS modules
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

// 4. Internal shared modules
import { BaseDomainError } from '@/modules/shared/errors';
import { TypedCommand } from '@/modules/shared/cqrs';

// 5. Feature modules (if cross-module)
import { IUserInProc } from '@/modules/shared/in-proc/user.in-proc';

// 6. Relative imports
import { Article } from '../../domain/article/article';
import { IArticleRepository } from '../../domain/article/article.repository';
import { ARTICLE_TOKENS } from '../../article.tokens';
```

### Path Aliases

Use `@/` for absolute imports from `src/`:

```typescript
// ✅ Good - path alias
import { BaseDomainError } from '@/modules/shared/errors';

// ❌ Bad - relative path hell
import { BaseDomainError } from '../../../shared/errors';
```

---

## 🔒 Code Quality Rules

### ESLint Rules (Enforced)

- ✅ Explicit function return types
- ✅ Explicit module boundary types
- ✅ No explicit `any`
- ✅ No unused variables (except `_` prefix)
- ✅ No `console.log` (use logger)

### Prettier Rules (Auto-formatted)

- Single quotes for strings
- Trailing commas
- 2 space indentation
- 80 character line width (soft limit)

---

## 📋 Checklist for New Code

Before committing, ensure:

- [ ] All functions have explicit return types
- [ ] No `console.log` statements
- [ ] All endpoints have `@CorrelationId()`
- [ ] All endpoints have Swagger decorators
- [ ] Tests are co-located with code
- [ ] Validation uses Zod, not class-validator
- [ ] Business logic is in domain entities
- [ ] Imports are organized correctly
- [ ] Pre-commit hooks pass (lint-staged)

---

## 🔄 Refactoring Guidelines

### When to Extract

- **Extract to method**: When code block has a clear purpose
- **Extract to class**: When related methods and data form a concept
- **Extract to module**: When feature is self-contained

### Naming During Refactoring

- Keep existing names if they're clear
- Rename if purpose has changed
- Update all references (use IDE refactoring tools)

---

## 📚 Additional Resources

- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [NestJS Best Practices](https://docs.nestjs.com/fundamentals/testing)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
