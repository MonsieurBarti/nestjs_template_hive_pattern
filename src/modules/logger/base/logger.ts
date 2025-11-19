import { LoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import chalk from 'chalk';

import { LoggerExtraParams } from './types/extra-params.type';
import { LoggerOptionalParams } from './types/optional-params.type';
import { Any } from '@/util/stubs';
import { LocalLoggerConfig } from '../../../config/logger.local.config';

export const LOGGER_TOKEN = 'BaseLogger';
export const LOGGER_TOKEN_MODULE = 'BaseLoggerModule';
export const LOGGER_TOKEN_GLOBAL = 'GlobalLoggerModule';

function getCloudWatchLevel(level: string): string {
  switch (level) {
    case 'fatal':
      return 'FATAL';
    case 'error':
      return 'ERROR';
    case 'warn':
      return 'WARN';
    case 'info':
    case 'log':
      return 'INFO';
    case 'debug':
    default:
      return 'DEBUG';
  }
}

export class BaseLogger<
  OptionalParams extends LoggerOptionalParams = LoggerOptionalParams,
  ExtraParams extends LoggerExtraParams = LoggerExtraParams,
> implements LoggerService
{
  protected extraParams: ExtraParams;
  private isLocal: boolean;

  constructor(
    private readonly logger: PinoLogger,
    extraParams: ExtraParams,
    options: { renameContext?: string; isLocal?: boolean },
  ) {
    this.extraParams = extraParams;
    this.isLocal = options.isLocal ?? false;
  }

  /**
   * Create a child logger with isolated context
   * Use this to set moduleName and className for each service/controller
   *
   * @example
   * constructor(@InjectLogger() logger: BaseLogger) {
   *   this.logger = logger.createChild({
   *     moduleName: LoggerModuleNames.BOT_DETECTION,
   *     className: DetectBotsCommandHandler.name
   *   });
   * }
   */
  createChild(
    context: Partial<ExtraParams>,
  ): BaseLogger<OptionalParams, ExtraParams> {
    return new BaseLogger(
      this.logger,
      { ...this.extraParams, ...context } as ExtraParams,
      { isLocal: this.isLocal },
    );
  }

  /**
   * Check if current module should be logged (local dev filtering)
   */
  private shouldLog(): boolean {
    // No filtering in production
    if (!this.isLocal) return true;

    const moduleName = this.extraParams.moduleName;
    if (!moduleName) return true; // Show logs without moduleName

    // If enabledModules is set, use it (allowlist takes precedence)
    if (LocalLoggerConfig.enabledModules.length > 0) {
      return LocalLoggerConfig.enabledModules.includes(moduleName);
    }

    // If disabledModules is set, exclude those modules
    if (LocalLoggerConfig.disabledModules.length > 0) {
      return !LocalLoggerConfig.disabledModules.includes(moduleName);
    }

    // No filter configured, show all
    return true;
  }

  private buildLogPayload(
    level: string,
    message: Any,
    optionalParams?: OptionalParams,
  ): Record<string, Any> {
    const metadata =
      typeof optionalParams === 'string'
        ? { module: optionalParams }
        : (optionalParams ?? {});

    // ============================================
    // LOCAL DEVELOPMENT ONLY - PRODUCTION SKIPS
    // ============================================
    if (this.isLocal) {
      // Clean up request data
      if ('request' in metadata) {
        const req = metadata.request as Request;

        if (!LocalLoggerConfig.showFullRequest) {
          // Only keep essential info: "POST /v1/hub/rewards"
          metadata.request = `${req.method} ${req.url}`;
        }
      }
    }
    // ============================================
    // END LOCAL DEVELOPMENT ONLY
    // ============================================

    const payload: Record<string, Any> = {
      timestamp: new Date().toISOString(),
      level: getCloudWatchLevel(level),
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...this.extraParams,
      ...metadata,
    };

    // Add stack trace for errors (BOTH local and production)
    if (
      level === 'error' &&
      'error' in metadata &&
      metadata.error instanceof Error
    ) {
      payload.stack = metadata.error.stack;
      payload.errorName = metadata.error.name;
      payload.errorMessage = metadata.error.message;
    }

    // ============================================
    // LOCAL DEVELOPMENT ONLY - PRODUCTION SKIPS
    // ============================================
    if (this.isLocal) {
      // Format message with colored module/class prefix
      const parts: string[] = [];

      if (payload.moduleName) {
        const colorName =
          LocalLoggerConfig.moduleColors[payload.moduleName as string] ||
          'white';
        const colorFn =
          (chalk as unknown as Record<string, (text: string) => string>)[
            colorName
          ] || chalk.white;
        parts.push(colorFn(`[${payload.moduleName}]`));
      }

      if (payload.className) {
        parts.push(chalk.gray(payload.className as string));
      }

      // Add beautiful request formatting for HTTP requests
      if (payload.request && typeof payload.request === 'string') {
        // Request is already formatted as "METHOD /path" by earlier logic
        const [method, ...urlParts] = payload.request.split(' ');
        const url = urlParts.join(' ');

        // Color-code HTTP methods
        const methodColors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'yellow',
          DELETE: 'red',
          PATCH: 'magenta',
        };
        const methodColor = methodColors[method] || 'white';
        const methodColorFn =
          (chalk as unknown as Record<string, (text: string) => string>)[
            methodColor
          ] || chalk.white;

        parts.push(methodColorFn(method) + chalk.cyan(` ${url}`));

        // Remove request from metadata since we've formatted it inline
        delete payload.request;
      }

      if (parts.length > 0) {
        parts.push(chalk.gray('|'));
        payload.message = `${parts.join(' ')} ${payload.message}`;
      }

      // In local mode, return formatted message
      // Optionally include data field for debugging
      const result: Record<string, Any> = { msg: payload.message };

      if (LocalLoggerConfig.showDataField && 'data' in payload) {
        result.data = payload.data;
      }

      // Include error details if enabled (for error-level logs)
      if (LocalLoggerConfig.showErrors && level === 'error') {
        if ('error' in payload && payload.error) result.error = payload.error;
      }

      return result;
    }
    // ============================================
    // END LOCAL DEVELOPMENT ONLY
    // ============================================

    // Remove any null/undefined values (BOTH local and production)
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    return payload;
  }

  log(message: Any, optionalParams?: OptionalParams): void {
    if (!this.shouldLog()) return;
    this.logger.info(this.buildLogPayload('log', message, optionalParams));
  }

  debug(message: Any, optionalParams?: OptionalParams): void {
    if (!this.shouldLog()) return;
    this.logger.debug(this.buildLogPayload('debug', message, optionalParams));
  }

  warn(message: Any, optionalParams?: OptionalParams): void {
    if (!this.shouldLog()) return;
    this.logger.warn(this.buildLogPayload('warn', message, optionalParams));
  }

  error(
    message: Any,
    error: Error | null,
    optionalParams?: OptionalParams,
  ): void {
    if (!this.shouldLog()) return;

    const mergedParams: OptionalParams = {
      ...(optionalParams as OptionalParams),
      error,
    };

    this.logger.error(this.buildLogPayload('error', message, mergedParams));
  }

  verbose(message: string): void {
    if (!this.shouldLog()) return;
    this.logger.debug(
      this.buildLogPayload('debug', `Verbose log deprecated: ${message}`),
    );
  }

  fatal(message: string): void {
    if (!this.shouldLog()) return;
    this.logger.fatal(
      this.buildLogPayload('fatal', `Fatal log deprecated: ${message}`),
    );
  }
}
