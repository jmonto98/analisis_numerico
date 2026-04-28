from fastapi import HTTPException, APIRouter
from .service import biseccion
from .schemas import BiseccionRequest, BiseccionResponse


biseccion_router = APIRouter(prefix="/biseccion", tags=["Bisección"])

@biseccion_router.post("/", response_model=BiseccionResponse)
def compute_biseccion(request: BiseccionRequest):
    try:
        result = biseccion(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result