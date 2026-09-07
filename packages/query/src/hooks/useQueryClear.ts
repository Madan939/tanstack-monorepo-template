import { useQueryClient } from '@tanstack/react-query';

export const useQueryClear = () => {
  const queryClient = useQueryClient();

  const clearAllQueries = () => {
    queryClient.clear();
    queryClient.resetQueries();
    queryClient.getMutationCache().clear();
  };

  return { clearAllQueries };
};
