import { type QueryKey, useQueryClient } from '@tanstack/react-query';

export const useInvalidates = () => {
  const queryClient = useQueryClient();

  const invalidate = (key: QueryKey) =>
    queryClient.invalidateQueries({ queryKey: key });

  const invalidateMany = (keys: QueryKey[]) =>
    Promise.all(
      keys.map((key) =>
        queryClient.invalidateQueries({
          queryKey: key,
          type: 'all',
          exact: false,
          refetchType: 'all',
        }),
      ),
    );

  return { invalidate, invalidateMany };
};
