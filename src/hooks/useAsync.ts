import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import type { ServiceResult } from '../types/api.types';
import { logError } from '../utils/errors';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async function that returns a `ServiceResult<T>` and exposes
 * loading/error/data state. Re-runs whenever `deps` changes, and ignores
 * stale responses if the component re-runs the request before a previous
 * one resolves.
 */
export function useAsync<T>(
  fn: () => Promise<ServiceResult<T>>,
  deps: DependencyList = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const requestId = useRef(0);

  const run = useCallback(() => {
    const currentId = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fn()
      .then((result) => {
        if (currentId !== requestId.current) return; // stale response
        if (result.error) {
          logError('useAsync', result.error);
          setState({ data: null, loading: false, error: result.error.message });
        } else {
          setState({ data: result.data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (currentId !== requestId.current) return;
        logError('useAsync', err);
        setState({ data: null, loading: false, error: 'Something went wrong.' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, refetch: run };
}
