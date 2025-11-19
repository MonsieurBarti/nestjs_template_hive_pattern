import { Inject } from '@nestjs/common';
import { LOGGER_TOKEN } from './base/logger';

/**
 * Decorator to inject the logger into a class property or constructor parameter.
 * This is a shorthand for @Inject(LOGGER_TOKEN).
 */
export const InjectLogger = (): PropertyDecorator & ParameterDecorator =>
  Inject(LOGGER_TOKEN);
