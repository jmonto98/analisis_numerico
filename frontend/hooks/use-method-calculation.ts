import { useCallback, useState } from 'react';
import { NumericalMethod, IterationResult, MethodResponse } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api-config';

export function useMethodCalculation(method: NumericalMethod) {
  const [iterations, setIterations] = useState<IterationResult[]>([]);
  const [root, setRoot] = useState<number | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    async (payload: Record<string, any>) => {
      setIsLoading(true);
      setError(null);
      setMessage(undefined);

      try {
        const methodEndpoint = method
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');

        const response = await fetch(
          `${API_BASE_URL}/${methodEndpoint.replace(/--/g, '-')}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error en el cálculo');
        }

        const data: MethodResponse = await response.json();
        setIterations(data.iteraciones || []);
        setRoot(data.raiz);
        setMessage(data.mensaje);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIterations([]);
        setRoot(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [method]
  );

  const reset = useCallback(() => {
    setIterations([]);
    setRoot(undefined);
    setMessage(undefined);
    setError(null);
  }, []);

  return {
    iterations,
    root,
    message,
    isLoading,
    error,
    calculate,
    reset,
  };
}
