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
  niter: IterationResult[];
  xi?: number;
  xs?: number;
}

export function FunctionChart({
  funcion,
  niter,
  xi = -10,
  xs = 10,
}: FunctionChartProps) {
  const chartData = useMemo(() => {
    if (!funcion) return [];

    const points: { x: number; y: number | null }[] = [];
    const step = (xs - xi) / 200;
    
    // Convertir sintaxis Python (**) a sintaxis mathjs (^)
    const convertedFuncion = funcion.replace(/\*\*/g, "^");

    for (let x = xi; x <= xs; x += step) {
      try {
        const y = evaluate(convertedFuncion, { x });
        if (typeof y === "number" && isFinite(y) && Math.abs(y) < 1000) {
          points.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(6)) });
        } else {
          points.push({ x: parseFloat(x.toFixed(4)), y: null });
        }
      } catch (err) {
        console.error(`Error evaluando función en x=${x}:`, err);
        points.push({ x: parseFloat(x.toFixed(4)), y: null });
      }
    }

    return points;
  }, [funcion, xi, xs]);

  const rootPoint = useMemo(() => {
    if (niter.length === 0) return null;
    const lastIteration = niter[niter.length - 1];
    const x = "x" in lastIteration ? lastIteration.x : "xm" in lastIteration ? lastIteration.xm : 0;
    const fx = "f_x" in lastIteration ? lastIteration.f_x : "f_xm" in lastIteration ? lastIteration.f_xm : 0;
    return { x, y: fx };
  }, [niter]);

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
              x={rootPoint.x ?? 0}
              stroke="var(--chart-5)"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Raiz: ${(rootPoint.x ?? 0).toFixed(6)}`,
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
