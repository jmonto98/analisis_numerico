import { SystemCalculator } from '@/components/systems-calculator';

export default function GaussSeidelPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Método de Gauss-Seidel</h1>
        <p className="text-muted-foreground">
          Resuelve sistemas de ecuaciones lineales Ax = b usando el método iterativo de Gauss-Seidel.
          Converge más rápido que Jacobi usando los valores nuevos inmediatamente.
        </p>
      </div>

      <SystemCalculator method="gauss-seidel" endpoint="gauss-seidel" />
    </div>
  );
}
