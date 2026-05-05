'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const methods = [
  { id: 'biseccion', label: 'Bisección' },
  { id: 'newton', label: 'Newton' },
  { id: 'punto-fijo', label: 'Punto Fijo' },
  { id: 'raices-multiples', label: 'Raíces Múltiples' },
  { id: 'regla-falsa', label: 'Regla Falsa' },
  { id: 'secante', label: 'Secante' },
];

export default function EcuacionesNoLinealesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentMethod = pathname.split('/').pop();

  return (
    <div className="flex flex-col">
      {/* Tabs Navigation */}
      <div className="border-b border-border bg-secondary/30">
        <div className="flex overflow-x-auto">
          {methods.map((method) => (
            <Link
              key={method.id}
              href={`/methods/ecuaciones-no-lineales/${method.id}`}
              className={cn(
                'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                currentMethod === method.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {method.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
