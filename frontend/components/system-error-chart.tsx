'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';
import { SystemIteration } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

interface SystemErrorChartProps {
  iterations: SystemIteration[];
}

interface ErrorData {
  i: number;
  error_absoluto: number;
  error_relativo_1: number;
  error_relativo_2: number;
  error_relativo_3: number;
  error_relativo_4: number;
}

type ErrorType = 'error_absoluto' | 'error_relativo_1' | 'error_relativo_2' | 'error_relativo_3' | 'error_relativo_4';

const ERROR_TYPES: { value: ErrorType; label: string; color: string; formula: string }[] = [
  { value: 'error_absoluto', label: 'Absoluto', color: '#3b82f6', formula: '(|Xₙ - Xₙ₋₁|)' },
  { value: 'error_relativo_1', label: 'Relativo 1', color: '#10b981', formula: '(|Xₙ - Xₙ₋₁| / |Xₙ|)' },
  { value: 'error_relativo_2', label: 'Relativo 2', color: '#f59e0b', formula: '(|Xₙ - Xₙ₋₁| / |Xₙ₋₁|)' },
  { value: 'error_relativo_3', label: 'Relativo 3', color: '#ef4444', formula: '(|(Xₙ - Xₙ₋₁) / Xₙ|)' },
  { value: 'error_relativo_4', label: 'Relativo 4', color: '#d946ef', formula: '(|(Xₙ - Xₙ₋₁) / Xₙ₋₁|)' },
];

// Calcula los 5 tipos de error entre dos vectores
function calculateErrors(x_n: number[], x_prev: number[]): {
  error_absoluto: number;
  error_relativo_1: number;
  error_relativo_2: number;
  error_relativo_3: number;
  error_relativo_4: number;
} {
  const diff = x_n.map((val, i) => val - x_prev[i]);
  
  // Error absoluto: max(|X_n - X_n-1|)
  const error_absoluto = Math.max(...diff.map(d => Math.abs(d)));
  
  // Error relativo aproximado: max(|X_n - X_n-1| / |X_n|)
  const error_relativo_1 = Math.max(...x_n.map((val, i) => 
    Math.abs(val) > 1e-10 ? Math.abs(diff[i]) / Math.abs(val) : 0
  ));
  
  // Error relativo aproximado 2: max(|X_n - X_n-1| / |X_n-1|)
  const error_relativo_2 = Math.max(...x_prev.map((val, i) => 
    Math.abs(val) > 1e-10 ? Math.abs(diff[i]) / Math.abs(val) : 0
  ));
  
  // Error relativo aproximado 3: max(|(X_n - X_n-1) / X_n|)
  const error_relativo_3 = Math.max(...x_n.map((val, i) => 
    Math.abs(val) > 1e-10 ? Math.abs(diff[i] / val) : 0
  ));
  
  // Error relativo aproximado 4: max(|(X_n - X_n-1) / X_n-1|)
  const error_relativo_4 = Math.max(...x_prev.map((val, i) => 
    Math.abs(val) > 1e-10 ? Math.abs(diff[i] / val) : 0
  ));
  
  return {
    error_absoluto,
    error_relativo_1,
    error_relativo_2,
    error_relativo_3,
    error_relativo_4,
  };
}

export function SystemErrorChart({ iterations }: SystemErrorChartProps) {
  const [selectedErrors, setSelectedErrors] = useState<ErrorType[]>(['error_absoluto', 'error_relativo_1']);

  const errorData = useMemo(() => {
    if (iterations.length < 2) return [];

    const data: ErrorData[] = [];
    for (let i = 1; i < iterations.length; i++) {
      const x_n = iterations[i].x;
      const x_prev = iterations[i - 1].x;
      
      if (!Array.isArray(x_n) || !Array.isArray(x_prev)) {
        continue;
      }
      
      const errors = calculateErrors(x_n, x_prev);
      data.push({
        i: iterations[i].i,
        ...errors,
      });
    }
    return data;
  }, [iterations]);

  const handleErrorToggle = (errorType: ErrorType, checked: boolean) => {
    setSelectedErrors(prev =>
      checked
        ? [...prev, errorType]
        : prev.filter(e => e !== errorType)
    );
  };

  if (iterations.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Se necesitan al menos 2 iteraciones para graficar los errores
      </div>
    );
  }

  if (errorData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No hay datos de error para mostrar
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <span className="text-sm font-medium self-center">Tipo de Error:</span>
        {ERROR_TYPES.map((errorType) => (
          <div key={errorType.value} className="flex items-center space-x-2">
            <Checkbox
              id={`error-${errorType.value}`}
              checked={selectedErrors.includes(errorType.value)}
              onCheckedChange={(checked) =>
                handleErrorToggle(errorType.value, checked as boolean)
              }
            />
            <label
              htmlFor={`error-${errorType.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {errorType.label}
            </label>
          </div>
        ))}
      </div>

      <div className="w-full h-80 rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={errorData} margin={{ top: 40, right: 24, left: 16, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
              iconSize={10}
            />
            <XAxis 
              dataKey="i" 
              tick={{ fontSize: 12 }}
              label={{
                value: 'Iteración (i)',
                position: 'bottom',
                offset: 0,
                style: { fontSize: 12 },
              }}
            />
            <YAxis 
              scale="log"
              domain={[1e-10, 1]}
              tick={{ fontSize: 12 }}
              label={{ value: '', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value < 1e-10 ? '< 1e-10' : value.toExponential(2);
                }
                return value;
              }}
              contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', border: 'none' }}
            />
            {ERROR_TYPES.map((errorType) => {
              if (!selectedErrors.includes(errorType.value)) return null;
              return (
                <Line
                  key={errorType.value}
                  type="monotone"
                  dataKey={errorType.value}
                  stroke={errorType.color}
                  name={errorType.label}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground mb-3">Fórmulas de Errores</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ERROR_TYPES.map((errorType) => (
            <div key={errorType.value} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: errorType.color }}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{errorType.label}:</span>
                <span className="text-sm text-muted-foreground ml-2">{errorType.formula}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
