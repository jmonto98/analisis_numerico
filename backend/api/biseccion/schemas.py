from typing import List, Optional, Literal
from pydantic import BaseModel, Field


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