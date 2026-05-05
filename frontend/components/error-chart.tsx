"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { IterationResult } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ErrorChartProps {
  niter: IterationResult[];
}

type ErrorType = "absolute" | "relative1" | "relative2" | "conditional";

export function ErrorChart({ niter }: ErrorChartProps) {
  const [selectedError, setSelectedError] = useState<ErrorType>("absolute");

  const chartData = useMemo(() => {
    if (!niter || niter.length === 0) return [];

    return niter
      .filter((it) => it.i > 0) // Excluir la primera iteración (i=0)
      .map((it) => {
        const dataPoint: Record<string, any> = {
          i: it.i,
        };

        // Agregar los valores de error disponibles
        if (it.error_absolute !== null && it.error_absolute !== undefined) {
          dataPoint.absolute = it.error_absolute;
        }
        if (it.error_relative1 !== null && it.error_relative1 !== undefined) {
          dataPoint.relative1 = it.error_relative1;
        }
        if (it.error_relative2 !== null && it.error_relative2 !== undefined) {
          dataPoint.relative2 = it.error_relative2;
        }
        if (it.error_conditional !== null && it.error_conditional !== undefined) {
          dataPoint.conditional = it.error_conditional;
        }

        return dataPoint;
      });
  }, [niter]);

  const getYAxisLabel = (errorType: ErrorType): string => {
    switch (errorType) {
      case "absolute":
        return "Error Absoluto: |Xⱼ₊₁ - Xⱼ|";
      case "relative1":
        return "Error Relativo 1: |Xⱼ₊₁ - Xⱼ| / |Xⱼ|";
      case "relative2":
        return "Error Relativo 2: |Xⱼ₊₁ - Xⱼ| / |Xⱼ₊₁|";
      case "conditional":
        return "Error Condicional: |f(Xᵢ)|";
      default:
        return "Error";
    }
  };

  const getDataKey = (errorType: ErrorType): string => {
    switch (errorType) {
      case "absolute":
        return "absolute";
      case "relative1":
        return "relative1";
      case "relative2":
        return "relative2";
      case "conditional":
        return "conditional";
      default:
        return "absolute";
    }
  };

  const hasData = chartData.length > 0 && chartData.some((d) => d[getDataKey(selectedError)] !== undefined);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No hay datos de error para graficar
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="error-select" className="text-sm font-medium">
          Tipo de Error:
        </label>
        <Select value={selectedError} onValueChange={(value) => setSelectedError(value as ErrorType)}>
          <SelectTrigger id="error-select" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="absolute">Absoluto</SelectItem>
            <SelectItem value="relative1">Relativo 1</SelectItem>
            <SelectItem value="relative2">Relativo 2</SelectItem>
            <SelectItem value="conditional">Condicional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full h-80 rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="i" 
              label={{ value: "Iteración (i)", position: "insideBottomRight", offset: -10 }}
            />
            <YAxis 
              label={{ value: getYAxisLabel(selectedError), angle: -90, position: "insideLeft" }}
            />
            <Tooltip 
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  if (Math.abs(value) < 0.0001 || Math.abs(value) > 10000) {
                    return value.toExponential(6);
                  }
                  return value.toFixed(8);
                }
                return value;
              }}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={getDataKey(selectedError)}
              stroke="#3b82f6"
              dot={{ fill: '#3b82f6', r: 4 }}
              isAnimationActive={false}
              name={getYAxisLabel(selectedError)}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
