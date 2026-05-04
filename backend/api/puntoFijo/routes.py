from fastapi import HTTPException, APIRouter
from .service import punto_fijo
from .schemas import PuntoFijoRequest, PuntoFijoResponse


punto_fijo_router = APIRouter(prefix="/punto-fijo", tags=["Punto Fijo"])

@punto_fijo_router.post("/", response_model=PuntoFijoResponse)
def compute_punto_fijo(request: PuntoFijoRequest):
    try:
        result = punto_fijo(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result
