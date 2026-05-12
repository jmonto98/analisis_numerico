import numpy as np
from typing import List, Tuple
from .schemas import SORIteration
from api.utils.linear_solver_utils import validate_system, check_diagonal_dominance, calculate_error


def sor_method(
    matrix: List[List[float]],
    b: List[float],
    omega: float = 1.5,
    tol: float = 0.0001,
    niter: int = 100,
    x0: List[float] = None,
) -> Tuple[List[float], List[SORIteration], bool, float]:
    """
    Solve the system Ax = b using SOR (Successive Over-Relaxation) method.
    
    Args:
        matrix: Coefficient matrix A (n x n)
        b: Independent terms vector
        omega: Relaxation parameter (0 < omega < 2, typically 1.5)
        tol: Tolerance for convergence
        niter: Maximum number of iterations
        x0: Initial approximation (if None, uses zeros)
    
    Returns:
        Tuple of (solution, iterations_data, converged, final_error)
    """
    # Validate inputs
    if omega <= 0 or omega >= 2:
        raise ValueError("Relaxation parameter omega must be in (0, 2)")
    
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
    iteration_data = SORIteration(
        i=0,
        x=x.tolist(),
        error=None,  # No error for initial value
    )
    iterations.append(iteration_data)
    
    converged = False
    final_error = float('inf')
    
    for k in range(niter):
        x_old = x.copy()
        
        # SOR iteration
        # First compute Gauss-Seidel step, then apply relaxation
        for i in range(n):
            suma_lower = np.dot(a[i, :i], x[:i])  # Use new values
            suma_upper = np.dot(a[i, i+1:], x_old[i+1:])  # Use old values
            
            # Gauss-Seidel value
            x_gs = (b_vec[i] - suma_lower - suma_upper) / a[i, i]
            
            # Apply relaxation
            x[i] = (1 - omega) * x_old[i] + omega * x_gs
        
        # Calculate error
        error = calculate_error(x, x_old)
        
        # Store iteration
        iteration_data = SORIteration(
            i=k+1,
            x=x.tolist(),
            error=error,
        )
        iterations.append(iteration_data)
        
        # Check convergence
        if error < tol:
            converged = True
            final_error = error
            break
        
        final_error = error
    
    return x.tolist(), iterations, converged, final_error
