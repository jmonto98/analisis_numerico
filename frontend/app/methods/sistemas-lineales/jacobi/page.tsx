import { SystemCalculator } from '@/components/systems-calculator';

export default function JacobiPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Método de Jacobi</h1>
        <p className="text-muted-foreground">
          Resuelve sistemas de ecuaciones lineales Ax = b usando el método iterativo de Jacobi.
        </p>
      </div>

      <SystemCalculator method="jacobi" endpoint="jacobi" />
    </div>
  );
}
