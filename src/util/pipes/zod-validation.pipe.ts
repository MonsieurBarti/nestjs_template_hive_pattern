import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { z } from 'zod';
import { CustomZodValidationException } from '../errors/custom-zod-error';
import { ZOD_SCHEMA_KEY } from '../decorators/zod-schema.decorator';
import { Any } from '@/util/stubs';

/**
 * Unified Zod validation pipe that supports both manual and metadata-driven validation
 *
 * Usage modes:
 * 1. Manual: new ZodValidationPipe(schema) - validates using provided schema
 * 2. Global: new ZodValidationPipe() - auto-detects schemas from @ZodSchema decorator
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: z.ZodTypeAny) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    // Only validate body, query, and param types - skip custom decorators
    if (!['body', 'query', 'param'].includes(metadata.type)) {
      return value;
    }

    // If explicit schema provided, use it (manual mode)
    if (this.schema) {
      return this.validateWithSchema(value, this.schema);
    }

    // Otherwise use metadata detection (global mode)
    return this.validateWithMetadata(value, metadata);
  }

  private validateWithMetadata(
    value: Any,
    metadata: ArgumentMetadata,
  ): unknown {
    // Only validate body, query, and param types
    if (!['body', 'query', 'param'].includes(metadata.type)) {
      return value;
    }

    // Skip if no metatype is provided
    if (!metadata.metatype) {
      return value;
    }

    // Get the Zod schema from the decorator metadata
    const schema = this.getSchemaFromMetadata(metadata.metatype);

    // If no schema is found, pass through the value
    if (!schema) {
      return value;
    }

    return this.validateWithSchema(value, schema);
  }

  private validateWithSchema(value: unknown, schema: z.ZodTypeAny): unknown {
    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomZodValidationException(error);
      }
      throw error;
    }
  }

  private getSchemaFromMetadata(metatype: Type<Any>): z.ZodTypeAny | undefined {
    // Retrieve the schema from the decorator metadata
    return Reflect.getMetadata(ZOD_SCHEMA_KEY, metatype);
  }
}

// Factory function for creating validation pipes
export function createZodPipe(schema: z.ZodTypeAny): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
