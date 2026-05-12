import numpy as np
from typing import List, Tuple
from .schemas import JacobiIteration
from api.utils.linear_solver_utils import validate_system, check_diagonal_dominance, calculate_error


def jacobi_method(
    matrix: List[List[float]],
    b: List[float],
    tol: float = 0.0001,
    niter: int = 100,
    x0: List[float] = None,
) -> Tuple[List[float], List[JacobiIteration], bool, float]:
    """
    Solve the system Ax = b using Jacobi method.
    
    Args:
        matrix: Coefficient matrix A (n x n)
        b: Independent terms vector
        tol: Tolerance for convergence
        niter: Maximum number of iterations
        x0: Initial approximation (if None, uses zeros)
    
    Returns:
        Tuple of (solution, iterations_data, converged, final_error)
    """
    # Validate system
    validate_system(matrix, b)
    check_diagonal_dominance(matrix)
    
    # Convert to numpy arrays
    a = np.array(matrix, dtype=float)
    b_vec = np.array(b, dtype=float)
    n = a.shape[0]
    
    # Initialize solution
    x = np.array(x0, dtype=float) if x0 else np.zeros(n)
    
    iterations = []
    
    # Store initial approximation x0 as iteration 0
    iteration_data = JacobiIteration(
        i=0,
        x=x.tolist(),
        error=None,  # No error for initial value
    )
    iterations.append(iteration_data)
    
    converged = False
    final_error = float('inf')
    
    for k in range(niter):
        # Jacobi iteration
        x_new = np.zeros(n)
        for i in range(n):
            suma = np.dot(a[i, :i], x[: i]) + np.dot(a[i, i+1 :], x[i+1 :])
            x_new[i] = (b_vec[i] - suma) / a[i, i]
        
        # Calculate error
        error = calculate_error(x_new, x)
        
        # Store iteration
        iteration_data = JacobiIteration(
            i=k+1,
            x=x_new.tolist(),
            error=error,
        )
        iterations.append(iteration_data)
        
        x = x_new
        
        # Check convergence
        if error < tol:
            converged = True
            final_error = error
            break
        
        final_error = error
    
    return x.tolist(), iterations, converged, final_error
