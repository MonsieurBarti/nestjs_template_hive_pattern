# Getting Started with NestJS Hive Pattern Template

Welcome! This guide will help you understand and use this template effectively.

## 📚 What You'll Learn

1. Understanding the example Article module
2. Creating your first feature from scratch
3. Running and testing your code
4. Next steps and best practices

---

## 🎯 Step 1: Understand the Example

This template includes a complete `Article` module as a reference. Let's explore it.

### The Article Module Structure

```
src/modules/article/
├── domain/article/
│   ├── article.ts                    # Entity with business logic
│   ├── article.repository.ts         # Repository interface (port)
│   └── article.spec.ts               # Entity tests
├── application/
│   ├── commands/create-article/
│   │   ├── create-article.command.ts
│   │   └── create-article.command.spec.ts
│   └── queries/get-article/
│       ├── get-article.query.ts
│       └── get-article.query.spec.ts
├── infrastructure/article/
│   └── in-memory-article.repository.ts  # Test implementation
├── presentation/
│   ├── controllers/article.controller.ts
│   └── dto/
│       ├── create-article.dto.ts
│       └── article-response.dto.ts
├── article.module.ts
└── article.tokens.ts
```

### Key Files to Review

1. **[`article.ts`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/article/domain/article/article.ts)** - See how entities encapsulate business logic
2. **[`create-article.command.ts`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/article/application/commands/create-article/create-article.command.ts)** - Example of a command (write operation)
3. **[`get-article.query.ts`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/article/application/queries/get-article/get-article.query.ts)** - Example of a query (read operation)
4. **[`article.controller.ts`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/article/presentation/controllers/article.controller.ts)** - See how controllers stay thin

---

## 🚀 Step 2: Run the Example

### Install Dependencies

```bash
yarn install
```

### Set Up Environment

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
IS_LOCAL=true
```

### Start the Server

```bash
yarn start:dev
```

### Explore the API

Visit **http://localhost:3000/api/docs** to see the Swagger documentation.

Try these endpoints:

1. **POST /article** - Create a new article

   ```json
   {
     "title": "My First Article",
     "content": "This is the content"
   }
   ```

2. **GET /article/:id** - Get an article by ID (use the ID from step 1)

### Run the Tests

```bash
yarn test
```

You should see all tests passing ✅

---

## 🛠️ Step 3: Create Your First Feature

Let's create a simple `Task` module together.

### 3.1 Use the Workflow

We'll use the `/create-feature` workflow. Read it here: [`.agent/workflows/create-feature.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/.agent/workflows/create-feature.md)

### 3.2 Create the Structure

```bash
FEATURE_NAME="task"
mkdir -p src/modules/$FEATURE_NAME/{domain/$FEATURE_NAME,application/{commands,queries},infrastructure/$FEATURE_NAME,presentation/{controllers,dto}}
```

### 3.3 Create the Domain Entity

Create `src/modules/task/domain/task/task.ts`:

```typescript
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const TaskPropsSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  completed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TaskProps = z.infer<typeof TaskPropsSchema>;

export class Task {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _description: string;
  private _completed: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: TaskProps) {
    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._completed = props.completed;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: TaskProps): Task {
    const validated = TaskPropsSchema.parse(props);
    return new Task(validated);
  }

  public static createNew(title: string, description: string): Task {
    return new Task({
      id: randomUUID(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters
  public get id(): string {
    return this._id;
  }
  public get title(): string {
    return this._title;
  }
  public get description(): string {
    return this._description;
  }
  public get completed(): boolean {
    return this._completed;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business logic
  public complete(): void {
    this._completed = true;
    this._updatedAt = new Date();
  }

  public uncomplete(): void {
    this._completed = false;
    this._updatedAt = new Date();
  }
}
```

### 3.4 Follow the Workflow

Continue following the steps in [`.agent/workflows/create-feature.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/.agent/workflows/create-feature.md) to:

1. Create the repository interface
2. Create the InMemory repository
3. Create tokens
4. Create a command (CreateTask)
5. Create a query (GetTask)
6. Create DTOs
7. Create the controller
8. Create the module
9. Register in app.module.ts
10. Write tests

### 3.5 Or Use AI Assistance

If you're using an AI agent, simply say:

> "Create a Task module with title, description, and completed status. Include commands for creating and completing tasks, and a query to get a task by ID."

The AI will follow the workflows and templates automatically!

---

## 🧪 Step 4: Test Your Feature

### Run Tests

```bash
yarn test
```

### Run in Watch Mode

```bash
yarn test:watch
```

### Check Coverage

```bash
yarn test:cov
```

### Test the API

```bash
yarn start:dev
```

Visit **http://localhost:3000/api/docs** and try your new endpoints!

---

## 📖 Step 5: Learn the Architecture

Now that you've created a feature, dive deeper into the concepts:

### Read These Docs (in order)

1. **[`ARCHITECTURE.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/ARCHITECTURE.md)** - Understand the "why" behind the structure
2. **[`AI_AGENTS.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/AI_AGENTS.md)** - Learn all the rules and conventions
3. **[`AI_TEMPLATES.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/AI_TEMPLATES.md)** - Bookmark for quick reference

### Key Concepts to Understand

- **Hexagonal Architecture**: Why we separate domain, application, infrastructure, and presentation
- **CQRS**: Why commands and queries are separate
- **Hive Pattern**: How modules communicate without tight coupling
- **Dependency Injection**: How we use tokens for loose coupling

---

## 🎯 Next Steps

### Add More Features

Use the workflows:

- [Add a command](.agent/workflows/add-command.md) - e.g., "Complete Task"
- [Add a query](.agent/workflows/add-query.md) - e.g., "Find All Tasks"

### Replace InMemory Repository

When ready for production:

1. Add Prisma schema
2. Create SQL repository implementation
3. Create mapper (domain ↔ persistence)
4. Update module to use SQL repository

See the **Infrastructure Template** in [`AI_TEMPLATES.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/AI_TEMPLATES.md).

### Add Advanced Features

- **Domain Events**: Publish events when entities change
- **Exception Filters**: Custom error handling per module
- **Integration Tests**: Test full HTTP flows
- **Background Jobs**: Use BullMQ for async processing

### Customize for Your Project

- Update `package.json` with your project name
- Modify `.env.example` with your environment variables
- Add your database schema
- Configure CI/CD pipelines

---

## 🆘 Common Questions

### Q: Where does business logic go?

**A**: In the domain entity. Handlers should be thin orchestrators.

```typescript
// ❌ Bad - logic in handler
async execute(command: CompleteTaskCommand): Promise<void> {
  const task = await this.repository.findById(command.props.id);
  task._completed = true; // Don't manipulate directly!
  await this.repository.save(task);
}

// ✅ Good - logic in entity
async execute(command: CompleteTaskCommand): Promise<void> {
  const task = await this.repository.findById(command.props.id);
  task.complete(); // Entity method handles the logic
  await this.repository.save(task);
}
```

### Q: When should I use a command vs a query?

**A**:

- **Command**: Changes state, returns `void`
- **Query**: Reads data, returns data

### Q: How do I access another module's data?

**A**: Use the Hive Pattern (In-Proc interfaces). See [`ARCHITECTURE.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/src/modules/ARCHITECTURE.md) section 4.

### Q: Why Zod instead of class-validator?

**A**: Zod provides:

- Runtime type safety
- Better TypeScript inference
- Composable schemas
- Smaller bundle size

### Q: Can I use a different database?

**A**: Yes! Just implement the repository interface for your database. The domain layer doesn't care about persistence details.

---

## 📚 Additional Resources

- **Quick Reference**: [`.ai-context.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/.ai-context.md)
- **Workflows**: [`.agent/workflows/`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/.agent/workflows/)
- **NestJS Docs**: https://docs.nestjs.com/
- **Zod Docs**: https://zod.dev/
- **Vitest Docs**: https://vitest.dev/

---

## 🎉 You're Ready!

You now have:

- ✅ Understanding of the architecture
- ✅ A working example to reference
- ✅ Your first custom feature
- ✅ Knowledge of where to find help

**Happy coding!** 🚀

---

**Need help?** Check the [`.ai-context.md`](file:///Users/monsieurbarti/Projects/nest_hive_pattern_template/.ai-context.md) for quick answers or ask an AI agent to help you using the workflows.
