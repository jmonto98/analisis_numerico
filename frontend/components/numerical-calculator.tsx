"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { MethodSelector } from "./method-selector";
import { ParameterForm, type FormData } from "./parameter-form";
import { IterationsTable } from "./iterations-table";
import { FunctionChart } from "./function-chart";
import { ResultsSummary } from "./results-summary";
import { API_BASE_URL } from "@/lib/api-config";
import { METHODS, type NumericalMethod, type IterationResult, type MethodResponse } from "@/lib/types";

const getDefaultFormData = (method: NumericalMethod): FormData => {
  const common = {
    funcion: "x^3 - x - 2",
    tolerancia: "1e-6",
    tipoError: "relativo" as const,
    maxIteraciones: 100,
  };

  switch (method) {
    case "biseccion":
      return { ...common, x1: 1, xs: 2 };
    case "punto-fijo":
      return { ...common, x0: 1.5 };
    case "newton-raphson":
      return { ...common, derivada: "3*x^2 - 1", x0: 1.5 };
    case "secante":
      return { ...common, x0: 1, x1: 2 };
  }
};

export function NumericalCalculator() {
  const [selectedMethod, setSelectedMethod] = useState<NumericalMethod>("biseccion");
  const [formData, setFormData] = useState<FormData>(getDefaultFormData("biseccion"));
  const [iterations, setIterations] = useState<IterationResult[]>([]);
  const [root, setRoot] = useState<number | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodChange = useCallback((method: NumericalMethod) => {
    setSelectedMethod(method);
    setFormData(getDefaultFormData(method));
    setIterations([]);
    setRoot(undefined);
    setMessage(undefined);
    setError(null);
  }, []);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    const methodConfig = METHODS.find((m) => m.id === selectedMethod);
    if (!methodConfig) {
      setError("Metodo no encontrado");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        tolerancia: parseFloat(formData.tolerancia),
      };

      const response = await fetch(`${API_BASE_URL}${methodConfig.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data: MethodResponse = await response.json();

      if (data.success) {
        setIterations(data.iterations);
        setRoot(data.root);
        setMessage(data.message);
      } else {
        setError(data.message || "Error en el calculo");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al conectar con el servidor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getChartBounds = () => {
    if (selectedMethod === "biseccion" && "x1" in formData && "xs" in formData) {
      const margin = Math.abs(formData.xs - formData.x1) * 0.5;
      return {
        xMin: Math.min(formData.x1, formData.xs) - margin,
        xMax: Math.max(formData.x1, formData.xs) + margin,
      };
    }
    if ("x0" in formData) {
      return { xMin: formData.x0 - 5, xMax: formData.x0 + 5 };
    }
    return { xMin: -10, xMax: 10 };
  };

  const chartBounds = getChartBounds();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Calculadora de Metodos Numericos
          </h1>
          <p className="text-muted-foreground">
            Herramienta para el analisis y calculo de raices de funciones
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuracion */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-foreground">Configuracion</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <MethodSelector value={selectedMethod} onChange={handleMethodChange} />
              <ParameterForm
                method={selectedMethod}
                formData={formData}
                onChange={setFormData}
              />
              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Calculando...
                  </span>
                ) : (
                  "Calcular"
                )}
              </Button>
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de resultados */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ResultsSummary iterations={iterations} root={root} message={message} />

            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">Grafica de la Funcion</CardTitle>
              </CardHeader>
              <CardContent>
                <FunctionChart
                  funcion={formData.funcion}
                  iterations={iterations}
                  xMin={chartBounds.xMin}
                  xMax={chartBounds.xMax}
                />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">Tabla de Iteraciones</CardTitle>
              </CardHeader>
              <CardContent>
                <IterationsTable iterations={iterations} />
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Configura la URL del backend en{" "}
            <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">
              NEXT_PUBLIC_API_URL
            </code>
          </p>
        </footer>
      </div>
    </div>
  );
}
