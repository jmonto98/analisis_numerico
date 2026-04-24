import React, { useMemo, useState } from "react";
import { GraphPoint } from "../types";

type Props = {
  points: GraphPoint[];
};

export default function FunctionGraph({ points }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validPoints = useMemo(
    () => points.filter((point) => point.y !== null && Number.isFinite(point.y)),
    [points]
  );

  if (validPoints.length < 2) {
    return (
      <div className="graph-card">
        <h5 className="mb-3">Gráfica</h5>
        <div className="graph-empty">No se puede generar la gráfica con los datos actuales.</div>
      </div>
    );
  }

  const xValues = validPoints.map((point) => point.x);
  const yValues = validPoints.map((point) => point.y as number);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const renderGraph = (width: number, height: number) => {
    const padding = 40;

    const toX = (x: number) => {
      if (xMax === xMin) return width / 2;
      return padding + ((x - xMin) / (xMax - xMin)) * (width - padding * 2);
    };

    const toY = (y: number) => {
      if (yMax === yMin) return height / 2;
      return height - padding - ((y - yMin) / (yMax - yMin)) * (height - padding * 2);
    };

    const pathData = validPoints
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command} ${toX(point.x)} ${toY(point.y as number)}`;
      })
      .join(" ");

    const xAxisY = toY(0);
    const yAxisX = toX(0);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="graph-chart" role="img" aria-label="Gráfica de la función">
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" rx="16" />
        <g stroke="#d1d5db" strokeWidth="1">
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
          <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} />
        </g>
        <g stroke="#94a3b8" strokeWidth="1">
          {Array.from({ length: 4 }).map((_, index) => {
            const y = padding + ((height - padding * 2) / 4) * index;
            return <line key={`h-${index}`} x1={padding} y1={y} x2={width - padding} y2={y} />;
          })}
          {Array.from({ length: 4 }).map((_, index) => {
            const x = padding + ((width - padding * 2) / 4) * index;
            return <line key={`v-${index}`} x1={x} y1={padding} x2={x} y2={height - padding} />;
          })}
        </g>
        <g stroke="#0f172a" strokeWidth="2" fill="none">
          {xAxisY >= padding && xAxisY <= height - padding && (
            <line x1={padding} y1={xAxisY} x2={width - padding} y2={xAxisY} />
          )}
          {yAxisX >= padding && yAxisX <= width - padding && (
            <line x1={yAxisX} y1={padding} x2={yAxisX} y2={height - padding} />
          )}
        </g>
        <path d={pathData} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <>
      <div className="graph-card">
        <h5 className="mb-3">Gráfica</h5>
        <div
          className="graph-clickable"
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: "pointer" }}
        >
          {renderGraph(760, 320)}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Gráfica Ampliada</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {renderGraph(1200, 600)}
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && <div className="modal-backdrop fade show" onClick={() => setIsModalOpen(false)}></div>}
    </>
  );
}
