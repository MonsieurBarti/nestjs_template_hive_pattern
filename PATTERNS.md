# Advanced Patterns

This document covers advanced architectural patterns that are used or directly applicable to the NestJS Hive Pattern Template.

## 📚 Table of Contents

1. [Domain Events](#1-domain-events)
2. [Cross-Module Communication (Hive Pattern)](#2-cross-module-communication-hive-pattern)
3. [Repository Patterns](#3-repository-patterns)
4. [Error Handling Strategies](#4-error-handling-strategies)
5. [Validation Patterns](#5-validation-patterns)
6. [Testing Patterns](#6-testing-patterns)
7. [Mapper Patterns](#7-mapper-patterns)

---

## 1. Domain Events

### Pattern Overview

Domain events represent something significant that happened in the domain. They enable loose coupling between modules and make side effects explicit.

### When to Use

- Triggering side effects after domain operations
- Decoupling modules (instead of direct calls)
- Audit logging
- Notification systems
- Updating read models

### Implementation

#### Define the Event

```typescript
// domain/events/article-published.event.ts
import { z } from 'zod';

export const ArticlePublishedEventPropsSchema = z.object({
  articleId: z.uuid(),
  title: z.string(),
  authorId: z.uuid(),
  publishedAt: z.date(),
});

export type ArticlePublishedEventProps = z.infer<
  typeof ArticlePublishedEventPropsSchema
>;

export class ArticlePublishedEvent {
  public readonly articleId: string;
  public readonly title: string;
  public readonly authorId: string;
  public readonly publishedAt: Date;

  constructor(props: ArticlePublishedEventProps) {
    const validated = ArticlePublishedEventPropsSchema.parse(props);
    Object.assign(this, validated);
  }
}
```

#### Publish from Handler

```typescript
// application/commands/publish-article/publish-article.command.ts
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(PublishArticleCommand)
export class PublishArticleCommandHandler {
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly repository: IArticleRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PublishArticleCommand): Promise<void> {
    const article = await this.repository.findById(command.props.articleId);
    if (!article) throw new ArticleNotFoundError(command.props.articleId);

    // Call domain method
    article.publish();
    await this.repository.save(article);

    // Publish domain event
    await this.eventBus.publish(
      new ArticlePublishedEvent({
        articleId: article.id,
        title: article.title,
        authorId: article.authorId,
        publishedAt: new Date(),
      }),
    );
  }
}
```

#### Handle the Event

```typescript
// application/events/article-published.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(ArticlePublishedEvent)
export class ArticlePublishedEventHandler
  implements IEventHandler<ArticlePublishedEvent>
{
  constructor(
    @InjectLogger(ArticlePublishedEventHandler.name)
    private readonly logger: BaseLogger,
    @Inject(IN_PROC_TOKENS.NOTIFICATION)
    private readonly notificationService: INotificationInProc,
  ) {}

  async handle(event: ArticlePublishedEvent): Promise<void> {
    this.logger.log({
      message: 'Article published event received',
      articleId: event.articleId,
    });

    // Send notification (side effect)
    await this.notificationService.sendNotification({
      userId: event.authorId,
      message: `Your article "${event.title}" has been published!`,
    });
  }
}
```

#### Register Event Handler

```typescript
@Module({
  providers: [
    // ... other providers
    ArticlePublishedEventHandler,
  ],
})
export class ArticleModule {}
```

### Best Practices

- ✅ Events are past tense (ArticlePublished, not PublishArticle)
- ✅ Events are immutable (readonly properties)
- ✅ Events contain all necessary data (avoid lazy loading)
- ✅ Event handlers are idempotent (can be called multiple times safely)
- ❌ Don't use events for request/response (use queries instead)

---

## 2. Cross-Module Communication (Hive Pattern)

### Pattern Overview

The Hive Pattern enables modules to communicate through well-defined interfaces without creating direct dependencies. This is the core pattern of this template.

### When to Use

- Accessing data from another module
- Triggering actions in another module
- Avoiding circular dependencies
- Maintaining module boundaries

### Implementation

#### Step 1: Define Interface

```typescript
// modules/shared/in-proc/user.in-proc.ts
export interface IUserInProc {
  getUserById(id: string): Promise<UserDto | null>;
  getUsersByIds(ids: string[]): Promise<UserDto[]>;
}

export const IN_PROC_TOKENS = {
  USER: Symbol('USER_IN_PROC'),
};

// DTO for cross-module communication
export class UserDto {
  id: string;
  email: string;
  name: string;

  static fromDomain(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

#### Step 2: Implement in Provider Module

```typescript
// modules/user/infrastructure/user.in-proc.service.ts
@Injectable()
export class UserInProcService implements IUserInProc {
  constructor(
    @Inject(USER_TOKENS.USER_REPOSITORY)
    private readonly repository: IUserRepository,
  ) {}

  async getUserById(id: string): Promise<UserDto | null> {
    const user = await this.repository.findById(id);
    return user ? UserDto.fromDomain(user) : null;
  }

  async getUsersByIds(ids: string[]): Promise<UserDto[]> {
    const users = await this.repository.findByIds(ids);
    return users.map(UserDto.fromDomain);
  }
}
```

#### Step 3: Provide in Module

```typescript
// modules/user/user.module.ts
@Module({
  providers: [
    {
      provide: IN_PROC_TOKENS.USER,
      useClass: UserInProcService,
    },
  ],
  exports: [IN_PROC_TOKENS.USER], // Export for other modules
})
export class UserModule {}
```

#### Step 4: Consume in Another Module

```typescript
// modules/article/article.module.ts
@Module({
  imports: [UserModule], // Import the provider module
  providers: [GetArticleWithAuthorQueryHandler],
})
export class ArticleModule {}

// In the handler
@QueryHandler(GetArticleWithAuthorQuery)
export class GetArticleWithAuthorQueryHandler {
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly articleRepo: IArticleRepository,
    @Inject(IN_PROC_TOKENS.USER) // Inject the interface
    private readonly userService: IUserInProc,
  ) {}

  async execute(
    query: GetArticleWithAuthorQuery,
  ): Promise<ArticleWithAuthorDto> {
    const article = await this.articleRepo.findById(query.props.id);
    const author = await this.userService.getUserById(article.authorId);

    return {
      article: ArticleDto.fromDomain(article),
      author,
    };
  }
}
```

### Best Practices

- ✅ Define interfaces in `modules/shared/in-proc/`
- ✅ Use DTOs for cross-module data transfer (not domain entities)
- ✅ Keep interfaces focused (single responsibility)
- ✅ Export tokens from provider module
- ❌ Never import domain entities from other modules
- ❌ Never import repositories from other modules

---

## 3. Repository Patterns

### InMemory Repository (for Testing)

Used in this template for fast, isolated tests.

```typescript
// infrastructure/article/in-memory-article.repository.ts
@Injectable()
export class InMemoryArticleRepository implements IArticleRepository {
  private readonly articles = new Map<string, Article>();

  async save(article: Article): Promise<void> {
    this.articles.set(article.id, article);
  }

  async findById(id: string): Promise<Article | null> {
    return this.articles.get(id) || null;
  }

  // Test-only helper method (NOT in interface)
  async findAll(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  // Test-only helper method
  async clear(): Promise<void> {
    this.articles.clear();
  }
}
```

**Usage in tests:**

```typescript
describe('CreateArticleCommandHandler', () => {
  let repository: InMemoryArticleRepository; // Concrete type!
  let handler: CreateArticleCommandHandler;

  beforeEach(() => {
    repository = new InMemoryArticleRepository();
    handler = new CreateArticleCommandHandler(repository);
  });

  it('should create article', async () => {
    await handler.execute(command);

    // Use test-only method
    const articles = await repository.findAll();
    expect(articles).toHaveLength(1);
  });
});
```

### SQL Repository (for Production)

```typescript
// infrastructure/article/sql-article.repository.ts
@Injectable()
export class SqlArticleRepository implements IArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(article: Article): Promise<void> {
    const data = SqlArticleMapper.toPersistence(article);

    await this.prisma
      .withLabel('Article.save') // For query tracking
      .article.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
  }

  async findById(id: string): Promise<Article | null> {
    const raw = await this.prisma
      .withLabel('Article.findById')
      .article.findUnique({
        where: { id },
      });

    return raw ? SqlArticleMapper.toDomain(raw) : null;
  }
}
```

### Specification Pattern (for Complex Queries)

When you need reusable, composable query logic:

```typescript
// domain/article/specifications/article.specification.ts
export interface IArticleSpecification {
  isSatisfiedBy(article: Article): boolean;
}

export class PublishedArticleSpec implements IArticleSpecification {
  isSatisfiedBy(article: Article): boolean {
    return article.status === 'published';
  }
}

export class ArticleByAuthorSpec implements IArticleSpecification {
  constructor(private readonly authorId: string) {}

  isSatisfiedBy(article: Article): boolean {
    return article.authorId === this.authorId;
  }
}

// Combine specifications
export class AndSpec implements IArticleSpecification {
  constructor(
    private readonly left: IArticleSpecification,
    private readonly right: IArticleSpecification,
  ) {}

  isSatisfiedBy(article: Article): boolean {
    return (
      this.left.isSatisfiedBy(article) && this.right.isSatisfiedBy(article)
    );
  }
}
```

**Usage:**

```typescript
const spec = new AndSpec(
  new PublishedArticleSpec(),
  new ArticleByAuthorSpec('author-123'),
);

const articles = await repository.findAll();
const filtered = articles.filter((a) => spec.isSatisfiedBy(a));
```

---

## 4. Error Handling Strategies

### Domain Error Hierarchy

```typescript
// modules/shared/errors/base-domain.error.ts
export abstract class BaseDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Feature-specific errors
// domain/article/article.errors.ts
export class ArticleNotFoundError extends BaseDomainError {
  constructor(id: string) {
    super(`Article with ID ${id} not found`);
  }
}

export class ArticleAlreadyPublishedError extends BaseDomainError {
  constructor(id: string) {
    super(`Article with ID ${id} is already published`);
  }
}

export class ArticleValidationError extends BaseDomainError {
  constructor(message: string) {
    super(`Article validation failed: ${message}`);
  }
}
```

### Exception Filter

```typescript
// presentation/filters/article-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BaseDomainError)
export class ArticleExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectLogger(ArticleExceptionFilter.name)
    private readonly logger: BaseLogger,
  ) {}

  catch(exception: BaseDomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = this.mapErrorToStatus(exception);

    this.logger.error({
      message: 'Domain error occurred',
      error: exception.message,
      errorType: exception.name,
      path: request.url,
    });

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapErrorToStatus(exception: BaseDomainError): HttpStatus {
    if (exception instanceof ArticleNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ArticleValidationError) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof ArticleAlreadyPublishedError) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
```

**Register in controller:**

```typescript
@Controller('articles')
@UseFilters(ArticleExceptionFilter)
export class ArticleController {
  // ...
}
```

---

## 5. Validation Patterns

### Zod Schema Composition

Reuse schemas for consistency:

```typescript
// presentation/dto/article.schemas.ts
import { z } from 'zod';

// Base schemas
const ArticleTitleSchema = z.string().min(1).max(200);
const ArticleContentSchema = z.string().min(1).max(10000);

// Composed schemas
export const CreateArticleSchema = z.object({
  title: ArticleTitleSchema,
  content: ArticleContentSchema,
});

export const UpdateArticleSchema = z.object({
  title: ArticleTitleSchema.optional(),
  content: ArticleContentSchema.optional(),
});

// Ensure at least one field is provided
export const UpdateArticleRefinedSchema = UpdateArticleSchema.refine(
  (data) => data.title !== undefined || data.content !== undefined,
  { message: 'At least one field must be provided' },
);
```

### Cross-Field Validation

```typescript
export const DateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
  });
```

### Custom Zod Validators

```typescript
const UUIDSchema = z.uuid();
const EmailSchema = z.string().email();
const URLSchema = z.string().url();

// Custom validator
const SlugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens',
  );
```

---

## 6. Testing Patterns

### Arrange-Act-Assert Pattern

```typescript
it('should publish article when status is draft', async () => {
  // Arrange - Set up test data
  const article = Article.createNew('Title', 'Content');
  await repository.save(article);

  const command = new PublishArticleCommand({
    articleId: article.id,
    correlationId: 'test-123',
  });

  // Act - Execute the operation
  await handler.execute(command);

  // Assert - Verify the results
  const updated = await repository.findById(article.id);
  expect(updated.status).toBe('published');
});
```

### Test Data Builders

For complex entities:

```typescript
// test/builders/article.builder.ts
export class ArticleBuilder {
  private props: Partial<ArticleProps> = {};

  withTitle(title: string): this {
    this.props.title = title;
    return this;
  }

  withContent(content: string): this {
    this.props.content = content;
    return this;
  }

  withStatus(status: ArticleStatus): this {
    this.props.status = status;
    return this;
  }

  build(): Article {
    return Article.create({
      id: randomUUID(),
      title: this.props.title || 'Default Title',
      content: this.props.content || 'Default Content',
      status: this.props.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// Usage
const article = new ArticleBuilder()
  .withTitle('Test Article')
  .withStatus('published')
  .build();
```

### Testing Error Cases

```typescript
it('should throw ArticleNotFoundError when article does not exist', async () => {
  const command = new PublishArticleCommand({
    articleId: 'non-existent-id',
    correlationId: 'test-123',
  });

  await expect(handler.execute(command)).rejects.toThrow(ArticleNotFoundError);
});
```

---

## 7. Mapper Patterns

### Domain ↔ Persistence Mapping

```typescript
// infrastructure/article/sql-article.mapper.ts
export class SqlArticleMapper {
  static toDomain(raw: PrismaArticle): Article {
    return Article.create({
      id: raw.id,
      title: raw.title,
      content: raw.content,
      status: raw.status as ArticleStatus,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(article: Article): PrismaArticleCreate {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status,
      created_at: article.createdAt,
      updated_at: article.updatedAt,
    };
  }
}
```

### Domain → DTO Mapping

```typescript
// presentation/dto/article-response.dto.ts
export class ArticleResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: 'My Article' })
  title!: string;

  @ApiProperty({ example: 'Content here' })
  content!: string;

  @ApiProperty({ example: 'draft' })
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(article: Article): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
```

### Handling Nested Objects

```typescript
export class ArticleWithAuthorResponseDto {
  @ApiProperty({ type: ArticleResponseDto })
  article!: ArticleResponseDto;

  @ApiProperty({ type: UserDto })
  author!: UserDto;

  static fromDomain(
    article: Article,
    author: User,
  ): ArticleWithAuthorResponseDto {
    return {
      article: ArticleResponseDto.fromDomain(article),
      author: UserDto.fromDomain(author),
    };
  }
}
```

---

## 📚 Additional Resources

- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Specification Pattern](https://martinfowler.com/apsupp/spec.pdf)
