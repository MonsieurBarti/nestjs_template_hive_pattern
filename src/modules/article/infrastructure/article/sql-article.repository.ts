import { Injectable } from '@nestjs/common';
import { IArticleRepository } from '../../domain/article/article.repository';
import { Article } from '../../domain/article/article';
import { PrismaService } from '@/modules/shared/prisma/prisma.service';
import { SqlArticleMapper } from './sql-article.mapper';

@Injectable()
export class SqlArticleRepository implements IArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(article: Article): Promise<void> {
    const data = SqlArticleMapper.toPersistence(article);

    await this.prisma.article.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Article | null> {
    const raw = await this.prisma.article.findUnique({
      where: { id },
    });

    return raw ? SqlArticleMapper.toDomain(raw) : null;
  }
}
