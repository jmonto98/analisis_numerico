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
  tol: string;
  error_type: ErrorType;
  niter: number;
}

interface BisectionFormData extends CommonParams {
  xi: number;
  xs: number;
}

interface NewtonFormData extends CommonParams {
  x0: number;
}

interface PuntoFijoFormData extends CommonParams {
  x0: number;
}

interface RaicesMultiplesFormData extends CommonParams {
  a: number;
  b: number;
  subintervalos: number;
}

interface SecanteFormData extends CommonParams {
  x0: number;
  x1: number;
}

export type FormData = BisectionFormData | NewtonFormData | PuntoFijoFormData | RaicesMultiplesFormData | SecanteFormData;

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
          Función f(x)
        </Label>
        <Input
          id="funcion"
          value={(formData as CommonParams).funcion}
          onChange={(e) => handleChange("funcion", e.target.value)}
          
          className="bg-secondary border-border font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Usa sintaxis Python: x**2, sin(x), cos(x), exp(x), log(x), sqrt(x)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {method === "biseccion" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="xi" className="text-sm font-medium">
                xi (límite inferior)
              </Label>
              <Input
                id="xi"
                type="number"
                step="any"
                value={(formData as BisectionFormData).xi}
                onChange={(e) => handleChange("xi", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="xs" className="text-sm font-medium">
                xs (límite superior)
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

        {method === "newton" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="x0" className="text-sm font-medium">
              x0 (valor inicial)
            </Label>
            <Input
              id="x0"
              type="number"
              step="any"
              value={(formData as NewtonFormData).x0}
              onChange={(e) => handleChange("x0", parseFloat(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
          </div>
        )}

        {method === "punto-fijo" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="x0" className="text-sm font-medium">
              x0 (valor inicial)
            </Label>
            <Input
              id="x0"
              type="number"
              step="any"
              value={(formData as PuntoFijoFormData).x0}
              onChange={(e) => handleChange("x0", parseFloat(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
          </div>
        )}

        {method === "raices-multiples" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="a" className="text-sm font-medium">
                a (límite inferior)
              </Label>
              <Input
                id="a"
                type="number"
                step="any"
                value={(formData as RaicesMultiplesFormData).a}
                onChange={(e) => handleChange("a", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="b" className="text-sm font-medium">
                b (límite superior)
              </Label>
              <Input
                id="b"
                type="number"
                step="any"
                value={(formData as RaicesMultiplesFormData).b}
                onChange={(e) => handleChange("b", parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
          </>
        )}

        {method === "secante" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="x0" className="text-sm font-medium">
                x0 (primer valor)
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
                x1 (segundo valor)
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

      <div className={`grid ${method === "raices-multiples" ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tol" className="text-sm font-medium">
            Tolerancia
          </Label>
          <Input
            id="tol"
            value={(formData as CommonParams).tol}
            onChange={(e) => handleChange("tol", e.target.value)}
            
            className="bg-secondary border-border font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="error_type" className="text-sm font-medium">
            Tipo de error
          </Label>
          <Select
            value={(formData as CommonParams).error_type}
            onValueChange={(value) => handleChange("error_type", value)}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absolute">Absoluto</SelectItem>
              <SelectItem value="relative">Relativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {method !== "raices-multiples" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="niter" className="text-sm font-medium">
              Máx. iteraciones
            </Label>
            <Input
              id="niter"
              type="number"
              value={(formData as CommonParams).niter}
              onChange={(e) => handleChange("niter", parseInt(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
          </div>
        )}

        {method === "raices-multiples" && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="niter" className="text-sm font-medium">
                Máx. iteraciones
              </Label>
              <Input
                id="niter"
                type="number"
                value={(formData as CommonParams).niter}
                onChange={(e) => handleChange("niter", parseInt(e.target.value) || 0)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subintervalos" className="text-sm font-medium">
                Subintervalos
              </Label>
              <Input
                id="subintervalos"
                type="number"
                value={(formData as RaicesMultiplesFormData).subintervalos}
                onChange={(e) => handleChange("subintervalos", parseInt(e.target.value) || 20)}
                className="bg-secondary border-border"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
