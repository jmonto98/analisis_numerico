from __future__ import annotations

import math
from typing import Callable, List, Optional

from sympy import Symbol, lambdify, sympify, diff, SympifyError


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


def newton(funcion: str, x0: float, tol: float, niter: int, error_type: str = "relative") -> dict:
    if tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    f, df = parse_function(funcion)

    try:
        fe = _validate_real_value(f(x0))
        dfe = _validate_real_value(df(x0))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en el valor inicial: {exc}") from exc

    iterations: List[dict] = []
    result = {
        "iterations": iterations,
        "root": None,
        "message": "",
        "success": False,
        "error_type": error_type,
    }

    # Primera iteración
    iterations.append({"i": 0, "x": x0, "f_x": fe, "df_x": dfe, "error": None})

    if fe == 0:
        result.update(root=x0, message=f"{x0} es raíz de f(x)", success=True)
        return result

    if dfe == 0:
        result.update(message=f"La derivada es cero en x0 = {x0}. No se puede aplicar el método de Newton.")
        return result

    # Iteraciones subsecuentes
    for i in range(1, niter + 1):
        xn = x0 - fe / dfe
        
        try:
            fe = _validate_real_value(f(xn))
            dfe = _validate_real_value(df(xn))
        except Exception as exc:
            raise ValueError(f"Error al evaluar la función en iteración {i}: {exc}") from exc

        error = _compute_error(xn, x0, error_type)
        iterations.append({"i": i, "x": xn, "f_x": fe, "df_x": dfe, "error": error})

        if fe == 0 or error < tol:
            result.update(
                root=xn,
                message=f"{xn} es una aproximación de una raíz con tolerancia={tol} usando error {error_type}",
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
        message=f"Fracasó en {niter} iteraciones, última aproximación = {xn}",
        success=False,
    )
    return result


def graph_points(funcion: str, xi: float, xs: float, n_points: int = 180) -> list[dict]:
    if xi == xs:
        raise ValueError("xi y xs deben ser diferentes para generar la gráfica.")
    if n_points <= 1:
        raise ValueError("El número de puntos debe ser mayor que 1.")

    f, _ = parse_function(funcion)
    step = (xs - xi) / (n_points - 1)

    points: list[dict] = []
    for i in range(n_points):
        x = xi + step * i
        try:
            y = _validate_real_value(f(x))
        except Exception:
            y = None

        points.append({"x": x, "y": y})

    return points
