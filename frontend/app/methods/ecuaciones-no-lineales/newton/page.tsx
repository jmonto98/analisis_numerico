import { MethodCalculator } from '@/components/method-calculator';

export const metadata = {
  title: 'Método de Newton',
  description: 'Calcular raíces usando el método de Newton',
};

export default function NewtonPage() {
  return (
    <MethodCalculator
      method="newton"
      endpoint="newton/"
      defaultFormData={{
        funcion: 'x**3 - x - 2',
        x0: 1.5,
        tol: '1e-6',
        error_type: 'relative',
        niter: 100,
      }}
    />
  );
}
