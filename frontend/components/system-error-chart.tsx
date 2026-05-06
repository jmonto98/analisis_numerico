'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SystemIteration } from '@/lib/types';

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

// Calcula los 5 tipos de error entre dos vectores
function calculateErrors(x_n: number[], x_prev: number[]): { [key: string]: number } {
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
  if (iterations.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Se necesitan al menos 2 iteraciones para graficar los errores
      </div>
    );
  }

  // Calcular errores para cada iteración
  const errorData: ErrorData[] = [];
  
  for (let i = 1; i < iterations.length; i++) {
    const x_n = iterations[i].x;
    const x_prev = iterations[i - 1].x;
    
    if (!Array.isArray(x_n) || !Array.isArray(x_prev)) {
      continue;
    }
    
    const errors = calculateErrors(x_n, x_prev);
    
    errorData.push({
      i: iterations[i].i,
      ...errors,
    });
  }

  if (errorData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No hay datos de error para mostrar
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={errorData} margin={{ top: 5, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="i" 
            label={{ value: 'Iteración', position: 'bottom', offset: 10 }}
          />
          <YAxis 
            scale="log"
            domain={[1e-10, 1]}
            label={{ value: 'Error (escala log)', angle: -90, position: 'insideLeft' }}
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
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            dataKey="error_absoluto" 
            stroke="#8884d8" 
            name="Absoluto"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="error_relativo_1" 
            stroke="#82ca9d" 
            name="Relativo 1"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="error_relativo_2" 
            stroke="#ffc658" 
            name="Relativo 2"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="error_relativo_3" 
            stroke="#ff7c7c" 
            name="Relativo 3"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="error_relativo_4" 
            stroke="#8dd1e1" 
            name="Relativo 4"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
