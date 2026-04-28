"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { evaluate } from "mathjs";
import type { IterationResult } from "@/lib/types";

interface FunctionChartProps {
  funcion: string;
  iterations: IterationResult[];
  xMin?: number;
  xMax?: number;
}

export function FunctionChart({
  funcion,
  iterations,
  xMin = -10,
  xMax = 10,
}: FunctionChartProps) {
  const chartData = useMemo(() => {
    if (!funcion) return [];

    const points: { x: number; y: number | null }[] = [];
    const step = (xMax - xMin) / 200;

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = evaluate(funcion, { x });
        if (typeof y === "number" && isFinite(y) && Math.abs(y) < 1000) {
          points.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(6)) });
        } else {
          points.push({ x: parseFloat(x.toFixed(4)), y: null });
        }
      } catch {
        points.push({ x: parseFloat(x.toFixed(4)), y: null });
      }
    }

    return points;
  }, [funcion, xMin, xMax]);

  const rootPoint = useMemo(() => {
    if (iterations.length === 0) return null;
    const lastIteration = iterations[iterations.length - 1];
    return { x: lastIteration.xm, y: lastIteration.fxm };
  }, [iterations]);

  if (!funcion || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground bg-secondary/30 rounded-lg">
        Ingresa una funcion para visualizar
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="x"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
            }}
            labelFormatter={(label) => `x = ${label}`}
            formatter={(value: number) => [value?.toFixed(6), "f(x)"]}
          />
          <Legend />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="y"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            name="f(x)"
            connectNulls={false}
          />
          {rootPoint && (
            <ReferenceLine
              x={rootPoint.x}
              stroke="var(--chart-5)"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Raiz: ${rootPoint.x.toFixed(6)}`,
                position: "top",
                fill: "var(--foreground)",
                fontSize: 12,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
