import { Injectable } from '@nestjs/common';

export interface RequestContext {
  method: string;
  url: string;
  params: unknown;
  query: unknown;
  body: unknown;
  headers: unknown;
  requestId: string;
}

export interface UserContext {
  id: string;
  defiAddress?: string;
}

@Injectable()
export class SentryService {
  captureException(error: unknown, context: Record<string, unknown>): void {
    console.error('[Sentry Stub] Captured Exception:', error, context);
  }
}
