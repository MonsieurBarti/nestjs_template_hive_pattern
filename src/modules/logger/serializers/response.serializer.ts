import { Any } from '@/util/stubs';
import { redactSensitiveData } from '@/util/stubs';

interface SerializedResponse {
  statusCode: number;
  headers: Record<string, unknown>;
}

export const responseSerializer = (res: Any): SerializedResponse => {
  return {
    statusCode: res.statusCode,
    headers: redactSensitiveData(
      res.getHeaders?.() || res.headers || {},
    ) as Record<string, unknown>,
  };
};
