import { Any } from '@/util/stubs';

export type LoggerOptionalParams = {
  functionName?: string;
  entityId?: string;
  entityType?: string;
  data?: Record<string, Any>;
  domain?: string;
  correlationId?: string;
  error?: Error;
  errorCode?: string;
  metadata?: Record<string, Any>;
};
