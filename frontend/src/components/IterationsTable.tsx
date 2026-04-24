import React from "react";
import { Iteration } from "../types";

type Props = {
  iterations: Iteration[];
};

export default function IterationsTable({ iterations }: Props) {
  return (
    <div className="table-card">
      <h5 className="mb-3">Tabla de Iteraciones</h5>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Iteración</th>
              <th>xm</th>
              <th>f(xm)</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {iterations.map((row) => (
              <tr key={row.i}>
                <td>{row.i}</td>
                <td>{row.xm.toPrecision(12)}</td>
                <td>{row.f_xm.toExponential(6)}</td>
                <td>{row.error === null ? "—" : row.error.toExponential(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
