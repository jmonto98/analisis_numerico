from typing import List, Optional
from pydantic import BaseModel, Field


class NewtonInterpolationRequest(BaseModel):
    x: List[float] = Field(..., description="X coordinates of interpolation points")
    y: List[float] = Field(..., description="Y coordinates of interpolation points")
    validation_percentage: float = Field(default=0, ge=0, le=40, description="Percentage of points for validation")
    validation_x: Optional[List[float]] = Field(default=None, description="X coordinates for validation points")
    validation_y: Optional[List[float]] = Field(default=None, description="Y coordinates for validation points")


class ValidationMetrics(BaseModel):
    validation_percentage: float
    num_train: int
    num_validation: int
    rmse: float
    max_error: float
    mean_error: float


class Point(BaseModel):
    x: float
    y: float


class ValidationResult(BaseModel):
    x: float
    y_actual: float
    y_pred: float
    error: float


class NewtonInterpolationResponse(BaseModel):
    divided_differences_table: List[List[float]] = Field(..., description="Divided differences table")
    newton_coefficients: List[float] = Field(..., description="Coefficients in Newton form")
    polynomial_coefficients: List[float] = Field(..., description="Coefficients in standard form (descending powers)")
    polynomial_degree: int = Field(..., description="Degree of the polynomial")
    vector_x: List[float] = Field(..., description="Sorted x points")
    domain: dict = Field(..., description="Domain {min_x, max_x}")
    training_points: List[Point] = Field(..., description="Training points used")
    validation_points: List[Point] = Field(..., description="Validation points")
    validation_metrics: ValidationMetrics = Field(..., description="Validation metrics (RMSE, errors, etc.)")
    validation_results: Optional[List[ValidationResult]] = Field(None, description="Comparison of actual vs predicted")
    message: str = Field(..., description="Success message")
