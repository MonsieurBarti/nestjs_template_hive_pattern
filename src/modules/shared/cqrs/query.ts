import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { BaseLogger } from '@/modules/logger/base/logger';
import { Any, redactSensitiveData } from '@/util/stubs';

/**
 * Base interface for queries with explicit result type declaration.
 */
export interface ITypedQuery<TResult> {
  readonly _resultType?: TResult;
}

/**
 * Base class for typed queries with automatic result type inference.
 */
export abstract class TypedQuery<TResult> implements ITypedQuery<TResult> {
  readonly _resultType?: TResult;
}

/**
 * Type-safe QueryBus that enforces explicit result type declaration.
 */
@Injectable()
export class TypedQueryBus {
  private readonly errorLogger: BaseLogger;
  private readonly queryBus: QueryBus;

  constructor(queryBus: QueryBus, logger: BaseLogger) {
    this.queryBus = queryBus;
    this.errorLogger = logger;
  }

  async execute<TQuery extends ITypedQuery<Any>>(
    query: TQuery,
  ): Promise<TQuery extends ITypedQuery<infer TResult> ? TResult : never> {
    try {
      const result = await this.queryBus.execute(query);
      return result as TQuery extends ITypedQuery<infer TResult>
        ? TResult
        : never;
    } catch (error) {
      const queryName = query.constructor.name;
      const correlationId = (query as Any).props?.correlationId;

      if (error instanceof Error) {
        this.errorLogger.error(`${queryName} executionFailed`, error, {
          data: {
            queryName,
            queryData: redactSensitiveData(query),
          },
          correlationId,
        });
      }

      throw error;
    }
  }
}
