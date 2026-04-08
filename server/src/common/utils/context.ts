import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
export interface RequestStore {
  requestId: string;
  startTime: number;
  tenantId?: string; 
  userId?: string;
}

export const contextStorage = new AsyncLocalStorage<RequestStore>();

export const getContext = () => contextStorage.getStore();
export const getRequestId = () => getContext()?.requestId || randomUUID();
export const getTenantId = () => getContext()?.tenantId;

export const runInContext = (store: RequestStore, callback: () => void) => {
  contextStorage.run(store, callback);
};