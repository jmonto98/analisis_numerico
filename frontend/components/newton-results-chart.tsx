'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface NewtonResultsChartProps {
  results: {
    vector_x: number[];
    polynomial_coefficients: number[];
    polynomial_degree: number;
    domain: { min_x: number; max_x: number };
    training_points: Array<{ x: number; y: number }>;
    validation_points: Array<{ x: number; y: number }>;
  };
}

export function NewtonResultsChart({ results }: NewtonResultsChartProps) {
  const [showNewtonPoly, setShowNewtonPoly] = useState(true);
  const [showTrainingPoints, setShowTrainingPoints] = useState(true);
  const [showValidationPoints, setShowValidationPoints] = useState(true);

  // Evaluate Newton polynomial at many points
  const evaluatePolynomial = (x: number): number => {
    const coef = results.polynomial_coefficients;
    let result = 0;
    for (let i = 0; i < coef.length; i++) {
      result += coef[i] * Math.pow(x, results.polynomial_degree - i);
    }
    return result;
  };

  // Generate curve data
  const { min_x, max_x } = results.domain;
  const step = (max_x - min_x) / 100;
  const chartData: { x: number; y_newton: number }[] = [];

  for (let x = min_x; x <= max_x; x += step) {
    const y = evaluatePolynomial(x);
    chartData.push({ x: parseFloat(x.toFixed(4)), y_newton: parseFloat(y.toFixed(4)) });
  }

  // Add final point
  chartData.push({
    x: parseFloat(max_x.toFixed(4)),
    y_newton: parseFloat(evaluatePolynomial(max_x).toFixed(4)),
  });

  // Training and validation data
  const trainingData = results.training_points.map((p) => ({
    x: p.x,
    y: p.y,
  }));

  const validationData = results.validation_points.map((p) => ({
    x: p.x,
    y: p.y,
  }));

  // Calculate domain padding
  const visibleXValues = [
    ...(showNewtonPoly ? chartData.map((p) => p.x) : []),
    ...(showTrainingPoints ? trainingData.map((p) => p.x) : []),
    ...(showValidationPoints ? validationData.map((p) => p.x) : []),
  ];

  const visibleYValues = [
    ...(showNewtonPoly ? chartData.map((p) => p.y_newton) : []),
    ...(showTrainingPoints ? trainingData.map((p) => p.y) : []),
    ...(showValidationPoints ? validationData.map((p) => p.y) : []),
  ];

  const xMin = visibleXValues.length ? Math.min(...visibleXValues) : results.domain.min_x;
  const xMax = visibleXValues.length ? Math.max(...visibleXValues) : results.domain.max_x;
  const xPadding = Math.max((xMax - xMin) * 0.05, 0.5);

  const yMin = visibleYValues.length ? Math.min(...visibleYValues) : 0;
  const yMax = visibleYValues.length ? Math.max(...visibleYValues) : 1;
  const yPadding = Math.max((yMax - yMin) * 0.1, 0.5);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-newton"
            checked={showNewtonPoly}
            onCheckedChange={(checked) => setShowNewtonPoly(checked === true)}
          />
          <Label htmlFor="show-newton" className="text-sm font-medium cursor-pointer">
            Polinomio Newton P(x)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-training"
            checked={showTrainingPoints}
            onCheckedChange={(checked) => setShowTrainingPoints(checked === true)}
          />
          <Label htmlFor="show-training" className="text-sm font-medium cursor-pointer">
            Puntos de Entrenamiento
          </Label>
        </div>
        {results.validation_points && results.validation_points.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-validation"
              checked={showValidationPoints}
              onCheckedChange={(checked) => setShowValidationPoints(checked === true)}
            />
            <Label htmlFor="show-validation" className="text-sm font-medium cursor-pointer">
              Puntos de Validación
            </Label>
          </div>
        )}
      </div>

      {/* Chart */}
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

            {/* Polynomial curve - blue line */}
            {showNewtonPoly && (
              <Line
                type="monotone"
                dataKey="y_newton"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Polinomio P(x)"
                isAnimationActive={false}
              />
            )}

            {/* Training points - red circles */}
            {showTrainingPoints && trainingData.length > 0 && (
              <Scatter
                name="Puntos de Entrenamiento"
                data={trainingData}
                dataKey="y"
                fill="#ef4444"
                shape="circle"
              />
            )}

            {/* Validation points - green diamonds */}
            {showValidationPoints && validationData.length > 0 && (
              <Scatter
                name="Puntos de Validación"
                data={validationData}
                dataKey="y"
                fill="#10b981"
                shape="diamond"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
