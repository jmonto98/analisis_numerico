'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VandermondePointsInput } from '@/components/vandermonde-points-input';
import { VandermondeErrorChart } from '@/components/vandermonde-error-chart';
import { API_BASE_URL } from '@/lib/api-config';

interface VandermondePoint {
  x: number;
  y: number;
}

interface ValidateResult {
  x: number;
  y_actual: number;
  y_pred: number;
  error: number;
}

interface VandermondeResponse {
  coefficients: number[];
  polynomial_degree: number;
  polynomial_str: string;
  matrix_A: number[][];
  domain: { min_x: number; max_x: number };
  training_points: VandermondePoint[];
  validation_points: VandermondePoint[];
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

export function VandermondeCalculator() {
  const [points, setPoints] = useState<Array<{ x: string; y: string }>>([
    { x: '0', y: '0' },
    { x: '1', y: '1' },
    { x: '2', y: '4' },
  ]);

  const [validationPercentage, setValidationPercentage] = useState(0);
  const [selectedValidationPoints, setSelectedValidationPoints] = useState<number[]>([]);
  const [results, setResults] = useState<VandermondeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate points
      if (points.length < 3 || points.length > 20) {
        setError('Se requieren entre 3 y 20 puntos');
        setIsLoading(false);
        return;
      }

      // Validate that if validation percentage is set, at least one point is selected
      if (validationPercentage > 0 && selectedValidationPoints.length === 0) {
        setError('Debes seleccionar al menos un punto para validación');
        setIsLoading(false);
        return;
      }

      // Prepare payload - separate training and validation data
      const x = points.map((p) => parseValue(p.x));
      const y = points.map((p) => parseValue(p.y));

      // Split into training and validation
      const training_x: number[] = [];
      const training_y: number[] = [];
      const validation_x: number[] = [];
      const validation_y: number[] = [];

      x.forEach((xVal, idx) => {
        if (selectedValidationPoints.includes(idx)) {
          validation_x.push(xVal);
          validation_y.push(y[idx]);
        } else {
          training_x.push(xVal);
          training_y.push(y[idx]);
        }
      });

      const payload = {
        x: training_x,
        y: training_y,
        validation_percentage: validationPercentage,
        validation_x: validation_x.length > 0 ? validation_x : undefined,
        validation_y: validation_y.length > 0 ? validation_y : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/vandermonde`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el servidor');
      }

      const data: VandermondeResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Interpolación Polinomial de Vandermonde</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa puntos (mínimo 3, máximo 20) para construir un polinomio interpolante
            </p>
          </CardHeader>
        </Card>

        {/* Points Input */}
        <VandermondePointsInput 
          points={points} 
          validationPercentage={validationPercentage}
          selectedValidationPoints={selectedValidationPoints}
          onPointsChange={setPoints}
          onValidationPercentageChange={setValidationPercentage}
          onValidationPointsChange={setSelectedValidationPoints}
        />

        {/* Optional: Evaluation Points - REMOVED - Now using validate_points from selected indices */}

        {/* Calculate Button */}
        <Button onClick={handleCalculate} disabled={isLoading || (validationPercentage > 0 && selectedValidationPoints.length === 0)} size="lg" className="w-full">
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
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Entrenamiento</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.num_train}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Validación</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.num_validation}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">% Validación</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.validation_percentage}%</span>
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
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.rmse.toExponential(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Max Error</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.max_error.toExponential(2)}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Mean Error</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.validation_metrics.mean_error.toExponential(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Results Table - if validation_results exists */}
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
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">x</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">y_actual</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">y_pred</th>
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.validation_results.map((result, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono">{result.x.toFixed(4)}</td>
                          <td className="py-2 px-3 font-mono">{result.y_actual.toFixed(4)}</td>
                          <td className="py-2 px-3 font-mono">{result.y_pred.toFixed(4)}</td>
                          <td className="py-2 px-3 font-mono text-red-600">{result.error.toExponential(2)}</td>
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
                <CardTitle>Gráfico del Polinomio Interpolante</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Puntos de interpolación y polinomio resultante</p>
              </CardHeader>
              <CardContent>
                <VandermondeErrorChart
                  training_points={results.training_points}
                  validation_points={
                    results.validation_results
                      ? results.validation_results.map((r) => ({ x: r.x, y: r.y_actual }))
                      : undefined
                  }
                  coefficients={results.coefficients}
                  domain={results.domain}
                />
              </CardContent>
            </Card>

            {/* Polynomial and Coefficients below the graph */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="bg-primary/10 border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Polinomio Resultante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center font-mono text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-28 overflow-y-auto">
                    {results.polynomial_str}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Coeficientes</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">a₀ + a₁x + a₂x² + ... + aₙxⁿ</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {results.coefficients.map((coeff, i) => (
                      <div key={i} className="bg-muted/50 p-2 rounded flex justify-between items-center">
                        <p className="text-xs text-muted-foreground font-semibold">a₍{i}₎</p>
                        <p className="font-mono text-xs font-bold break-all">
                          {Math.abs(coeff) < 1e-10 ? '0' : coeff.toExponential(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Width: Matrix Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sistema Ax = b ({results.matrix_A.length}×{results.matrix_A[0]?.length})</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Matriz de Vandermonde y vectores de entrada/salida</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Matriz A - Ampliada */}
                <div className="border border-border rounded-lg p-4 overflow-x-auto">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Matriz A</p>
                  <div 
                    className="grid gap-1" 
                    style={{ 
                      gridTemplateColumns: `repeat(${Math.min(results.matrix_A[0]?.length || 0, 10)}, minmax(50px, 1fr))`,
                      minWidth: 'min-content'
                    }}
                  >
                    {results.matrix_A.map((row, i) =>
                      row.map((val, j) => (
                        <div
                          key={`${i}-${j}`}
                          className="bg-muted/50 border border-border rounded p-2 text-center"
                          title={val.toExponential(6)}
                        >
                          <p className="font-mono text-xs font-bold">
                            {Math.abs(val) < 1e-10 ? '0' : val.toFixed(2)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vector x0 */}
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Vector x₀</p>
                    <div className="grid gap-1 max-h-64 overflow-y-auto">
                      {results.training_points.map((p, i) => (
                        <div key={i} className="grid grid-cols-[auto_1fr] gap-2 items-center bg-muted/50 border border-border rounded p-2">
                          <p className="text-xs text-muted-foreground font-semibold">x{i}</p>
                          <p className="font-mono text-xs font-bold text-right">{p.x.toFixed(3)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vector b */}
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Vector b</p>
                    <div className="grid gap-1 max-h-64 overflow-y-auto">
                      {results.training_points.map((p, i) => (
                        <div key={i} className="grid grid-cols-[auto_1fr] gap-2 items-center bg-muted/50 border border-border rounded p-2">
                          <p className="text-xs text-muted-foreground font-semibold">b{i}</p>
                          <p className="font-mono text-xs font-bold text-right">{p.y.toFixed(3)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input Data */}
                <div className="col-span-1 lg:col-span-2">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Datos de Entrada</p>
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
