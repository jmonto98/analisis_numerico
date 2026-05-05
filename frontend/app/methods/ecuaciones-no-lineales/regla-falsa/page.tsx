"use client";

import { MethodCalculator } from "@/components/method-calculator";

export default function ReglaFalsaPage() {
  return (
    <MethodCalculator
      method="regla-falsa"
      endpoint="regla-falsa/"
      defaultFormData={{
        funcion: 'x**3 - x - 2',
        a: 1,
        b: 2,
        tol: '1e-6',
        error_type: 'relative',
        niter: 100,
    }}
    />
  );
}

