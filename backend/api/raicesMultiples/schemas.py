from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class RaicesMultiplesRequest(BaseModel):
    funcion: str = Field(..., description="Función f(x)")
    a: float = Field(..., description="Límite inferior del intervalo")
    b: float = Field(..., description="Límite superior del intervalo")
    tol: float = Field(..., gt=0, description="Tolerancia positiva")
    niter: int = Field(..., gt=0, description="Número máximo de iteraciones")
    subintervalos: int = Field(default=20, gt=0, description="Número de subintervalos para buscar raíces")
    error_type: Literal["absolute", "relative"] = Field(
        "absolute",
        description="Tipo de error a utilizar en la condición de parada: absolute o relative",
    )


class RaizEncontrada(BaseModel):
    raiz: float
    f_raiz: float
    iteraciones: int


class RaicesMultiplesResponse(BaseModel):
    raices: List[RaizEncontrada]
    total_raices: int
    message: str
    success: bool
    error_type: str
