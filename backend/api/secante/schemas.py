from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SecanteRequest(BaseModel):
    funcion: str = Field(..., description="Función f(x)")
    x0: float = Field(..., description="Primer valor inicial")
    x1: float = Field(..., description="Segundo valor inicial")
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    error_type: Literal["absolute", "relative"] = Field(
        "relative",
        description="Tipo de error a utilizar en la condición de parada: absolute o relative",
    )


class SecanteIteration(BaseModel):
    i: int
    xi: float
    f_xi: float
    error: Optional[float] = None
    error_absolute: Optional[float] = None
    error_relative1: Optional[float] = None
    error_relative2: Optional[float] = None
    error_conditional: Optional[float] = None


class SecanteResponse(BaseModel):
    iterations: List[SecanteIteration]
    root: Optional[float]
    message: str
    success: bool
    error_type: str
