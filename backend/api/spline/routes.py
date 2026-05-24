from fastapi import APIRouter, HTTPException
from .schemas import SplineRequest, SplineResponse
from .service import spline_interpolation

router = APIRouter(prefix="/spline", tags=["interpolation"])


@router.post("/", response_model=SplineResponse)
def compute_spline(request: SplineRequest) -> SplineResponse:
    """
    Compute spline interpolation for given data points.
    
    Parameters:
    - x: List of x values (training points)
    - y: List of y values (training points)
    - spline_degree: Degree of spline (1=linear, 2=quadratic, 3=cubic)
    - validation_percentage: Percentage of data reserved for validation
    - validation_x: Pre-separated validation x values (from frontend)
    - validation_y: Pre-separated validation y values (from frontend)
    
    Returns:
    - Spline coefficients matrix and validation results
    """
    try:
        result = spline_interpolation(
            x=request.x,
            y=request.y,
            spline_degree=request.spline_degree,
            validation_percentage=request.validation_percentage,
            validation_x=request.validation_x,
            validation_y=request.validation_y,
        )
        return SplineResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing spline: {str(e)}")
