from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class NewtonRequest(BaseModel):
    funcion: str
    x0: float = Field(..., description="Valor inicial")
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    error_type: Literal["absolute", "relative"] = Field(
        "relative",
        description="Tipo de error a utilizar en la condición de paro: absolute o relative",
    )


class NewtonIteration(BaseModel):
    i: int
    x: float
    f_x: float
    df_x: float
    error: Optional[float] = None


class NewtonResponse(BaseModel):
    iterations: List[NewtonIteration]
    root: Optional[float]
    message: str
    success: bool
    error_type: str
