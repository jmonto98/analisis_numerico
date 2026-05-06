'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const methods = [
  { id: 'jacobi', label: 'Jacobi' },
  { id: 'gauss-seidel', label: 'Gauss-Seidel (Próximamente)', disabled: true },
  { id: 'sor', label: 'SOR (Próximamente)', disabled: true },
];

export default function SistemasLinealesLayout({
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
              href={method.disabled ? '#' : `/methods/sistemas-lineales/${method.id}`}
              className={cn(
                'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                method.disabled && 'cursor-not-allowed opacity-50',
                currentMethod === method.id && !method.disabled
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
