from __future__ import annotations
import math
from typing import Callable, List
from sympy import Symbol, lambdify, sympify, SympifyError

from .schemas import SecanteRequest


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


def secante(request: SecanteRequest) -> dict:
    
    if request.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if request.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if request.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    f = parse_function(request.funcion)

    try:
        f_x0 = _validate_real_value(f(request.x0))
        f_x1 = _validate_real_value(f(request.x1))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en los puntos iniciales: {exc}") from exc

    iterations: List[dict] = []
    result = {
        "iterations": iterations,
        "root": None,
        "message": "",
        "success": False,
        "error_type": request.error_type,
    }

    # Iteración 0 y 1
    iterations.append({
        "i": 0,
        "xi": request.x0,
        "f_xi": f_x0,
        "error": None
    })
    iterations.append({
        "i": 1,
        "xi": request.x1,
        "f_xi": f_x1,
        "error": None
    })

    x0 = request.x0
    x1 = request.x1
    f0 = f_x0
    f1 = f_x1

    # Iteraciones
    for i in range(2, request.niter + 2):
        # Evitar división por cero
        if f1 == f0:
            result.update(message="División por cero: f(x0) == f(x1)")
            return result

        try:
            # xn = x1 - f1 * (x1 - x0) / (f1 - f0)
            xn = x1 - f1 * (x1 - x0) / (f1 - f0)
            fn = _validate_real_value(f(xn))
        except (OverflowError, ValueError) as exc:
            if isinstance(exc, OverflowError):
                result.update(
                    root=x1,
                    message=f"Divergencia detectada en iteración {i}. Última aproximación válida = {x1}",
                    success=False
                )
                return result
            raise
        
        error = _compute_error(xn, x1, request.error_type)
        
        iterations.append({
            "i": i,
            "xi": xn,
            "f_xi": fn,
            "error": error
        })

        if error < request.tol:
            result.update(
                root=xn,
                message=f"Convergió en {i} iteraciones",
                success=True
            )
            return result

        x0 = x1
        f0 = f1
        x1 = xn
        f1 = fn

    result.update(message=f"No convergió en {request.niter} iteraciones")
    return result
