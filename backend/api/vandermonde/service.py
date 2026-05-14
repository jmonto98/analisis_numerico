import numpy as np
from typing import List, Tuple
from .schemas import VandermondePoint, VandermondeValidationMetrics





def format_polynomial(coefficients: np.ndarray) -> str:
    """
    Format polynomial coefficients as a string representation.
    
    Args:
        coefficients: Array of polynomial coefficients [a0, a1, a2, ...] for P(x) = a0 + a1*x + a2*x^2 + ...
        
    Returns:
        String representation like "P(x) = 0.5x² + 2x + 1"
    """
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


def split_data(
    x: List[float],
    y: List[float],
    validation_percentage: float
) -> Tuple[List[float], List[float], List[float], List[float]]:
    """
    Split data into training and validation sets.
    
    Args:
        x: List of x values
        y: List of y values
        validation_percentage: Percentage for validation (0, 10, 20, 30). If 0, all points used for training.
        
    Returns:
        Tuple of (x_train, y_train, x_val, y_val)
    """
    if validation_percentage not in [0, 10, 20, 30]:
        raise ValueError("Validation percentage must be 0, 10, 20, or 30")
    
    if len(x) != len(y):
        raise ValueError("x and y must have same length")
    
    if len(x) < 2:
        raise ValueError("Need at least 2 points")
    
    x_array = np.array(x)
    y_array = np.array(y)
    
    # If validation_percentage is 0, use all points for training
    if validation_percentage == 0:
        x_train = x
        y_train = y
        x_val = []
        y_val = []
    else:
        # Set seed for reproducibility
        np.random.seed(42)
        n = len(x)
        
        # Calculate number of validation points
        num_validation = max(1, int(n * validation_percentage / 100))
        
        # Shuffle indices and split
        indices = np.random.permutation(n)
        val_indices = indices[:num_validation]
        train_indices = indices[num_validation:]
        
        x_train = x_array[train_indices].tolist()
        y_train = y_array[train_indices].tolist()
        x_val = x_array[val_indices].tolist()
        y_val = y_array[val_indices].tolist()
    
    return x_train, y_train, x_val, y_val


def vandermonde_interpolation(
    x: List[float],
    y: List[float],
    validation_percentage: float = 0,
    validation_x: List[float] = None,
    validation_y: List[float] = None,
) -> Tuple[List[float], str, List[List[float]], dict, List[VandermondePoint], List[VandermondePoint], VandermondeValidationMetrics, List[dict]]:
    """
    Perform Vandermonde polynomial interpolation with training and validation data.
    
    Args:
        x: List of x values for training
        y: List of y values for training
        validation_percentage: Percentage of data reserved for validation (informational)
        validation_x: Optional x values for validation
        validation_y: Optional y values for validation
        
    Returns:
        Tuple of (coefficients, polynomial_str, matrix_A, domain, training_points, validation_points, metrics, validation_results)
    """
    if len(x) < 2:
        raise ValueError("Need at least 2 points for training")
    
    if len(x) != len(y):
        raise ValueError("x and y must have same length")
    
    # Convert input to numpy arrays
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
    
    # Build Vandermonde matrix for training data
    # N parameter specifies the number of columns (polynomial degree + 1)
    A_train = np.vander(x_train_arr, N=n_train, increasing=False)
    
    # Solve: A * a = y_train
    try:
        coefficients, _, _, _ = np.linalg.lstsq(A_train, y_train_arr, rcond=None)
    except np.linalg.LinAlgError:
        raise ValueError("Cannot solve the system - matrix may be singular")
    
    # Generate polynomial string representation
    polynomial_str = format_polynomial(coefficients)
    
    # Convert matrix A to list of lists for JSON serialization
    matrix_A = A_train.tolist()
    
    # Calculate domain from all data points
    all_x = np.concatenate([x_train_arr, x_val_arr]) if len(x_val_arr) > 0 else x_train_arr
    domain = {
        "min_x": float(np.min(all_x)),
        "max_x": float(np.max(all_x)),
    }
    
    # Calculate metrics
    if len(x_val_arr) > 0:
        # Evaluate on validation set
        # Use same N to get compatible matrix dimensions
        A_val = np.vander(x_val_arr, N=n_train, increasing=False)
        y_pred_val = A_val @ coefficients
        
        errors = np.abs(y_val_arr - y_pred_val)
        rmse = np.sqrt(np.mean((y_val_arr - y_pred_val) ** 2))
        max_error = np.max(errors)
        mean_error = np.mean(errors)
    else:
        # No validation set - calculate metrics on training data
        y_pred_train = A_train @ coefficients
        errors = np.abs(y_train_arr - y_pred_train)
        rmse = np.sqrt(np.mean((y_train_arr - y_pred_train) ** 2))
        max_error = np.max(errors)
        mean_error = np.mean(errors)
    
    metrics = VandermondeValidationMetrics(
        validation_percentage=validation_percentage,
        num_train=n_train,
        num_validation=len(x_val_arr),
        rmse=float(rmse),
        max_error=float(max_error),
        mean_error=float(mean_error),
    )
    
    # Create training points objects
    training_points = [
        VandermondePoint(x=float(x_train_arr[i]), y=float(y_train_arr[i]))
        for i in range(len(x_train_arr))
    ]
    
    # Create validation points objects
    validation_points = [
        VandermondePoint(x=float(x_val_arr[i]), y=float(y_val_arr[i]))
        for i in range(len(x_val_arr))
    ]
    
    # Evaluate on validation points if provided
    validation_results = []
    if len(x_val_arr) > 0:
        A_val = np.vander(x_val_arr, N=n_train, increasing=False)
        y_val_pred = A_val @ coefficients
        
        validation_results = [
            {
                "x": float(x_val_arr[i]), 
                "y_actual": float(y_val_arr[i]),
                "y_pred": float(y_val_pred[i]),
                "error": float(abs(y_val_arr[i] - y_val_pred[i]))
            }
            for i in range(len(x_val_arr))
        ]
    
    return (
        coefficients.tolist(),
        polynomial_str,
        matrix_A,
        domain,
        training_points,
        validation_points,
        metrics,
        validation_results,
    )
