import {
  dehydrate,
  type DehydratedState,
  type FetchQueryOptions,
  QueryClient,
} from '@tanstack/react-query';

const getServerQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });

export async function prefetchQueries(
  queries: FetchQueryOptions[],
): Promise<DehydratedState> {
  const queryClient = getServerQueryClient();

  await Promise.all(
    queries.map(({ queryKey, queryFn }) =>
      queryClient.prefetchQuery({
        queryKey,
        ...(queryFn !== undefined && { queryFn }),
        staleTime: 1000 * 60 * 5,
      }),
    ),
  );

  return dehydrate(queryClient);
}
