from pydantic import BaseModel, Field
from typing import List, Optional


class VandermondeRequest(BaseModel):
    x: List[float] = Field(..., description="X values of the data points")
    y: List[float] = Field(..., description="Y values of the data points")
    validation_percentage: float = Field(default=0, description="Percentage of data for validation (10, 20, or 30)")
    eval_points: Optional[List[float]] = Field(default=None, description="Points where to evaluate the polynomial")


class VandermondePoint(BaseModel):
    x: float
    y: float


class VandermondeValidationMetrics(BaseModel):
    validation_percentage: float
    num_train: int
    num_validation: int
    rmse: float  # Root Mean Square Error
    max_error: float
    mean_error: float


class VandermondeResponse(BaseModel):
    coefficients: List[float]  # Polynomial coefficients [a0, a1, a2, ...]
    polynomial_degree: int
    polynomial_str: str  # String representation: "P(x) = 0.5x² + 2x + 1"
    matrix_A: List[List[float]]  # Vandermonde matrix for training data
    domain: dict  # {"min_x": float, "max_x": float}
    training_points: List[VandermondePoint]
    validation_points: List[VandermondePoint]
    validation_metrics: VandermondeValidationMetrics
    error_10: float  # RMSE with 10% validation
    error_20: float  # RMSE with 20% validation
    error_30: float  # RMSE with 30% validation
    eval_results: Optional[List[dict]] = None  # [{"x": float, "y": float}, ...]
    message: str
