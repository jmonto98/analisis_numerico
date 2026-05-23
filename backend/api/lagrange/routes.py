from fastapi import HTTPException, APIRouter
from .service import lagrange_interpolation
from .schemas import LagrangeRequest, LagrangeResponse


lagrange_router = APIRouter(prefix="/lagrange", tags=["Lagrange"])


@lagrange_router.post("/", response_model=LagrangeResponse)
def compute_lagrange(request: LagrangeRequest):
    """
    Compute Lagrange polynomial interpolation.
    
    Parameters:
    - **x**: List of x training points
    - **y**: List of y training points
    - **validation_percentage**: Percentage of data to use for validation (0, 10, 20, 30)
    - **validation_x**: Optional pre-separated validation x points
    - **validation_y**: Optional pre-separated validation y points
    
    Returns:
    - Polynomial coefficients, degree, string representation
    - Training and validation points for visualization
    - Validation metrics (RMSE, max error, mean error)
    - Validation results with predicted vs actual values
    """
    try:
        result = lagrange_interpolation(
            x=request.x,
            y=request.y,
            validation_percentage=request.validation_percentage,
            validation_x=request.validation_x,
            validation_y=request.validation_y,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(exc)}")
    
    return result
