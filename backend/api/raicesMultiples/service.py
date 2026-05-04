from __future__ import annotations
import math
from typing import Callable, List
from sympy import Symbol, lambdify, sympify, SympifyError

from .schemas import RaicesMultiplesRequest


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


def _biseccion_refinar(
    f: Callable[[float], float],
    xi: float,
    xs: float,
    tol: float,
    max_iter: int,
    error_type: str,
) -> tuple[float, int]:
    """Usa bisección para refinar una raíz en el intervalo [xi, xs]"""
    for i in range(1, max_iter + 1):
        xm = (xi + xs) / 2.0
        fm = _validate_real_value(f(xm))
        fi = _validate_real_value(f(xi))
        
        error = _compute_error(xm, xi, error_type)
        
        if error < tol:
            return xm, i
        
        if fi * fm < 0:
            xs = xm
        else:
            xi = xm
    
    xm = (xi + xs) / 2.0
    return xm, max_iter


def raices_multiples(request: RaicesMultiplesRequest) -> dict:
    
    if request.a >= request.b:
        raise ValueError("El límite inferior (a) debe ser menor que el superior (b).")
    if request.tol <= 0:
        raise ValueError("La tolerancia debe ser mayor que cero.")
    if request.niter <= 0:
        raise ValueError("El número de iteraciones debe ser mayor que cero.")
    if request.subintervalos <= 0:
        raise ValueError("El número de subintervalos debe ser mayor que cero.")
    if request.error_type not in {"absolute", "relative"}:
        raise ValueError("El tipo de error debe ser 'absolute' o 'relative'.")

    f = parse_function(request.funcion)

    result = {
        "raices": [],
        "total_raices": 0,
        "message": "",
        "success": False,
        "error_type": request.error_type,
    }

    # Dividir el intervalo en subintervalos
    h = (request.b - request.a) / request.subintervalos
    raices_encontradas: List[dict] = []

    try:
        for i in range(request.subintervalos):
            x_left = request.a + i * h
            x_right = request.a + (i + 1) * h

            f_left = _validate_real_value(f(x_left))
            f_right = _validate_real_value(f(x_right))

            # Detectar cambio de signo (indica raíz)
            if f_left * f_right < 0:
                # Refinar la raíz usando bisección
                raiz, iter_count = _biseccion_refinar(
                    f, x_left, x_right, request.tol, request.niter, request.error_type
                )
                
                f_raiz = _validate_real_value(f(raiz))
                raices_encontradas.append({
                    "raiz": raiz,
                    "f_raiz": f_raiz,
                    "iteraciones": iter_count
                })

    except Exception as exc:
        raise ValueError(f"Error durante la búsqueda de raíces: {exc}") from exc

    if raices_encontradas:
        result.update(
            raices=raices_encontradas,
            total_raices=len(raices_encontradas),
            message=f"Se encontraron {len(raices_encontradas)} raíz(ces)",
            success=True
        )
    else:
        result.update(message="No se encontraron raíces en el intervalo especificado")

    return result
