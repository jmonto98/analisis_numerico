'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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

interface SplinePoint {
  x: number;
  y: number;
}

interface SplineErrorChartProps {
  coefficients: number[][];
  x_points: number[];
  training_points: SplinePoint[];
  validation_points: SplinePoint[];
  domain: { min_x: number; max_x: number };
  spline_degree: number;
}

export function SplineErrorChart({
  coefficients,
  x_points,
  training_points,
  validation_points,
  domain,
  spline_degree,
}: SplineErrorChartProps) {
  const [showSpline, setShowSpline] = useState(true);
  const [showTrainingPoints, setShowTrainingPoints] = useState(true);
  const [showValidationPoints, setShowValidationPoints] = useState(true);

  const evaluateSpline = (x: number): number => {
    // Find which interval x belongs to
    const n_intervals = coefficients.length;
    let interval_idx = n_intervals - 1;

    for (let i = 0; i < n_intervals; i++) {
      if (x <= x_points[i + 1]) {
        interval_idx = i;
        break;
      }
    }

    // Get coefficients for this interval
    const coeff = coefficients[interval_idx];

    // Evaluate polynomial (coefficients in descending order)
    let result = 0.0;
    for (let i = 0; i < coeff.length; i++) {
      const power = spline_degree - i;
      result += coeff[i] * Math.pow(x, power);
    }

    return result;
  };

  // Generate data for the spline curve
  const step = (domain.max_x - domain.min_x) / 100;
  const chartData: { x: number; y_spline: number }[] = [];

  for (let x = domain.min_x; x <= domain.max_x; x += step) {
    const y = evaluateSpline(x);
    chartData.push({ x: parseFloat(x.toFixed(4)), y_spline: parseFloat(y.toFixed(4)) });
  }

  // Add final point
  chartData.push({
    x: parseFloat(domain.max_x.toFixed(4)),
    y_spline: parseFloat(evaluateSpline(domain.max_x).toFixed(4)),
  });

  // Puntos de entrenamiento
  const trainingData = training_points.map((p) => ({
    x: p.x,
    y: p.y,
  }));

  // Puntos de validación
  const validationData = validation_points.map((p) => ({
    x: p.x,
    y: p.y,
  }));

  // Calculate domain padding
  const visibleXValues = [
    ...(showSpline ? chartData.map((p) => p.x) : []),
    ...(showTrainingPoints ? trainingData.map((p) => p.x) : []),
    ...(showValidationPoints ? validationData.map((p) => p.x) : []),
  ];

  const visibleYValues = [
    ...(showSpline ? chartData.map((p) => p.y_spline) : []),
    ...(showTrainingPoints ? trainingData.map((p) => p.y) : []),
    ...(showValidationPoints ? validationData.map((p) => p.y) : []),
  ];

  const xMin = visibleXValues.length ? Math.min(...visibleXValues) : domain.min_x;
  const xMax = visibleXValues.length ? Math.max(...visibleXValues) : domain.max_x;
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
            id="show-spline"
            checked={showSpline}
            onCheckedChange={(checked) => setShowSpline(checked === true)}
          />
          <Label htmlFor="show-spline" className="text-sm font-medium cursor-pointer">
            Spline S(x)
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
        {validation_points && validation_points.length > 0 && (
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

            {/* Spline curve - blue line */}
            {showSpline && (
              <Line
                type="monotone"
                dataKey="y_spline"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Spline S(x)"
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
