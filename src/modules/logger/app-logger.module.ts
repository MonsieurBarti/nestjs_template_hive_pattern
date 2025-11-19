import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

import { EnvVars } from '../../config';
import { BaseLogger, LOGGER_TOKEN } from './base/logger';

const loggerProvider = {
  provide: LOGGER_TOKEN,
  useFactory: (
    logger: PinoLogger,
    configService: ConfigService<EnvVars, true>,
  ): BaseLogger => {
    const isLocal = configService.get('IS_LOCAL', { infer: true });

    return new BaseLogger(
      logger,
      { appName: 'api' },
      { isLocal: isLocal === 'true' },
    );
  },
  inject: [PinoLogger, ConfigService],
};

@Global()
@Module({
  providers: [loggerProvider],
  exports: [loggerProvider],
})
export class AppLoggerModule {}
