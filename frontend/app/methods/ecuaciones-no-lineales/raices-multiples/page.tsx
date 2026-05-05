import { MethodCalculator } from '@/components/method-calculator';

export const metadata = {
  title: 'Método de Raíces Múltiples',
  description: 'Encontrar raíces múltiples usando método de Newton',
};

export default function RaicesMultiplesPage() {
  return (
    <MethodCalculator
      method="raices-multiples"
      endpoint="raices-multiples/"
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
