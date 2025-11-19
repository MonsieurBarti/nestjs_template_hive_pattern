/**
 * Base class for all domain errors in feature modules.
 *
 * This class provides:
 * - Sentry reporting control via `reportToSentry` flag
 * - Correlation ID propagation for request tracing
 * - Standardized error codes for API consumers
 * - Metadata attachment for additional context
 * - Timestamp tracking for when error occurred
 *
 * @example
 * ```typescript
 * export class VoucherNotFoundError extends BaseDomainError {
 *   readonly errorCode = "VOUCHER_NOT_FOUND";
 *
 *   constructor(options?: {
 *     correlationId?: string;
 *     voucherId?: string;
 *   }) {
 *     super("Voucher not found or invalid", {
 *       reportToSentry: false, // User error, don't spam Sentry
 *       correlationId: options?.correlationId,
 *       metadata: { voucherId: options?.voucherId },
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseDomainError extends Error {
  /**
   * Unique error code in format: {MODULE}_{ENTITY}_{ERROR_TYPE}
   * e.g., "VOUCHER_NOT_FOUND", "HTE_CAMPAIGN_EXPIRED"
   *
   * This code is:
   * - Returned to API consumers for programmatic error handling
   * - Used for Sentry error grouping via fingerprint
   * - Used for automatic HTTP status code mapping
   */
  abstract readonly errorCode: string;

  /**
   * Controls whether this error should be reported to Sentry.
   *
   * Set to `false` for expected user errors (validation, not found, business rules).
   * Set to `true` for unexpected system errors (external failures, data corruption).
   *
   * @default true
   */
  readonly reportToSentry: boolean;

  /**
   * Correlation ID for distributed tracing across request lifecycle.
   *
   * Extracted from:
   * 1. @CorrelationId() decorator in controllers
   * 2. Passed through CQRS commands/queries
   * 3. Included in error responses, logs, and Sentry reports
   */
  readonly correlationId?: string;

  /**
   * Additional context data attached to the error.
   * Useful for debugging and providing extra information to error handlers.
   */
  readonly metadata?: Record<string, unknown>;

  /**
   * Timestamp when the error was created (not when it was thrown).
   */
  readonly timestamp: Date;

  constructor(
    message: string,
    options?: {
      /**
       * Whether to report this error to Sentry.
       * @default true
       */
      reportToSentry?: boolean;

      /**
       * Correlation ID from @CorrelationId() decorator.
       * Pass this from controller → command → handler → error.
       */
      correlationId?: string;

      /**
       * Additional context data for debugging.
       * Avoid including sensitive information (passwords, tokens, etc.).
       */
      metadata?: Record<string, unknown>;

      /**
       * Cause of this error (if wrapping another error).
       */
      cause?: Error;
    },
  ) {
    super(message);

    // Set error name to class name for better stack traces
    this.name = this.constructor.name;

    // Default to not reporting to Sentry unless explicitly enabled
    this.reportToSentry = options?.reportToSentry ?? false;

    // Store correlation ID for request tracing
    this.correlationId = options?.correlationId;

    // Store metadata for additional context
    this.metadata = options?.metadata;

    // Record when error was created
    this.timestamp = new Date();
  }
}
