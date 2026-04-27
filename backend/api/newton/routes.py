from fastapi import HTTPException, APIRouter
from .service import newton, graph_points
from .schemas import NewtonRequest, NewtonResponse, GraphRequest, GraphResponse


newton_router = APIRouter(prefix="/newton", tags=["Newton"])


@newton_router.post("/", response_model=NewtonResponse)
def compute_newton(request: NewtonRequest):
    try:
        if request.method == "newton":
            result = newton(
                request.funcion,
                request.x0,
                request.tol,
                request.niter,
                request.error_type,
            )
        else:
            raise HTTPException(status_code=400, detail=f"Método {request.method} no implementado aún.")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result


@newton_router.post("/grafica", response_model=GraphResponse)
def compute_graph(request: GraphRequest):
    try:
        points = graph_points(request.funcion, request.xi, request.xs, request.n_points)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "points": points,
        "success": True,
        "message": "Gráfica generada correctamente.",
    }
