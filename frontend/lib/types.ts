export type NumericalMethod = "biseccion" | "newton";

export type ErrorType = "relative" | "absolute";

export interface IterationResult {
  i: number;
  xm?: number;
  x?: number;
  f_xm?: number;
  f_x?: number;
  df_x?: number;
  error: number | null;
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

export type MethodParams = BisectionParams | NewtonParams;

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
];
