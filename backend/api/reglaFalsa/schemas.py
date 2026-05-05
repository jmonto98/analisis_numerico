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


class ReglaFalsaResponse(BaseModel):
    iterations: list[ReglaFalsaIteration]
    root: float | None
    message: str
    success: bool
    error_type: str
