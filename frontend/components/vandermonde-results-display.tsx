'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VandermondeResultsDisplayProps {
  polynomial_str: string;
  coefficients: number[];
  matrix_A: number[][];
  polynomial_degree: number;
}

export function VandermondeResultsDisplay({
  polynomial_str,
  coefficients,
  matrix_A,
  polynomial_degree,
}: VandermondeResultsDisplayProps) {
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

      {/* Matriz A */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Matriz de Vandermonde (A)</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Sistema Ax = y para coeficientes</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center">
              <tbody>
                {matrix_A.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        className="border border-border px-2 py-1 font-mono text-xs min-w-16"
                        title={val.toExponential(6)}
                      >
                        {Math.abs(val) < 1e-10 ? '0' : val.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
