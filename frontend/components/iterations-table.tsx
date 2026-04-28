"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IterationResult } from "@/lib/types";

interface IterationsTableProps {
  iterations: IterationResult[];
}

export function IterationsTable({ iterations }: IterationsTableProps) {
  if (iterations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Ejecuta el cálculo para ver las iteraciones
      </div>
    );
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num && num !== 0) return "---";
    if (Math.abs(num) < 0.0001 || Math.abs(num) > 10000) {
      return num.toExponential(6);
    }
    return num.toFixed(8);
  };

  // Detectar si es Newton (tiene df_x) o Bisección
  const isNewton = iterations.some((it) => "df_x" in it && it.df_x !== undefined);

  return (
    <div className="overflow-auto max-h-[400px] rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-center font-semibold text-foreground w-24">
              i
            </TableHead>
            <TableHead className="text-center font-semibold text-foreground">
              {isNewton ? "x" : "xm"}
            </TableHead>
            <TableHead className="text-center font-semibold text-foreground">
              {isNewton ? "f(x)" : "f(xm)"}
            </TableHead>
            {isNewton && (
              <TableHead className="text-center font-semibold text-foreground">
                f&apos;(x)
              </TableHead>
            )}
            <TableHead className="text-center font-semibold text-foreground">
              Error
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {iterations.map((iteration, index) => {
            const x = "x" in iteration ? iteration.x : "xm" in iteration ? iteration.xm : 0;
            const fx =
              "f_x" in iteration ? iteration.f_x : "f_xm" in iteration ? iteration.f_xm : 0;
            const dfx = "df_x" in iteration ? iteration.df_x : null;

            return (
              <TableRow
                key={iteration.i}
                className={`border-border ${
                  index === iterations.length - 1
                    ? "bg-primary/10"
                    : "hover:bg-secondary/50"
                }`}
              >
                <TableCell className="text-center font-mono">{iteration.i}</TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {formatNumber(x)}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {formatNumber(fx)}
                </TableCell>
                {isNewton && (
                  <TableCell className="text-center font-mono text-sm">
                    {formatNumber(dfx)}
                  </TableCell>
                )}
                <TableCell className="text-center font-mono text-sm">
                  {formatNumber(iteration.error)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
