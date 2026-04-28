from __future__ import annotations
import math
from typing import Callable, List
from sympy import Symbol, lambdify, sympify, SympifyError

from .schemas import BiseccionRequest

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


def _compute_error(xm: float, xa: float, error_type: str) -> float:
    if error_type == "absolute":
        return abs(xm - xa)
    if error_type == "relative":
        return abs(xm - xa) / abs(xm) if xm != 0 else abs(xm - xa)
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


def biseccion(biseccion: BiseccionRequest) -> dict:
    
    if biseccion.xi == biseccion.xs:
        raise ValueError("xi y xs deben ser diferentes.")
    if biseccion.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if biseccion.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if biseccion.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    f = parse_function(biseccion.funcion)

    try:
        fi = _validate_real_value(f(biseccion.xi))
        fs = _validate_real_value(f(biseccion.xs))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en el intervalo inicial: {exc}") from exc

    iterations: List[dict] = []
    result = {
        "iterations": iterations,
        "root": None,
        "message": "",
        "success": False,
        "error_type": biseccion.error_type,
    }

    if fi == 0:
        result.update(root=biseccion.xi, message=f"{biseccion.xi} es raíz de f(x)", success=True)
        return result

    if fs == 0:
        result.update(root=biseccion.xs, message=f"{biseccion.xs} es raíz de f(x)", success=True)
        return result

    if fi * fs > 0:
        result.update(message="El intervalo es inadecuado para el método de bisección.")
        return result

    xm = (biseccion.xi + biseccion.xs) / 2.0

    try:
        f_xm = _validate_real_value(f(xm))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en xm: {exc}") from exc

    iterations.append({"i": 0, "xm": xm, "f_xm": f_xm, "error": None})

    if f_xm == 0:
        result.update(root=xm, message=f"{xm} es raíz de f(x)", success=True)
        return result

    # Inicializar variables locales para el loop
    xi = biseccion.xi
    xs = biseccion.xs

    for i in range(1, biseccion.niter + 1):
        if fi * f_xm < 0:
            xs = xm
            fs = f_xm
        else:
            xi = xm
            fi = f_xm

        xa = xm
        xm = (xi + xs) / 2.0

        try:
            f_xm = _validate_real_value(f(xm))
        except Exception as exc:
            raise ValueError(f"Error al evaluar la función en xm: {exc}") from exc

        error = _compute_error(xm, xa, biseccion.error_type)
        iterations.append({"i": i, "xm": xm, "f_xm": f_xm, "error": error})

        if f_xm == 0 or error < biseccion.tol:
            result.update(
                root=xm,
                message=f"{xm} es una aproximación de una raíz con tolerancia={biseccion.tol} usando error {biseccion.error_type}",
                success=True,
            )
            return result

    result.update(
        root=xm,
        message=f"Fracasó en {biseccion.niter} iteraciones, última aproximación = {xm}",
        success=False,
    )
    return result
