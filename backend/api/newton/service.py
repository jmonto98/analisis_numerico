from __future__ import annotations

import math
from typing import Callable, List

from sympy import Symbol, lambdify, sympify, diff, SympifyError

from .schemas import NewtonRequest


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


def _compute_error(xn: float, x0: float, error_type: str) -> float:
    if error_type == "absolute":
        return abs(xn - x0)
    if error_type == "relative":
        return abs(xn - x0) / abs(xn) if xn != 0 else abs(xn - x0)
    raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")


def parse_function(expression: str) -> tuple[Callable[[float], float], Callable[[float], float]]:
    expression = _normalize_expression(expression)
    x = Symbol("x")

    try:
        parsed = sympify(expression, locals={"x": x})
    except SympifyError as exc:
        raise ValueError(f"Función inválida: {exc}") from exc

    # Calcular la derivada simbólicamente
    try:
        df_parsed = diff(parsed, x)
    except Exception as exc:
        raise ValueError(f"No se pudo calcular la derivada: {exc}") from exc

    try:
        f = lambdify(x, parsed, modules=["math"])
        df = lambdify(x, df_parsed, modules=["math"])
    except Exception as exc:
        raise ValueError(f"No se pudo construir la función: {exc}") from exc

    try:
        f(1.0)
        df(1.0)
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función: {exc}") from exc

    return f, df


def newton(newton_request: NewtonRequest) -> dict:
    if newton_request.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if newton_request.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if newton_request.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    f, df = parse_function(newton_request.funcion)

    try:
        fe = _validate_real_value(f(newton_request.x0))
        dfe = _validate_real_value(df(newton_request.x0))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en el valor inicial: {exc}") from exc

    iterations: List[dict] = []
    result = {
        "iterations": iterations,
        "root": None,
        "message": "",
        "success": False,
        "error_type": newton_request.error_type,
    }

    # Primera iteración
    iterations.append({"i": 0, "x": newton_request.x0, "f_x": fe, "df_x": dfe, "error": None})

    if fe == 0:
        result.update(root=newton_request.x0, message=f"{newton_request.x0} es raíz de f(x)", success=True)
        return result

    if dfe == 0:
        result.update(message=f"La derivada es cero en x0 = {newton_request.x0}. No se puede aplicar el método de Newton.")
        return result

    # Iteraciones subsecuentes
    x0 = newton_request.x0
    for i in range(1, newton_request.niter + 1):
        xn = x0 - fe / dfe
        
        try:
            fe = _validate_real_value(f(xn))
            dfe = _validate_real_value(df(xn))
        except Exception as exc:
            raise ValueError(f"Error al evaluar la función en iteración {i}: {exc}") from exc

        error = _compute_error(xn, x0, newton_request.error_type)
        iterations.append({"i": i, "x": xn, "f_x": fe, "df_x": dfe, "error": error})

        if fe == 0 or error < newton_request.tol:
            result.update(
                root=xn,
                message=f"{xn} es una aproximación de una raíz con tolerancia={newton_request.tol} usando error {newton_request.error_type}",
                success=True,
            )
            return result

        if dfe == 0:
            result.update(
                root=xn,
                message=f"{xn} es una posible raíz múltiple de f(x)",
                success=True,
            )
            return result

        x0 = xn

    result.update(
        root=xn,
        message=f"Fracasó en {newton_request.niter} iteraciones, última aproximación = {xn}",
        success=False,
    )
    return result
