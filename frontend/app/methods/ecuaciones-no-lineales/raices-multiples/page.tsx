import { MethodCalculator } from '@/components/method-calculator';

export const metadata = {
  title: 'Método de Raíces Múltiples',
  description: 'Encontrar múltiples raíces en un intervalo',
};

export default function RaicesMultiplesPage() {
  return (
    <MethodCalculator
      method="raices-multiples"
      endpoint="raices-multiples/"
      defaultFormData={{
        funcion: 'x**3 - x - 2',
        a: -2,
        b: 2,
        subintervalos: 20,
        tol: '1e-6',
        error_type: 'relative',
        niter: 100,
      }}
    />
  );
}
