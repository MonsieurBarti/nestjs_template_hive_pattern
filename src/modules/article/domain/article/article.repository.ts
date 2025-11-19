import { Article } from './article';

export interface IArticleRepository {
  save(article: Article): Promise<void>;
  findById(id: string): Promise<Article | null>;
}
