
from fastapi import HTTPException, APIRouter
from .service import biseccion, graph_points
from .schemas import BiseccionRequest, BiseccionResponse, BiseccionResponse, GraphRequest, GraphResponse


biseccion_router = APIRouter(prefix="/biseccion", tags=["Bisección"])

@biseccion_router.post("/", response_model=BiseccionResponse)
def compute_biseccion(request: BiseccionRequest):
    try:
        if request.method == "biseccion":
            result = biseccion(
                request.funcion,
                request.xi,
                request.xs,
                request.tol,
                request.niter,
                request.error_type,
            )
        else:
            raise HTTPException(status_code=400, detail=f"Método {request.method} no implementado aún.")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result


@biseccion_router.post("/grafica", response_model=GraphResponse)
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
