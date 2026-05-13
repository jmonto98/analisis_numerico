from fastapi import APIRouter, HTTPException
from .schemas import VandermondeRequest, VandermondeResponse
from .service import vandermonde_interpolation

router = APIRouter(tags=["interpolation"])


@router.post("/vandermonde", response_model=VandermondeResponse)
async def solve_vandermonde(request: VandermondeRequest):
    """
    Solve polynomial interpolation using Vandermonde matrix method.
    
    Splits data into training and validation sets, builds polynomial from training data,
    and evaluates error on validation set.
    
    Parameters:
    - x: List of x values
    - y: List of y values (must have same length as x)
    - validation_percentage: Percentage of data for validation (0, 10, 20, or 30). If 0, uses all points for training.
    - eval_points: Optional points where to evaluate the polynomial
    
    Returns:
    - coefficients: Polynomial coefficients [a0, a1, a2, ...] for P(x) = a0 + a1*x + a2*x^2 + ...
    - polynomial_degree: Degree of the polynomial (n-1 for n training points)
    - polynomial_str: String representation of the polynomial (e.g., "P(x) = 0.5x² + 2x + 1")
    - matrix_A: Vandermonde matrix used for training
    - domain: Dictionary with min_x and max_x from all data points
    - training_points: Points used for training
    - validation_points: Points used for validation
    - validation_metrics: Error metrics on validation set (RMSE, max error, mean error)
    - eval_results: Polynomial evaluated at requested eval_points
    - message: Status message
    """
    try:
        coefficients, polynomial_str, matrix_A, domain, train_pts, val_pts, metrics, eval_results, error_10, error_20, error_30 = vandermonde_interpolation(
            x=request.x,
            y=request.y,
            validation_percentage=request.validation_percentage,
            eval_points=request.eval_points,
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
            error_10=error_10,
            error_20=error_20,
            error_30=error_30,
            eval_results=eval_results,
            message=message,
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
