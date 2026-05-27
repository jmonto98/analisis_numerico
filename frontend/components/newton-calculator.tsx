'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NewtonPointsInput } from '@/components/newton-points-input';
import { NewtonResultsChart } from '@/components/newton-results-chart';
import { API_BASE_URL } from '@/lib/api-config';

interface Point {
  x: string;
  y: string;
}

interface ValidateResult {
  x: number;
  y_actual: number;
  y_pred: number;
  error: number;
}

const parseValue = (value: string): number => {
  if (!value.trim()) return 0;

  if (value.includes('/')) {
    const [num, den] = value.split('/');
    const n = parseFloat(num.trim());
    const d = parseFloat(den.trim());
    if (d === 0) return 0;
    return n / d;
  }

  return parseFloat(value);
};

interface NewtonResponse {
  divided_differences_table: number[][];
  newton_coefficients: number[];
  polynomial_coefficients: number[];
  polynomial_degree: number;
  vector_x: number[];
  domain: { min_x: number; max_x: number };
  training_points: Array<{ x: number; y: number }>;
  validation_points: Array<{ x: number; y: number }>;
  validation_metrics: {
    validation_percentage: number;
    num_train: number;
    num_validation: number;
    rmse: number;
    max_error: number;
    mean_error: number;
  };
  validation_results: ValidateResult[] | null;
  message: string;
}

export function NewtonCalculator() {
  const [points, setPoints] = useState<Point[]>([
    { x: '0', y: '1' },
    { x: '1', y: '2.71' },
    { x: '2', y: '7.39' },
  ]);
  const [validationPercentage, setValidationPercentage] = useState(0);
  const [selectedValidationPoints, setSelectedValidationPoints] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<NewtonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate that if validation percentage is set, at least one point is selected
      if (validationPercentage > 0 && selectedValidationPoints.size === 0) {
        setError('Debes seleccionar al menos un punto para validación');
        setIsLoading(false);
        return;
      }

      // Parse string values to numbers
      const x = points.map(p => parseValue(p.x));
      const y = points.map(p => parseValue(p.y));

      // Separate training and validation data
      const trainingIndices = Array.from({ length: points.length }, (_, i) => i).filter(
        i => !selectedValidationPoints.has(i)
      );
      const validationIndices = Array.from(selectedValidationPoints);

      const training_x = trainingIndices.map(i => x[i]);
      const training_y = trainingIndices.map(i => y[i]);
      const validation_x = validationIndices.length > 0 ? validationIndices.map(i => x[i]) : null;
      const validation_y = validationIndices.length > 0 ? validationIndices.map(i => y[i]) : null;

      const payload = {
        x: training_x,
        y: training_y,
        validation_percentage: validationPercentage,
        validation_x,
        validation_y,
      };

      const response = await fetch(`${API_BASE_URL}/interpolation/newton/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el servidor');
      }

      const data: NewtonResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Interpolación por Newton</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa puntos para construir una interpolación con polinomios de Newton
            </p>
          </CardHeader>
        </Card>

        {/* Points Input */}
        <NewtonPointsInput
          points={points}
          setPoints={setPoints}
          validationPercentage={validationPercentage}
          setValidationPercentage={setValidationPercentage}
          selectedValidationPoints={selectedValidationPoints}
          setSelectedValidationPoints={setSelectedValidationPoints}
        />

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={isLoading || points.length < 2 || (validationPercentage > 0 && selectedValidationPoints.size === 0)}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Calculando...
            </>
          ) : (
            'Interpolar'
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{results.message}</AlertDescription>
          </Alert>

          {/* Resultado Card and Validation Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Resultado Card */}
            <Card className="bg-primary/10 border border-primary/30 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary text-sm">Resultado</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Grado</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.polynomial_degree}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Puntos</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.num_train}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Entrenamiento</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.num_train}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Validación</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.num_validation}</span>
                </div>
              </CardContent>
            </Card>

            {/* Validation Metrics Card */}
            <Card className="bg-primary/10 border border-primary/30 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary text-sm">Métricas de Validación</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">RMSE</span>
                  <span className="text-lg font-mono font-semibold text-foreground">
                    {results.validation_metrics.rmse.toExponential(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Max Error</span>
                  <span className="text-lg font-mono font-semibold text-foreground">
                    {results.validation_metrics.max_error.toExponential(2)}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Mean Error</span>
                  <span className="text-lg font-mono font-semibold text-foreground">
                    {results.validation_metrics.mean_error.toExponential(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Results Table */}
          {results.validation_results && results.validation_results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resultados de Validación</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Comparación de valores reales vs predichos</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">x</th>
                        <th className="text-left py-2 px-3">y_actual</th>
                        <th className="text-left py-2 px-3">y_pred</th>
                        <th className="text-left py-2 px-3">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.validation_results.map((result, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono text-xs">{result.x.toFixed(4)}</td>
                          <td className="py-2 px-3 font-mono text-xs">{result.y_actual.toFixed(4)}</td>
                          <td className="py-2 px-3 font-mono text-xs">{result.y_pred.toFixed(4)}</td>
                          <td className="py-2 px-3 font-mono text-xs text-red-600">{result.error.toExponential(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Graph Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gráfico del Polinomio de Newton</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Puntos de interpolación y polinomio resultante</p>
              </CardHeader>
              <CardContent>
                <NewtonResultsChart results={results} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Divided Differences Table */}
              <Card className="bg-primary/10 border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Tabla de Diferencias Divididas</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Coeficientes por nivel de diferencia</p>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg p-4 overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">x</th>
                          <th className="text-left py-2 px-2">f(x)</th>
                          {Array.from({ length: results.polynomial_degree }).map((_, i) => (
                            <th key={i} className="text-left py-2 px-2">
                              dd{i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.divided_differences_table.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            {row.map((val, jdx) => (
                              <td key={jdx} className="py-2 px-2">
                                {typeof val === 'number' ? val.toFixed(4) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Newton Coefficients */}
              <Card className="bg-primary/10 border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Coeficientes de Newton</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Diagonal de la tabla de diferencias</p>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg p-4 overflow-x-auto">
                    <div className="flex flex-wrap gap-2">
                      {results.newton_coefficients.map((c, idx) => (
                        <div key={idx} className="bg-muted/50 px-3 py-2 rounded text-center">
                          <p className="font-mono text-xs">c{idx}</p>
                          <p className="font-mono text-xs font-semibold">{c.toFixed(6)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Polynomial in Standard Form */}
            <Card className="bg-primary/10 border border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary">Polinomio en Forma Estándar</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Coeficientes en orden descendente de potencias</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border rounded-lg p-4 overflow-x-auto">
                  <div className="flex flex-wrap gap-2">
                    {results.polynomial_coefficients.map((coef, idx) => (
                      <div key={idx} className="bg-muted/50 px-3 py-2 rounded text-center">
                        <p className="font-mono text-xs">a{idx}</p>
                        <p className="font-mono text-xs font-semibold">{coef.toFixed(6)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-xs font-mono text-foreground overflow-x-auto">
                    P(x) = {results.polynomial_coefficients
                      .map((coef, idx) => {
                        const power = results.polynomial_degree - idx;
                        if (Math.abs(coef) < 1e-10) return '';
                        const sign = coef > 0 ? (idx === 0 ? '' : ' + ') : ' − ';
                        const absCoef = Math.abs(coef).toFixed(5);
                        if (power === 0) return `${sign}${absCoef}`;
                        if (power === 1) return `${sign}${absCoef}x`;
                        return `${sign}${absCoef}x^${power}`;
                      })
                      .filter(Boolean)
                      .join('')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Input Data */}
            <Card className="bg-primary/10 border border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary">Datos de Entrada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">x</th>
                        <th className="text-left py-2 px-3">y</th>
                        <th className="text-left py-2 px-3">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.training_points.map((p, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono text-xs">{p.x.toFixed(6)}</td>
                          <td className="py-2 px-3 font-mono text-xs">{p.y.toFixed(6)}</td>
                          <td className="py-2 px-3 text-blue-600 text-xs">Entrenamiento</td>
                        </tr>
                      ))}
                      {results.validation_points.map((p, idx) => (
                        <tr key={`val-${idx}`} className="border-b border-border hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono text-xs">{p.x.toFixed(6)}</td>
                          <td className="py-2 px-3 font-mono text-xs">{p.y.toFixed(6)}</td>
                          <td className="py-2 px-3 text-green-600 text-xs">Validación</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
