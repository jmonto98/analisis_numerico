from pydantic import BaseModel, Field
from typing import List, Optional


class LagrangeRequest(BaseModel):
    x: List[float] = Field(..., description="X values for training")
    y: List[float] = Field(..., description="Y values for training")
    validation_percentage: float = Field(default=0, description="Percentage of data for validation")
    validation_x: Optional[List[float]] = Field(default=None, description="X values for validation")
    validation_y: Optional[List[float]] = Field(default=None, description="Y values for validation")


class LagrangePoint(BaseModel):
    x: float
    y: float


class LagrangeValidationMetrics(BaseModel):
    validation_percentage: float
    num_train: int
    num_validation: int
    rmse: float  # Root Mean Square Error
    max_error: float
    mean_error: float


class LagrangeResponse(BaseModel):
    coefficients: List[float]  # Polynomial coefficients in descending order of powers [an, an-1, ..., a1, a0]
    polynomial_degree: int
    polynomial_str: str  # String representation: "P(x) = 0.5x² + 2x + 1"
    matrix_A: List[List[float]]  # Matrix of Lagrange basis polynomial coefficients (each row is Li(x)/denominator)
    vector_x: List[float]  # Training x points
    vector_b: List[float]  # Training y points (denominación 'b' para consistencia con Ax=b)
    domain: dict  # {"min_x": float, "max_x": float}
    training_points: List[LagrangePoint]
    validation_points: List[LagrangePoint]
    validation_metrics: LagrangeValidationMetrics
    validation_results: Optional[List[dict]] = None  # [{"x": float, "y_actual": float, "y_pred": float, "error": float}, ...]
    message: str
