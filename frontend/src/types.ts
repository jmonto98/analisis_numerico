export type Iteration = {
  i: number;
  xm: number;
  f_xm: number;
  error: number | null;
};

export type BiseccionResponse = {
  iterations: Iteration[];
  root: number | null;
  message: string;
  success: boolean;
  error_type: string;
};

export type GraphPoint = {
  x: number;
  y: number | null;
};

export type GraphResponse = {
  points: GraphPoint[];
  success: boolean;
  message: string;
};

export type Method = "biseccion" | "punto_fijo" | "newton" | "regla_falsa" | "secante" | "raices_multiples";
