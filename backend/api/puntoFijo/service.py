from __future__ import annotations
import math
from typing import Callable, List
from sympy import Symbol, lambdify, sympify, SympifyError

from .schemas import PuntoFijoRequest


def _normalize_expression(expression: str) -> str:
    return expression.replace("^", "**").strip()


def _validate_real_value(value) -> float:
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


def _compute_error(xi_nuevo: float, xi: float, error_type: str) -> float:
    if error_type == "absolute":
        return abs(xi_nuevo - xi)
    if error_type == "relative":
        return abs(xi_nuevo - xi) / abs(xi_nuevo) if xi_nuevo != 0 else abs(xi_nuevo - xi)
    raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")


def parse_function(expression: str) -> Callable[[float], float]:
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


def punto_fijo(request: PuntoFijoRequest) -> dict:
    
    if request.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if request.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if request.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    # Parsear f(x)
    f = parse_function(request.funcion)
    
    # Crear g(x) = f(x) + x internamente
    def g(x):
        return f(x) + x

    try:
        g_x0 = _validate_real_value(g(request.x0))
    except Exception as exc:
        raise ValueError(f"Error al evaluar g(x0): {exc}") from exc

    iterations: List[dict] = []
    result = {
        "iterations": iterations,
        "root": None,
        "message": "",
        "success": False,
        "error_type": request.error_type,
    }

    # Iteración 0
    xi = request.x0
    iterations.append({
        "i": 0,
        "xi": xi,
        "g_xi": g_x0,
        "error": None
    })

    # Iteraciones
    for i in range(1, request.niter + 1):
        try:
            xi_nuevo = g(xi)
            xi_nuevo = _validate_real_value(xi_nuevo)
        except (OverflowError, ValueError) as exc:
            result.update(
                message=f"Divergencia detectada en iteración {i}: {str(exc)}. La función de iteración g(x) no cumple con la condición de convergencia |g'(x)| < 1.",
                success=False
            )
            return result
        
        error = _compute_error(xi_nuevo, xi, request.error_type)
        
        iterations.append({
            "i": i,
            "xi": xi_nuevo,
            "g_xi": xi_nuevo,
            "error": error
        })

        xi = xi_nuevo

        if error < request.tol:
            result.update(
                root=xi,
                message=f"Convergió en {i} iteraciones",
                success=True
            )
            return result

    result.update(message=f"No convergió en {request.niter} iteraciones. Verifique que g(x) = f(x) + x cumpla |g'(x)| < 1 cerca de la raíz.")
    return result
