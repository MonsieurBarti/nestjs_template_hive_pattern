import { FactoryProvider, Scope } from '@nestjs/common';

import { BaseLogger, LOGGER_TOKEN, LOGGER_TOKEN_MODULE } from './logger';
import { LoggerModuleName } from './types/extra-params.type';

export const LoggerProvider = (
  moduleName: LoggerModuleName,
): FactoryProvider => ({
  scope: Scope.TRANSIENT,
  provide: LOGGER_TOKEN_MODULE,
  useFactory: (base: BaseLogger): BaseLogger => {
    return base.createChild({ moduleName });
  },
  inject: [LOGGER_TOKEN],
});
