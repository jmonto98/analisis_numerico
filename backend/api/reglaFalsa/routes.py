from fastapi import HTTPException, APIRouter
from .service import regla_falsa
from .schemas import ReglaFalsaRequest, ReglaFalsaResponse


regla_falsa_router = APIRouter(prefix="/regla-falsa", tags=["Regla Falsa"])

@regla_falsa_router.post("/", response_model=ReglaFalsaResponse)
def compute_regla_falsa(request: ReglaFalsaRequest):
    try:
        result = regla_falsa(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result
