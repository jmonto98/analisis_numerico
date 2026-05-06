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
import { Checkbox } from "@/components/ui/checkbox";

interface ErrorChartProps {
  niter: IterationResult[];
}

type ErrorType = "absolute" | "error" | "relative1" | "relative2" | "conditional";

const ERROR_TYPES: { value: ErrorType; label: string; yLabel: string; formula: string; color: string }[] = [
  { value: "absolute", label: "Absoluto", yLabel: "Absoluto", formula: "|Xⱼ₊₁ - Xⱼ|", color: "#3b82f6" },
  { value: "conditional", label: "Condicional", yLabel: "Condicional", formula: "|f(Xᵢ)|", color: "#ef4444" },
  { value: "error", label: "Relativo", yLabel: "Relativo", formula: "|Xⱼ₊₁ - Xⱼ| / |Xⱼ|", color: "#10b981" },
  { value: "relative1", label: "Relativo 1", yLabel: "Relativo 1", formula: "|Xⱼ₊₁ - Xⱼ| / |Xⱼ|", color: "#f59e0b" },
  { value: "relative2", label: "Relativo 2", yLabel: "Relativo 2", formula: "|Xⱼ₊₁ - Xⱼ| / |Xⱼ₊₁|", color: "#d946ef" },
];

export function ErrorChart({ niter }: ErrorChartProps) {
  const [selectedErrors, setSelectedErrors] = useState<ErrorType[]>(["absolute", "error"]);

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
        if (it.error !== null && it.error !== undefined) {
          dataPoint.error = it.error;
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

  const handleErrorToggle = (errorType: ErrorType, checked: boolean) => {
    setSelectedErrors(prev =>
      checked
        ? [...prev, errorType]
        : prev.filter(e => e !== errorType)
    );
  };

  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No hay datos de error para graficar
      </div>
    );
  }

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#d946ef"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <span className="text-sm font-medium self-center">Tipo de Error:</span>
        {ERROR_TYPES.map((errorType, index) => (
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
          <LineChart data={chartData} margin={{ top: 40, right: 24, left: 16, bottom: 24 }}>
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
                value: "Iteración (i)",
                position: "bottom",
                offset: 0,
                style: { fontSize: 12 },
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
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
            {ERROR_TYPES.map((errorInfo, index) => {
              if (!selectedErrors.includes(errorInfo.value)) return null;
              const hasErrorData = chartData.some(d => d[errorInfo.value] !== undefined);
              if (!hasErrorData) return null;
              return (
                <Line
                  key={errorInfo.value}
                  type="monotone"
                  dataKey={errorInfo.value}
                  stroke={errorInfo.color}
                  dot={{ fill: errorInfo.color, r: 4 }}
                  isAnimationActive={false}
                  name={errorInfo.yLabel}
                  strokeWidth={2}
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
