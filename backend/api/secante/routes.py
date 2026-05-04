from fastapi import HTTPException, APIRouter
from .service import secante
from .schemas import SecanteRequest, SecanteResponse


secante_router = APIRouter(prefix="/secante", tags=["Secante"])

@secante_router.post("/", response_model=SecanteResponse)
def compute_secante(request: SecanteRequest):
    try:
        result = secante(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result
