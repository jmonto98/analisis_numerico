'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParameterForm, type FormData } from '@/components/parameter-form';
import { IterationsTable } from '@/components/iterations-table';
import { FunctionChart } from '@/components/function-chart';
import { ErrorChart } from '@/components/error-chart';
import { ResultsSummary } from '@/components/results-summary';
import { API_BASE_URL } from '@/lib/api-config';
import { NumericalMethod, IterationResult } from '@/lib/types';

export interface MethodCalculatorProps {
  method: NumericalMethod;
  defaultFormData: FormData;
  endpoint: string;
}

interface StoredResults {
  iterations: IterationResult[];
  root: number;
  message: string;
  formData: FormData;
  timestamp: number;
}

export function MethodCalculator({ method, defaultFormData, endpoint }: MethodCalculatorProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [iterations, setIterations] = useState<IterationResult[]>([]);
  const [root, setRoot] = useState<number | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar resultados y parámetros guardados cuando cambia el método
  useEffect(() => {
    const storageKey = `results_${method}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data: StoredResults = JSON.parse(stored);
        setIterations(data.iterations);
        setRoot(data.root);
        setMessage(data.message);
        setFormData(data.formData);
      } catch (err) {
        console.error('Error al recuperar resultados guardados:', err);
        setFormData(defaultFormData);
      }
    } else {
      // Si no hay resultados guardados, limpiar y usar parámetros predeterminados
      setIterations([]);
      setRoot(undefined);
      setMessage(undefined);
      setFormData(defaultFormData);
    }
    
    setError(null);
    setIsHydrated(true);
  }, [method, defaultFormData]);

  const saveResultsToStorage = (iters: IterationResult[], rootValue: number, msg: string) => {
    const storageKey = `results_${method}`;
    const data: StoredResults = {
      iterations: iters,
      root: rootValue,
      message: msg,
      formData: formData,
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const handleFormChange = useCallback(
    (updatedFormData: FormData) => {
      setFormData(updatedFormData);
    },
    []
  );

  const buildPayload = () => {
    const payload: Record<string, any> = {
      funcion: (formData as any).funcion,
      tol: parseFloat((formData as any).tol),
      error_type: (formData as any).error_type,
      niter: (formData as any).niter,
    };

    // Agregar parámetros específicos del método
    switch (method) {
      case 'biseccion':
        payload.xi = (formData as any).xi;
        payload.xs = (formData as any).xs;
        break;
      case 'newton':
      case 'punto-fijo':
      case 'raices-multiples':
        payload.x0 = (formData as any).x0;
        break;
      case 'secante':
        payload.x0 = (formData as any).x0;
        payload.x1 = (formData as any).x1;
        break;
      case 'regla-falsa':
        payload.a = (formData as any).a;
        payload.b = (formData as any).b;
        break;
    }

    return payload;
  };

  const getChartBounds = () => {
    const MARGIN = 0.5;
    let xMin = 0,
      xMax = 10;

    // Verificar que formData existe y tiene las propiedades necesarias
    if (!formData || typeof formData !== 'object') {
      return { xMin, xMax };
    }

    const fData = formData as any;

    switch (method) {
      case 'biseccion':
      case 'regla-falsa':
        const xi = fData.xi ?? fData.a ?? 0;
        const xs = fData.xs ?? fData.b ?? 10;
        xMin = Math.min(xi, xs) - MARGIN;
        xMax = Math.max(xi, xs) + MARGIN;
        break;
      case 'newton':
      case 'punto-fijo':
      case 'raices-multiples':
        const x0 = fData.x0 ?? 1;
        xMin = x0 - MARGIN;
        xMax = x0 + MARGIN;
        break;
      case 'secante':
        const x0s = fData.x0 ?? 1;
        const x1 = fData.x1 ?? 2;
        xMin = Math.min(x0s, x1) - MARGIN;
        xMax = Math.max(x0s, x1) + MARGIN;
        break;
    }

    return { xMin, xMax };
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(undefined);

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el cálculo');
      }

      const data = await response.json();
      const iterationsData = data.iterations || [];
      const rootData = data.root;
      const messageData = data.message;
      
      setIterations(iterationsData);
      setRoot(rootData);
      setMessage(messageData);
      
      // Guardar en localStorage
      saveResultsToStorage(iterationsData, rootData, messageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIterations([]);
      setRoot(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const { xMin, xMax } = useMemo(() => {
    if (!isHydrated || !formData) {
      return { xMin: 0, xMax: 10 };
    }
    return getChartBounds();
  }, [isHydrated, formData, method]);

  return (
    <div className="space-y-6">
      {/* Row 1: Parámetros | Gráfica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Form Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Parámetros</CardTitle>
            </CardHeader>
            <CardContent>
              <ParameterForm method={method} formData={formData || defaultFormData} onChange={handleFormChange} />

              {/* Action Button */}
              <Button onClick={handleCalculate} disabled={isLoading} className="w-full mt-6">
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Calculando...
                  </>
                ) : (
                  'Calcular'
                )}
              </Button>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Chart */}
        <div>
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Gráfica</CardTitle>
            </CardHeader>
            <CardContent>
              {isHydrated && formData && (
                <FunctionChart
                  funcion={(formData as any).funcion}
                  niter={iterations}
                  xi={xMin}
                  xs={xMax}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Resultados (full width) */}
      {root !== undefined && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsSummary
              root={root}
              iterations={iterations}
              message={message}
            />
          </CardContent>
        </Card>
      )}

      {/* Row 3: Errores | Iteraciones */}
      {iterations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Error Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Análisis de Errores</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorChart niter={iterations} />
            </CardContent>
          </Card>

          {/* Right: Iterations Table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Iteraciones</CardTitle>
            </CardHeader>
            <CardContent>
              <IterationsTable iterations={iterations} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
