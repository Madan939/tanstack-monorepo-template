import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ComponentProps } from 'react';

interface QueryProviderProps
  extends ComponentProps<typeof PersistQueryClientProvider> {}

export function QueryProvider(props: QueryProviderProps) {
  const { children, ...rest } = props;
  return (
    <PersistQueryClientProvider {...rest}>
      {children}
      {(process.env.NODE_ENV ?? 'development') === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="left"
          buttonPosition="bottom-right"
        />
      )}
    </PersistQueryClientProvider>
  );
}
