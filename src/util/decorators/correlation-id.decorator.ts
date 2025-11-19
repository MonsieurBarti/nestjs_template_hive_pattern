import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // In a real app, this would come from headers (x-correlation-id)
    return request.headers['x-correlation-id'] || randomUUID();
  },
);
