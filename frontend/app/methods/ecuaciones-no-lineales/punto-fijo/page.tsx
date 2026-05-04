import { MethodCalculator } from '@/components/method-calculator';

export const metadata = {
  title: 'Método de Punto Fijo',
  description: 'Calcular raíces usando el método de punto fijo',
};

export default function PuntoFijoPage() {
  return (
    <MethodCalculator
      method="punto-fijo"
      endpoint="punto-fijo/"
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
