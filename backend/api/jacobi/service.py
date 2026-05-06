import numpy as np
from typing import List, Tuple, Dict, Any
from .schemas import JacobiIteration


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
    # Convert to numpy arrays
    a = np.array(matrix, dtype=float)
    b_vec = np.array(b, dtype=float)
    n = a.shape[0]
    
    # Check if matrix is square
    if a.shape[0] != a.shape[1]:
        raise ValueError("Matrix A must be square")
    
    if len(b_vec) != n:
        raise ValueError("Vector b must have same length as matrix rows")
    
    # Check diagonal dominance (recommended but not required)
    for i in range(n):
        if abs(a[i, i]) <= 1e-10:
            raise ValueError(f"Diagonal element a[{i},{i}] is zero or near-zero")
    
    # Initialize solution
    x = np.array(x0, dtype=float) if x0 else np.zeros(n)
    x_prev = x.copy()
    
    iterations = []
    converged = False
    final_error = float('inf')
    
    for k in range(niter):
        # Jacobi iteration
        x_new = np.zeros(n)
        for i in range(n):
            suma = np.dot(a[i, :i], x[: i]) + np.dot(a[i, i+1 :], x[i+1 :])
            x_new[i] = (b_vec[i] - suma) / a[i, i]
        
        # Calculate error
        error = np.linalg.norm(x_new - x) / np.linalg.norm(x_new) if np.any(x_new) else np.linalg.norm(x_new - x)
        
        # Store iteration
        iteration_data = JacobiIteration(
            i=k,
            x=x_new.tolist(),
            error=float(error) if not np.isnan(error) else None,
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
