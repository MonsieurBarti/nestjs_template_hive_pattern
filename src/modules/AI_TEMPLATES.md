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
  prop2!: number;
}
```
