from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class PuntoFijoRequest(BaseModel):
    funcion: str = Field(..., description="Función f(x) donde f(x)=0")
    x0: float = Field(..., description="Valor inicial")
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    error_type: Literal["absolute", "relative"] = Field(
        "absolute",
        description="Tipo de error a utilizar en la condición de parada: absolute o relative",
    )


class PuntoFijoIteration(BaseModel):
    i: int
    xi: float
    g_xi: float
    error: Optional[float] = None
    error_absolute: Optional[float] = None
    error_relative1: Optional[float] = None
    error_relative2: Optional[float] = None
    error_conditional: Optional[float] = None


class PuntoFijoResponse(BaseModel):
    iterations: List[PuntoFijoIteration]
    root: Optional[float]
    message: str
    success: bool
    error_type: str
