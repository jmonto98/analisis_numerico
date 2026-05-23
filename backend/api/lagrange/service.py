import numpy as np
from typing import List, Tuple
from .schemas import LagrangePoint, LagrangeValidationMetrics


def format_polynomial(coefficients: np.ndarray) -> str:
    """
    Format polynomial coefficients as a string representation.
    
    Args:
        coefficients: Array of polynomial coefficients in descending order of powers
        
    Returns:
        String representation like "P(x) = 0.5x² + 2x + 1"
    """
    # Normalize coefficients (remove leading zeros)
    coefficients = np.trim_zeros(coefficients, trim='f')
    
    if len(coefficients) == 0:
        return "P(x) = 0"
    
    degree = len(coefficients) - 1
    terms = []
    
    for i, coeff in enumerate(coefficients):
        power = degree - i
        coeff_val = float(coeff)
        
        # Skip zero coefficients
        if abs(coeff_val) < 1e-10:
            continue
        
        # Format coefficient
        if abs(coeff_val - round(coeff_val)) < 1e-10:
            coeff_str = str(int(round(coeff_val)))
        else:
            coeff_str = f"{coeff_val:.6g}"
        
        # Build term
        if power == 0:
            term = coeff_str
        elif power == 1:
            term = f"{coeff_str}x"
        else:
            # Use Unicode superscript for power
            power_str = str(power)
            superscript = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")
            term = f"{coeff_str}x{power_str.translate(superscript)}"
        
        terms.append(term)
    
    # Join terms with signs
    if not terms:
        return "P(x) = 0"
    
    result = terms[0]
    for term in terms[1:]:
        if term[0] == '-':
            result += f" - {term[1:]}"
        else:
            result += f" + {term}"
    
    return f"P(x) = {result}"


def evaluate_polynomial(coefficients: np.ndarray, x: float) -> float:
    """
    Evaluate polynomial at a point using Horner's method.
    
    Args:
        coefficients: Polynomial coefficients in descending order
        x: Point at which to evaluate
        
    Returns:
        Polynomial value at x
    """
    result = 0.0
    for coeff in coefficients:
        result = result * x + coeff
    return result


def lagrange_interpolation(
    x: List[float],
    y: List[float],
    validation_percentage: float = 0,
    validation_x: List[float] = None,
    validation_y: List[float] = None,
) -> dict:
    """
    Lagrange interpolation method.
    
    Args:
        x: List of x training points
        y: List of y training points
        validation_percentage: Percentage of data for validation
        validation_x: Optional pre-separated validation x points
        validation_y: Optional pre-separated validation y points
        
    Returns:
        Dictionary with interpolation results
    """
    
    if len(x) != len(y):
        raise ValueError("x and y must have same length")
    
    if len(x) < 2:
        raise ValueError("Need at least 2 points for interpolation")
    
    x_train_arr = np.array(x, dtype=float)
    y_train_arr = np.array(y, dtype=float)
    
    # Handle validation data if provided
    if validation_x is not None and validation_y is not None:
        if len(validation_x) != len(validation_y):
            raise ValueError("validation_x and validation_y must have same length")
        x_val_arr = np.array(validation_x, dtype=float)
        y_val_arr = np.array(validation_y, dtype=float)
    else:
        x_val_arr = np.array([], dtype=float)
        y_val_arr = np.array([], dtype=float)
    
    n_train = len(x_train_arr)
    n_val = len(x_val_arr)
    
    # Build Lagrange polynomial by computing coefficients
    # Initialize with zero polynomial
    P = np.array([0.0])
    
    for i in range(n_train):
        # Build Li(x) = ∏(j≠i) (x - xj)/(xi - xj)
        Li = np.array([1.0])  # Start with polynomial 1
        denominator = 1.0
        
        for j in range(n_train):
            if i != j:
                # Multiply Li by (x - xj)
                # Polynomial (x - xj) has coefficients [1, -xj]
                Li = np.convolve(Li, np.array([1.0, -x_train_arr[j]]))
                denominator *= (x_train_arr[i] - x_train_arr[j])
        
        # Scale by y(i) / denominator
        Li = y_train_arr[i] * Li / denominator
        
        # Add to P
        # Pad polynomials to same length before adding
        max_len = max(len(P), len(Li))
        P_padded = np.pad(P, (max_len - len(P), 0), mode='constant')
        Li_padded = np.pad(Li, (max_len - len(Li), 0), mode='constant')
        P = P_padded + Li_padded
    
    # Clean up the polynomial (remove very small coefficients)
    P = np.where(np.abs(P) < 1e-10, 0, P)
    
    # Polynomial degree
    poly_degree = len(P) - 1
    
    # Format polynomial string
    polynomial_str = format_polynomial(P)
    
    # Calculate domain
    all_x = np.concatenate([x_train_arr, x_val_arr]) if len(x_val_arr) > 0 else x_train_arr
    domain = {
        "min_x": float(np.min(all_x)),
        "max_x": float(np.max(all_x)),
    }
    
    # Training points for visualization
    training_points = [
        {"x": float(x_train_arr[i]), "y": float(y_train_arr[i])}
        for i in range(n_train)
    ]
    
    # Validation points for visualization
    validation_points = [
        {"x": float(x_val_arr[i]), "y": float(y_val_arr[i])}
        for i in range(n_val)
    ]
    
    # Validation results
    validation_results = None
    if n_val > 0:
        validation_results = []
        errors = []
        
        for i in range(n_val):
            y_pred = evaluate_polynomial(P, x_val_arr[i])
            y_actual = y_val_arr[i]
            error = abs(y_actual - y_pred)
            errors.append(error)
            
            validation_results.append({
                "x": float(x_val_arr[i]),
                "y_actual": float(y_actual),
                "y_pred": float(y_pred),
                "error": float(error),
            })
        
        rmse = float(np.sqrt(np.mean(np.array(errors) ** 2)))
        max_error = float(np.max(errors))
        mean_error = float(np.mean(errors))
    else:
        rmse = 0.0
        max_error = 0.0
        mean_error = 0.0
    
    # Validation metrics
    validation_metrics = LagrangeValidationMetrics(
        validation_percentage=validation_percentage,
        num_train=n_train,
        num_validation=n_val,
        rmse=rmse,
        max_error=max_error,
        mean_error=mean_error,
    )
    
    return {
        "coefficients": P.tolist(),
        "polynomial_degree": poly_degree,
        "polynomial_str": polynomial_str,
        "domain": domain,
        "training_points": training_points,
        "validation_points": validation_points,
        "validation_metrics": validation_metrics,
        "validation_results": validation_results,
        "message": "Interpolación de Lagrange completada exitosamente",
    }
