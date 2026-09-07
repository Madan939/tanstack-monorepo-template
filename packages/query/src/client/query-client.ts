import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

export const createQueryClient = (options?: QueryClientConfig) =>
  new QueryClient(options);
