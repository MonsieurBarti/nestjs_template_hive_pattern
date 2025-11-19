import { Any } from '@/util/stubs';
import { redactSensitiveData } from '@/util/stubs';
import { LocalLoggerConfig } from '@/config/logger.local.config';

interface SerializedRequest {
  method: string;
  url: string;
  headers?: Record<string, unknown>;
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  remoteAddress?: string;
  userAgent?: string;
}

export const requestSerializer = (req: Any): SerializedRequest => {
  const isLocal = process.env.IS_LOCAL === 'true';

  // In local mode with showFullRequest: false, only show method and URL
  if (isLocal && !LocalLoggerConfig.showFullRequest) {
    return {
      method: req.method,
      url: req.url,
    };
  }

  // Full request details (production or when showFullRequest: true)
  return {
    method: req.method,
    url: req.url,
    headers: redactSensitiveData(req.headers || {}) as Record<string, unknown>,
    body: redactSensitiveData(req.body),
    query: redactSensitiveData(req.query || {}) as Record<string, unknown>,
    params: req.params || {},
    remoteAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers?.['user-agent'],
  };
};
