"use client";

import type { IterationResult } from "@/lib/types";

interface ResultsSummaryProps {
  iterations: IterationResult[];
  root?: number;
  message?: string;
}

export function ResultsSummary({ iterations, root, message }: ResultsSummaryProps) {
  if (iterations.length === 0) {
    return null;
  }

  const lastIteration = iterations[iterations.length - 1];
  
  // Obtener los valores según el método
  const x = "x" in lastIteration && typeof lastIteration.x === "number"
    ? lastIteration.x
    : "xm" in lastIteration && typeof lastIteration.xm === "number"
    ? lastIteration.xm
    : 0;
  const fx = "f_x" in lastIteration && typeof lastIteration.f_x === "number"
    ? lastIteration.f_x
    : "f_xm" in lastIteration && typeof lastIteration.f_xm === "number"
    ? lastIteration.f_xm
    : 0;
  const error = lastIteration.error ?? 0;

  const formatExponential = (num: number) => {
    if (Math.abs(num) < 1e-10) return "0";
    return num.toExponential(4);
  };

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-primary mb-3">Resultado</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Raíz Aproximada
          </span>
          <span className="text-lg font-mono font-medium text-foreground">
            {root !== undefined ? root.toFixed(8) : x.toFixed(8)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            f(raíz)
          </span>
          <span className="text-lg font-mono font-medium text-foreground">
            {formatExponential(fx)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Error Final
          </span>
          <span className="text-lg font-mono font-medium text-foreground">
            {formatExponential(error)}
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
      </div>
      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
