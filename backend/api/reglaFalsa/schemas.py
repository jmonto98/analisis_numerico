from pydantic import BaseModel


class ReglaFalsaRequest(BaseModel):
    funcion: str
    a: float
    b: float
    tol: float
    niter: int
    error_type: str = "relative"


class ReglaFalsaIteration(BaseModel):
    i: int
    a: float
    xr: float
    b: float
    f_xr: float
    error: float | None
    error_absolute: float | None = None
    error_relative1: float | None = None
    error_relative2: float | None = None
    error_conditional: float | None = None


class ReglaFalsaResponse(BaseModel):
    iterations: list[ReglaFalsaIteration]
    root: float | None
    message: str
    success: bool
    error_type: str
