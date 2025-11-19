import { describe, it, expect, beforeEach } from 'vitest';
import { CreateArticleCommandHandler } from './create-article.command';
import { InMemoryArticleRepository } from '../../../infrastructure/article/in-memory-article.repository';

describe('CreateArticleCommandHandler', () => {
  let handler: CreateArticleCommandHandler;
  let repository: InMemoryArticleRepository;

  beforeEach(() => {
    repository = new InMemoryArticleRepository();
    handler = new CreateArticleCommandHandler(repository);
  });

  it('should create and save a new article', async () => {
    const command = {
      props: {
        title: 'Test Article',
        content: 'Test content',
        correlationId: 'test-correlation-id',
      },
    };

    await handler.execute(command);

    const articles = await repository.findAll();
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Test Article');
    expect(articles[0].content).toBe('Test content');
  });

  it('should create article with correct properties', async () => {
    const command = {
      props: {
        title: 'My Article',
        content: 'Article content',
        correlationId: 'test-id',
      },
    };

    await handler.execute(command);

    const articles = await repository.findAll();
    expect(articles[0].title).toBe('My Article');
    expect(articles[0].content).toBe('Article content');
    expect(articles[0].isPublished).toBe(false);
  });
});
