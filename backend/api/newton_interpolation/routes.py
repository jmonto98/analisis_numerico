from fastapi import APIRouter, HTTPException
from .schemas import NewtonInterpolationRequest, NewtonInterpolationResponse
from .service import newton_interpolation

router = APIRouter(prefix="/interpolation/newton", tags=["Newton Interpolation"])


@router.post("/", response_model=NewtonInterpolationResponse)
async def compute_newton_interpolation(request: NewtonInterpolationRequest):
    """
    Compute Newton polynomial interpolation.
    
    Returns the divided differences table and polynomial in standard form.
    """
    try:
        result = newton_interpolation(
            x=request.x,
            y=request.y,
            validation_percentage=request.validation_percentage,
            validation_x=request.validation_x,
            validation_y=request.validation_y,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
