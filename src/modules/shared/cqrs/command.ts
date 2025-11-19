import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { BaseLogger } from '@/modules/logger/base/logger';
import { Any, redactSensitiveData } from '@/util/stubs';

/**
 * Base interface for commands with explicit result type declaration.
 */
export interface ITypedCommand<TResult = void> {
  readonly _resultType?: TResult;
}

/**
 * Base class for typed commands with automatic result type inference.
 */
export abstract class TypedCommand<TResult = void>
  implements ITypedCommand<TResult>
{
  readonly _resultType?: TResult;
}

/**
 * Type-safe CommandBus that enforces explicit result type declaration.
 */
@Injectable()
export class TypedCommandBus {
  private readonly errorLogger: BaseLogger;
  private readonly commandBus: CommandBus;

  constructor(commandBus: CommandBus, logger: BaseLogger) {
    this.commandBus = commandBus;
    this.errorLogger = logger;
  }

  async execute<TCommand extends ITypedCommand<Any>>(
    command: TCommand,
  ): Promise<TCommand extends ITypedCommand<infer TResult> ? TResult : void> {
    try {
      const result = await this.commandBus.execute(command);
      return result as TCommand extends ITypedCommand<infer TResult>
        ? TResult
        : void;
    } catch (error) {
      const commandName = command.constructor.name;
      const correlationId = (command as Any).props?.correlationId;

      if (error instanceof Error) {
        this.errorLogger.error(`${commandName} executionFailed`, error, {
          data: {
            commandName,
            commandData: redactSensitiveData(command),
          },
          correlationId,
        });
      }

      throw error;
    }
  }
}
