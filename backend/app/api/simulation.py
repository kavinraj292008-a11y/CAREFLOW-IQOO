"""
POST /api/simulation/replan — dynamic replanning after a treatment event.

Workflow:
  1. Freeze completed periods (unchanged).
  2. Recalculate remaining balance from actual completed payments.
  3. Apply the simulation event to future treatment costs.
  4. Re-run CareFlow optimization for remaining periods.
  5. Return combined schedule (completed frozen + new future).
"""

from fastapi import APIRouter, HTTPException

from app.schemas.simulation import ReplanRequest, ReplanResult
from app.schemas.financial import OptimizationStatus
from app.services.loan_service import calculate_remaining_balance
from app.services.repayment_service import (
    reconstruct_completed_periods,
    calculate_careflow_schedule_from_balance,
    _compute_schedule_metrics,
)
from app.services.optimization_service import (
    apply_simulation_event,
    generate_explanations,
    build_case_summary,
)
from app.services.loan_service import calculate_emi

router = APIRouter(prefix="/api", tags=["simulation"])


@router.post("/simulation/replan", response_model=ReplanResult)
def replan(request: ReplanRequest):
    """
    Re-optimize the repayment schedule after a treatment event.

    Completed periods are immutable.
    Only periods beyond completed_periods are subject to replanning.

    Supported events: additional_cycle, additional_expense, treatment_delay
    """
    case = request.case
    event = request.event
    n_completed = request.completed_periods
    completed_payments = request.completed_payments

    # ── Step 1: Recalculate remaining balance ──────────────────────────────
    remaining_balance = calculate_remaining_balance(
        principal=case.loan.principal,
        annual_interest_rate=case.loan.annual_interest_rate,
        completed_payments=completed_payments,
    )

    # ── Step 2: Freeze completed periods ──────────────────────────────────
    completed_schedule = reconstruct_completed_periods(
        case=case,
        n_completed=n_completed,
        completed_payments=completed_payments,
    )

    # ── Step 3: Apply simulation event to future treatment costs ───────────
    updated_medical = apply_simulation_event(
        treatment_costs=case.treatment_costs,
        event=event,
        completed_periods=n_completed,
    )

    # Future medical costs only (from period n_completed+1 onwards)
    future_medical = updated_medical[n_completed:]

    # ── Step 4: Re-optimize remaining periods ──────────────────────────────
    n_remaining = case.loan.remaining_periods - n_completed

    future_result = calculate_careflow_schedule_from_balance(
        case=case,
        remaining_balance=remaining_balance,
        n_remaining=n_remaining,
        future_medical=future_medical,
        period_offset=n_completed,
    )

    # ── Step 5: Generate explanations for new future schedule ──────────────
    standard_emi = calculate_emi(
        case.loan.principal,
        case.loan.annual_interest_rate,
        case.loan.remaining_periods,
    )

    if future_result.optimization_status != OptimizationStatus.INFEASIBLE:
        explanations = generate_explanations(
            careflow_schedule=future_result.schedule,
            traditional_emi=standard_emi,
            original_periods=case.loan.remaining_periods,
            medical_expenses=future_medical,
        )
    else:
        explanations = []

    # ── Step 6: Combine completed + future ────────────────────────────────
    full_schedule = completed_schedule + future_result.schedule

    # Metrics cover the full combined schedule
    full_metrics = _compute_schedule_metrics(
        periods=full_schedule,
        original_tenure=case.loan.remaining_periods,
        extension_periods=future_result.metrics.extension_periods,
    )

    return ReplanResult(
        event=event,
        replan_status=future_result.optimization_status,
        balance_at_replan=round(remaining_balance, 2),
        updated_medical_expenses=updated_medical,
        completed_schedule=completed_schedule,
        new_future_schedule=future_result.schedule,
        full_schedule=full_schedule,
        new_metrics=full_metrics,
        explanations=explanations,
        infeasibility_reason=future_result.infeasibility_reason,
    )
