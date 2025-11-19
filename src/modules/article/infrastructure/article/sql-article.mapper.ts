import { Article } from '../../domain/article/article';
import { Article as PrismaArticle } from '@prisma/client';

export class SqlArticleMapper {
  static toDomain(raw: PrismaArticle): Article {
    return Article.create({
      id: raw.id,
      title: raw.title,
      content: raw.content,
      isPublished: raw.is_published,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(article: Article): Omit<
    PrismaArticle,
    'created_at' | 'updated_at'
  > & {
    created_at: Date;
    updated_at: Date;
  } {
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
