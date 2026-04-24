from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from metodos_ml.biseccion import biseccion, graph_points

app = FastAPI(
    title="API de Bisección",
    version="0.1.0",
    description="Backend FastAPI para el método de bisección de análisis numérico.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BiseccionRequest(BaseModel):
    method: Literal["biseccion", "punto_fijo", "newton", "regla_falsa", "secante", "raices_multiples"]
    funcion: str
    xi: float
    xs: float
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    error_type: Literal["absolute", "relative"] = Field(
        "relative",
        description="Tipo de error a utilizar en la condición de paro: absolute o relative",
    )


class BiseccionIteration(BaseModel):
    i: int
    xm: float
    f_xm: float
    error: Optional[float] = None


class BiseccionResponse(BaseModel):
    iterations: List[BiseccionIteration]
    root: Optional[float]
    message: str
    success: bool
    error_type: str


class GraphPoint(BaseModel):
    x: float
    y: Optional[float] = None


class GraphRequest(BaseModel):
    funcion: str
    xi: float
    xs: float
    n_points: int = Field(180, gt=1, description="Cantidad de puntos a usar para la gráfica")


class GraphResponse(BaseModel):
    points: List[GraphPoint]
    success: bool
    message: str


@app.post("/api/biseccion", response_model=BiseccionResponse)
def compute_biseccion(request: BiseccionRequest):
    try:
        if request.method == "biseccion":
            result = biseccion(
                request.funcion,
                request.xi,
                request.xs,
                request.tol,
                request.niter,
                request.error_type,
            )
        else:
            raise HTTPException(status_code=400, detail=f"Método {request.method} no implementado aún.")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result


@app.post("/api/grafica", response_model=GraphResponse)
def compute_graph(request: GraphRequest):
    try:
        points = graph_points(request.funcion, request.xi, request.xs, request.n_points)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "points": points,
        "success": True,
        "message": "Gráfica generada correctamente.",
    }
