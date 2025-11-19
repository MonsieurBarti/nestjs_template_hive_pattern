# Database Setup

This guide explains how to set up and use the database with Prisma.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database URL

Copy `.env.example` to `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Migrations

```bash
npm run prisma:migrate
```

This will create the database tables based on your Prisma schema.

## Development Workflow

### Creating a Migration

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

Prisma will:

1. Prompt you for a migration name
2. Create a migration file in `prisma/migrations/`
3. Apply the migration to your database
4. Regenerate the Prisma Client

### Viewing Your Data

Use Prisma Studio to browse and edit your data:

```bash
npm run prisma:studio
```

This opens a GUI at `http://localhost:5555`

## Switching Between Repositories

The template includes both InMemory and SQL repositories.

### Use InMemory Repository (Default - for testing)

```typescript
// article.module.ts
{
  provide: ARTICLE_TOKENS.ARTICLE_REPOSITORY,
  useClass: InMemoryArticleRepository,
}
```

### Use SQL Repository (for production)

```typescript
// article.module.ts
import { SqlArticleRepository } from './infrastructure/article/sql-article.repository';

{
  provide: ARTICLE_TOKENS.ARTICLE_REPOSITORY,
  useClass: SqlArticleRepository,
}
```

## Database Schema

The Prisma schema is located at `prisma/schema.prisma`.

### Example: Article Model

```prisma
model Article {
  id           String   @id @default(uuid())
  title        String
  content      String
  is_published Boolean  @default(false)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  @@map("articles")
}
```

### Naming Conventions

- **Database**: `snake_case` (e.g., `created_at`, `is_published`)
- **Domain**: `camelCase` (e.g., `createdAt`, `isPublished`)
- **Mapper**: Handles conversion between the two

## Common Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Format schema file
npx prisma format
```

## Production Deployment

### 1. Build

```bash
npm run build
```

### 2. Run Migrations

```bash
npx prisma migrate deploy
```

Use `migrate deploy` in production (not `migrate dev`).

### 3. Start Application

```bash
npm run start:prod
```

## Docker Setup

The template includes a `docker-compose.yml` for local PostgreSQL:

```bash
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- Database: `nest_db`
- User: `nest_user`
- Password: `nest_password`

Update your `.env`:

```env
DATABASE_URL="postgresql://nest_user:nest_password@localhost:5432/nest_db?schema=public"
```

## Troubleshooting

### Error: "Can't reach database server"

- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall/network settings

### Error: "Prisma Client not generated"

Run:

```bash
npm run prisma:generate
```

### Error: "Migration failed"

1. Check migration file in `prisma/migrations/`
2. Manually fix if needed
3. Run `npx prisma migrate resolve --applied <migration_name>` if already applied
4. Or `npx prisma migrate reset` to start fresh (dev only!)

### Type Errors After Schema Change

1. Regenerate Prisma Client: `npm run prisma:generate`
2. Restart TypeScript server in VSCode
3. Update mappers if field names changed

## Best Practices

1. **Always generate client after schema changes**
2. **Use migrations in production** (never `prisma db push`)
3. **Keep mappers in sync** with schema changes
4. **Test migrations** in staging before production
5. **Backup database** before running migrations in production

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
