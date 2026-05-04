from fastapi import HTTPException, APIRouter
from .service import raices_multiples
from .schemas import RaicesMultiplesRequest, RaicesMultiplesResponse


raices_multiples_router = APIRouter(prefix="/raices-multiples", tags=["Raíces Múltiples"])

@raices_multiples_router.post("/", response_model=RaicesMultiplesResponse)
def compute_raices_multiples(request: RaicesMultiplesRequest):
    try:
        result = raices_multiples(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result
