import { describe, it, expect, beforeEach } from 'vitest';
import { GetArticleQueryHandler } from './get-article.query';
import { InMemoryArticleRepository } from '../../../infrastructure/article/in-memory-article.repository';
import { Article } from '../../../domain/article/article';

describe('GetArticleQueryHandler', () => {
  let handler: GetArticleQueryHandler;
  let repository: InMemoryArticleRepository;

  beforeEach(() => {
    repository = new InMemoryArticleRepository();
    handler = new GetArticleQueryHandler(repository);
  });

  it('should return an article by ID', async () => {
    const article = Article.createNew('Test Article', 'Test content');
    await repository.save(article);

    const query = {
      props: {
        id: article.id,
        correlationId: 'test-correlation-id',
      },
    };

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.id).toBe(article.id);
    expect(result.title).toBe('Test Article');
    expect(result.content).toBe('Test content');
  });

  it('should throw error when article not found', async () => {
    const query = {
      props: {
        id: 'non-existent-id',
        correlationId: 'test-correlation-id',
      },
    };

    await expect(handler.execute(query)).rejects.toThrow('Article not found');
  });
});
