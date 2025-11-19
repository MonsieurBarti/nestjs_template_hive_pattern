/**
 * RFC 9457 Problem Details for HTTP APIs
 *
 * This standardized error response format provides:
 * - Machine-readable error types (error codes)
 * - Human-readable error messages
 * - HTTP status codes
 * - Request tracing via correlation IDs
 * - Additional context via metadata
 *
 * @see https://datatracker.ietf.org/doc/html/rfc9457
 *
 * @example
 * ```json
 * {
 *   "type": "VOUCHER_NOT_FOUND",
 *   "title": "VoucherNotFoundError",
 *   "status": 404,
 *   "detail": "Voucher not found or invalid",
 *   "instance": "/api/v1/vouchers/redeem",
 *   "correlationId": "req_a1b2c3d4",
 *   "timestamp": "2025-10-28T12:34:56.789Z",
 *   "metadata": {
 *     "voucherId": "abc-123"
 *   }
 * }
 * ```
 */
export interface ErrorResponseDto {
  /**
   * Error code identifying the error type.
   * Format: {MODULE}_{ENTITY}_{ERROR_TYPE}
   *
   * Examples:
   * - "VOUCHER_NOT_FOUND"
   * - "VOUCHER_ALREADY_REDEEMED"
   * - "HTE_CAMPAIGN_EXPIRED"
   *
   * This should be used by API consumers for programmatic error handling.
   */
  type: string;

  /**
   * Human-readable summary of the error type.
   * Typically the error class name (e.g., "VoucherNotFoundError").
   */
  title: string;

  /**
   * HTTP status code.
   *
   * Common codes:
   * - 400: Bad Request (validation, business rules)
   * - 404: Not Found
   * - 409: Conflict (already exists, already redeemed)
   * - 410: Gone (expired)
   * - 422: Unprocessable Entity (invalid state)
   * - 429: Too Many Requests
   * - 500: Internal Server Error
   */
  status: number;

  /**
   * Human-readable explanation of the specific error occurrence.
   * This is the error message.
   */
  detail: string;

  /**
   * URI reference identifying the specific occurrence of the problem.
   * Typically the request path (e.g., "/api/v1/vouchers/redeem").
   */
  instance: string;

  /**
   * Correlation ID for distributed tracing.
   * Used to trace the request through logs, Sentry, and other observability tools.
   *
   * Sources (in priority order):
   * 1. request.raw.correlationId (from middleware)
   * 2. request.headers["correlationid"] (from client)
   * 3. Generated UUID (fallback)
   */
  correlationId: string;

  /**
   * ISO 8601 timestamp when the error occurred.
   * Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
   */
  timestamp: string;

  /**
   * Additional context data about the error.
   * Optional field for providing extra debugging information.
   *
   * Note: Avoid including sensitive information (passwords, tokens, PII).
   */
  metadata?: Record<string, unknown>;
}
