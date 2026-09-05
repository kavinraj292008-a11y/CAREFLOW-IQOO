"""
Explanation generation, comparison metrics, and simulation event processing.

Explanations are DETERMINISTIC — they are derived from the actual numerical
output, not from templates chosen arbitrarily.
"""

from __future__ import annotations
from typing import List, Optional
import logging

from app.schemas.case import CareFlowCase
from app.schemas.simulation import SimulationEvent
from app.schemas.repayment import (
    RepaymentPeriod, ComparisonMetrics, Explanation,
    TraditionalResult, CareFlowResult,
)

logger = logging.getLogger(__name__)


# ── Comparison ────────────────────────────────────────────────────────────────

def calculate_comparison(
    traditional: TraditionalResult,
    careflow: CareFlowResult,
) -> ComparisonMetrics:
    """
    Compute side-by-side metrics between Traditional and CareFlow schedules.

    Positive reduction values mean CareFlow is better.
    Positive interest_difference means CareFlow costs MORE in interest.
    Positive tenure_difference means CareFlow takes LONGER.

    Transparency: if CareFlow incurs additional interest, this is exposed,
    not hidden. Lender economics are fully reported.
    """
    tm = traditional.metrics
    cm = careflow.metrics

    return ComparisonMetrics(
        peak_deficit_reduction=round(tm.peak_deficit - cm.peak_deficit, 2),
        total_deficit_reduction=round(tm.total_deficit - cm.total_deficit, 2),
        high_stress_period_reduction=tm.high_stress_periods - cm.high_stress_periods,
        critical_stress_period_reduction=tm.critical_stress_periods - cm.critical_stress_periods,
        interest_difference=round(cm.total_interest - tm.total_interest, 2),
        tenure_difference=cm.optimized_tenure - tm.optimized_tenure,
    )


# ── Explanations ──────────────────────────────────────────────────────────────

def generate_explanations(
    careflow_schedule: List[RepaymentPeriod],
    traditional_emi: float,
    original_periods: int,
    medical_expenses: List[float],
) -> List[Explanation]:
    """
    Generate deterministic explanations for each period's payment decision.

    Rules are based on the actual numerical output:
      - Payment significantly below EMI in a high-medical period → payment_reduced
      - Payment significantly above EMI in a low-medical period → payment_increased
      - Period beyond original tenure → extension
    """
    explanations: List[Explanation] = []

    # Average medical expense across all treatment periods (non-zero periods)
    non_zero = [m for m in medical_expenses if m > 0]
    avg_medical = sum(non_zero) / len(non_zero) if non_zero else 0.0

    for period in careflow_schedule:
        t = period.period
        medical = period.medical_expense
        payment = period.payment
        exp_type: Optional[str] = None
        message: Optional[str] = None

        if t > original_periods:
            exp_type = "extension"
            message = (
                "Repayment was redistributed to this extended period because the "
                "original schedule created projected treatment-related cashflow stress."
            )

        elif medical > avg_medical * 1.4 and payment < traditional_emi * 0.85:
            exp_type = "payment_reduced"
            message = (
                f"Payment was reduced to {payment:,.0f} (vs standard {traditional_emi:,.0f}) "
                f"because projected treatment expense of {medical:,.0f} creates "
                f"significant cashflow pressure in this period."
            )

        elif medical < avg_medical * 0.6 and payment > traditional_emi * 1.1:
            exp_type = "payment_increased"
            message = (
                f"Payment was increased to {payment:,.0f} (vs standard {traditional_emi:,.0f}) "
                f"because lower treatment expense ({medical:,.0f}) provides "
                f"greater repayment capacity in this period."
            )

        elif medical == 0 and payment > traditional_emi * 1.05:
            exp_type = "payment_increased"
            message = (
                f"Payment of {payment:,.0f} reflects increased repayment capacity — "
                f"no treatment expense in this period offsets the loan obligation."
            )

        elif medical == 0 and payment < traditional_emi * 0.95:
            exp_type = "treatment_driven"
            message = (
                f"Payment of {payment:,.0f} is scheduled in a treatment-free period "
                f"as part of the globally optimized repayment plan."
            )

        if exp_type is not None and message is not None:
            explanations.append(
                Explanation(
                    period=t,
                    explanation_type=exp_type,
                    message=message,
                )
            )

    return explanations


# ── Simulation Event Processing ───────────────────────────────────────────────

def apply_simulation_event(
    treatment_costs: List[float],
    event: SimulationEvent,
    completed_periods: int,
) -> List[float]:
    """
    Apply a simulation event to the treatment cost list.

    Only future periods (index >= completed_periods) may be modified.
    Completed periods are protected.

    Returns:
        Updated treatment_costs list (new list, original is not mutated).
    """
    updated = list(treatment_costs)

    if event.event_type in ("additional_cycle", "additional_expense"):
        target_idx = (event.target_period or 1) - 1  # convert to 0-based

        if target_idx < completed_periods:
            logger.warning(
                "Event target_period %d is a completed period — ignoring",
                event.target_period,
            )
            return updated

        # Extend list if necessary
        while len(updated) <= target_idx:
            updated.append(0.0)

        updated[target_idx] += (event.additional_cost or 0.0)

    elif event.event_type == "treatment_delay":
        src_idx = (event.source_period or 1) - 1
        delay = event.delay_periods or 1
        dst_idx = src_idx + delay

        if src_idx < completed_periods:
            logger.warning(
                "Event source_period %d is a completed period — ignoring",
                event.source_period,
            )
            return updated

        # Extend list if necessary
        while len(updated) <= dst_idx:
            updated.append(0.0)

        cost_to_move = updated[src_idx] if src_idx < len(updated) else 0.0
        updated[src_idx] = 0.0
        updated[dst_idx] += cost_to_move

    else:
        logger.warning("Unknown event_type: %s", event.event_type)

    return updated


def build_case_summary(case: CareFlowCase) -> dict:
    """Build a frontend-ready summary of the case inputs."""
    total_medical = sum(case.treatment_costs)
    return {
        "income": case.income,
        "monthly_household_expenses": case.monthly_household_expenses,
        "loan_principal": case.loan.principal,
        "annual_interest_rate": case.loan.annual_interest_rate,
        "remaining_periods": case.loan.remaining_periods,
        "total_treatment_cost": total_medical,
        "treatment_periods": len([c for c in case.treatment_costs if c > 0]),
        "constraints": {
            "minimum_payment": case.constraints.minimum_payment,
            "maximum_payment": case.constraints.maximum_payment,
            "maximum_extension_periods": case.constraints.maximum_extension_periods,
        },
    }
