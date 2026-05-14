from pydantic import BaseModel, Field
from typing import List, Optional


class VandermondeRequest(BaseModel):
    x: List[float] = Field(..., description="X values for training")
    y: List[float] = Field(..., description="Y values for training")
    validation_percentage: float = Field(default=0, description="Percentage of data for validation")
    validation_x: Optional[List[float]] = Field(default=None, description="X values for validation")
    validation_y: Optional[List[float]] = Field(default=None, description="Y values for validation")


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
    validation_results: Optional[List[dict]] = None  # [{"x": float, "y_actual": float, "y_pred": float, "error": float}, ...]
    message: str
