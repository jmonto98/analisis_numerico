'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VandermondeErrorChartProps {
  error_10: number;
  error_20: number;
  error_30: number;
}

export function VandermondeErrorChart({ error_10, error_20, error_30 }: VandermondeErrorChartProps) {
  const data = [
    {
      percentage: '10%',
      error: error_10,
      name: 'E₁₀',
    },
    {
      percentage: '20%',
      error: error_20,
      name: 'E₂₀',
    },
    {
      percentage: '30%',
      error: error_30,
      name: 'E₃₀',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Errores de Validación (RMSE)</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Error cuadrático medio raíz para diferentes porcentajes de validación
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80 rounded-lg border border-border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 40, right: 24, left: 16, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                iconSize={10}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                label={{
                  value: 'Porcentaje de Validación',
                  position: 'bottom',
                  offset: 0,
                  style: { fontSize: 12 },
                }}
              />
              <YAxis
                scale="log"
                tick={{ fontSize: 12 }}
                label={{
                  value: 'RMSE (escala log)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return value.toExponential(6);
                  }
                  return value;
                }}
                labelStyle={{ color: '#000' }}
              />
              <Line
                type="monotone"
                dataKey="error"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8 }}
                name="RMSE"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">E₁₀</div>
            <div className="text-sm font-mono font-bold text-blue-700 mt-1">
              {error_10.toExponential(4)}
            </div>
            <div className="text-xs text-gray-500 mt-1">10% validación</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">E₂₀</div>
            <div className="text-sm font-mono font-bold text-green-700 mt-1">
              {error_20.toExponential(4)}
            </div>
            <div className="text-xs text-gray-500 mt-1">20% validación</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">E₃₀</div>
            <div className="text-sm font-mono font-bold text-orange-700 mt-1">
              {error_30.toExponential(4)}
            </div>
            <div className="text-xs text-gray-500 mt-1">30% validación</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
