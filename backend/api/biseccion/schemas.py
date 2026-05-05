from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class BiseccionRequest(BaseModel):
    funcion: str
    xi: float
    xs: float
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    error_type: Literal["absolute", "relative"] = Field(
        "absolute",
        description="Tipo de error a utilizar en la condición de parada: absolute o relative",
    )


class BiseccionIteration(BaseModel):
    i: int
    xm: float
    f_xm: float
    error: Optional[float] = None
    error_absolute: Optional[float] = None
    error_relative1: Optional[float] = None
    error_relative2: Optional[float] = None
    error_conditional: Optional[float] = None


class BiseccionResponse(BaseModel):
    iterations: List[BiseccionIteration]
    root: Optional[float]
    message: str
    success: bool
    error_type: str