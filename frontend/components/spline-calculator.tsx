'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SplinePointsInput } from '@/components/spline-points-input';
import { SplineErrorChart } from '@/components/spline-error-chart';
import { API_BASE_URL } from '@/lib/api-config';

interface SplinePoint {
  x: string;
  y: string;
}

interface SplinePointNumeric {
  x: number;
  y: number;
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

const formatPolynomial = (coefficients: number[], degree: number): string => {
  const terms: string[] = [];

  for (let i = 0; i < coefficients.length; i++) {
    const coeff = coefficients[i];
    const power = degree - i;
    const roundedCoeff = coeff.toFixed(5);
    const sign = coeff >= 0 ? '+ ' : '− ';
    const absCoeff = Math.abs(coeff).toFixed(5);

    if (power === 0) {
      terms.push(`${sign}${absCoeff}`);
    } else if (power === 1) {
      terms.push(`${sign}${absCoeff}x`);
    } else {
      terms.push(`${sign}${absCoeff}x${power}`);
    }
  }

  // Remove leading + or −
  let result = terms.join(' ').trim();
  if (result.startsWith('+ ')) {
    result = result.substring(2);
  } else if (result.startsWith('− ')) {
    result = '−' + result.substring(2);
  }

  return `(${result})`;
};

interface SplineResponse {
  spline_degree: number;
  num_intervals: number;
  coefficients_matrix: number[][];
  vector_x: number[];
  vector_b: number[];
  domain: { min_x: number; max_x: number };
  training_points: SplinePointNumeric[];
  validation_points: SplinePointNumeric[];
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

export function SplineCalculator() {
  const [points, setPoints] = useState<SplinePoint[]>([
    { x: '-2', y: '12.13533528' },
    { x: '-1', y: '6.367879441' },
    { x: '2', y: '-4.610943901' },
    { x: '3', y: '2.085536923' },
  ]);
  const [validationPercentage, setValidationPercentage] = useState(0);
  const [selectedValidationPoints, setSelectedValidationPoints] = useState<Set<number>>(new Set());
  const [splineDegree, setSplineDegree] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SplineResponse | null>(null);
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
        spline_degree: splineDegree,
        validation_percentage: validationPercentage,
        validation_x,
        validation_y,
      };

      const response = await fetch(`${API_BASE_URL}/spline/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el servidor');
      }

      const data: SplineResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const degreeLabel = {
    1: 'Lineal',
    2: 'Cuadrático',
    3: 'Cúbico',
  }[splineDegree] || 'Spline';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Interpolación por Spline {degreeLabel}</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa puntos para construir una interpolación polinomial por tramos
            </p>
          </CardHeader>
        </Card>

        {/* Points Input */}
        <SplinePointsInput
          points={points}
          setPoints={setPoints}
          validationPercentage={validationPercentage}
          setValidationPercentage={setValidationPercentage}
          selectedValidationPoints={selectedValidationPoints}
          setSelectedValidationPoints={setSelectedValidationPoints}
          splineDegree={splineDegree}
          setSplineDegree={setSplineDegree}
        />

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={isLoading || points.length < splineDegree + 1 || (validationPercentage > 0 && selectedValidationPoints.size === 0)}
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

      {/* Results Section */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      )}

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
                  <span className="text-lg font-mono font-semibold text-foreground">{results.spline_degree}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Intervalos</span>
                  <span className="text-lg font-mono font-semibold text-foreground">{results.num_intervals}</span>
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
                <CardTitle>Gráfico del Spline</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Puntos de interpolación y spline resultante</p>
              </CardHeader>
              <CardContent>
                <SplineErrorChart
                  coefficients={results.coefficients_matrix}
                  x_points={results.vector_x}
                  training_points={results.training_points}
                  validation_points={results.validation_points}
                  domain={results.domain}
                  spline_degree={results.spline_degree}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Coefficients Matrix */}
              <Card className="bg-primary/10 border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Matriz de Coeficientes</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Coeficientes de cada polinomio por intervalo</p>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg p-4 overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Intervalo</th>
                          {Array.from({ length: results.spline_degree + 1 }).map((_, i) => (
                            <th key={i} className="text-right py-2 px-2">
                              c₍{results.spline_degree - i}₎
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.coefficients_matrix.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 font-semibold">[{results.vector_x[idx].toFixed(2)}, {results.vector_x[idx + 1]?.toFixed(2)}]</td>
                            {row.map((coeff, cidx) => (
                              <td key={cidx} className="text-right py-2 px-2">
                                {coeff.toExponential(2)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Polynomials by Interval */}
              <Card className="bg-primary/10 border border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-primary">Polinomios por Tramos</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Expresión polinomial de cada intervalo</p>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg p-4">
                    <div className="space-y-0">
                      <div className="border-b border-border py-2 px-2 min-h-[1.5rem]"></div>
                      {results.coefficients_matrix.map((row, idx) => (
                        <div key={idx} className="border-b border-border hover:bg-muted/50 py-2 px-2">
                          <p className="text-xs font-mono text-foreground">
                            P{idx + 1}(x) = {formatPolynomial(row, results.spline_degree)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Input Data */}
            <Card className="bg-primary/10 border border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary">Datos de Entrada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Vector x</p>
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(results.vector_x.length, 8)}, minmax(50px, 1fr))`,
                      minWidth: 'min-content',
                    }}
                  >
                    {results.vector_x.map((val, i) => (
                      <div key={i} className="bg-muted/50 p-2 rounded text-center">
                        <p className="font-mono text-xs">{val.toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Vector b</p>
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(results.vector_b.length, 8)}, minmax(50px, 1fr))`,
                      minWidth: 'min-content',
                    }}
                  >
                    {results.vector_b.map((val, i) => (
                      <div key={i} className="bg-muted/50 p-2 rounded text-center">
                        <p className="font-mono text-xs">{val.toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
