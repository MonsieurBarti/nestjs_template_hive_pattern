import { Prisma } from '@prisma/client';
import { Article } from '../../domain/article/article';

export class SqlArticleMapper {
  static toDomain(raw: Prisma.ArticleGetPayload<true>): Article {
    return Article.create({
      id: raw.id,
      title: raw.title,
      content: raw.content,
      isPublished: raw.is_published,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(article: Article): Prisma.ArticleCreateInput {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      is_published: article.isPublished,
      created_at: article.createdAt,
      updated_at: article.updatedAt,
    };
  }
}
