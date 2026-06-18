import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpDeskRepository } from '../help-desk.repository';
import type { HelpDeskListParams } from '../help-desk.types';

const QUERY_KEY = 'help-desk';

export function useHelpDeskListQuery(params: HelpDeskListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => helpDeskRepository.list(params),
  });
}

export function useResolveHelpDeskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => helpDeskRepository.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
