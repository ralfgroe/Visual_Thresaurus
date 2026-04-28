import { useState, useCallback } from 'react';
import { callClaude } from '../lib/prompt';
import { useGraphDispatch } from './useGraphStore';

export function useClaude() {
  const dispatch = useGraphDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explore = useCallback(
    async (apiKey: string, word: string) => {
      setLoading(true);
      setError(null);
      try {
        const { nodes, edges, centerId } = await callClaude(apiKey, word);
        dispatch({ type: 'EXPAND', nodes, edges, centerId });
        return centerId;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { explore, loading, error, clearError };
}
