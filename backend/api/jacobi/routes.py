from fastapi import APIRouter, HTTPException
from .schemas import JacobiRequest, JacobiResponse, JacobiIteration
from .service import jacobi_method

router = APIRouter(prefix="/jacobi", tags=["jacobi"])


@router.post("")
async def solve_jacobi(request: JacobiRequest) -> JacobiResponse:
    """
    Solve a system of linear equations using the Jacobi method.
    
    Args:
        matrix: Coefficient matrix A (n x n)
        b: Independent terms vector
        tol: Tolerance for convergence
        niter: Maximum number of iterations
        x0: Initial approximation (optional)
    """
    try:
        solution, iterations, converged, final_error = jacobi_method(
            matrix=request.matrix,
            b=request.b,
            tol=request.tol,
            niter=request.niter,
            x0=request.x0,
        )
        
        n_iter = len(iterations)
        
        message = (
            f"Jacobi converged in {n_iter} iterations"
            if converged
            else f"Jacobi did not converge after {n_iter} iterations (error: {final_error:.6e})"
        )
        
        return JacobiResponse(
            iterations=iterations,
            solution=solution,
            root=solution,  # For frontend compatibility
            message=message,
            converged=converged,
            final_error=final_error,
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error solving system: {str(e)}")
