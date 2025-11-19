import { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';
import { InjectLogger } from '@/modules/logger';
import type { BaseLogger } from '@/modules/logger/base/logger';
import {
  SentryService,
  RequestContext,
  UserContext,
} from '@/util/errors/sentry.service';
import type { ErrorResponseDto } from './error-response.dto';
import type { BaseDomainError } from './base-domain.error';
import { LoggerModuleNames } from '@/modules/logger/base/types/extra-params.type';

/**
 * Base exception filter for feature modules.
 *
 * Provides common error handling logic including:
 * - Sentry reporting (based on error.shouldReport flag)
 * - Structured logging with correlation IDs
 * - RFC 9457 Problem Details responses
 * - Request/user context extraction
 *
 * Subclasses only need to implement HTTP status mapping:
 * ```typescript
 * @Catch(ModuleError)
 * export class ModuleExceptionFilter extends BaseFeatureExceptionFilter<ModuleError> {
 *   protected mapErrorToStatus(error: ModuleError): number {
 *     if (error instanceof SpecificError) return HttpStatus.NOT_FOUND;
 *     // Fallback: unmapped errors indicate bugs or missing handlers
 *     return HttpStatus.INTERNAL_SERVER_ERROR;
 *   }
 * }
 * ```
 *
 * @template TError - Domain error type that extends BaseDomainError
 */
export abstract class BaseFeatureExceptionFilter<
  TError extends BaseDomainError,
> extends BaseExceptionFilter {
  protected readonly logger: BaseLogger;
  private readonly moduleName: string;

  constructor(
    protected readonly sentryService: SentryService,
    @InjectLogger() logger: BaseLogger,
  ) {
    super();
    this.moduleName = this.getModuleName();
    this.logger = logger.createChild({
      moduleName: LoggerModuleNames.EXCEPTION_FILTER,
      className: this.constructor.name,
    });
  }

  /**
   * Main catch handler - orchestrates all error handling logic.
   */
  async catch(error: TError, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    // Extract correlation ID
    const correlationId = error.correlationId || this.getCorrelationId(request);

    // Log error
    this.logError(error, correlationId);

    // Report to Sentry if flag is set
    if (error.shouldReport) {
      this.shouldReport(error, request, correlationId);
    }

    // Map to HTTP status code
    const statusCode = this.mapErrorToStatus(error);

    // Build and send RFC 9457 response
    const errorResponse = this.buildErrorResponse(
      error,
      request,
      statusCode,
      correlationId,
    );
    await response.status(statusCode).send(errorResponse);
  }

  /**
   * Maps domain error to HTTP status code.
   * Subclasses MUST implement this method with module-specific logic.
   *
   * @param error - The domain error to map
   * @returns HTTP status code (200-599)
   *
   * @example
   * ```typescript
   * protected mapErrorToStatus(error: ArticleError): number {
   *   if (error instanceof ArticleNotFoundError) return HttpStatus.NOT_FOUND;
   *   if (error instanceof ArticleAlreadyPublishedError) return HttpStatus.CONFLICT;
   *   // Fallback: unmapped errors indicate bugs or missing handlers
   *   return HttpStatus.INTERNAL_SERVER_ERROR;
   * }
   * ```
   */
  protected abstract mapErrorToStatus(error: TError): number;

  /**
   * Gets the module name for logging and Sentry tags.
   * Defaults to filter class name with "ExceptionFilter" removed.
   *
   * Override this method to customize the module name:
   * ```typescript
   * protected getModuleName(): string {
   *   return "my-custom-module";
   * }
   * ```
   */
  protected getModuleName(): string {
    // Convert "ArticleExceptionFilter" -> "article"
    return this.constructor.name.replace('ExceptionFilter', '').toLowerCase();
  }

  /**
   * Gets Sentry tags for error reporting.
   * Override this method to add custom tags:
   *
   * ```typescript
   * protected getSentryTags(error: TError): Record<string, string> {
   *   return {
   *     ...super.getSentryTags(error),
   *     custom_tag: "value",
   *   };
   * }
   * ```
   */
  protected getSentryTags(error: TError): Record<string, string> {
    return {
      error_code: error.errorCode,
      error_type: error.constructor.name,
      module: this.moduleName,
    };
  }

  /**
   * Logs the error with structured context.
   */
  private logError(error: TError, correlationId: string): void {
    this.logger.error(
      `${this.moduleName} Error: ${error.errorCode} | ${error.message}`,
      error,
      {
        correlationId,
        errorCode: error.errorCode,
        metadata: error.metadata,
      },
    );
  }

  /**
   * Reports error to Sentry with full context.
   */
  private shouldReport(
    error: TError,
    request: FastifyRequest,
    correlationId: string,
  ): void {
    const requestContext = this.extractRequestContext(request, correlationId);
    const userContext = this.extractUserContext(request);

    this.sentryService.captureException(error, {
      request: {
        ...requestContext,
        requestId: correlationId,
      },
      user: userContext,
      extra: {
        errorCode: error.errorCode,
        metadata: error.metadata,
        timestamp: error.timestamp,
      },
      tags: this.getSentryTags(error),
      fingerprint: [error.errorCode],
      level: 'error',
    });
  }

  /**
   * Builds RFC 9457 Problem Details response.
   */
  private buildErrorResponse(
    error: TError,
    request: FastifyRequest,
    statusCode: number,
    correlationId: string,
  ): ErrorResponseDto {
    return {
      type: error.errorCode,
      title: error.name,
      status: statusCode,
      detail: error.message,
      instance: request.url,
      correlationId,
      timestamp: error.timestamp.toISOString(),
      metadata: error.metadata,
    };
  }

  /**
   * Extracts correlation ID from request.
   * Matches the pattern used by @CorrelationId() decorator.
   *
   * Priority order:
   * 1. request.raw.correlationId (set by middleware)
   * 2. request.headers["correlationid"] (client-provided)
   * 3. Generated UUID (fallback)
   */
  private getCorrelationId(request: FastifyRequest): string {
    const rawRequest = request.raw as typeof request.raw & {
      correlationId?: string;
    };
    return (
      rawRequest.correlationId ||
      (request.headers['correlationid'] as string) ||
      randomUUID()
    );
  }

  /**
   * Extracts request context for Sentry reporting.
   */
  private extractRequestContext(
    request: FastifyRequest,
    correlationId: string,
  ): RequestContext {
    return {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      body: request.body,
      headers: request.headers,
      requestId: correlationId,
    };
  }

  /**
   * Extracts user context from authenticated request.
   */
  private extractUserContext(request: FastifyRequest): UserContext | undefined {
    const user = (request as { user?: { id: string; defiAddress?: string } })
      .user;

    if (!user) {
      return undefined;
    }

    return {
      id: user.id,
      defiAddress: user.defiAddress,
    };
  }
}
