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
import { VandermondeResultsDisplay } from '@/components/vandermonde-results-display';
import { API_BASE_URL } from '@/lib/api-config';

interface VandermondePoint {
  x: number;
  y: number;
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
  error_10: number;
  error_20: number;
  error_30: number;
  eval_results: Array<{ x: number; y: number }> | null;
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

  const [evalPointsStr, setEvalPointsStr] = useState('');
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

      // Parse eval points
      let evalPoints: number[] = [];
      if (evalPointsStr.trim()) {
        evalPoints = evalPointsStr
          .split(',')
          .map((x) => parseValue(x.trim()))
          .filter((x) => !isNaN(x));
      }

      // Prepare payload
      const x = points.map((p) => parseValue(p.x));
      const y = points.map((p) => parseValue(p.y));

      const payload = {
        x,
        y,
        validation_percentage: 0, // Use all points for training by default
        eval_points: evalPoints.length > 0 ? evalPoints : undefined,
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
        <VandermondePointsInput points={points} onPointsChange={setPoints} />

        {/* Optional: Evaluation Points */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puntos de Evaluación (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm">Puntos donde evaluar el polinomio (separados por comas)</Label>
              <Input
                type="text"
                value={evalPointsStr}
                onChange={(e) => setEvalPointsStr(e.target.value)}
                placeholder="Ej: -1, 0, 0.5, 2.5, 5"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar fracciones (1/2), decimales (1.5) o notación científica (1e-4)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Calculate Button */}
        <Button onClick={handleCalculate} disabled={isLoading} size="lg" className="w-full">
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

          {/* Error Chart */}
          <VandermondeErrorChart
            error_10={results.error_10}
            error_20={results.error_20}
            error_30={results.error_30}
          />

          {/* Results Display */}
          <VandermondeResultsDisplay
            polynomial_str={results.polynomial_str}
            coefficients={results.coefficients}
            matrix_A={results.matrix_A}
            polynomial_degree={results.polynomial_degree}
          />

          {/* Domain Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Dominio (Mínimo)</Label>
                <div className="text-lg font-mono font-bold">{results.domain.min_x.toFixed(4)}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Dominio (Máximo)</Label>
                <div className="text-lg font-mono font-bold">{results.domain.max_x.toFixed(4)}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Puntos de Entrenamiento</Label>
                <div className="text-lg font-mono font-bold">{results.validation_metrics.num_train}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Puntos de Validación</Label>
                <div className="text-lg font-mono font-bold">{results.validation_metrics.num_validation}</div>
              </div>
            </CardContent>
          </Card>

          {/* Eval Results */}
          {results.eval_results && results.eval_results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evaluación en Puntos Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left text-sm font-semibold">x</th>
                        <th className="border px-4 py-2 text-right text-sm font-semibold">P(x)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.eval_results.map((point, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-4 py-2 font-mono text-sm">{point.x.toFixed(6)}</td>
                          <td className="border px-4 py-2 font-mono text-sm text-right">
                            {point.y.toExponential(6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
