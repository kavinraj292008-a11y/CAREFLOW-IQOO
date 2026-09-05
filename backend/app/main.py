"""
CareFlow Financial Engine — Day 1 Backend.

Treatment doesn't follow an EMI schedule. Neither should repayment.

This is a prototype decision-support tool.
It does NOT provide medical advice, financial advice, or loan approvals.
All treatment scenarios are synthetic and illustrative.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.config.settings import settings
from app.api import health, repayment, simulation

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — permissive for Day 1 prototype (frontend dev on same machine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global error handlers ─────────────────────────────────────────────────────

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    """Return 422 with structured validation errors, no internal stack traces."""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Input validation failed"},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "message": "Invalid input"},
    )


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(repayment.router)
app.include_router(simulation.router)


# ── Root ──────────────────────────────────────────────────────────────────────

@app.get("/", tags=["system"])
def root():
    return {
        "service": settings.APP_NAME,
        "tagline": settings.APP_DESCRIPTION,
        "version": settings.APP_VERSION,
        "endpoints": [
            "GET  /health",
            "GET  /api/demo-case",
            "POST /api/repayment/analyze",
            "POST /api/repayment/optimize",
            "POST /api/simulation/replan",
            "GET  /docs",
        ],
        "disclaimer": settings.SYNTHETIC_DATA_DISCLAIMER,
    }
