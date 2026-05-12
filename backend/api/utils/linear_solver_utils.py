import numpy as np
from typing import List


def validate_system(matrix: List[List[float]], b: List[float]) -> None:
    """
    Validate that the system is well-formed.
    
    Args:
        matrix: Coefficient matrix A (n x n)
        b: Independent terms vector
        
    Raises:
        ValueError: If matrix is not square or dimensions don't match
    """
    a = np.array(matrix, dtype=float)
    b_vec = np.array(b, dtype=float)
    n = a.shape[0]
    
    if a.shape[0] != a.shape[1]:
        raise ValueError("Matrix A must be square")
    
    if len(b_vec) != n:
        raise ValueError("Vector b must have same length as matrix rows")


def check_diagonal_dominance(matrix: List[List[float]]) -> None:
    """
    Check diagonal dominance and raise error if diagonal elements are zero.
    
    Args:
        matrix: Coefficient matrix A
        
    Raises:
        ValueError: If any diagonal element is zero or near-zero
    """
    a = np.array(matrix, dtype=float)
    n = a.shape[0]
    
    for i in range(n):
        if abs(a[i, i]) <= 1e-10:
            raise ValueError(f"Diagonal element a[{i},{i}] is zero or near-zero")


def calculate_error(x_new: np.ndarray, x_old: np.ndarray) -> float:
    """
    Calculate absolute error using infinity norm.
    Matches MATLAB: norm(x1 - x0, 'inf') = max(|x1_i - x0_i|)
    
    Args:
        x_new: Current iteration solution
        x_old: Previous iteration solution
        
    Returns:
        Infinity norm (maximum absolute difference)
    """
    error = np.linalg.norm(x_new - x_old, ord=np.inf)
    return float(error) if not np.isnan(error) else float('inf')
