"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NumericalMethod, ErrorType } from "@/lib/types";

interface CommonParams {
  funcion: string;
  tolerancia: string;
  tipoError: ErrorType;
  maxIteraciones: number;
}

interface BisectionFormData extends CommonParams {
  x1: number;
  xs: number;
}

interface FixedPointFormData extends CommonParams {
  x0: number;
}

interface NewtonRaphsonFormData extends CommonParams {
  derivada: string;
  x0: number;
}

interface SecanteFormData extends CommonParams {
  x0: number;
  x1: number;
}

export type FormData = BisectionFormData | FixedPointFormData | NewtonRaphsonFormData | SecanteFormData;

interface ParameterFormProps {
  method: NumericalMethod;
  formData: FormData;
  onChange: (data: FormData) => void;
}

export function ParameterForm({ method, formData, onChange }: ParameterFormProps) {
  const handleChange = (field: string, value: string | number) => {
    onChange({ ...formData, [field]: value } as FormData);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="funcion" className="text-sm font-medium">
          Funcion f(x)
        </Label>
        <Input
          id="funcion"
          value={(formData as CommonParams).funcion}
          onChange={(e) => handleChange("funcion", e.target.value)}
          placeholder="Ej: x^3 - x - 2"
          className="bg-secondary border-border font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Usa sintaxis matematica: x^2, sin(x), cos(x), exp(x), log(x), sqrt(x)
        </p>
      </div>

      {method === "newton-raphson" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="derivada" className="text-sm font-medium">
            {"Derivada f'(x)"}
          </Label>
          <Input
            id="derivada"
            value={(formData as NewtonRaphsonFormData).derivada || ""}
            onChange={(e) => handleChange("derivada", e.target.value)}
            placeholder="Ej: 3*x^2 - 1"
            className="bg-secondary border-border font-mono"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {method === "biseccion" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="x1" className="text-sm font-medium">
                x1 (limite inferior)
              </Label>
              <Input
                id="x1"
                type="number"
                step="any"
                value={(formData as BisectionFormData).x1}
                onChange={(e) => handleChange("x1", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="xs" className="text-sm font-medium">
                xs (limite superior)
              </Label>
              <Input
                id="xs"
                type="number"
                step="any"
                value={(formData as BisectionFormData).xs}
                onChange={(e) => handleChange("xs", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
          </>
        )}

        {(method === "punto-fijo" || method === "newton-raphson") && (
          <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
            <Label htmlFor="x0" className="text-sm font-medium">
              x0 (valor inicial)
            </Label>
            <Input
              id="x0"
              type="number"
              step="any"
              value={(formData as FixedPointFormData | NewtonRaphsonFormData).x0}
              onChange={(e) => handleChange("x0", parseFloat(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
          </div>
        )}

        {method === "secante" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="x0" className="text-sm font-medium">
                x0
              </Label>
              <Input
                id="x0"
                type="number"
                step="any"
                value={(formData as SecanteFormData).x0}
                onChange={(e) => handleChange("x0", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="x1" className="text-sm font-medium">
                x1
              </Label>
              <Input
                id="x1"
                type="number"
                step="any"
                value={(formData as SecanteFormData).x1}
                onChange={(e) => handleChange("x1", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tolerancia" className="text-sm font-medium">
            Tolerancia
          </Label>
          <Input
            id="tolerancia"
            type="text"
            value={(formData as CommonParams).tolerancia}
            onChange={(e) => handleChange("tolerancia", e.target.value)}
            placeholder="Ej: 1e-6, 1e-10"
            className="bg-secondary border-border font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Notacion cientifica: 1e-6, 1e-10
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxIteraciones" className="text-sm font-medium">
            Max. Iteraciones
          </Label>
          <Input
            id="maxIteraciones"
            type="number"
            value={(formData as CommonParams).maxIteraciones}
            onChange={(e) => handleChange("maxIteraciones", parseInt(e.target.value) || 100)}
            className="bg-secondary border-border"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Tipo de Error</Label>
        <Select
          value={(formData as CommonParams).tipoError}
          onValueChange={(v) => handleChange("tipoError", v)}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relativo">Error Relativo</SelectItem>
            <SelectItem value="absoluto">Error Absoluto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
