import { BaseLogger } from './logger';

/**
 * @description
 * This store is used to provide the app logger instance to non-NestJS managed classes/functions
 */
export class LoggerStore {
  private static instance: BaseLogger;

  /**
   * @description
   * This must be called in your main.ts file "LoggerStore.setInstance(logger);"
   */
  static setInstance(logger: BaseLogger): void {
    this.instance = logger;
  }

  /**
   * @description
   * Call in your non-NestJS managed classes/functions
   */
  static getInstance(): BaseLogger {
    if (this.instance) return this.instance;
    else
      throw new Error(
        'No logger instance was set, please set the instance in your main.ts',
      );
  }
}
