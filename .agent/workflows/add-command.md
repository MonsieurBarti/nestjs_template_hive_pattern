---
description: Add a new command to an existing module
---

# Add a New Command to Existing Module

This workflow guides you through adding a new command (write operation) to an existing feature module.

## Prerequisites

- Feature module already exists
- Understand CQRS pattern (commands return `void`)
- Know what business operation you're implementing

## Steps

### 1. Create Command Directory

// turbo

```bash
# Replace [feature] and [verb-noun] with your values
FEATURE_NAME="[feature]"
COMMAND_NAME="[verb-noun]"
mkdir -p src/modules/$FEATURE_NAME/application/commands/$COMMAND_NAME
```

### 2. Create Command and Handler

Create `src/modules/[feature]/application/commands/[verb-noun]/[verb-noun].command.ts` using the **Command Template** from `AI_TEMPLATES.md`.

**Critical rules:**

- ✅ Must extend `TypedCommand<void>`
- ✅ Must include `correlationId: string` in props
- ✅ Must return `Promise<void>` from handler
- ✅ Use `@Inject()` with DI token for dependencies

**Example:**

```typescript
export type PublishArticleCommandProps = {
  correlationId: string;
  articleId: string;
};

export class PublishArticleCommand extends TypedCommand<void> {
  constructor(public readonly props: PublishArticleCommandProps) {
    super();
  }
}

@CommandHandler(PublishArticleCommand)
export class PublishArticleCommandHandler
  implements ICommandHandler<PublishArticleCommand>
{
  constructor(
    @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
    private readonly repository: IArticleRepository,
  ) {}

  async execute(command: PublishArticleCommand): Promise<void> {
    const { correlationId, articleId } = command.props;

    // 1. Load entity
    const article = await this.repository.findById(articleId);
    if (!article) throw new ArticleNotFoundError(articleId);

    // 2. Call domain method (business logic lives in entity)
    article.publish();

    // 3. Save
    await this.repository.save(article);
  }
}
```

### 3. Create DTO (if needed for HTTP endpoint)

If exposing via HTTP, create `src/modules/[feature]/presentation/dto/[verb-noun].dto.ts` using the **DTO Template** from `AI_TEMPLATES.md`.

**Key points:**

- Use Zod schema with `@ZodSchema` decorator
- Add `@ApiProperty` for Swagger
- Don't include `correlationId` (added by decorator)

### 4. Add Endpoint to Controller (if needed)

Update `src/modules/[feature]/presentation/controllers/[feature].controller.ts`:

```typescript
@Post('[action]')
@ApiOperation({ summary: 'Description of what this does' })
@ApiBody({ type: [VerbNoun]Dto })
@ApiResponse({ status: 200, description: 'Success message' })
async [actionName](
  @Body() dto: [VerbNoun]Dto,
  @CorrelationId() correlationId: string,
): Promise<void> {
  await this.commandBus.execute(
    new [VerbNoun]Command({
      ...dto,
      correlationId,
    })
  );
}
```

### 5. Register Handler in Module

Update `src/modules/[feature]/[feature].module.ts`:

```typescript
import { [VerbNoun]CommandHandler } from './application/commands/[verb-noun]/[verb-noun].command';

@Module({
  providers: [
    // ... existing providers
    [VerbNoun]CommandHandler,
  ],
})
```

### 6. Create Test

Create `src/modules/[feature]/application/commands/[verb-noun]/[verb-noun].command.spec.ts` using the **Command Handler Test Template** from `AI_TEMPLATES.md`.

**Testing best practices:**

- Use InMemory repository (not mocks)
- Type repository as concrete class for test helpers
- Test both success and error cases
- Use descriptive test names

### 7. Verify

// turbo

```bash
# Run tests
npm run test

# Run linter
npm run lint
```

If exposing via HTTP, start the server and check Swagger:

```bash
npm run start:dev
```

Visit `http://localhost:3000/api/docs`

## Common Patterns

### Command with Multiple Entities

```typescript
constructor(
  @Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)
  private readonly articleRepo: IArticleRepository,
  @Inject(USER_TOKENS.USER_REPOSITORY)
  private readonly userRepo: IUserRepository,
) {}
```

### Command that Publishes Domain Event

```typescript
async execute(command: PublishArticleCommand): Promise<void> {
  const article = await this.repository.findById(command.props.articleId);
  article.publish(); // This might emit ArticlePublishedEvent

  await this.repository.save(article);

  // Event will be published by the entity or repository
}
```

### Command with Complex Validation

Put validation in the domain entity, not the handler:

```typescript
// ❌ Bad - validation in handler
async execute(command: CreateArticleCommand): Promise<void> {
  if (command.props.title.length < 5) throw new Error('Title too short');
  // ...
}

// ✅ Good - validation in entity factory
export class Article {
  static createNew(title: string, content: string): Article {
    const props = ArticlePropsSchema.parse({ title, content, ... });
    // Zod schema handles validation
    return new Article(props);
  }
}
```

## Next Steps

- Add more commands as needed
- Consider adding domain events for side effects
- Add integration tests for full HTTP flow

## Troubleshooting

- **Handler not found**: Did you register it in the module providers?
- **DI error**: Check token is imported and matches repository provider
- **Type error on TypedCommand**: Ensure you're extending `TypedCommand<void>`
- **Correlation ID missing**: Add `@CorrelationId()` decorator to controller method
