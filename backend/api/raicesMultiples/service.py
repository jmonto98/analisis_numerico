from __future__ import annotations
import math
from typing import Callable
from sympy import Symbol, lambdify, sympify, SympifyError, diff

from .schemas import RaicesMultiplesRequest, RaicesMultiplesIteration, RaicesMultiplesResponse


def _normalize_expression(expression: str) -> str:
    return expression.replace("^", "**").strip()


def _validate_real_value(value) -> float:
    """Valida que el valor sea un número real válido"""
    if isinstance(value, complex):
        if abs(value.imag) < 1e-15:
            value = value.real
        else:
            raise ValueError(f"Evaluación compleja no permitida: {value}")

    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Valor de función no numérico: {value}") from exc

    if math.isnan(result) or math.isinf(result):
        raise ValueError(f"Valor de función no válido: {result}")

    return result


def _compute_error(xn: float, xn_prev: float, error_type: str) -> float:
    """Calcula el error según el tipo especificado"""
    if error_type == "absolute":
        return abs(xn - xn_prev)
    if error_type == "relative":
        return abs(xn - xn_prev) / abs(xn) if xn != 0 else abs(xn - xn_prev)
    raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")


def _compute_all_errors(current: float, previous: float, f_current: float) -> dict:
    """Calcula todos los tipos de error para visualización"""
    errors = {}
    
    # Error absoluto: |X_{j+1} - X_j|
    errors["error_absolute"] = abs(current - previous)
    
    # Error relativo 1: |X_{j+1} - X_j| / |X_j|
    if previous != 0:
        errors["error_relative1"] = abs(current - previous) / abs(previous)
    else:
        errors["error_relative1"] = abs(current - previous)
    
    # Error relativo 2: |X_{j+1} - X_j| / |X_{j+1}|
    if current != 0:
        errors["error_relative2"] = abs(current - previous) / abs(current)
    else:
        errors["error_relative2"] = abs(current - previous)
    
    # Error condicional: |f(X_i)|
    errors["error_conditional"] = abs(f_current)
    
    return errors


def parse_function(expression: str) -> Callable[[float], float]:
    """Convierte una expresión en string a una función evaluable"""
    expression = _normalize_expression(expression)
    x = Symbol("x")

    try:
        parsed = sympify(expression, locals={"x": x})
    except SympifyError as exc:
        raise ValueError(f"Función inválida: {exc}") from exc

    try:
        f = lambdify(x, parsed, modules=["math"])
    except Exception as exc:
        raise ValueError(f"No se pudo construir la función: {exc}") from exc

    try:
        f(1.0)
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función: {exc}") from exc

    return f


def parse_derivatives(expression: str) -> tuple[Callable, Callable, Callable]:
    """
    Calcula automáticamente las derivadas de la función
    Retorna (f, f', f'')
    """
    expression = _normalize_expression(expression)
    x = Symbol("x")

    try:
        parsed = sympify(expression, locals={"x": x})
    except SympifyError as exc:
        raise ValueError(f"Función inválida: {exc}") from exc

    # Calcular derivadas
    first_deriv = diff(parsed, x)
    second_deriv = diff(first_deriv, x)

    try:
        f = lambdify(x, parsed, modules=["math"])
        f_prime = lambdify(x, first_deriv, modules=["math"])
        f_double_prime = lambdify(x, second_deriv, modules=["math"])
    except Exception as exc:
        raise ValueError(f"No se pudo construir las funciones derivadas: {exc}") from exc

    return f, f_prime, f_double_prime


def raices_multiples(request: RaicesMultiplesRequest) -> RaicesMultiplesResponse:
    """
    Método de Newton para raíces múltiples
    
    Fórmula: x_{n+1} = x_n - (f(x_n) * f'(x_n)) / (f'(x_n)^2 - f(x_n) * f''(x_n))
    """
    
    # Validaciones
    if request.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if request.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if request.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    # Obtener funciones
    try:
        f, f_prime, f_double_prime = parse_derivatives(request.funcion)
    except Exception as exc:
        raise ValueError(f"Error al procesar la función: {exc}") from exc

    iterations: list[RaicesMultiplesIteration] = []
    x0 = request.x0

    # Validar que x0 esté en el dominio
    try:
        fx = _validate_real_value(f(x0))
        fx_prime = _validate_real_value(f_prime(x0))
        fx_double_prime = _validate_real_value(f_double_prime(x0))
    except ValueError as exc:
        raise ValueError(f"x0 no está en el dominio de la función o sus derivadas: {exc}") from exc

    # Primera iteración
    iterations.append(RaicesMultiplesIteration(
        i=0,
        x=x0,
        f_x=fx,
        error=None,
        error_absolute=None,
        error_relative1=None,
        error_relative2=None,
        error_conditional=abs(fx),
    ))

    d = fx_prime ** 2 - fx * fx_double_prime
    err = request.tol + 1
    cont = 0

    try:
        while err > request.tol and d != 0 and cont < request.niter:
            # Fórmula de Newton para raíces múltiples
            denominator = (fx_prime ** 2) - (fx * fx_double_prime)
            
            if abs(denominator) < 1e-15:
                raise ValueError("El denominador es muy pequeño (posible división por cero)")
            
            xn = x0 - (fx * fx_prime) / denominator

            if math.isinf(xn) or math.isnan(xn):
                raise ValueError(f"Valor infinito o no definido en iteración {cont + 1}")

            # Evaluar en el nuevo punto
            fx = _validate_real_value(f(xn))
            fx_prime = _validate_real_value(f_prime(xn))
            fx_double_prime = _validate_real_value(f_double_prime(xn))

            # Calcular error
            err = _compute_error(xn, x0, request.error_type)
            all_errors = _compute_all_errors(xn, x0, fx)

            cont += 1
            x0 = xn
            d = fx_prime ** 2 - fx * fx_double_prime

            iterations.append(RaicesMultiplesIteration(
                i=cont,
                x=xn,
                f_x=fx,
                error=err,
                error_absolute=all_errors["error_absolute"],
                error_relative1=all_errors["error_relative1"],
                error_relative2=all_errors["error_relative2"],
                error_conditional=all_errors["error_conditional"],
            ))

    except Exception as exc:
        raise ValueError(f"Error durante la iteración {cont}: {exc}") from exc

    # Determinar conclusión y mensaje
    root = x0
    if abs(fx) < 1e-10:
        message = f"Se encontró la raíz exacta en x = {root:.15f}"
    elif err <= request.tol:
        message = f"Se encontró una aproximación de la raíz con tolerancia {request.tol}"
    elif cont >= request.niter:
        message = f"Se alcanzó el máximo de iteraciones ({request.niter}) sin convergencia"
    else:
        message = "El método se degeneró o no convergió"

    return RaicesMultiplesResponse(
        iterations=iterations,
        root=root,
        message=message,
        success=abs(fx) < request.tol or err <= request.tol,
        error_type=request.error_type
    )
