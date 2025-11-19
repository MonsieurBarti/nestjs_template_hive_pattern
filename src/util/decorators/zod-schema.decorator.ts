import { SetMetadata } from '@nestjs/common';
import { z } from 'zod';

export const ZOD_SCHEMA_KEY = Symbol('zod-schema');

/**
 * Decorator to associate a Zod schema with a DTO class
 * Usage: @ZodSchema(mySchema) class MyDto {}
 */
export const ZodSchema = (schema: z.ZodTypeAny): ClassDecorator =>
  SetMetadata(ZOD_SCHEMA_KEY, schema);
