import { MethodCalculator } from '@/components/method-calculator';

export const metadata = {
  title: 'Método de Secante',
  description: 'Calcular raíces usando el método de secante',
};

export default function SecantePage() {
  return (
    <MethodCalculator
      method="secante"
      endpoint="secante/"
      defaultFormData={{
        funcion: 'x**3 - x - 2',
        x0: 1,
        x1: 2,
        tol: '1e-6',
        error_type: 'relative',
        niter: 100,
      }}
    />
  );
}
