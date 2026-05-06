from pydantic import BaseModel, Field
from typing import List, Optional


class JacobiIteration(BaseModel):
    i: int
    x: List[float]
    error: Optional[float] = None


class JacobiRequest(BaseModel):
    matrix: List[List[float]] = Field(..., description="Coefficient matrix A (n x n)")
    b: List[float] = Field(..., description="Independent terms vector b")
    tol: float = Field(default=0.0001, description="Tolerance")
    niter: int = Field(default=100, description="Maximum number of iterations")
    x0: Optional[List[float]] = Field(default=None, description="Initial approximation (optional)")


class JacobiResponse(BaseModel):
    iterations: List[JacobiIteration]
    solution: List[float]
    root: List[float]  # For compatibility with frontend
    message: str
    converged: bool
    final_error: Optional[float] = None
