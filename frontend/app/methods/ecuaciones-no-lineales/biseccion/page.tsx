import { MethodCalculator } from '@/components/method-calculator';

export const metadata = {
  title: 'Método de Bisección',
  description: 'Calcular raíces usando el método de bisección',
};

export default function BiseccionPage() {
  return (
    <MethodCalculator
      method="biseccion"
      endpoint="biseccion/"
      defaultFormData={{
        funcion: 'x**3 - x - 2',
        xi: 1,
        xs: 2,
        tol: '1e-6',
        error_type: 'relative',
        niter: 100,
      }}
    />
  );
}
