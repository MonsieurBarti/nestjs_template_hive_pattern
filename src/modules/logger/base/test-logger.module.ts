import { Global, Module, Scope } from '@nestjs/common';
import { PinoLogger, LoggerModule } from 'nestjs-pino';
import { LoggerModuleNames } from './types/extra-params.type';

import { BaseLogger, LOGGER_TOKEN, LOGGER_TOKEN_MODULE } from './logger';

@Global()
@Module({
  imports: [LoggerModule.forRoot()],
  providers: [
    {
      scope: Scope.TRANSIENT,
      provide: LOGGER_TOKEN,
      useFactory: (logger: PinoLogger): BaseLogger => {
        return new BaseLogger(logger, { appName: 'test' }, {});
      },
      inject: [PinoLogger],
    },
    {
      scope: Scope.TRANSIENT,
      provide: LOGGER_TOKEN_MODULE,
      useFactory: (base: BaseLogger): BaseLogger => {
        return base.createChild({ moduleName: LoggerModuleNames.TEST_LOGGER });
      },
      inject: [LOGGER_TOKEN],
    },
  ],
  exports: [LOGGER_TOKEN, LOGGER_TOKEN_MODULE],
})
export class TestLoggerModule {}
