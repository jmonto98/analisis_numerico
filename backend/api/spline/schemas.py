from pydantic import BaseModel, Field
from typing import List, Optional


class SplineRequest(BaseModel):
    x: List[float] = Field(..., description="X values for training")
    y: List[float] = Field(..., description="Y values for training")
    spline_degree: int = Field(default=3, description="Degree of spline polynomial (1=linear, 2=quadratic, 3=cubic)")
    validation_percentage: float = Field(default=0, description="Percentage of data for validation")
    validation_x: Optional[List[float]] = Field(default=None, description="X values for validation")
    validation_y: Optional[List[float]] = Field(default=None, description="Y values for validation")


class SplinePoint(BaseModel):
    x: float
    y: float


class SplineValidationMetrics(BaseModel):
    validation_percentage: float
    num_train: int
    num_validation: int
    rmse: float  # Root Mean Square Error
    max_error: float
    mean_error: float


class SplineResponse(BaseModel):
    spline_degree: int  # Degree of the spline polynomials
    num_intervals: int  # Number of intervals (n-1 where n is number of points)
    coefficients_matrix: List[List[float]]  # Matrix of spline polynomial coefficients (intervals x (degree+1))
    vector_x: List[float]  # Training x points
    vector_b: List[float]  # Training y points
    domain: dict  # {"min_x": float, "max_x": float}
    training_points: List[SplinePoint]
    validation_points: List[SplinePoint]
    validation_metrics: SplineValidationMetrics
    validation_results: Optional[List[dict]] = None  # [{"x": float, "y_actual": float, "y_pred": float, "error": float}, ...]
    message: str
