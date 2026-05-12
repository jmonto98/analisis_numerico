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

interface SORCalculatorProps {
  method: string;
  endpoint: string;
}

export function SORCalculator({ method, endpoint }: SORCalculatorProps) {
  const [matrixSize, setMatrixSize] = useState(2);
  const [matrix, setMatrix] = useState<number[][]>(
    Array(2)
      .fill(null)
      .map(() => Array(2).fill(0))
  );
  const [vectorB, setVectorB] = useState<number[]>([0, 0]);
  const [vectorX0, setVectorX0] = useState<number[]>([0, 0]);
  const [omega, setOmega] = useState('1.5');
  const [tol, setTol] = useState('1e-4');
  const [niter, setNiter] = useState(100);

  const [iterations, setIterations] = useState<SystemIteration[]>([]);
  const [solution, setSolution] = useState<number[] | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [converged, setConverged] = useState(false);

  // Update vector B and X0 size when matrix size changes
  useEffect(() => {
    setVectorB(Array(matrixSize).fill(0));
    setVectorX0(Array(matrixSize).fill(0));
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
      // Parse omega
      const omegaValue = parseFloat(omega);
      if (isNaN(omegaValue) || omegaValue <= 0 || omegaValue >= 2) {
        throw new Error('Parámetro omega debe estar en el rango (0, 2)');
      }

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
        x0: vectorX0,
        omega: omegaValue,
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Parameters (1 column) */}
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

              {/* Relaxation Parameter (Omega) */}
              <div className="space-y-2">
                <Label htmlFor="omega">Parámetro de Relajación (ω)</Label>
                <Input
                  id="omega"
                  type="text"
                  value={omega}
                  onChange={(e) => setOmega(e.target.value)}
                  placeholder="1.5"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Rango: 0 &lt; ω &lt; 2 (default: 1.5)
                </p>
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

        {/* Right: Matrix Input (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="border-2 h-full">
            <CardHeader>
              <CardTitle>Matriz A, x0 y Vector b</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MatrixInput 
                size={matrixSize} 
                matrix={matrix} 
                onMatrixChange={setMatrix}
                vectorB={vectorB}
                onVectorBChange={setVectorB}
                x0={vectorX0}
                onX0Change={setVectorX0}
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
        <div>
          <SystemResultsSummary 
            solution={solution} 
            converged={converged} 
            message={message}
            iterations={iterations}
          />
        </div>
      )}

      {/* Row 3: Errores | Iteraciones */}
      {iterations.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SystemErrorChart iterations={iterations} />
          </div>
          <div>
            {/* Iterations Table would go here */}
          </div>
        </div>
      )}
    </div>
  );
}
