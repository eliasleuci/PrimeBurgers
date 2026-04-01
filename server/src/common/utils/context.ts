import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  requestId: string;
  startTime: number;
}

export const contextStorage = new AsyncLocalStorage<RequestStore>();

export const getContext = () => contextStorage.getStore();
export const getRequestId = () => getContext()?.requestId || 'system';
