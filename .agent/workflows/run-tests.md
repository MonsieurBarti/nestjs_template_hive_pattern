---
description: Run and debug tests
---

# Run and Debug Tests

This workflow covers running tests, debugging failures, and understanding test output.

## Quick Commands

// turbo-all

### Run All Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Specific Test File

```bash
npx vitest run src/modules/article/domain/article/article.spec.ts
```

### Run Tests Matching Pattern

```bash
npx vitest run --grep "should create"
```

## Understanding Test Output

### Successful Test

```
✓ src/modules/article/domain/article/article.spec.ts (3)
  ✓ Article Entity (3)
    ✓ should create a new article
    ✓ should validate props
    ✓ should publish article
```

### Failed Test

```
✗ src/modules/article/domain/article/article.spec.ts (1)
  ✗ Article Entity > should create a new article
    AssertionError: expected 'Draft' to equal 'Published'
```

## Debugging Failed Tests

### 1. Read the Error Message

Vitest provides clear error messages with:

- Expected vs actual values
- Stack trace
- Line numbers

### 2. Use Console Logging (Temporarily)

```typescript
it('should create article', () => {
  const article = Article.createNew('Title', 'Content');
  console.log('Article:', article); // Temporary debug
  expect(article.title).toBe('Title');
});
```

**Remember**: Remove console.log before committing (ESLint will catch this).

### 3. Use Vitest UI for Interactive Debugging

```bash
npm run test:ui
```

This opens a browser interface where you can:

- See test results visually
- Re-run specific tests
- View detailed error messages

### 4. Check Test Isolation

Each test should be independent:

```typescript
describe('ArticleRepository', () => {
  let repository: InMemoryArticleRepository;

  beforeEach(() => {
    // Fresh repository for each test
    repository = new InMemoryArticleRepository();
  });

  it('test 1', async () => {
    // This won't affect test 2
  });

  it('test 2', async () => {
    // Clean state
  });
});
```

## Common Test Failures

### "Cannot find module"

**Cause**: Import path is wrong or module not found.

**Fix**: Check path aliases in `tsconfig.json` and `vitest.config.ts`:

```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    'src': path.resolve(__dirname, './src'),
  },
},
```

### "Handler is not a constructor"

**Cause**: Forgot to import handler or imported incorrectly.

**Fix**:

```typescript
// ✅ Correct
import { CreateArticleCommandHandler } from './create-article.command';

// ❌ Wrong
import CreateArticleCommandHandler from './create-article.command';
```

### "Repository method not found"

**Cause**: Trying to use test-only method but typed as interface.

**Fix**:

```typescript
// ❌ Wrong - typed as interface
let repository: IArticleRepository;

// ✅ Correct - typed as concrete class
let repository: InMemoryArticleRepository;

// Now you can use test-only methods
const all = await repository.findAll();
```

### "Zod validation error"

**Cause**: Test data doesn't match schema.

**Fix**: Check the schema and provide valid data:

```typescript
// If schema requires UUID
import { randomUUID } from 'crypto';

const article = Article.create({
  id: randomUUID(), // ✅ Valid UUID
  // id: '123', // ❌ Invalid UUID
  title: 'Test',
  content: 'Content',
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Test Coverage

### View Coverage Report

```bash
npm run test:cov
```

This generates a coverage report in `coverage/` directory.

### Understanding Coverage Metrics

- **Statements**: % of code statements executed
- **Branches**: % of if/else branches tested
- **Functions**: % of functions called
- **Lines**: % of lines executed

### Target Coverage

Aim for:

- **Domain entities**: 100% (pure logic, easy to test)
- **Handlers**: 90%+ (core business logic)
- **Controllers**: 70%+ (mostly integration tests)

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good - describes behavior
it('should create article with draft status', () => {});
it('should throw error when title is empty', () => {});

// ❌ Bad - vague
it('test 1', () => {});
it('works', () => {});
```

### 2. Arrange-Act-Assert

```typescript
it('should publish article', () => {
  // Arrange - setup
  const article = Article.createNew('Title', 'Content');

  // Act - execute
  article.publish();

  // Assert - verify
  expect(article.status).toBe('published');
});
```

### 3. Test One Thing

```typescript
// ✅ Good - focused test
it('should create article with generated ID', () => {
  const article = Article.createNew('Title', 'Content');
  expect(article.id).toBeDefined();
});

it('should create article with draft status', () => {
  const article = Article.createNew('Title', 'Content');
  expect(article.status).toBe('draft');
});

// ❌ Bad - testing multiple things
it('should create article', () => {
  const article = Article.createNew('Title', 'Content');
  expect(article.id).toBeDefined();
  expect(article.status).toBe('draft');
  expect(article.title).toBe('Title');
  // ... too much
});
```

### 4. Use InMemory Repositories

```typescript
// ✅ Good - real implementation
const repository = new InMemoryArticleRepository();
const handler = new CreateArticleCommandHandler(repository);

// ❌ Avoid - mocks are brittle
const repository = {
  save: vi.fn(),
  findById: vi.fn(),
};
```

## Continuous Integration

Tests should pass before:

- Committing code
- Creating pull requests
- Deploying to production

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test

- name: Check coverage
  run: npm run test:cov
```

## Next Steps

- Write tests for new features before implementation (TDD)
- Add integration tests for critical flows
- Set up coverage thresholds in CI

## Troubleshooting

- **Tests hang**: Check for missing `await` on async operations
- **Flaky tests**: Ensure tests are isolated and don't depend on timing
- **Slow tests**: Use InMemory repositories instead of real database
- **Import errors**: Verify path aliases in both `tsconfig.json` and `vitest.config.ts`
