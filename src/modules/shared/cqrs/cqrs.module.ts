import { Global, Module } from '@nestjs/common';
import {
  CqrsModule as NestCqrsModule,
  QueryBus,
  CommandBus,
} from '@nestjs/cqrs';
import { TypedQueryBus } from './query';
import { TypedCommandBus } from './command';
import { BaseLogger, LOGGER_TOKEN } from '@/modules/logger/base/logger';
import { LoggerModuleNames } from '@/modules/logger/base/types/extra-params.type';

/**
 * TypedCqrsModule - Enhanced CQRS module with type safety
 *
 * This module provides type-safe alternatives to NestJS's standard QueryBus and CommandBus.
 * It wraps the existing NestJS CQRS infrastructure while adding compile-time type enforcement.
 *
 * ## Key Features:
 * - **Type Safety**: Enforces explicit result type declarations
 * - **Auto-inference**: TypeScript automatically infers return types
 * - **Backward Compatible**: Works alongside existing QueryBus/CommandBus
 * - **Zero Runtime Overhead**: Type checking happens at compile-time only
 * - **Global Scope**: Available everywhere without explicit imports
 * - **Centralized Error Logging**: All command/query errors are automatically logged
 *
 * ## Usage:
 * This module is globally available once imported in the root AppModule.
 * No need to import it in feature modules:
 *
 * @example
 * ```typescript
 * // In AppModule (one-time setup)
 * @Module({
 *   imports: [TypedCqrsModule],
 * })
 * export class AppModule {}
 *
 * // In any feature module - no TypedCqrsModule import needed!
 * @Module({
 *   controllers: [UserController],
 *   providers: [
 *     GetUserQueryHandler,
 *     CreateUserCommandHandler,
 *   ],
 * })
 * export class UserModule {}
 * ```
 *
 * ## Migration Strategy:
 * This module can coexist with the standard NestJS CQRS module:
 * - Continue using QueryBus/CommandBus in existing code
 * - Use TypedQueryBus/TypedCommandBus in new code
 * - Gradually migrate existing code when refactoring
 *
 * @see TypedQueryBus
 * @see TypedCommandBus
 * @see ITypedQuery
 * @see ITypedCommand
 */
@Global()
@Module({
  imports: [NestCqrsModule],
  providers: [
    {
      provide: TypedQueryBus,
      useFactory: (queryBus: QueryBus, logger: BaseLogger): TypedQueryBus => {
        const errorLogger = logger.createChild({
          moduleName: LoggerModuleNames.CQRS,
          className: TypedQueryBus.name,
        });
        return new TypedQueryBus(queryBus, errorLogger);
      },
      inject: [QueryBus, LOGGER_TOKEN],
    },
    {
      provide: TypedCommandBus,
      useFactory: (
        commandBus: CommandBus,
        logger: BaseLogger,
      ): TypedCommandBus => {
        const errorLogger = logger.createChild({
          moduleName: LoggerModuleNames.CQRS,
          className: TypedCommandBus.name,
        });
        return new TypedCommandBus(commandBus, errorLogger);
      },
      inject: [CommandBus, LOGGER_TOKEN],
    },
  ],
  exports: [TypedQueryBus, TypedCommandBus, NestCqrsModule],
})
export class TypedCqrsModule {}
