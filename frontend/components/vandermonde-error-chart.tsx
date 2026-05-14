'use client';

import { useState } from 'react';
import { ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';

interface VandermondePoint {
  x: number;
  y: number;
}

interface VandermondePolynomialChartProps {
  training_points: VandermondePoint[];
  coefficients: number[];
  domain: { min_x: number; max_x: number };
}

export function VandermondeErrorChart({
  training_points,
  coefficients,
  domain,
}: VandermondePolynomialChartProps) {
  const [showPolynomial, setShowPolynomial] = useState(true);
  const [showInterpolationPoints, setShowInterpolationPoints] = useState(true);

  // Evalúa el polinomio en un punto
  const evaluatePolynomial = (x: number): number => {
    let result = 0;
    // Coeficientes en orden ascendente: a0 + a1*x + a2*x^2 + ...
    for (let i = 0; i < coefficients.length; i++) {
      result += coefficients[i] * Math.pow(x, i);
    }
    return result;
  };

  // Genera puntos densos para graficar el polinomio
  const generatePolynomialCurve = () => {
    const points = [];
    const step = (domain.max_x - domain.min_x) / 100;
    for (let x = domain.min_x; x <= domain.max_x; x += step) {
      points.push({
        x: parseFloat(x.toFixed(4)),
        y_poly: parseFloat(evaluatePolynomial(x).toFixed(6)),
      });
    }
    return points;
  };

  const polyPoints = generatePolynomialCurve();

  // Prepara datos para el gráfico combinado
  const chartData = polyPoints.map((p) => ({
    x: p.x,
    y_poly: p.y_poly,
  }));

  // Puntos de interpolación con formato compatible
  const interpolationData = training_points.map((p) => ({
    x: p.x,
    y: p.y,
  }));

  const visibleXValues = [
    ...(showPolynomial ? chartData.map((p) => p.x) : []),
    ...(showInterpolationPoints ? interpolationData.map((p) => p.x) : []),
  ];

  const visibleYValues = [
    ...(showPolynomial ? chartData.map((p) => p.y_poly) : []),
    ...(showInterpolationPoints ? interpolationData.map((p) => p.y) : []),
  ];

  const xMin = visibleXValues.length ? Math.min(...visibleXValues) : domain.min_x;
  const xMax = visibleXValues.length ? Math.max(...visibleXValues) : domain.max_x;
  const xPadding = Math.max((xMax - xMin) * 0.05, 0.5);

  const yMin = visibleYValues.length ? Math.min(...visibleYValues) : 0;
  const yMax = visibleYValues.length ? Math.max(...visibleYValues) : 1;
  const yPadding = Math.max((yMax - yMin) * 0.1, 0.5);

  return (
    <div className="space-y-6">
      {/* Polynomial Interpolation Graph */}
      <div>
        {/* Checkboxes for visibility control */}
        <div className="flex gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-polynomial"
              checked={showPolynomial}
              onCheckedChange={(checked) => setShowPolynomial(checked === true)}
            />
            <label htmlFor="show-polynomial" className="text-sm font-medium cursor-pointer">
              Polinomio P(x)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-points"
              checked={showInterpolationPoints}
              onCheckedChange={(checked) => setShowInterpolationPoints(checked === true)}
            />
            <label htmlFor="show-points" className="text-sm font-medium cursor-pointer">
              Puntos de Interpolación
            </label>
          </div>
        </div>
        <div className="w-full h-80 rounded-lg border border-border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 16, right: 24, left: 16, bottom: 24 }} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[xMin - xPadding, xMax + xPadding]}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'x',
                  position: 'insideBottomRight',
                  offset: -8,
                  style: { fontSize: 12 },
                }}
              />
              <YAxis
                type="number"
                domain={[yMin - yPadding, yMax + yPadding]}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'y',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return value.toFixed(6);
                  }
                  return value;
                }}
                labelStyle={{ color: '#000' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

              {/* Polinomio interpolado - línea azul */}
              {showPolynomial && (
                <Line
                  type="monotone"
                  dataKey="y_poly"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Polinomio P(x)"
                  isAnimationActive={false}
                />
              )}

              {/* Puntos de interpolación - círculos rojos */}
              {showInterpolationPoints && (
                <Scatter
                  name="Puntos de Interpolación"
                  data={interpolationData}
                  dataKey="y"
                  fill="#ef4444"
                  shape="circle"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
