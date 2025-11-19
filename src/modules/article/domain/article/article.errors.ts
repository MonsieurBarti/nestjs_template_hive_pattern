import { BaseDomainError } from '@/modules/shared/errors/base-domain.error';

/**
 * Thrown when an article is not found by its ID.
 */
export class ArticleNotFoundError extends BaseDomainError {
  readonly errorCode = 'ARTICLE_NOT_FOUND';

  constructor(
    articleId: string,
    options?: {
      correlationId?: string;
    },
  ) {
    super(`Article with ID ${articleId} not found`, {
      shouldReport: false, // User error, don't spam Sentry
      correlationId: options?.correlationId,
      metadata: { articleId },
    });
  }
}

/**
 * Thrown when attempting to publish an article that is already published.
 */
export class ArticleAlreadyPublishedError extends BaseDomainError {
  readonly errorCode = 'ARTICLE_ALREADY_PUBLISHED';

  constructor(
    articleId: string,
    options?: {
      correlationId?: string;
    },
  ) {
    super(`Article with ID ${articleId} is already published`, {
      shouldReport: false, // Business rule violation, not a system error
      correlationId: options?.correlationId,
      metadata: { articleId },
    });
  }
}

/**
 * Thrown when article validation fails.
 */
export class ArticleValidationError extends BaseDomainError {
  readonly errorCode = 'ARTICLE_VALIDATION_ERROR';

  constructor(
    message: string,
    options?: {
      correlationId?: string;
      field?: string;
    },
  ) {
    super(`Article validation failed: ${message}`, {
      shouldReport: false, // User input error
      correlationId: options?.correlationId,
      metadata: { field: options?.field },
    });
  }
}
