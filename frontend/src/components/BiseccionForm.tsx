import React from "react";
import { Method } from "../types";

type Props = {
  funcion: string;
  xi: string;
  xs: string;
  tol: string;
  niter: string;
  errorType: "absolute" | "relative";
  method: Method;
  generateGraph: boolean;
  onChange: (field: string, value: string) => void;
  onToggleGenerateGraph: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  loading: boolean;
};

const InputField = ({
  id,
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  step,
}: any) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label fw-bold">
      {label}
    </label>
    <input
      id={id}
      type={type}
      className="form-control"
      value={value}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(id, e.target.value)}
    />
  </div>
);

const SelectField = ({
  id,
  label,
  value,
  options,
  onChange,
}: any) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label fw-bold">
      {label}
    </label>
    <select
      id={id}
      className="form-select"
      value={value}
      onChange={(e) => onChange(id, e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function BiseccionForm({
  funcion,
  xi,
  xs,
  tol,
  niter,
  errorType,
  method,
  generateGraph,
  onChange,
  onToggleGenerateGraph,
  onSubmit,
  onReset,
  loading,
}: Props) {
  return (
    <div className="form-card">
      <form onSubmit={onSubmit}>
        
        <InputField
          id="funcion"
          label="Función f(x)"
          value={funcion}
          placeholder="x^3 - x - 2"
          onChange={onChange}
        />

        <SelectField
          id="method"
          label="Seleccione el Método deseado"
          value={method}
          onChange={onChange}
          options={[
            { value: "biseccion", label: "Bisección" },
            { value: "punto_fijo", label: "Punto Fijo" },
            { value: "newton", label: "Newton" },
            { value: "regla_falsa", label: "Regla Falsa" },
            { value: "secante", label: "Secante" },
            { value: "raices_multiples", label: "Raíces Múltiples" },
          ]}
        />

        <div className="row">
          <div className="col-md-6">
            <InputField
              id="xi"
              label="xi"
              type="number"
              value={xi}
              placeholder="1"
              onChange={onChange}
            />
          </div>
          <div className="col-md-6">
            <InputField
              id="xs"
              label="xs"
              type="number"
              value={xs}
              placeholder="2"
              onChange={onChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <InputField
              id="tol"
              label="Tolerancia"
              type="number"
              step="any"
              value={tol}
              placeholder="1e-6"
              onChange={onChange}
            />
          </div>
          <div className="col-md-6">
            <InputField
              id="niter"
              label="Iteraciones"
              type="number"
              value={niter}
              placeholder="50"
              onChange={onChange}
            />
          </div>
        </div>

        <SelectField
          id="errorType"
          label="Tipo de error"
          value={errorType}
          onChange={onChange}
          options={[
            { value: "relative", label: "Relativo" },
            { value: "absolute", label: "Absoluto" },
          ]}
        />

        <div className="form-check form-switch mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="generateGraph"
            checked={generateGraph}
            onChange={onToggleGenerateGraph}
          />
          <label className="form-check-label" htmlFor="generateGraph">
            Generar gráfica
          </label>
        </div>

        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Calculando..." : "Calcular"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onReset}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}