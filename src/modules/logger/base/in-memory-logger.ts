import { Any } from '@/util/stubs';
import { LoggerOptionalParams } from './types/optional-params.type';
import { LoggerExtraParams } from './types/extra-params.type';
import { BaseLogger } from './logger';

/**
 * Simple in-memory logger for testing purposes.
 * Stores log entries in arrays to allow for inspection during tests.
 *
 * This is a testing utility that extends BaseLogger for proper compatibility
 * with the application layer while providing test-specific functionality.
 */
export class InMemoryLogger<
  OptionalParams extends LoggerOptionalParams = LoggerOptionalParams,
  ExtraParams extends LoggerExtraParams = LoggerExtraParams,
> extends BaseLogger<OptionalParams, ExtraParams> {
  protected logEntries: Array<{ message: Any; params?: OptionalParams }> = [];
  protected errorEntries: Array<{
    message: Any;
    error: Error | null;
    params?: OptionalParams;
  }> = [];
  protected warnEntries: Array<{ message: Any; params?: OptionalParams }> = [];
  protected debugEntries: Array<{ message: Any; params?: OptionalParams }> = [];

  constructor(extraParams: ExtraParams = {} as ExtraParams) {
    // Create a mock PinoLogger since we don't need real logging functionality
    const mockPinoLogger = {
      info: () => {
        // No-op for testing
      },
      debug: () => {
        // No-op for testing
      },
      warn: () => {
        // No-op for testing
      },
      error: () => {
        // No-op for testing
      },
      fatal: () => {
        // No-op for testing
      },
    } as Any;

    super(mockPinoLogger, extraParams, { renameContext: 'InMemoryLogger' });
  }

  /**
   * Override createChild to return InMemoryLogger instance instead of BaseLogger.
   * This ensures logs are captured in tests when using child loggers.
   */
  override createChild(
    context: Partial<ExtraParams>,
  ): InMemoryLogger<OptionalParams, ExtraParams> {
    const childLogger = new InMemoryLogger<OptionalParams, ExtraParams>({
      ...this.extraParams,
      ...context,
    } as ExtraParams);

    // Share the same log arrays so parent and children use the same storage
    childLogger.logEntries = this.logEntries;
    childLogger.errorEntries = this.errorEntries;
    childLogger.warnEntries = this.warnEntries;
    childLogger.debugEntries = this.debugEntries;

    return childLogger;
  }

  override log(message: Any, optionalParams?: OptionalParams): void {
    this.logEntries.push({ message, params: optionalParams });
    super.log(message, optionalParams);
  }

  override error(
    message: Any,
    error: Error | null,
    optionalParams?: OptionalParams,
  ): void {
    this.errorEntries.push({ message, error, params: optionalParams });
    super.error(message, error, optionalParams);
  }

  override warn(message: Any, optionalParams?: OptionalParams): void {
    this.warnEntries.push({ message, params: optionalParams });
    super.warn(message, optionalParams);
  }

  override debug(message: Any, optionalParams?: OptionalParams): void {
    this.debugEntries.push({ message, params: optionalParams });
    super.debug(message, optionalParams);
  }

  override verbose(message: string): void {
    this.logEntries.push({ message: `[VERBOSE] ${message}` });
    super.verbose(message);
  }

  fatal(message: string): void {
    this.errorEntries.push({ message: `[FATAL] ${message}`, error: null });
    super.fatal(message);
  }

  /**
   * Gets all log entries that have been recorded.
   */
  get allLogEntries(): Array<{ message: Any; params?: OptionalParams }> {
    return [...this.logEntries];
  }

  /**
   * Gets all error entries that have been recorded.
   */
  get allErrorEntries(): Array<{
    message: Any;
    error: Error | null;
    params?: OptionalParams;
  }> {
    return [...this.errorEntries];
  }

  /**
   * Gets all warn entries that have been recorded.
   */
  get allWarnEntries(): Array<{ message: Any; params?: OptionalParams }> {
    return [...this.warnEntries];
  }

  /**
   * Gets all debug entries that have been recorded.
   */
  get allDebugEntries(): Array<{ message: Any; params?: OptionalParams }> {
    return [...this.debugEntries];
  }

  /**
   * Gets the number of log entries recorded.
   */
  get logCount(): number {
    return this.logEntries.length;
  }

  /**
   * Gets the number of error entries recorded.
   */
  get errorCount(): number {
    return this.errorEntries.length;
  }

  /**
   * Gets the number of warn entries recorded.
   */
  get warnCount(): number {
    return this.warnEntries.length;
  }

  /**
   * Checks if a specific message has been logged.
   */
  hasLoggedMessage(message: Any): boolean {
    return this.logEntries.some((entry) => entry.message === message);
  }

  /**
   * Checks if a specific error message has been logged.
   */
  hasLoggedError(message: Any, correlationId?: string): boolean {
    return this.errorEntries.some((entry) =>
      entry.message === message && entry.params?.correlationId
        ? entry.params.correlationId === correlationId
        : true,
    );
  }

  /**
   * Checks if a specific warning has been logged.
   */
  hasLoggedWarn(message: Any): boolean {
    return this.warnEntries.some((entry) => entry.message === message);
  }

  /**
   * Gets log messages as strings for backward compatibility.
   */
  getLogMessages(): string[] {
    return this.logEntries.map((entry) =>
      typeof entry.message === 'string'
        ? entry.message
        : JSON.stringify(entry.message),
    );
  }

  /**
   * Gets error messages as strings for backward compatibility.
   */
  getErrorMessages(): string[] {
    return this.errorEntries.map((entry) =>
      typeof entry.message === 'string'
        ? entry.message
        : JSON.stringify(entry.message),
    );
  }

  getModuleName(): string | undefined {
    return this.extraParams.moduleName;
  }

  /**
   * Gets warn messages as strings for backward compatibility.
   */
  getWarnMessages(): string[] {
    return this.warnEntries.map((entry) =>
      typeof entry.message === 'string'
        ? entry.message
        : JSON.stringify(entry.message),
    );
  }

  /**
   * Clears all logged entries from the in-memory store.
   * Useful for resetting state between tests.
   *
   * IMPORTANT: Uses length = 0 instead of creating new arrays to preserve
   * array references shared with child loggers created via createChild().
   */
  clear(): void {
    this.logEntries.length = 0;
    this.errorEntries.length = 0;
    this.warnEntries.length = 0;
    this.debugEntries.length = 0;
  }
}
