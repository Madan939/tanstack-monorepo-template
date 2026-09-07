import {
  type QueryKey,
  useQueryClient,
} from '@tanstack/react-query';

export const useSetQueryData = () => {
  const queryClient = useQueryClient();

  const setQueryData = <TData, TOutput = TData>(
    queryKey: QueryKey,
    updater: TOutput | ((old: TData | undefined) => TOutput),
  ) => queryClient.setQueryData(queryKey, updater as any);

  return { setQueryData };
};
