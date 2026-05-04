'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const categories = [
  {
    id: 'ecuaciones-no-lineales',
    label: 'Ecuaciones No Lineales',
    description: 'Métodos para encontrar raíces de ecuaciones',
  },
  {
    id: 'sistemas-ecuaciones',
    label: 'Sistemas de Ecuaciones',
    description: 'Métodos para resolver sistemas lineales',
    disabled: true,
  },
  {
    id: 'interpolacion',
    label: 'Interpolación',
    description: 'Métodos de interpolación polinomial',
    disabled: true,
  },
];

export default function MethodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-2">Métodos Numéricos</h1>
          <p className="text-lg text-muted-foreground">Calculadora interactiva de análisis numérico</p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.disabled ? '#' : `/methods/${category.id}`}
              className={cn(
                'p-4 rounded-lg border-2 transition-all',
                pathname.includes(category.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-card',
                category.disabled && 'opacity-50 cursor-not-allowed hover:border-border',
              )}
            >
              <h3 className="font-semibold mb-1">{category.label}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              {category.disabled && <p className="text-xs text-primary mt-2">Próximamente</p>}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border-2 border-border rounded-lg">{children}</div>
      </div>
    </div>
  );
}
