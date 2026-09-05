"""GET /health — liveness check."""

from fastapi import APIRouter
from app.config.settings import settings

router = APIRouter()


@router.get("/health", tags=["system"])
def health_check() -> dict:
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "disclaimer": settings.SYNTHETIC_DATA_DISCLAIMER,
    }
