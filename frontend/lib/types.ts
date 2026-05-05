export type NumericalMethod = "biseccion" | "newton" | "punto-fijo" | "raices-multiples" | "secante" | "regla-falsa";

export type ErrorType = "relative" | "absolute";

export interface IterationResult {
  i: number;
  xm?: number;
  x?: number;
  xi?: number;
  xr?: number;
  a?: number;
  b?: number;
  f_xm?: number;
  f_x?: number;
  f_xi?: number;
  f_xr?: number;
  g_xi?: number;
  df_x?: number;
  error: number | null;
  // Error types for visualization
  error_absolute?: number | null;
  error_relative?: number | null;
  error_relative1?: number | null;
  error_relative2?: number | null;
  error_conditional?: number | null;
}

export interface MethodResponse {
  success: boolean;
  iterations: IterationResult[];
  root?: number;
  message?: string;
  error_type: string;
}

export interface BisectionParams {
  funcion: string;
  xi: number;
  xs: number;
  tol: number;
  error_type: ErrorType;
  niter: number;
}

export interface NewtonParams {
  funcion: string;
  x0: number;
  tol: number;
  error_type: ErrorType;
  niter: number;
}

export interface PuntoFijoParams {
  funcion: string;
  x0: number;
  tol: number;
  error_type: ErrorType;
  niter: number;
}

export interface RaicesMultiplesParams {
  funcion: string;
  x0: number;
  tol: number;
  error_type: ErrorType;
  niter: number;
}

export interface SecanteParams {
  funcion: string;
  x0: number;
  x1: number;
  tol: number;
  error_type: ErrorType;
  niter: number;
}

export interface ReglaFalsaParams {
  funcion: string;
  a: number;
  b: number;
  tol: number;
  error_type: ErrorType;
  niter: number;
}

export type MethodParams = BisectionParams | NewtonParams | PuntoFijoParams | RaicesMultiplesParams | ReglaFalsaParams | SecanteParams;

export interface MethodConfig {
  id: NumericalMethod;
  name: string;
  description: string;
  endpoint: string;
}

export const METHODS: MethodConfig[] = [
  {
    id: "biseccion",
    name: "Bisección",
    description: "Método de búsqueda de raíces por división de intervalos",
    endpoint: "/biseccion",
  },
  {
    id: "newton",
    name: "Newton-Raphson",
    description: "Método que usa la derivada (calculada automáticamente) para convergencia rápida",
    endpoint: "/newton",
  },
  {
    id: "punto-fijo",
    name: "Punto Fijo",
    description: "Método que convierte la ecuación a una iteración g(x) = f(x) + x",
    endpoint: "/punto-fijo",
  },
  {
    id: "raices-multiples",
    name: "Raíces Múltiples",
    description: "Método para encontrar todas las raíces en un intervalo especificado",
    endpoint: "/raices-multiples",
  },
  {
    id: "secante",
    name: "Secante",
    description: "Método que aproxima la derivada usando dos puntos iniciales",
    endpoint: "/secante",
  },
  {
    id: "regla-falsa",
    name: "Regla Falsa",
    description: "Método que usa una recta por dos puntos del intervalo para estimar la raíz",
    endpoint: "/regla-falsa",
  },
];
