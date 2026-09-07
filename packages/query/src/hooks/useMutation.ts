import {
  type DefaultError,
  type QueryKey,
  type UseMutationOptions,
  useMutation as useTanstackMutation,
} from '@tanstack/react-query';
import { useInvalidates } from './useInvalidates';

export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext> & {
    invalidateKeys?: QueryKey[];
  },
) {
  const { invalidateMany } = useInvalidates();
  const { onSuccess: optionOnSuccess, ...restOptions } = options || {};
  return useTanstackMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (options?.invalidateKeys) {
        await invalidateMany(options.invalidateKeys);
      }
      optionOnSuccess?.(data, variables, onMutateResult, context);
    },
    ...restOptions,
  });
}
