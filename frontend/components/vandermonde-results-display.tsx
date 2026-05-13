'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VandermondePoint {
  x: number;
  y: number;
}

interface VandermondeResultsDisplayProps {
  polynomial_str: string;
  coefficients: number[];
  matrix_A: number[][];
  polynomial_degree: number;
  training_points?: VandermondePoint[];
}

export function VandermondeResultsDisplay({
  polynomial_str,
  coefficients,
  matrix_A,
  polynomial_degree,
  training_points = [],
}: VandermondeResultsDisplayProps) {
  const x_vector = training_points.map(p => p.x);
  const y_vector = training_points.map(p => p.y);

  return (
    <div className="space-y-4">
      {/* Polinomio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Polinomio Resultante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center font-mono text-sm bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
            {polynomial_str}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Grado</p>
              <p className="text-lg font-semibold">{polynomial_degree}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Coeficientes</p>
              <p className="text-lg font-semibold">{coefficients.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coeficientes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Coeficientes</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Formato: a₀ + a₁x + a₂x² + ... + aₙxⁿ</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {coefficients.map((coeff, i) => (
              <div key={i} className="bg-muted/50 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground font-semibold mb-1">a₍{i}₎</p>
                <p className="font-mono text-xs font-bold break-all">
                  {Math.abs(coeff) < 1e-10 ? '0' : coeff.toExponential(3)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sistema Ax = y */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Matriz A ({matrix_A.length}×{matrix_A[0]?.length})</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Sistema Ax = y para coeficientes</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matriz A */}
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Matriz A</p>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(matrix_A[0]?.length || 0, 4)}, minmax(0, 1fr))` }}>
                {matrix_A.map((row, i) =>
                  row.map((val, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="bg-muted/50 border border-border rounded p-2 text-center"
                      title={val.toExponential(6)}
                    >
                      <p className="font-mono text-xs font-bold">
                        {Math.abs(val) < 1e-10 ? '0' : val.toFixed(3)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vector x */}
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Vector x₀</p>
              <div className="grid gap-1">
                {x_vector.map((val, i) => (
                  <div key={i} className="bg-muted/50 border border-border rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">x{i}</p>
                    <p className="font-mono text-xs font-bold">{val.toFixed(3)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vector b (y) */}
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Vector b</p>
              <div className="grid gap-1">
                {y_vector.map((val, i) => (
                  <div key={i} className="bg-muted/50 border border-border rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">b{i}</p>
                    <p className="font-mono text-xs font-bold">{val.toFixed(3)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
