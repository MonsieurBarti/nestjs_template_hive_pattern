import { describe, it, expect } from 'vitest';
import { Article } from './article';
import { randomUUID } from 'crypto';

describe('Article Entity', () => {
  describe('createNew', () => {
    it('should create a new article with generated ID and timestamps', () => {
      const title = 'Test Article';
      const content = 'Test content';

      const article = Article.createNew(title, content);

      expect(article.id).toBeDefined();
      expect(article.title).toBe(title);
      expect(article.content).toBe(content);
      expect(article.isPublished).toBe(false);
      expect(article.createdAt).toBeInstanceOf(Date);
      expect(article.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different articles', () => {
      const article1 = Article.createNew('Title 1', 'Content 1');
      const article2 = Article.createNew('Title 2', 'Content 2');

      expect(article1.id).not.toBe(article2.id);
    });
  });

  describe('create', () => {
    it('should create an article from valid props', () => {
      const props = {
        id: randomUUID(),
        title: 'Test Article',
        content: 'Test content',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const article = Article.create(props);

      expect(article.id).toBe(props.id);
      expect(article.title).toBe(props.title);
      expect(article.content).toBe(props.content);
      expect(article.isPublished).toBe(props.isPublished);
    });

    it('should throw error for invalid UUID', () => {
      const props = {
        id: 'invalid-uuid',
        title: 'Test',
        content: 'Content',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => Article.create(props)).toThrow();
    });

    it('should throw error for empty title', () => {
      const props = {
        id: randomUUID(),
        title: '',
        content: 'Content',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => Article.create(props)).toThrow();
    });
  });

  describe('publish', () => {
    it('should set isPublished to true', () => {
      const article = Article.createNew('Test', 'Content');
      expect(article.isPublished).toBe(false);

      article.publish();

      expect(article.isPublished).toBe(true);
    });

    it('should update the updatedAt timestamp', async () => {
      const article = Article.createNew('Test', 'Content');
      const originalUpdatedAt = article.updatedAt.getTime();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      article.publish();

      expect(article.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });
  });
});
