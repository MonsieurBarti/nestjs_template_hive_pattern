# AI Code Templates

**Usage**: Copy these templates and fill in the placeholders (e.g., `[Entity]`, `[Feature]`).

---

## 1. Domain Entity

```typescript
import { z } from "zod";
import { BaseDomainError } from "src/modules/shared/errors";

// --- Props Schema ---
export const [Entity]PropsSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Add other fields
});

export type [Entity]Props = z.infer<typeof [Entity]PropsSchema>;

// --- Entity Class ---
export class [Entity] {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: [Entity]Props) {
    this._id = props.id;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: [Entity]Props): [Entity] {
    const validated = [Entity]PropsSchema.parse(props);
    return new [Entity](validated);
  }

  // --- Getters ---
  public get id(): string { return this._id; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  // --- Business Logic ---
  public someBusinessMethod(): void {
    // Logic here
  }
}
```

---

## 2. Repository Interface (Port)

```typescript
import { [Entity] } from "./[entity]";

export interface I[Entity]Repository {
  save(entity: [Entity]): Promise<void>;
  findById(id: string): Promise<[Entity] | null>;
  // Add other methods
}
```

---

## 3. Infrastructure (Adapter)

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/shared/prisma/prisma.service";
import { I[Entity]Repository } from "../../domain/[entity]/[entity].repository";
import { [Entity] } from "../../domain/[entity]/[entity]";

@Injectable()
export class Sql[Entity]Repository implements I[Entity]Repository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: [Entity]): Promise<void> {
    const data = Sql[Entity]Mapper.toPersistence(entity);
    await this.prisma
      .withLabel("[Entity].save")
      .[prismaModel].upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
  }

  async findById(id: string): Promise<[Entity] | null> {
    const raw = await this.prisma
      .withLabel("[Entity].findById")
      .[prismaModel].findUnique({ where: { id } });

    return raw ? Sql[Entity]Mapper.toDomain(raw) : null;
  }
}

// --- InMemory Repository (for testing) ---
import { Injectable } from '@nestjs/common';
import { I[Entity]Repository } from '@/modules/[feature]/domain/[entity]/[entity].repository';
import { [Entity] } from '@/modules/[feature]/domain/[entity]/[entity]';

@Injectable()
export class InMemory[Entity]Repository implements I[Entity]Repository {
  private readonly [entities] = new Map<string, [Entity]>();

  async save([entity]: [Entity]): Promise<void> {
    this.[entities].set([entity].id, [entity]);
  }

  async findById(id: string): Promise<[Entity] | null> {
    return this.[entities].get(id) || null;
  }

  // Test-only helper method - NOT in the interface
  async findAll(): Promise<[Entity][]> {
    return Array.from(this.[entities].values());
  }
}

// --- Mapper ---
class Sql[Entity]Mapper {
  static toDomain(raw: any): [Entity] {
    return [Entity].create({
      id: raw.id,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(entity: [Entity]): any {
    return {
      id: entity.id,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
```

---

## 4. Command (Write)

```typescript
import { TypedCommand } from "src/modules/shared/cqrs";
import { ICommandHandler, CommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { [FEATURE]_TOKENS } from "../../[feature].tokens";

export type [Verb][Noun]CommandProps = {
  correlationId: string;
  // other props
};

export class [Verb][Noun]Command extends TypedCommand<void> {
  constructor(public readonly props: [Verb][Noun]CommandProps) {
    super();
  }
}

@CommandHandler([Verb][Noun]Command)
export class [Verb][Noun]CommandHandler implements ICommandHandler<[Verb][Noun]Command> {
  constructor(
    @Inject([FEATURE]_TOKENS.[ENTITY]_REPOSITORY)
    private readonly repository: I[Entity]Repository,
  ) {}

  async execute(command: [Verb][Noun]Command): Promise<void> {
    const { correlationId } = command.props;
    // Implementation
  }
}
```

---

## 5. Query (Read)

```typescript
import { TypedQuery } from "src/modules/shared/cqrs";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { [FEATURE]_TOKENS } from "../../[feature].tokens";

export type [Verb][Noun]QueryProps = {
  correlationId: string;
  id: string;
};

export type [Verb][Noun]Result = [Entity]; // Or a specific DTO

export class [Verb][Noun]Query extends TypedQuery<[Verb][Noun]Result> {
  constructor(public readonly props: [Verb][Noun]QueryProps) {
    super();
  }
}

@QueryHandler([Verb][Noun]Query)
export class [Verb][Noun]QueryHandler implements IQueryHandler<[Verb][Noun]Query> {
  constructor(
    @Inject([FEATURE]_TOKENS.[ENTITY]_REPOSITORY)
    private readonly repository: I[Entity]Repository,
  ) {}

  async execute(query: [Verb][Noun]Query): Promise<[Verb][Noun]Result> {
    const { correlationId, id } = query.props;
    // Implementation
    return result;
  }
}
```

---

## 6. Controller

```typescript
import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { TypedCommandBus, TypedQueryBus } from "src/modules/shared/cqrs";
import { CorrelationId } from "src/util/decorators/correlation-id.decorator";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

@ApiTags("[Feature]")
@Controller("[feature]")
export class [Feature]Controller {
  constructor(
    private readonly commandBus: TypedCommandBus,
    private readonly queryBus: TypedQueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create [Entity]" })
  @ApiBody({ type: Create[Entity]Dto })
  @ApiResponse({ status: 201, description: "[Entity] created." })
  async create(
    @Body() dto: Create[Entity]Dto,
    @CorrelationId() correlationId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new Create[Entity]Command({
        ...dto,
        correlationId,
      })
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get [Entity]" })
  @ApiResponse({ status: 200, description: "Return [Entity].", type: [Entity]ResponseDto })
  async get(
    @Param("id") id: string,
    @CorrelationId() correlationId: string,
  ): Promise<[Entity]ResponseDto> {
    const result = await this.queryBus.execute(
      new Get[Entity]Query({
        id,
        correlationId,
      })
    );
    return this.toDto(result);
  }

```

---

## 7. DTO (Zod)

```typescript
import { z } from "zod";
import { ZodSchema } from "src/util/decorators/zod-schema.decorator";
import { ApiProperty } from "@nestjs/swagger";

export const [Action][Entity]Schema = z.object({
  prop1: z.string().min(1),
  prop2: z.number(),
});

export type [Action][Entity]DtoType = z.infer<typeof [Action][Entity]Schema>;

@ZodSchema([Action][Entity]Schema)
export class [Action][Entity]Dto implements [Action][Entity]DtoType {
  @ApiProperty({ example: "Value 1" })
  prop1!: string;

  @ApiProperty({ example: 123 })
}
```

---

## 8. Domain Entity Test

```typescript
import { describe, it, expect } from 'vitest';
import { [Entity] } from './[entity]';
import { randomUUID } from 'crypto';

describe('[Entity] Entity', () => {
  describe('createNew', () => {
    it('should create a new [entity] with generated ID and timestamps', () => {
      const [entity] = [Entity].createNew(/* params */);

      expect([entity].id).toBeDefined();
      expect([entity].createdAt).toBeInstanceOf(Date);
      expect([entity].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    it('should create [entity] from valid props', () => {
      const props = {
        id: randomUUID(),
        // other props
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [entity] = [Entity].create(props);

      expect([entity].id).toBe(props.id);
    });

    it('should throw error for invalid props', () => {
      const props = {
        id: 'invalid-uuid',
        // other props
      };

      expect(() => [Entity].create(props)).toThrow();
    });
  });

  describe('businessMethod', () => {
    it('should perform expected business logic', () => {
      const [entity] = [Entity].createNew(/* params */);

      [entity].businessMethod();

      expect([entity].someProperty).toBe(expectedValue);
    });
  });
});
```

---

## 9. Command Handler Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { [Verb][Noun]CommandHandler } from './[verb]-[noun].command';
import { InMemory[Entity]Repository } from '../../../infrastructure/[entity]/in-memory-[entity].repository';

describe('[Verb][Noun]CommandHandler', () => {
  let handler: [Verb][Noun]CommandHandler;
  let repository: InMemory[Entity]Repository; // Use concrete type, not interface

  beforeEach(() => {
    repository = new InMemory[Entity]Repository();
    handler = new [Verb][Noun]CommandHandler(repository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should execute command successfully', async () => {
    const command = {
      props: {
        // command props
        correlationId: 'test-id',
      },
    };

    await handler.execute(command);

    // Verify side effects using test-only methods
    const results = await repository.findAll();
    expect(results).toHaveLength(1);
  });
});
```

---

## 10. Query Handler Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { [Verb][Noun]QueryHandler } from './[verb]-[noun].query';
import { InMemory[Entity]Repository } from '../../../infrastructure/[entity]/in-memory-[entity].repository';
import { [Entity] } from '../../../domain/[entity]/[entity]';

describe('[Verb][Noun]QueryHandler', () => {
  let handler: [Verb][Noun]QueryHandler;
  let repository: InMemory[Entity]Repository; // Use concrete type, not interface

  beforeEach(() => {
    repository = new InMemory[Entity]Repository();
    handler = new [Verb][Noun]QueryHandler(repository);
  });

  it('should return expected result', async () => {
    // Setup test data
    const [entity] = [Entity].createNew(/* params */);
    await repository.save([entity]);

    const query = {
      props: {
        id: [entity].id,
        correlationId: 'test-id',
      },
    };

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.id).toBe([entity].id);
  });

  it('should throw error when not found', async () => {
    const query = {
      props: {
        id: 'non-existent-id',
        correlationId: 'test-id',
      },
    };

    await expect(handler.execute(query)).rejects.toThrow();
  });
});
```

---

## 11. Domain Event

```typescript
import { z } from 'zod';

// --- Event Props Schema ---
export const [Entity][Action]EventPropsSchema = z.object({
  [entity]Id: z.string().uuid(),
  occurredAt: z.date(),
  // Add other event data
});

export type [Entity][Action]EventProps = z.infer<typeof [Entity][Action]EventPropsSchema>;

// --- Domain Event ---
export class [Entity][Action]Event {
  public readonly [entity]Id: string;
  public readonly occurredAt: Date;

  constructor(props: [Entity][Action]EventProps) {
    const validated = [Entity][Action]EventPropsSchema.parse(props);
    this.[entity]Id = validated.[entity]Id;
    this.occurredAt = validated.occurredAt;
  }
}

// --- Event Handler ---
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectLogger, BaseLogger } from '@/modules/logger';

@EventsHandler([Entity][Action]Event)
export class [Entity][Action]EventHandler implements IEventHandler<[Entity][Action]Event> {
  constructor(
    @InjectLogger([Entity][Action]EventHandler.name)
    private readonly logger: BaseLogger,
  ) {}

  async handle(event: [Entity][Action]Event): Promise<void> {
    this.logger.log({
      message: '[Entity] [action] event received',
      [entity]Id: event.[entity]Id,
      occurredAt: event.occurredAt,
    });

    // Handle the event (e.g., send notification, update read model, etc.)
  }
}
```

**Publishing events from entity:**

```typescript
export class [Entity] {
  // ... entity code

  public [action](): void {
    // Business logic
    this._status = 'published';

    // Publish event (if using event bus in handler)
    // The handler will publish this after saving
  }
}

// In the handler:
async execute(command: [Action][Entity]Command): Promise<void> {
  const [entity] = await this.repository.findById(command.props.id);
  [entity].[action]();
  await this.repository.save([entity]);

  // Publish event
  await this.eventBus.publish(
    new [Entity][Action]Event({
      [entity]Id: [entity].id,
      occurredAt: new Date(),
    })
  );
}
```

---

## 12. Exception Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseDomainError } from '@/modules/shared/errors';
import { InjectLogger, BaseLogger } from '@/modules/logger';

// --- Custom Domain Error ---
export class [Entity]NotFoundError extends BaseDomainError {
  constructor(id: string) {
    super(`[Entity] with ID ${id} not found`);
    this.name = '[Entity]NotFoundError';
  }
}

export class [Entity]ValidationError extends BaseDomainError {
  constructor(message: string) {
    super(message);
    this.name = '[Entity]ValidationError';
  }
}

// --- Exception Filter ---
@Catch(BaseDomainError)
export class [Feature]ExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectLogger([Feature]ExceptionFilter.name)
    private readonly logger: BaseLogger,
  ) {}

  catch(exception: BaseDomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = this.getHttpStatus(exception);

    this.logger.error({
      message: 'Domain error occurred',
      error: exception.message,
      errorName: exception.name,
      path: request.url,
      method: request.method,
    });

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getHttpStatus(exception: BaseDomainError): HttpStatus {
    if (exception instanceof [Entity]NotFoundError) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof [Entity]ValidationError) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
```

**Register in controller:**

```typescript
@Controller('[feature]')
@UseFilters([Feature]ExceptionFilter)
export class [Feature]Controller {
  // ...
}
```

---

## 13. Integration Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { [Feature]Module } from '../[feature].module';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('[Feature]Controller (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [[Feature]Module],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /[feature]', () => {
    it('should create a new [entity]', async () => {
      const createDto = {
        prop1: 'value1',
        prop2: 'value2',
      };

      const response = await request(app.getHttpServer())
        .post('/[feature]')
        .send(createDto)
        .expect(201);

      // If command returns void, check response is empty
      expect(response.body).toEqual({});
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        prop1: '', // Invalid
      };

      const response = await request(app.getHttpServer())
        .post('/[feature]')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /[feature]/:id', () => {
    it('should return [entity] by id', async () => {
      // First create an entity
      const createDto = {
        prop1: 'value1',
        prop2: 'value2',
      };

      // Note: You'll need to modify this based on your actual response
      // If using InMemory repository, you might need to seed data differently

      const response = await request(app.getHttpServer())
        .get('/[feature]/some-id')
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        prop1: 'value1',
        prop2: 'value2',
      });
    });

    it('should return 404 for non-existent [entity]', async () => {
      await request(app.getHttpServer())
        .get('/[feature]/non-existent-id')
        .expect(404);
    });
  });

  describe('Full Flow', () => {
    it('should create and retrieve [entity]', async () => {
      // Create
      const createDto = {
        prop1: 'Integration Test',
        prop2: 'Testing full flow',
      };

      await request(app.getHttpServer())
        .post('/[feature]')
        .send(createDto)
        .expect(201);

      // For InMemory repository, you might need to track the ID
      // This is a simplified example
    });
  });
});
```

**With Database (using test container):**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/modules/shared/prisma/prisma.service';

describe('[Feature]Controller (Integration with DB)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Set up test database (e.g., using test container)
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [[Feature]Module],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.[table].deleteMany();
  });

  // Tests here...
});
```

---

## 14. Mapper Test

```typescript
import { describe, it, expect } from 'vitest';
import { Sql[Entity]Mapper } from './sql-[entity].mapper';
import { [Entity] } from '../../domain/[entity]/[entity]';
import { randomUUID } from 'crypto';

describe('Sql[Entity]Mapper', () => {
  describe('toDomain', () => {
    it('should map persistence model to domain entity', () => {
      const persistenceModel = {
        id: randomUUID(),
        prop1: 'value1',
        prop2: 'value2',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      const entity = Sql[Entity]Mapper.toDomain(persistenceModel);

      expect(entity).toBeInstanceOf([Entity]);
      expect(entity.id).toBe(persistenceModel.id);
      expect(entity.prop1).toBe(persistenceModel.prop1);
      expect(entity.prop2).toBe(persistenceModel.prop2);
      expect(entity.createdAt).toEqual(persistenceModel.created_at);
      expect(entity.updatedAt).toEqual(persistenceModel.updated_at);
    });

    it('should handle null values correctly', () => {
      const persistenceModel = {
        id: randomUUID(),
        prop1: 'value1',
        prop2: null, // Nullable field
        created_at: new Date(),
        updated_at: new Date(),
      };

      const entity = Sql[Entity]Mapper.toDomain(persistenceModel);

      expect(entity.prop2).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to persistence model', () => {
      const entity = [Entity].createNew('value1', 'value2');

      const persistenceModel = Sql[Entity]Mapper.toPersistence(entity);

      expect(persistenceModel).toMatchObject({
        id: entity.id,
        prop1: entity.prop1,
        prop2: entity.prop2,
        created_at: entity.createdAt,
        updated_at: entity.updatedAt,
      });
    });

    it('should handle all entity properties', () => {
      const entity = [Entity].create({
        id: randomUUID(),
        prop1: 'value1',
        prop2: 'value2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      const persistenceModel = Sql[Entity]Mapper.toPersistence(entity);

      // Verify all properties are mapped
      expect(persistenceModel.id).toBe(entity.id);
      expect(persistenceModel.created_at).toEqual(entity.createdAt);
      expect(persistenceModel.updated_at).toEqual(entity.updatedAt);
    });
  });

  describe('Round-trip mapping', () => {
    it('should maintain data integrity through round-trip conversion', () => {
      const originalEntity = [Entity].createNew('value1', 'value2');

      // Entity -> Persistence -> Entity
      const persistenceModel = Sql[Entity]Mapper.toPersistence(originalEntity);
      const mappedEntity = Sql[Entity]Mapper.toDomain(persistenceModel);

      expect(mappedEntity.id).toBe(originalEntity.id);
      expect(mappedEntity.prop1).toBe(originalEntity.prop1);
      expect(mappedEntity.prop2).toBe(originalEntity.prop2);
      expect(mappedEntity.createdAt).toEqual(originalEntity.createdAt);
      expect(mappedEntity.updatedAt).toEqual(originalEntity.updatedAt);
    });
  });
});
```
