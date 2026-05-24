import numpy as np
from typing import List, Optional, Tuple
from .schemas import SplinePoint, SplineValidationMetrics


def build_spline_system(x: np.ndarray, y: np.ndarray, degree: int) -> Tuple[np.ndarray, np.ndarray]:
    """
    Build the system matrix A and vector b for spline interpolation.
    
    Args:
        x: Array of x values
        y: Array of y values
        degree: Spline degree (1=linear, 2=quadratic, 3=cubic)
        
    Returns:
        Tuple of (A matrix, b vector)
    """
    n = len(x)
    
    # System size: (degree+1) * (n-1) equations and unknowns
    system_size = (degree + 1) * (n - 1)
    A = np.zeros((system_size, system_size))
    b = np.zeros(system_size)
    
    x_sq = x ** 2
    x_cube = x ** 3
    
    if degree == 1:
        # Linear spline: P_i(x) = a_i * x + b_i
        # Constraints: P_i(x_i) = y_i and P_i(x_{i+1}) = y_{i+1}
        
        c = 0  # Column index
        h = 0  # Row index
        
        # First constraint: P_i(x_i) = y_i for all i
        for i in range(n - 1):
            A[h, c] = x[i]
            A[h, c + 1] = 1
            b[h] = y[i]
            c += 2
            h += 1
        
        # Second constraint: P_i(x_{i+1}) = y_{i+1} for all i
        c = 0
        for i in range(n - 1):
            A[h, c] = x[i + 1]
            A[h, c + 1] = 1
            b[h] = y[i + 1]
            c += 2
            h += 1
    
    elif degree == 2:
        # Quadratic spline: P_i(x) = a_i * x^2 + b_i * x + c_i
        
        c = 0
        h = 0
        
        # Constraint 1: P_i(x_i) = y_i
        for i in range(n - 1):
            A[h, c] = x_sq[i]
            A[h, c + 1] = x[i]
            A[h, c + 2] = 1
            b[h] = y[i]
            c += 3
            h += 1
        
        # Constraint 2: P_i(x_{i+1}) = y_{i+1}
        c = 0
        for i in range(n - 1):
            A[h, c] = x_sq[i + 1]
            A[h, c + 1] = x[i + 1]
            A[h, c + 2] = 1
            b[h] = y[i + 1]
            c += 3
            h += 1
        
        # Constraint 3: P'_i(x_{i+1}) = P'_{i+1}(x_{i+1}) (continuity of first derivative)
        # P'_i(x) = 2*a_i*x + b_i
        c = 0
        for i in range(n - 2):
            A[h, c] = 2 * x[i + 1]
            A[h, c + 1] = 1
            A[h, c + 3] = -2 * x[i + 1]
            A[h, c + 4] = -1
            b[h] = 0
            c += 3
            h += 1
        
        # Constraint 4: P'_1(x_1) = 0 (natural boundary condition)
        A[h, 0] = 2 * x[0]
        A[h, 1] = 1
        b[h] = 0
    
    elif degree == 3:
        # Cubic spline: P_i(x) = a_i * x^3 + b_i * x^2 + c_i * x + d_i
        
        c = 0
        h = 0
        
        # Constraint 1: P_i(x_i) = y_i
        for i in range(n - 1):
            A[h, c] = x_cube[i]
            A[h, c + 1] = x_sq[i]
            A[h, c + 2] = x[i]
            A[h, c + 3] = 1
            b[h] = y[i]
            c += 4
            h += 1
        
        # Constraint 2: P_i(x_{i+1}) = y_{i+1}
        c = 0
        for i in range(n - 1):
            A[h, c] = x_cube[i + 1]
            A[h, c + 1] = x_sq[i + 1]
            A[h, c + 2] = x[i + 1]
            A[h, c + 3] = 1
            b[h] = y[i + 1]
            c += 4
            h += 1
        
        # Constraint 3: P'_i(x_{i+1}) = P'_{i+1}(x_{i+1}) (continuity of first derivative)
        # P'_i(x) = 3*a_i*x^2 + 2*b_i*x + c_i
        c = 0
        for i in range(n - 2):
            A[h, c] = 3 * x_sq[i + 1]
            A[h, c + 1] = 2 * x[i + 1]
            A[h, c + 2] = 1
            A[h, c + 4] = -3 * x_sq[i + 1]
            A[h, c + 5] = -2 * x[i + 1]
            A[h, c + 6] = -1
            b[h] = 0
            c += 4
            h += 1
        
        # Constraint 4: P''_i(x_{i+1}) = P''_{i+1}(x_{i+1}) (continuity of second derivative)
        # P''_i(x) = 6*a_i*x + 2*b_i
        c = 0
        for i in range(n - 2):
            A[h, c] = 6 * x[i + 1]
            A[h, c + 1] = 2
            A[h, c + 4] = -6 * x[i + 1]
            A[h, c + 5] = -2
            b[h] = 0
            c += 4
            h += 1
        
        # Constraint 5: Natural boundary conditions P''_1(x_1) = 0 and P''_n(x_n) = 0
        A[h, 0] = 6 * x[0]
        A[h, 1] = 2
        b[h] = 0
        h += 1
        
        c = (n - 2) * 4  # Last polynomial coefficients
        A[h, c] = 6 * x[-1]
        A[h, c + 1] = 2
        b[h] = 0
    
    return A, b


def evaluate_spline(x_eval: float, x_points: np.ndarray, coefficients: np.ndarray, degree: int) -> float:
    """
    Evaluate spline at a given point.
    
    Args:
        x_eval: Point at which to evaluate
        x_points: Array of x values (knots)
        coefficients: Matrix of spline coefficients (intervals x (degree+1))
        degree: Spline degree
        
    Returns:
        Spline value at x_eval
    """
    # Find which interval x_eval belongs to
    n_intervals = len(coefficients)
    
    # Clamp x_eval to domain
    x_eval = max(min(x_eval, x_points[-1]), x_points[0])
    
    # Find interval
    interval_idx = n_intervals - 1
    for i in range(n_intervals - 1):
        if x_eval <= x_points[i + 1]:
            interval_idx = i
            break
    
    # Get coefficients for this interval
    coeff = coefficients[interval_idx]
    
    # Evaluate polynomial at x_eval
    # Coefficients are in descending order: [a, b, c, d] for ax^3 + bx^2 + cx + d
    result = 0.0
    for i, c in enumerate(coeff):
        power = degree - i
        result += c * (x_eval ** power)
    
    return result


def spline_interpolation(
    x: List[float],
    y: List[float],
    spline_degree: int = 3,
    validation_percentage: float = 0,
    validation_x: Optional[List[float]] = None,
    validation_y: Optional[List[float]] = None,
) -> dict:
    """
    Perform spline interpolation.
    
    Args:
        x: X values for training
        y: Y values for training
        spline_degree: Degree of spline (1, 2, or 3)
        validation_percentage: Percentage of data for validation
        validation_x: X values for validation (pre-separated from training)
        validation_y: Y values for validation (pre-separated from training)
        
    Returns:
        Dictionary with spline results
    """
    # Validate inputs
    if spline_degree not in [1, 2, 3]:
        raise ValueError("spline_degree must be 1, 2, or 3")
    
    if len(x) != len(y):
        raise ValueError("x and y must have the same length")
    
    if len(x) < spline_degree + 1:
        raise ValueError(f"Need at least {spline_degree + 1} points for degree {spline_degree} spline")
    
    # Convert to numpy arrays
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
    n_intervals = n_train - 1
    
    # Build and solve the system
    A, b = build_spline_system(x_train_arr, y_train_arr, spline_degree)
    
    try:
        coefficients_flat = np.linalg.solve(A, b)
    except np.linalg.LinAlgError:
        raise ValueError("Could not solve spline system - matrix is singular")
    
    # Reshape to (n_intervals, degree+1)
    coefficients_matrix = coefficients_flat.reshape((n_intervals, spline_degree + 1))
    
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
            y_pred = evaluate_spline(x_val_arr[i], x_train_arr, coefficients_matrix, spline_degree)
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
    validation_metrics = SplineValidationMetrics(
        validation_percentage=validation_percentage,
        num_train=n_train,
        num_validation=n_val,
        rmse=rmse,
        max_error=max_error,
        mean_error=mean_error,
    )
    
    return {
        "spline_degree": spline_degree,
        "num_intervals": n_intervals,
        "coefficients_matrix": coefficients_matrix.tolist(),
        "vector_x": x_train_arr.tolist(),
        "vector_b": y_train_arr.tolist(),
        "domain": domain,
        "training_points": training_points,
        "validation_points": validation_points,
        "validation_metrics": validation_metrics,
        "validation_results": validation_results,
        "message": f"Interpolación de Spline (grado {spline_degree}) completada exitosamente",
    }
