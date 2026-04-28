"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHODS, type NumericalMethod } from "@/lib/types";

interface MethodSelectorProps {
  value: NumericalMethod;
  onChange: (value: NumericalMethod) => void;
}

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  const selectedMethod = METHODS.find((m) => m.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Metodo Numerico
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as NumericalMethod)}>
        <SelectTrigger className="w-full bg-secondary border-border">
          <SelectValue placeholder="Selecciona un metodo" />
        </SelectTrigger>
        <SelectContent>
          {METHODS.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedMethod && (
        <p className="text-xs text-muted-foreground">
          {selectedMethod.description}
        </p>
      )}
    </div>
  );
}
