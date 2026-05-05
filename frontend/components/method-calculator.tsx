'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParameterForm, type FormData } from '@/components/parameter-form';
import { IterationsTable } from '@/components/iterations-table';
import { FunctionChart } from '@/components/function-chart';
import { ResultsSummary } from '@/components/results-summary';
import { API_BASE_URL } from '@/lib/api-config';
import { NumericalMethod, IterationResult } from '@/lib/types';

export interface MethodCalculatorProps {
  method: NumericalMethod;
  defaultFormData: FormData;
  endpoint: string;
}

export function MethodCalculator({ method, defaultFormData, endpoint }: MethodCalculatorProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [iterations, setIterations] = useState<IterationResult[]>([]);
  const [root, setRoot] = useState<number | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = useCallback(
    (updatedFormData: FormData) => {
      setFormData(updatedFormData);
    },
    []
  );

  const buildPayload = () => {
    const payload: Record<string, any> = {
      funcion: (formData as any).funcion,
      tol: (formData as any).tol,
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
    }

    return payload;
  };

  const getChartBounds = () => {
    const MARGIN = 0.5;
    let xMin = 0,
      xMax = 10;

    switch (method) {
      case 'biseccion':
        const xi = (formData as any).xi;
        const xs = (formData as any).xs;
        xMin = Math.min(xi, xs) - MARGIN;
        xMax = Math.max(xi, xs) + MARGIN;
        break;
      case 'newton':
      case 'punto-fijo':
      case 'raices-multiples':
        const x0 = (formData as any).x0;
        xMin = x0 - MARGIN;
        xMax = x0 + MARGIN;
        break;
      case 'secante':
        const x0s = (formData as any).x0;
        const x1 = (formData as any).x1;
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
      setIterations(data.iterations || []);
      setRoot(data.root);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIterations([]);
      setRoot(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(defaultFormData);
    setIterations([]);
    setRoot(undefined);
    setMessage(undefined);
    setError(null);
  };

  const { xMin, xMax } = getChartBounds();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Form and Results */}
      <div className="space-y-6">
        {/* Form Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Parámetros</CardTitle>
          </CardHeader>
          <CardContent>
            <ParameterForm method={method} formData={formData} onChange={handleFormChange} />

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button onClick={handleCalculate} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Calculando...
                  </>
                ) : (
                  'Calcular'
                )}
              </Button>
              <Button onClick={handleClear} variant="outline" disabled={isLoading}>
                Limpiar
              </Button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        {root !== undefined && (
          <ResultsSummary
            root={root}
            iterations={iterations}
            message={message}
          />
        )}
      </div>

      {/* Right Column: Chart and Table */}
      <div className="space-y-6">
        {/* Chart Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Gráfica</CardTitle>
          </CardHeader>
          <CardContent>
            <FunctionChart
              funcion={(formData as any).funcion}
              niter={iterations}
              xi={xMin}
              xs={xMax}
            />
          </CardContent>
        </Card>

        {/* Iterations Table */}
        {iterations.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Iteraciones</CardTitle>
            </CardHeader>
            <CardContent>
              <IterationsTable iterations={iterations} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
