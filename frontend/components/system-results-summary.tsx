'use client';

import { SystemIteration } from '@/lib/types';

interface SystemResultsSummaryProps {
  solution: number[];
  iterations: SystemIteration[];
  message?: string;
  converged: boolean;
}

export function SystemResultsSummary({ 
  solution, 
  iterations, 
  message, 
  converged 
}: SystemResultsSummaryProps) {
  const finalError = iterations.length > 0 
    ? iterations[iterations.length - 1].error ?? 0 
    : 0;

  const formatExponential = (num: number | null) => {
    if (num === null) return 'N/A';
    if (num === 0) return '0';
    if (Math.abs(num) < 1e-4) return num.toExponential(4);
    return num.toFixed(8);
  };

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary">Resultado</h3>
      
      {/* Main metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Error Final
          </span>
          <span className="text-lg font-mono font-medium text-foreground">
            {formatExponential(finalError)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Iteraciones
          </span>
          <span className="text-lg font-mono font-medium text-foreground">
            {iterations.length}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Estado
          </span>
          <span className={`text-lg font-medium ${converged ? 'text-green-500' : 'text-yellow-500'}`}>
            {converged ? '✓ Convergió' : '⚠ No convergió'}
          </span>
        </div>
      </div>

      {/* Solution variables */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Solución del Sistema</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {solution.map((val, i) => (
            <div key={`sol-${i}`} className="bg-muted/50 p-3 rounded">
              <p className="text-xs text-muted-foreground mb-1">x{i + 1}</p>
              <p className="font-mono font-semibold text-sm">{val.toFixed(8)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Description message */}
      {message && (
        <p className="text-sm text-muted-foreground border-t border-primary/20 pt-4">
          {message}
        </p>
      )}
    </div>
  );
}
