'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            Calculadora de <span className="text-primary">Métodos Numéricos</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Herramienta interactiva para análisis numérico con visualización gráfica en tiempo real
          </p>
          <Link href="/methods">
            <Button size="lg" className="gap-2">
              Comenzar <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Ecuaciones No Lineales</CardTitle>
              <CardDescription>
                Métodos para encontrar raíces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li>✓ Bisección</li>
                <li>✓ Newton</li>
                <li>✓ Punto Fijo</li>                
                <li>✓ Raíces Múltiples</li>
                <li>✓ Regla Falsa</li>
                <li>✓ Secante</li>
              </ul>
              <Link href="/methods/ecuaciones-no-lineales">
                <Button variant="outline" className="w-full">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle>Sistemas de Ecuaciones</CardTitle>
              <CardDescription>
                Resolución de sistemas lineales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li>○ Eliminación Gaussiana</li>
                <li>○ Gauss-Jordan</li>
                <li>○ Jacobi</li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 opacity-50 cursor-not-allowed">
            <CardHeader>
              <CardTitle>Interpolación</CardTitle>
              <CardDescription>
                Ajuste polinomial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li>○ Lagrange</li>
                <li>○ Diferencias Divididas</li>
                <li>○ Splines</li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="bg-card border-2 border-border rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Características</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">📊 Visualización</h3>
              <p className="text-muted-foreground text-sm">
                Gráficas interactivas con Recharts para visualizar funciones y raíces encontradas
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📈 Análisis Detallado</h3>
              <p className="text-muted-foreground text-sm">
                Tabla de iteraciones con seguimiento del proceso de convergencia
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⚡ Cálculo Rápido</h3>
              <p className="text-muted-foreground text-sm">
                Backend en FastAPI con sympy para evaluación precisa de expresiones
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎨 Diseño Moderno</h3>
              <p className="text-muted-foreground text-sm">
                Interfaz responsive con tema claro/oscuro y componentes accesibles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
