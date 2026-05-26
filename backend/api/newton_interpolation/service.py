import numpy as np
from typing import List, Dict, Any


def newton_divided_differences_table(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """
    Compute the divided differences table for Newton interpolation.
    
    Args:
        x: array of x points (sorted)
        y: array of y values
    
    Returns:
        Table: matrix where column 0 is x, column 1 is y, 
               columns 2+ are divided differences of increasing order
    """
    n = len(x)
    table = np.zeros((n, n + 1))
    table[:, 0] = x
    table[:, 1] = y
    
    # Compute divided differences (columns 2 to n+1)
    for j in range(2, n + 1):
        for i in range(j - 1, n):
            table[i, j] = (table[i, j - 1] - table[i - 1, j - 1]) / (table[i, 0] - table[i - j + 1, 0])
    
    return table


def extract_newton_coefficients(table: np.ndarray) -> np.ndarray:
    """
    Extract Newton coefficients from the divided differences table.
    These are the diagonal elements: coef[i] = table[i, i+1]
    
    Args:
        table: divided differences table from newton_divided_differences_table
    
    Returns:
        Array of Newton coefficients
    """
    n = len(table)
    coefficients = np.zeros(n)
    for i in range(n):
        coefficients[i] = table[i, i + 1]
    return coefficients


def newton_polynomial_to_standard_form(x: np.ndarray, coef: np.ndarray) -> np.ndarray:
    """
    Convert Newton form P(x) = c0 + c1(x-x0) + c2(x-x0)(x-x1) + ...
    to standard form P(x) = a0*x^n + a1*x^(n-1) + ... + an
    
    Args:
        x: array of x points
        coef: Newton coefficients
    
    Returns:
        Array of polynomial coefficients in descending order of powers
    """
    n = len(x)
    
    # Build each term separately: c[i] * (x-x[0])*...*(x-x[i-1])
    # Then sum all terms, padding to the final degree
    result = np.zeros(n)
    
    # Term 0: just c[0]
    result[-1] = coef[0]  # constant term at the end for descending order
    
    # Terms 1 to n-1
    for i in range(1, n):
        # Build polynomial (x-x[0])*(x-x[1])*...*(x-x[i-1])
        term = np.array([1.0])
        for j in range(i):
            factor = np.array([1.0, -x[j]])
            term = np.polymul(term, factor)
        
        # Multiply by c[i]
        term = term * coef[i]
        
        # Pad to length n and add to result
        padding = n - len(term)
        term_padded = np.concatenate([np.zeros(padding), term])
        result += term_padded
    
    return result


def evaluate_newton_polynomial(x_eval: float, x_points: np.ndarray, coef: np.ndarray) -> float:
    """
    Evaluate Newton polynomial at a point using Horner's method.
    P(x) = c0 + (x-x0)[c1 + (x-x1)[c2 + ... ]]
    
    Args:
        x_eval: point where to evaluate
        x_points: x values used in Newton interpolation
        coef: Newton coefficients
    
    Returns:
        Value of polynomial at x_eval
    """
    n = len(coef)
    result = coef[n - 1]
    
    for i in range(n - 2, -1, -1):
        result = coef[i] + (x_eval - x_points[i]) * result
    
    return result


def newton_interpolation(
    x: List[float],
    y: List[float],
    validation_percentage: float = 0,
    validation_x: List[float] = None,
    validation_y: List[float] = None,
) -> Dict[str, Any]:
    """
    Compute Newton interpolation for the given points.
    
    Args:
        x: x coordinates of interpolation points
        y: y coordinates of interpolation points
        validation_percentage: percentage of points for validation
        validation_x: x coordinates for validation (optional)
        validation_y: y coordinates for validation (optional)
    
    Returns:
        Dictionary with:
        - divided_differences_table: the full table
        - newton_coefficients: coefficients for Newton form
        - polynomial_coefficients: coefficients in standard form (descending)
        - polynomial_degree: degree of polynomial
        - domain: {min_x, max_x}
        - training_points: points used for training
        - validation_points: points used for validation
        - validation_metrics: RMSE, max_error, mean_error, etc.
        - validation_results: comparison of actual vs predicted
        - message: success message
    """
    x_array = np.array(x, dtype=float)
    y_array = np.array(y, dtype=float)
    
    # Sort by x
    sort_indices = np.argsort(x_array)
    x_array = x_array[sort_indices]
    y_array = y_array[sort_indices]
    
    n = len(x_array)
    
    # Compute divided differences table
    table = newton_divided_differences_table(x_array, y_array)
    
    # Extract Newton coefficients (diagonal)
    newton_coef = extract_newton_coefficients(table)
    
    # Convert to standard form
    standard_coef = newton_polynomial_to_standard_form(x_array, newton_coef)
    
    # Polynomial degree is n-1
    poly_degree = n - 1
    
    # Training and validation points
    training_points = [{"x": float(x_array[i]), "y": float(y_array[i])} for i in range(n)]
    
    validation_results = None
    validation_metrics = {
        "validation_percentage": validation_percentage,
        "num_train": n,
        "num_validation": 0,
        "rmse": 0.0,
        "max_error": 0.0,
        "mean_error": 0.0,
    }
    validation_points = []
    
    # Handle validation if provided
    if validation_percentage > 0 and validation_x and validation_y:
        val_x = np.array(validation_x, dtype=float)
        val_y = np.array(validation_y, dtype=float)
        num_val = len(val_x)
        
        validation_points = [{"x": float(val_x[i]), "y": float(val_y[i])} for i in range(num_val)]
        
        # Evaluate at validation points
        y_pred = np.array([evaluate_newton_polynomial(xi, x_array, newton_coef) for xi in val_x])
        errors = np.abs(val_y - y_pred)
        
        rmse = float(np.sqrt(np.mean(errors**2)))
        max_error = float(np.max(errors))
        mean_error = float(np.mean(errors))
        
        validation_metrics = {
            "validation_percentage": validation_percentage,
            "num_train": n,
            "num_validation": num_val,
            "rmse": rmse,
            "max_error": max_error,
            "mean_error": mean_error,
        }
        
        validation_results = [
            {
                "x": float(val_x[i]),
                "y_actual": float(val_y[i]),
                "y_pred": float(y_pred[i]),
                "error": float(errors[i]),
            }
            for i in range(num_val)
        ]
    
    return {
        "divided_differences_table": table.tolist(),
        "newton_coefficients": newton_coef.tolist(),
        "polynomial_coefficients": standard_coef.tolist(),
        "polynomial_degree": poly_degree,
        "vector_x": x_array.tolist(),
        "domain": {
            "min_x": float(np.min(x_array)),
            "max_x": float(np.max(x_array)),
        },
        "training_points": training_points,
        "validation_points": validation_points,
        "validation_metrics": validation_metrics,
        "validation_results": validation_results,
        "message": f"✓ Interpolación de Newton completada. Polinomio de grado {poly_degree}",
    }
