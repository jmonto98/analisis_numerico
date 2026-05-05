from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class RaicesMultiplesRequest(BaseModel):
    funcion: str = Field(..., description="Función f(x)")
    x0: float = Field(..., description="Punto inicial x0")
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    error_type: Literal["absolute", "relative"] = Field(
        "absolute",
        description="Tipo de error a utilizar en la condición de parada: absolute o relative",
    )


class RaicesMultiplesIteration(BaseModel):
    i: int
    x: float
    f_x: float
    error: Optional[float] = None


class RaicesMultiplesResponse(BaseModel):
    iterations: List[RaicesMultiplesIteration]
    root: Optional[float]
    message: str
    success: bool
    error_type: str
