---
description: Add a new query to an existing module
---

# Add a New Query to Existing Module

This workflow guides you through adding a new query (read operation) to an existing feature module.

## Prerequisites

- Feature module already exists
- Understand CQRS pattern (queries return data)
- Know what data you need to retrieve

## Steps

### 1. Create Query Directory

// turbo

```bash
# Replace [feature] and [verb-noun] with your values
FEATURE_NAME="[feature]"
QUERY_NAME="[verb-noun]"
mkdir -p src/modules/$FEATURE_NAME/application/queries/$QUERY_NAME
```

### 2. Create Query and Handler

Create `src/modules/[feature]/application/queries/[verb-noun]/[verb-noun].query.ts` using the **Query Template** from `AI_TEMPLATES.md`.

**Critical rules:**

- ✅ Must extend `TypedQuery<ResultType>`
- ✅ Must include `correlationId: string` in props
- ✅ Must return `Promise<ResultType>` from handler
- ✅ Define explicit result type

**Example:**

```typescript
export type GetArticleByIdQueryProps = {
  correlationId: string;
  id: string;
};

export type GetArticleByIdResult = Article;

export class GetArticleByIdQuery extends TypedQuery<GetArticleByIdResult> {
  constructor(public readonly props: GetArticleByIdQueryProps) {
    super();
  }
}

@QueryHandler(GetArticleByIdQuery)
export class GetArticleByIdQueryHandler
  implements IQueryHandler<GetArticleByIdQuery>
{
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly repository: IArticleRepository,
  ) {}

  async execute(query: GetArticleByIdQuery): Promise<GetArticleByIdResult> {
    const { correlationId, id } = query.props;

    const article = await this.repository.findById(id);
    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    return article;
  }
}
```

### 3. Create Response DTO

Create `src/modules/[feature]/presentation/dto/[feature]-response.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../../domain/article/article';

export class ArticleResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id!: string;

  @ApiProperty({ example: 'My Article Title' })
  title!: string;

  @ApiProperty({ example: 'Article content here' })
  content!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(article: Article): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
```

### 4. Add Endpoint to Controller

Update `src/modules/[feature]/presentation/controllers/[feature].controller.ts`:

```typescript
@Get(':id')
@ApiOperation({ summary: 'Get [feature] by ID' })
@ApiResponse({
  status: 200,
  description: 'Return [feature]',
  type: [Feature]ResponseDto
})
@ApiResponse({
  status: 404,
  description: '[Feature] not found'
})
async getById(
  @Param('id') id: string,
  @CorrelationId() correlationId: string,
): Promise<[Feature]ResponseDto> {
  const result = await this.queryBus.execute(
    new Get[Feature]ByIdQuery({
      id,
      correlationId,
    })
  );

  return [Feature]ResponseDto.fromDomain(result);
}
```

### 5. Register Handler in Module

Update `src/modules/[feature]/[feature].module.ts`:

```typescript
import { [VerbNoun]QueryHandler } from './application/queries/[verb-noun]/[verb-noun].query';

@Module({
  providers: [
    // ... existing providers
    [VerbNoun]QueryHandler,
  ],
})
```

### 6. Create Test

Create `src/modules/[feature]/application/queries/[verb-noun]/[verb-noun].query.spec.ts` using the **Query Handler Test Template** from `AI_TEMPLATES.md`.

**Testing best practices:**

- Use InMemory repository with pre-populated data
- Test both success and error cases (e.g., not found)
- Verify returned data structure

### 7. Verify

// turbo

```bash
# Run tests
yarn run test

# Run linter
yarn run lint
```

Start the server and check Swagger:

```bash
yarn run start:dev
```

Visit `http://localhost:3000/api/docs`

## Common Patterns

### Query with Multiple Parameters

```typescript
export type FindArticlesQueryProps = {
  correlationId: string;
  authorId?: string;
  status?: ArticleStatus;
  limit?: number;
  offset?: number;
};

export type FindArticlesResult = {
  articles: Article[];
  total: number;
};
```

### Query with Pagination

```typescript
export class PaginatedArticlesResponseDto {
  @ApiProperty({ type: [ArticleResponseDto] })
  items!: ArticleResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;
}
```

### Query Joining Multiple Entities

```typescript
export type GetArticleWithAuthorResult = {
  article: Article;
  author: User;
};

@QueryHandler(GetArticleWithAuthorQuery)
export class GetArticleWithAuthorQueryHandler {
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly articleRepo: IArticleRepository,
    @Inject(IN_PROC_TOKENS.USER) // Use Hive Pattern for cross-module
    private readonly userService: IUserInProc,
  ) {}

  async execute(
    query: GetArticleWithAuthorQuery,
  ): Promise<GetArticleWithAuthorResult> {
    const article = await this.articleRepo.findById(query.props.id);
    if (!article) throw new ArticleNotFoundError(query.props.id);

    const author = await this.userService.getUserById(article.authorId);

    return { article, author };
  }
}
```

### Query with Filtering

Add query parameters to DTO:

```typescript
export const FindArticlesSchema = z.object({
  status: z.enum(['draft', 'published']).optional(),
  authorId: z.uuid().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

@ZodSchema(FindArticlesSchema)
export class FindArticlesDto implements z.infer<typeof FindArticlesSchema> {
  @ApiProperty({ required: false, enum: ['draft', 'published'] })
  status?: 'draft' | 'published';

  @ApiProperty({ required: false })
  authorId?: string;

  @ApiProperty({ required: false, default: 10 })
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  offset?: number;
}
```

Controller:

```typescript
@Get()
@ApiOperation({ summary: 'Find articles with filters' })
async find(
  @Query() dto: FindArticlesDto,
  @CorrelationId() correlationId: string,
): Promise<PaginatedArticlesResponseDto> {
  const result = await this.queryBus.execute(
    new FindArticlesQuery({
      ...dto,
      correlationId,
    })
  );

  return {
    items: result.articles.map(ArticleResponseDto.fromDomain),
    total: result.total,
    limit: dto.limit || 10,
    offset: dto.offset || 0,
  };
}
```

## Next Steps

- Add more queries as needed
- Consider caching for frequently accessed data
- Add integration tests for full HTTP flow

## Troubleshooting

- **Handler not found**: Did you register it in the module providers?
- **DI error**: Check token is imported and matches repository provider
- **Type error on TypedQuery**: Ensure you're extending `TypedQuery<ResultType>`
- **Swagger not showing response**: Add `@ApiResponse` with `type` property
- **Correlation ID missing**: Add `@CorrelationId()` decorator to controller method
