from fastapi import APIRouter, HTTPException
from .schemas import SORRequest, SORResponse
from .service import sor_method

router = APIRouter(tags=["linear_systems"])


@router.post("/sor", response_model=SORResponse)
async def solve_sor(request: SORRequest):
    """
    Solve a system of linear equations using the SOR (Successive Over-Relaxation) method.
    
    Parameters:
    - matrix: Coefficient matrix A (n x n)
    - b: Independent terms vector
    - omega: Relaxation parameter (0 < omega < 2, typically 1.5, default: 1.5)
    - x0: Initial approximation (optional, defaults to zeros)
    - tol: Convergence tolerance (default: 1e-4)
    - niter: Maximum number of iterations (default: 100)
    
    Returns:
    - iterations: List of iterations with solutions and errors
    - solution: Final solution vector
    - root: Alias for solution (compatibility)
    - converged: Whether the method converged
    - message: Status message
    - final_error: Final error value
    """
    try:
        solution, iterations, converged, final_error = sor_method(
            matrix=request.matrix,
            b=request.b,
            omega=request.omega,
            tol=request.tol,
            niter=request.niter,
            x0=request.x0,
        )
        
        message = f"SOR (ω={request.omega}) converged in {len(iterations)-1} iterations" if converged else f"Maximum iterations ({request.niter}) reached"
        
        return SORResponse(
            iterations=iterations,
            solution=solution,
            root=solution,
            converged=converged,
            message=message,
            final_error=final_error,
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
