import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ArticleController } from './presentation/controllers/article.controller';
import { CreateArticleCommandHandler } from './application/commands/create-article/create-article.command';
import { GetArticleQueryHandler } from './application/queries/get-article/get-article.query';
import { InMemoryArticleRepository } from './infrastructure/article/in-memory-article.repository';
import { ARTICLE_TOKENS } from './article.tokens';
import { TypedCommandBus, TypedQueryBus } from '../shared/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [ArticleController],
  providers: [
    TypedCommandBus,
    TypedQueryBus,
    CreateArticleCommandHandler,
    GetArticleQueryHandler,
    {
      provide: ARTICLE_TOKENS.ARTICLE_REPOSITORY,
      useClass: InMemoryArticleRepository,
    },
  ],
})
export class ArticleModule {}
