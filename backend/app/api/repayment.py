"""
Repayment analysis and optimization endpoints.

GET  /api/demo-case
POST /api/repayment/analyze
POST /api/repayment/optimize

Business logic is entirely in services/ — route handlers are thin.
"""

from fastapi import APIRouter, HTTPException
from app.schemas.case import CareFlowCase
from app.schemas.repayment import CareFlowAnalysisResponse
from app.schemas.financial import OptimizationStatus
from app.services.repayment_service import (
    calculate_traditional_schedule,
    calculate_careflow_schedule,
)
from app.services.optimization_service import (
    calculate_comparison,
    generate_explanations,
    build_case_summary,
)
from app.services.loan_service import calculate_emi
from app.data.demo_cases import get_demo_cases, get_canonical_demo_case

router = APIRouter(prefix="/api", tags=["repayment"])


@router.get("/demo-case")
def demo_case():
    """Return the canonical demo case and all available demo cases."""
    return {
        "disclaimer": (
            "All scenarios are synthetic and illustrative. "
            "Not medical advice, financial advice, or a loan approval system."
        ),
        "cases": get_demo_cases(),
    }


@router.post("/repayment/analyze")
def analyze_repayment(case: CareFlowCase):
    """
    Generate only the traditional fixed-EMI schedule and its metrics.
    Useful for baseline calculation before running CareFlow optimization.
    """
    traditional = calculate_traditional_schedule(case)
    return {
        "case_summary": build_case_summary(case),
        "traditional": traditional.model_dump(),
    }


@router.post("/repayment/optimize", response_model=CareFlowAnalysisResponse)
def optimize_repayment(case: CareFlowCase):
    """
    Full CareFlow analysis:
      1. Calculate traditional fixed-EMI schedule.
      2. Run CareFlow LP optimization.
      3. Return both schedules, comparison metrics, and explanations.

    All financial values are computed by the deterministic engine.
    No values are fabricated or hardcoded.
    """
    traditional = calculate_traditional_schedule(case)
    careflow = calculate_careflow_schedule(case)

    if careflow.optimization_status == OptimizationStatus.INFEASIBLE:
        # Still return traditional result alongside the infeasibility report
        return CareFlowAnalysisResponse(
            case_summary=build_case_summary(case),
            traditional=traditional,
            careflow=careflow,
            comparison=calculate_comparison(traditional, careflow),
            explanations=[],
        )

    standard_emi = calculate_emi(
        case.loan.principal,
        case.loan.annual_interest_rate,
        case.loan.remaining_periods,
    )

    explanations = generate_explanations(
        careflow_schedule=careflow.schedule,
        traditional_emi=standard_emi,
        original_periods=case.loan.remaining_periods,
        medical_expenses=case.treatment_costs,
    )

    comparison = calculate_comparison(traditional, careflow)

    return CareFlowAnalysisResponse(
        case_summary=build_case_summary(case),
        traditional=traditional,
        careflow=careflow,
        comparison=comparison,
        explanations=explanations,
    )
