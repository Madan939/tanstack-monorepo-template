import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const asyncLocalStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) =>
    Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? asyncLocalStorage : null,
  key: 'APP_QUERY_CACHE',
  throttleTime: 1000,
});
