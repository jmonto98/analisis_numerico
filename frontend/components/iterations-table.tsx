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

  // Detectar el tipo de método: Newton (df_x), Punto Fijo (xi + g_xi), Secante (xi + f_xi pero no g_xi), o Bisección (xm)
  const isNewton = iterations.some((it) => "df_x" in it && it.df_x !== undefined);
  const isPuntoFijo = iterations.some((it) => "xi" in it && it.xi !== undefined && "g_xi" in it);
  const isSecante = iterations.some((it) => "xi" in it && it.xi !== undefined && "f_xi" in it && !("g_xi" in it));

  return (
    <div className="overflow-auto max-h-[400px] rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-center font-semibold text-foreground w-24">
              i
            </TableHead>
            {isPuntoFijo && (
              <>
                <TableHead className="text-center font-semibold text-foreground">
                  xi
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  g(xi)
                </TableHead>
              </>
            )}
            {isSecante && (
              <>
                <TableHead className="text-center font-semibold text-foreground">
                  xi
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  f(xi)
                </TableHead>
              </>
            )}
            {!isPuntoFijo && !isSecante && (
              <>
                <TableHead className="text-center font-semibold text-foreground">
                  {isNewton ? "x" : "xm"}
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  {isNewton ? "f(x)" : "f(xm)"}
                </TableHead>
              </>
            )}
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
            let col1: number | null | undefined;
            let col2: number | null | undefined;
            let dfx: number | null | undefined = null;

            if (isPuntoFijo) {
              col1 = "xi" in iteration ? iteration.xi : undefined;
              col2 = "g_xi" in iteration ? iteration.g_xi : undefined;
            } else if (isSecante) {
              col1 = "xi" in iteration ? iteration.xi : undefined;
              col2 = "f_xi" in iteration ? iteration.f_xi : undefined;
            } else {
              col1 =
                "x" in iteration ? iteration.x : "xm" in iteration ? iteration.xm : undefined;
              col2 =
                "f_x" in iteration ? iteration.f_x : "f_xm" in iteration ? iteration.f_xm : undefined;
              dfx = "df_x" in iteration ? iteration.df_x : null;
            }

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
                  {formatNumber(col1)}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {formatNumber(col2)}
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
