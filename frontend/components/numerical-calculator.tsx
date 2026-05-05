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
    funcion: "x**3 - x - 2",
    tol: "1e-6",
    error_type: "relative" as const,
    niter: 100,
  };

  switch (method) {
    case "biseccion":
      return { ...common, xi: 1, xs: 2 };
    case "newton":
      return { ...common, x0: 1.5 };
    case "punto-fijo":
      return { ...common, x0: 1.5 };
    case "raices-multiples":
      return { ...common, x0: 1.5 };
    case "secante":
      return { ...common, x0: 1, x1: 2 };
  }
};

const getEmptyFormData = (method: NumericalMethod): FormData => {
  const common = {
    funcion: "",
    tol: "",
    error_type: "relative" as const,
    niter: 0,
  };

  switch (method) {
    case "biseccion":
      return { ...common, xi: 0, xs: 0 };
    case "newton":
      return { ...common, x0: 0 };
    case "punto-fijo":
      return { ...common, x0: 0 };
    case "raices-multiples":
      return { ...common, x0: 0 };
    case "secante":
      return { ...common, x0: 0, x1: 0 };
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
    // Mantener valores comunes (función, tolerancia, error_type, iteraciones)
    setFormData((prevData) => {
      const commonData = {
        funcion: prevData.funcion,
        tol: prevData.tol,
        error_type: prevData.error_type,
        niter: prevData.niter,
      };
      
      // Agregar parámetros específicos del nuevo método
      const newMethod = method;
      switch (newMethod) {
        case "biseccion":
          return { ...commonData, xi: 1, xs: 2 } as FormData;
        case "newton":
          return { ...commonData, x0: 1.5 } as FormData;
        case "punto-fijo":
          return { ...commonData, x0: 1.5 } as FormData;
        case "raices-multiples":
          return { ...commonData, x0: 1.5 } as FormData;
        case "secante":
          return { ...commonData, x0: 1, x1: 2 } as FormData;
      }
    });
    // Limpiar solo los resultados
    setIterations([]);
    setRoot(undefined);
    setMessage(undefined);
    setError(null);
  }, []);

  const handleClear = () => {
    setFormData(getEmptyFormData(selectedMethod));
    setIterations([]);
    setRoot(undefined);
    setMessage(undefined);
    setError(null);
    setIsLoading(false);
  };

  const buildPayload = () => {
    const common = {
      funcion: formData.funcion,
      tol: parseFloat(formData.tol),
      error_type: formData.error_type,
      niter: formData.niter,
    };

    if (selectedMethod === "biseccion" && "xi" in formData) {
      return {
        ...common,
        xi: formData.xi,
        xs: formData.xs,
      };
    } else if (selectedMethod === "newton" && "x0" in formData && !("x1" in formData) && !("a" in formData)) {
      return {
        ...common,
        x0: formData.x0,
      };
    } else if (selectedMethod === "punto-fijo" && "x0" in formData && !("x1" in formData) && !("a" in formData)) {
      return {
        ...common,
        x0: formData.x0,
      };
    } else if (selectedMethod === "raices-multiples" && "x0" in formData && !("x1" in formData) && !("a" in formData)) {
      return {
        ...common,
        x0: (formData as any).x0,
      };
    } else if (selectedMethod === "secante" && "x0" in formData && "x1" in formData && !("a" in formData)) {
      return {
        ...common,
        x0: formData.x0,
        x1: (formData as any).x1,
      };
    }

    return null;
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    const methodConfig = METHODS.find((m) => m.id === selectedMethod);
    if (!methodConfig) {
      setError("Método no encontrado");
      setIsLoading(false);
      return;
    }

    const payload = buildPayload();
    if (!payload) {
      setError("Error al construir el payload");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Enviando payload al backend:", payload);

      const response = await fetch(`${API_BASE_URL}${methodConfig.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error del servidor: ${response.status}`);
      }

      const data: MethodResponse = await response.json();

      if (data.success) {
        setIterations(data.iterations);
        setRoot(data.root);
        setMessage(data.message);
      } else {
        setError(data.message || "Error en el cálculo");
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
    // Margen consistente: 0.5
    const MARGIN = 0.5;
    
    if (selectedMethod === "biseccion" && "xi" in formData && "xs" in formData) {
      return {
        xMin: Math.min(formData.xi, formData.xs) - MARGIN,
        xMax: Math.max(formData.xi, formData.xs) + MARGIN,
      };
    }
    if (selectedMethod === "raices-multiples" && "x0" in formData && !("x1" in formData) && !("a" in formData)) {
      return {
        xMin: (formData as any).x0 - MARGIN,
        xMax: (formData as any).x0 + MARGIN,
      };
    }
    if (selectedMethod === "secante" && "x0" in formData && "x1" in formData) {
      return {
        xMin: Math.min(formData.x0, (formData as any).x1) - MARGIN,
        xMax: Math.max(formData.x0, (formData as any).x1) + MARGIN,
      };
    }
    if ("x0" in formData) {
      // Para newton y punto-fijo
      return { xMin: formData.x0 - MARGIN, xMax: formData.x0 + MARGIN };
    }
    return { xMin: -10, xMax: 10 };
  };

  const chartBounds = getChartBounds();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Calculadora de Métodos Numéricos
          </h1>
          <p className="text-muted-foreground">
            Herramienta para el análisis y cálculo de raíces de funciones
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuracion */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-foreground">Configuración</CardTitle>
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
              <Button
                onClick={handleClear}
                variant="secondary"
                className="w-full"
                disabled={isLoading}
              >
                Limpiar
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
                <CardTitle className="text-lg text-foreground">Gráfica de la Función</CardTitle>
              </CardHeader>
              <CardContent>
                <FunctionChart
                  funcion={formData.funcion}
                  niter={iterations}
                  xi={chartBounds.xMin}
                  xs={chartBounds.xMax}
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
            Powered by Next.js, FastAPI y React. Developed by Daniel Posada y John Montoya.
          </p>
        </footer>
      </div>
    </div>
  );
}
