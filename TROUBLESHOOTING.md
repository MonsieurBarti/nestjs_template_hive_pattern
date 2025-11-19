# Troubleshooting Guide

Common issues and their solutions when working with the NestJS Hive Pattern Template.

## 🔍 Quick Diagnosis

### Symptoms → Solutions

| Symptom                             | Likely Cause       | Jump To                                              |
| ----------------------------------- | ------------------ | ---------------------------------------------------- |
| "Cannot find module"                | Import path issue  | [Module Resolution](#module-resolution-errors)       |
| "Nest can't resolve dependencies"   | DI configuration   | [Dependency Injection](#dependency-injection-errors) |
| Tests fail with "not a constructor" | Import issue       | [Test Import Errors](#test-import-errors)            |
| "Correlation ID is undefined"       | Missing decorator  | [Correlation ID](#correlation-id-issues)             |
| Validation not working              | Zod schema issue   | [Validation](#validation-errors)                     |
| Swagger not showing endpoint        | Missing decorators | [Swagger](#swagger-documentation-issues)             |
| ESLint errors on commit             | Pre-commit hook    | [Pre-commit Hooks](#pre-commit-hook-failures)        |

---

## 🚨 Common Errors

### Module Resolution Errors

#### Error: `Cannot find module '@/modules/...'`

**Cause**: Path alias not configured correctly.

**Solution**:

1. Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "src/*": ["src/*"]
    }
  }
}
```

2. Check `vitest.config.ts`:

```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
    },
  },
});
```

3. Restart TypeScript server in VSCode: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

---

#### Error: `Module not found: Can't resolve './domain/...'`

**Cause**: Incorrect relative path or file doesn't exist.

**Solution**:

1. Verify file exists at the path
2. Check file extension (`.ts` should be omitted in imports)
3. Use absolute imports with `@/` instead:

```typescript
// ❌ Bad - fragile relative path
import { Article } from '../../../domain/article/article';

// ✅ Good - absolute path
import { Article } from '@/modules/article/domain/article/article';
```

---

### Dependency Injection Errors

#### Error: `Nest can't resolve dependencies of [Handler]`

**Cause**: Repository or dependency not provided in module.

**Solution**:

1. Check module providers:

```typescript
@Module({
  providers: [
    CreateArticleCommandHandler,
    {
      provide: ARTICLE_TOKENS.ARTICLE_REPOSITORY,
      useClass: InMemoryArticleRepository,
    },
  ],
})
```

2. Verify token matches:

```typescript
// In handler
@Inject(ARTICLE_TOKENS.ARTICLE_REPOSITORY)

// In module
provide: ARTICLE_TOKENS.ARTICLE_REPOSITORY
```

3. Ensure token is imported from the same file

---

#### Error: `Cannot read property 'execute' of undefined`

**Cause**: CommandBus or QueryBus not provided.

**Solution**:

Add to module providers:

```typescript
@Module({
  imports: [CqrsModule],
  providers: [
    TypedCommandBus,
    TypedQueryBus,
    // ... handlers
  ],
})
```

---

### Test Import Errors

#### Error: `[Handler] is not a constructor`

**Cause**: Incorrect import syntax (using default import instead of named).

**Solution**:

```typescript
// ✅ Good - named import
import { CreateArticleCommandHandler } from './create-article.command';

// ❌ Bad - default import
import CreateArticleCommandHandler from './create-article.command';
```

---

#### Error: `Cannot access 'findAll' on IArticleRepository`

**Cause**: Repository typed as interface instead of concrete class in tests.

**Solution**:

```typescript
// ✅ Good - concrete type for test helpers
let repository: InMemoryArticleRepository;

beforeEach(() => {
  repository = new InMemoryArticleRepository();
});

// Now you can use test-only methods
const all = await repository.findAll();

// ❌ Bad - interface type
let repository: IArticleRepository;
```

---

### Correlation ID Issues

#### Error: `correlationId is undefined` in logs

**Cause**: Missing `@CorrelationId()` decorator on controller method.

**Solution**:

```typescript
// ✅ Good
@Post()
async create(
  @Body() dto: CreateArticleDto,
  @CorrelationId() correlationId: string,
): Promise<void> {
  // ...
}

// ❌ Bad - missing decorator
@Post()
async create(@Body() dto: CreateArticleDto): Promise<void> {
  // correlationId will be undefined
}
```

---

### Validation Errors

#### Error: Validation not working on DTO

**Cause**: Missing `@ZodSchema` decorator or validation pipe not configured.

**Solution**:

1. Add `@ZodSchema` decorator:

```typescript
@ZodSchema(CreateArticleSchema)
export class CreateArticleDto implements CreateArticleDtoType {
  // ...
}
```

2. Ensure validation pipe is global (in `main.ts`):

```typescript
app.useGlobalPipes(new ValidationPipe());
```

---

#### Error: `ZodError: Invalid type`

**Cause**: Data doesn't match Zod schema.

**Solution**:

1. Check schema definition:

```typescript
export const CreateArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});
```

2. Ensure request data matches:

```json
{
  "title": "Valid Title",
  "content": "Valid Content"
}
```

3. Check for type mismatches (string vs number, etc.)

---

### Swagger Documentation Issues

#### Error: Endpoint not showing in Swagger UI

**Cause**: Missing Swagger decorators.

**Solution**:

Add all required decorators:

```typescript
@ApiTags('Articles') // On controller
@Controller('articles')
export class ArticleController {
  @Post()
  @ApiOperation({ summary: 'Create article' }) // On method
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ status: 201, description: 'Created' })
  async create(/* ... */) {}
}
```

---

#### Error: DTO properties not showing in Swagger

**Cause**: Missing `@ApiProperty` decorators.

**Solution**:

```typescript
export class CreateArticleDto {
  @ApiProperty({ example: 'My Title' }) // Add this
  title!: string;

  @ApiProperty({ example: 'Content here' }) // Add this
  content!: string;
}
```

---

### TypeScript Errors

#### Error: `Type 'void' is not assignable to type 'Promise<void>'`

**Cause**: Command handler not returning Promise.

**Solution**:

```typescript
// ✅ Good - async returns Promise
async execute(command: CreateArticleCommand): Promise<void> {
  await this.repository.save(article);
}

// ❌ Bad - not async
execute(command: CreateArticleCommand): Promise<void> {
  this.repository.save(article);
}
```

---

#### Error: `Property '_id' is private and only accessible within class`

**Cause**: Trying to access private property from outside.

**Solution**:

Use getter:

```typescript
export class Article {
  private readonly _id: string;

  public get id(): string {
    return this._id;
  }
}

// Usage
const id = article.id; // ✅ Good
const id = article._id; // ❌ Bad
```

---

### Database/Prisma Errors

#### Error: `PrismaClient is not available`

**Cause**: PrismaService not provided or imported.

**Solution**:

1. Ensure PrismaModule is imported:

```typescript
@Module({
  imports: [PrismaModule],  // Add this
  // ...
})
```

2. Or provide PrismaService directly:

```typescript
@Module({
  providers: [PrismaService],
  // ...
})
```

---

### Pre-commit Hook Failures

#### Error: Pre-commit hook fails with lint errors

**Cause**: Code doesn't pass ESLint checks.

**Solution**:

1. Run lint manually to see errors:

```bash
npm run lint
```

2. Fix errors or bypass for emergency commits:

```bash
git commit --no-verify -m "message"
```

3. Common fixes:
   - Add explicit return types
   - Remove `console.log` statements
   - Fix unused variables (prefix with `_`)

---

#### Error: `lint-staged: command not found`

**Cause**: Husky not initialized or lint-staged not installed.

**Solution**:

```bash
npm install --save-dev husky lint-staged --legacy-peer-deps
npx husky init
```

---

## 🧪 Testing Issues

### Tests Hanging

**Cause**: Missing `await` on async operations.

**Solution**:

```typescript
// ✅ Good
it('should create article', async () => {
  await handler.execute(command);
  const articles = await repository.findAll();
  expect(articles).toHaveLength(1);
});

// ❌ Bad - missing await
it('should create article', async () => {
  handler.execute(command); // Not awaited!
  const articles = repository.findAll(); // Not awaited!
});
```

---

### Flaky Tests

**Cause**: Tests not isolated or depend on timing.

**Solution**:

1. Use `beforeEach` to reset state:

```typescript
let repository: InMemoryArticleRepository;

beforeEach(() => {
  repository = new InMemoryArticleRepository();
});
```

2. Don't rely on timing:

```typescript
// ❌ Bad
await new Promise((resolve) => setTimeout(resolve, 100));

// ✅ Good - use proper async/await
await someAsyncOperation();
```

---

### Coverage Not Generated

**Cause**: Vitest coverage not configured.

**Solution**:

1. Install coverage package:

```bash
npm install --save-dev @vitest/coverage-v8
```

2. Add to `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
```

---

## 🔧 Development Environment Issues

### VSCode Not Recognizing Imports

**Cause**: TypeScript server not using workspace version.

**Solution**:

1. Open any `.ts` file
2. `Cmd+Shift+P` → "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

---

### Debugger Not Stopping at Breakpoints

**Cause**: Source maps not configured or outdated.

**Solution**:

1. Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

2. Rebuild:

```bash
npm run build
```

3. Restart debugger

---

### ESLint Not Working in VSCode

**Cause**: ESLint extension not installed or not enabled.

**Solution**:

1. Install extension: `dbaeumer.vscode-eslint`
2. Reload VSCode
3. Check `.vscode/settings.json`:

```json
{
  "eslint.validate": ["javascript", "typescript"]
}
```

---

## 🚀 Performance Issues

### Slow Test Execution

**Cause**: Using real database or not using InMemory repositories.

**Solution**:

Use InMemory repositories in tests:

```typescript
// ✅ Good - fast
const repository = new InMemoryArticleRepository();

// ❌ Bad - slow
const repository = new SqlArticleRepository(prisma);
```

---

### Slow Application Startup

**Cause**: Too many modules or circular dependencies.

**Solution**:

1. Check for circular dependencies:

```bash
npx madge --circular src/
```

2. Use Hive Pattern for cross-module communication
3. Lazy load modules if possible

---

## 📚 Getting More Help

### Resources

- **Documentation**: Check `.ai-context.md` for quick reference
- **Examples**: Review `src/modules/article/` for working code
- **Workflows**: Follow `.agent/workflows/` for step-by-step guides
- **Conventions**: Read `CONVENTIONS.md` for standards

### Debugging Steps

1. **Read the error message** carefully
2. **Check the stack trace** for the exact location
3. **Search this document** for the error
4. **Review similar working code** in the article module
5. **Check recent changes** with `git diff`
6. **Ask for help** with specific error details

### Common Debugging Commands

```bash
# Check for syntax errors
npm run lint

# Run specific test
npx vitest run path/to/test.spec.ts

# Check TypeScript errors
npx tsc --noEmit

# View detailed logs
LOG_LEVEL=debug npm run start:dev

# Check for circular dependencies
npx madge --circular src/
```

---

## 🆘 Still Stuck?

If you've tried the solutions above and still have issues:

1. **Verify your setup**:
   - Node version: `node --version` (should be 20+)
   - Dependencies installed: `npm install`
   - TypeScript version: `npx tsc --version`

2. **Create minimal reproduction**:
   - Isolate the problem
   - Remove unrelated code
   - Test in a fresh branch

3. **Check for known issues**:
   - Review recent commits
   - Check if others have the same issue
   - Look for related GitHub issues

4. **Document the issue**:
   - Exact error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
