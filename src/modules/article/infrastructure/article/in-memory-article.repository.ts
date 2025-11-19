import { Injectable } from '@nestjs/common';
import { IArticleRepository } from '@/modules/article/domain/article/article.repository';
import { Article } from '@/modules/article/domain/article/article';

@Injectable()
export class InMemoryArticleRepository implements IArticleRepository {
  private readonly articles = new Map<string, Article>();

  async save(article: Article): Promise<void> {
    this.articles.set(article.id, article);
  }

  async findById(id: string): Promise<Article | null> {
    return this.articles.get(id) || null;
  }

  async findAll(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }
}
