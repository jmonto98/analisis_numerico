'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MatrixInput } from '@/components/matrix-input';
import { SystemErrorChart } from '@/components/system-error-chart';
import { SystemResultsSummary } from '@/components/system-results-summary';
import { API_BASE_URL } from '@/lib/api-config';
import { SystemIteration } from '@/lib/types';

interface SystemCalculatorProps {
  method: string;
  endpoint: string;
}

export function SystemCalculator({ method, endpoint }: SystemCalculatorProps) {
  const [matrixSize, setMatrixSize] = useState(2);
  const [matrix, setMatrix] = useState<number[][]>(
    Array(2)
      .fill(null)
      .map(() => Array(2).fill(0))
  );
  const [vectorB, setVectorB] = useState<number[]>([0, 0]);
  const [tol, setTol] = useState('1e-4');
  const [niter, setNiter] = useState(100);

  const [iterations, setIterations] = useState<SystemIteration[]>([]);
  const [solution, setSolution] = useState<number[] | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [converged, setConverged] = useState(false);

  // Update vector B size when matrix size changes
  useEffect(() => {
    setVectorB(Array(matrixSize).fill(0));
    setMatrix(
      Array(matrixSize)
        .fill(null)
        .map(() => Array(matrixSize).fill(0))
    );
  }, [matrixSize]);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse tolerance (support scientific notation)
      const tolValue = parseFloat(tol);
      if (isNaN(tolValue) || tolValue <= 0) {
        throw new Error('Tolerancia inválida. Usa un número positivo o notación científica (ej: 1e-4)');
      }

      // Validate matrix (check diagonal dominance)
      for (let i = 0; i < matrixSize; i++) {
        if (Math.abs(matrix[i][i]) < 1e-10) {
          throw new Error(`Elemento diagonal a[${i}][${i}] es cero o muy cercano a cero`);
        }
      }

      const payload = {
        matrix: matrix,
        b: vectorB,
        tol: tolValue,
        niter: niter,
      };

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el cálculo');
      }

      const data = await response.json();
      setIterations(data.iterations || []);
      setSolution(data.solution);
      setMessage(data.message);
      setConverged(data.converged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIterations([]);
      setSolution(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Parámetros | Matriz y Vector b */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Parameters */}
        <div>
          <Card className="border-2 h-full">
            <CardHeader>
              <CardTitle>Parámetros del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Matrix Size Selector */}
              <div className="space-y-2">
                <Label htmlFor="size-select">Tamaño de la Matriz (n x n)</Label>
                <Select value={matrixSize.toString()} onValueChange={(val) => setMatrixSize(parseInt(val))}>
                  <SelectTrigger id="size-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 7 }, (_, i) => i + 2).map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} x {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tolerance - Scientific Notation */}
              <div className="space-y-2">
                <Label htmlFor="tol">Tolerancia</Label>
                <Input
                  id="tol"
                  type="text"
                  value={tol}
                  onChange={(e) => setTol(e.target.value)}
                  placeholder="1e-4"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Notación científica: 1e-4, 1e-6, etc.
                </p>
              </div>

              {/* Max Iterations */}
              <div className="space-y-2">
                <Label htmlFor="niter">Máximo de Iteraciones</Label>
                <Input
                  id="niter"
                  type="number"
                  value={niter}
                  onChange={(e) => setNiter(parseInt(e.target.value) || 100)}
                  placeholder="100"
                  min="1"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Matrix Input */}
        <div>
          <Card className="border-2 h-full">
            <CardHeader>
              <CardTitle>Matriz A y Vector b</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MatrixInput 
                size={matrixSize} 
                matrix={matrix} 
                onMatrixChange={setMatrix}
                vectorB={vectorB}
                onVectorBChange={setVectorB}
              />

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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Solución (full width) */}
      {solution && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Solución</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemResultsSummary
              solution={solution}
              iterations={iterations}
              message={message}
              converged={converged}
            />
          </CardContent>
        </Card>
      )}

      {/* Row 3: Análisis de Errores | Iteraciones */}
      {solution && iterations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Análisis de Errores */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Análisis de Errores</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemErrorChart iterations={iterations} />
            </CardContent>
          </Card>

          {/* Iteraciones Table */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Iteraciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">i</th>
                      {solution.map((_, j) => (
                        <th key={`h-x${j}`} className="text-right py-2 px-2">
                          x{j + 1}
                        </th>
                      ))}
                      <th className="text-right py-2 px-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iterations.map((iter) => (
                      <tr key={`iter-${iter.i}`} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{iter.i}</td>
                        {iter.x.map((val, j) => (
                          <td key={`x-${iter.i}-${j}`} className="text-right py-2 px-2 font-mono text-xs">
                            {val.toFixed(6)}
                          </td>
                        ))}
                        <td className="text-right py-2 px-2 font-mono text-xs">
                          {iter.error !== null && iter.error !== undefined
                            ? iter.error < 0.0001
                              ? iter.error.toExponential(2)
                              : iter.error.toFixed(6)
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
