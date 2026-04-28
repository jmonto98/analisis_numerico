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
        Ejecuta el calculo para ver las iteraciones
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.0001 || Math.abs(num) > 10000) {
      return num.toExponential(6);
    }
    return num.toFixed(8);
  };

  return (
    <div className="overflow-auto max-h-[400px] rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-center font-semibold text-foreground w-24">
              Iteracion
            </TableHead>
            <TableHead className="text-center font-semibold text-foreground">
              xm
            </TableHead>
            <TableHead className="text-center font-semibold text-foreground">
              f(xm)
            </TableHead>
            <TableHead className="text-center font-semibold text-foreground">
              Error
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {iterations.map((iteration, index) => (
            <TableRow
              key={iteration.iteracion}
              className={`border-border ${
                index === iterations.length - 1
                  ? "bg-primary/10"
                  : "hover:bg-secondary/50"
              }`}
            >
              <TableCell className="text-center font-mono">
                {iteration.iteracion}
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                {formatNumber(iteration.xm)}
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                {formatNumber(iteration.fxm)}
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                {formatNumber(iteration.error)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
