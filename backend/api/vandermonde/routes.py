from fastapi import APIRouter, HTTPException
from .schemas import VandermondeRequest, VandermondeResponse
from .service import vandermonde_interpolation

router = APIRouter(tags=["interpolation"])


@router.post("/vandermonde", response_model=VandermondeResponse)
async def solve_vandermonde(request: VandermondeRequest):
    """
    Solve polynomial interpolation using Vandermonde matrix method.
    
    Parameters:
    - x: List of x values for training
    - y: List of y values for training
    - validation_percentage: Percentage of data reserved for validation (informational)
    - validation_x: Optional x values for validation
    - validation_y: Optional y values for validation
    
    Returns:
    - coefficients: Polynomial coefficients [a0, a1, a2, ...] for P(x) = a0 + a1*x + a2*x^2 + ...
    - polynomial_degree: Degree of the polynomial (n-1 for n training points)
    - polynomial_str: String representation of the polynomial
    - matrix_A: Vandermonde matrix used for training
    - domain: Dictionary with min_x and max_x from all data points
    - training_points: Points used for training
    - validation_points: Points used for validation
    - validation_metrics: Error metrics on validation set
    - validation_results: Detailed results for each validation point
    - message: Status message
    """
    try:
        coefficients, polynomial_str, matrix_A, domain, train_pts, val_pts, metrics, validation_results = vandermonde_interpolation(
            x=request.x,
            y=request.y,
            validation_percentage=request.validation_percentage,
            validation_x=request.validation_x,
            validation_y=request.validation_y,
        )
        
        # Coefficients are in descending order: [a_n, a_{n-1}, ..., a_1, a_0]
        # Reverse them for ascending order for clarity
        coefficients_asc = list(reversed(coefficients))
        degree = len(coefficients_asc) - 1
        
        message = (
            f"Vandermonde interpolation completed. "
            f"Polynomial of degree {degree} built from {metrics.num_train} training points. "
            f"Validated with {metrics.num_validation} points (RMSE: {metrics.rmse:.6e})"
        )
        
        return VandermondeResponse(
            coefficients=coefficients_asc,
            polynomial_degree=degree,
            polynomial_str=polynomial_str,
            matrix_A=matrix_A,
            domain=domain,
            training_points=train_pts,
            validation_points=val_pts,
            validation_metrics=metrics,
            validation_results=validation_results,
            message=message,
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
