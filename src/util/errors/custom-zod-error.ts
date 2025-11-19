import { ZodError } from 'zod';
import { BadRequestException } from '@nestjs/common';

export class CustomZodError extends Error {
  public name: string;
  public details: { [path: string]: string };

  constructor(zodError: ZodError) {
    const details = CustomZodError.formatZodError(zodError);
    const message = `ValidationError: ${JSON.stringify(details, null, 2)}`;
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }

  public static formatZodError(zodError: ZodError): { [path: string]: string } {
    const formattedErrors: { [path: string]: string } = {};

    for (const issue of zodError.issues) {
      const path = issue.path.join('.');
      formattedErrors[path] = issue.message;
    }

    return formattedErrors;
  }

  public toString(): string {
    return `${this.name}: ${JSON.stringify(this.details, null, 2)}`;
  }
}

/**
 * HTTP Exception version of CustomZodError for use in validation pipes
 * This ensures proper HTTP status codes while maintaining error type for Sentry filtering
 */
export class CustomZodValidationException extends BadRequestException {
  public details: { [path: string]: string };

  constructor(zodError: ZodError) {
    const details = CustomZodError.formatZodError(zodError);
    const message = `ValidationError: ${JSON.stringify(details, null, 2)}`;
    super(message);
    this.details = details;
  }
}
