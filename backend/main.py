from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.biseccion.routes import biseccion_router
from api.newton.routes import newton_router

app = FastAPI(
    title="API Análisis Numérico",
    version="0.1.0",
    description="Backend FastAPI para el análisis numérico.",
)

app = FastAPI()
app.include_router(biseccion_router)
app.include_router(newton_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)