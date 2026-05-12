import { SORCalculator } from '@/components/sor-calculator';

export default function SORPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Método SOR (Successive Over-Relaxation)</h1>
        <p className="text-muted-foreground">
          Resuelve sistemas de ecuaciones lineales Ax = b usando el método SOR.
          Combina Gauss-Seidel con un parámetro de relajación ω para convergencia más rápida.
        </p>
      </div>

      <SORCalculator method="sor" endpoint="sor" />
    </div>
  );
}
