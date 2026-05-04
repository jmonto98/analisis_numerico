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
    const xMin = xi === xs ? xi - 5 : xi;
    const xMax = xi === xs ? xs + 5 : xs;
    const step = (xMax - xMin) / 200;

    if (step === 0) {
      return [];
    }

    // Convertir sintaxis Python (**) a sintaxis mathjs (^)
    const convertedFuncion = funcion.replace(/\*\*/g, "^");

    for (let x = xMin; x <= xMax; x += step) {
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
    
    // Para Punto Fijo, el x es xi
    const x = "xi" in lastIteration 
      ? lastIteration.xi 
      : "x" in lastIteration 
      ? lastIteration.x 
      : "xm" in lastIteration 
      ? lastIteration.xm 
      : 0;
    
    // Para Punto Fijo, calculamos f(x) en el punto (no g_xi)
    // Para Newton y Bisección, usamos f(x) o f(xm)
    let fx: number;
    if ("f_x" in lastIteration) {
      fx = lastIteration.f_x ?? 0;
    } else if ("f_xm" in lastIteration) {
      fx = lastIteration.f_xm ?? 0;
    } else {
      // Para Punto Fijo, debemos calcular f(x) en el punto raíz
      try {
        const convertedFuncion = funcion.replace(/\*\*/g, "^");
        fx = evaluate(convertedFuncion, { x });
        if (!isFinite(fx)) fx = 0;
      } catch {
        fx = 0;
      }
    }
    
    return { x, y: fx };
  }, [niter, funcion]);

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
            tickFormatter={(v) => v.toFixed(2)}
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
