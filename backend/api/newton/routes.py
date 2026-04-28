from fastapi import HTTPException, APIRouter
from .service import newton
from .schemas import NewtonRequest, NewtonResponse


newton_router = APIRouter(prefix="/newton", tags=["Newton"])


@newton_router.post("/", response_model=NewtonResponse)
def compute_newton(request: NewtonRequest):
    try:
        result = newton(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result
