from __future__ import annotations
import math
from typing import Callable, List
from sympy import Symbol, lambdify, sympify, SympifyError

from .schemas import ReglaFalsaRequest


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


def _compute_error(xr_new: float, xr_old: float, error_type: str) -> float:
    if error_type == "absolute":
        return abs(xr_new - xr_old)
    if error_type == "relative":
        return abs(xr_new - xr_old) / abs(xr_new) if xr_new != 0 else abs(xr_new - xr_old)
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


def regla_falsa(request: ReglaFalsaRequest) -> dict:
    
    if request.a >= request.b:
        raise ValueError("a debe ser menor que b.")
    if request.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if request.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if request.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    f = parse_function(request.funcion)

    try:
        fa = _validate_real_value(f(request.a))
        fb = _validate_real_value(f(request.b))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en el intervalo inicial: {exc}") from exc

    iterations: List[dict] = []
    result = {
        "iterations": iterations,
        "root": None,
        "message": "",
        "success": False,
        "error_type": request.error_type,
    }

    if fa == 0:
        result.update(root=request.a, message=f"{request.a} es raíz de f(x)", success=True)
        return result

    if fb == 0:
        result.update(root=request.b, message=f"{request.b} es raíz de f(x)", success=True)
        return result

    if fa * fb > 0:
        result.update(message="El intervalo es inadecuado para el método de regla falsa: f(a) y f(b) deben tener signos opuestos.")
        return result

    # Calcular primer xr
    a = request.a
    b = request.b
    xr = b - (fb * (b - a)) / (fb - fa)

    try:
        f_xr = _validate_real_value(f(xr))
    except Exception as exc:
        raise ValueError(f"Error al evaluar la función en xr: {exc}") from exc

    iterations.append({"i": 0, "a": a, "xr": xr, "b": b, "f_xr": f_xr, "error": None})

    if f_xr == 0:
        result.update(root=xr, message=f"{xr} es raíz de f(x)", success=True)
        return result

    # Iteraciones
    for i in range(1, request.niter + 1):
        # Determinar nuevo intervalo
        if fa * f_xr < 0:
            b = xr
            fb = f_xr
        else:
            a = xr
            fa = f_xr

        xr_old = xr
        
        try:
            # xr = b - (f(b) * (b - a)) / (f(b) - f(a))
            xr = b - (fb * (b - a)) / (fb - fa)
            f_xr = _validate_real_value(f(xr))
        except (OverflowError, ValueError) as exc:
            if isinstance(exc, OverflowError):
                result.update(
                    root=xr_old,
                    message=f"Divergencia detectada en iteración {i}. Última aproximación válida = {xr_old}",
                    success=False
                )
                return result
            raise ValueError(f"Error al evaluar la función en iteración {i}: {exc}") from exc

        error = _compute_error(xr, xr_old, request.error_type)

        iterations.append({"i": i, "a": a, "xr": xr, "b": b, "f_xr": f_xr, "error": error})

        if f_xr == 0 or error < request.tol:
            result.update(
                root=xr,
                message=f"{xr} es una aproximación de una raíz con tolerancia={request.tol} usando error {request.error_type}",
                success=True,
            )
            return result

    result.update(
        root=xr,
        message=f"Fracasó en {request.niter} iteraciones, última aproximación = {xr}",
        success=False,
    )
    return result
