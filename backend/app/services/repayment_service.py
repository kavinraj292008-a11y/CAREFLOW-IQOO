"""
Repayment schedule generation.

Provides:
  - Traditional (fixed EMI) schedule
  - CareFlow (optimizer-driven adaptive) schedule

Business logic lives here, NOT in API route handlers.
"""

from __future__ import annotations
from typing import List, Tuple, Optional

from app.schemas.case import CareFlowCase
from app.schemas.repayment import RepaymentPeriod, ScheduleMetrics, TraditionalResult, CareFlowResult
from app.schemas.financial import OptimizationStatus, StressLevel
from app.services.loan_service import (
    calculate_emi,
    calculate_amortization,
    calculate_remaining_balance,
    monthly_rate,
)
from app.services.stress_service import (
    calculate_projected_deficit,
    get_stress_level,
    calculate_schedule_stress_metrics,
)
from app.optimization.careflow_optimizer import optimize_careflow


def _get_medical(treatment_costs: List[float], period_index: int) -> float:
    """Return treatment cost for period_index (0-based), zero if beyond list."""
    if period_index < len(treatment_costs):
        return treatment_costs[period_index]
    return 0.0


def _compute_schedule_metrics(
    periods: List[RepaymentPeriod],
    original_tenure: int,
    extension_periods: int = 0,
) -> ScheduleMetrics:
    """Derive aggregate metrics from a list of RepaymentPeriod objects."""
    deficits = [p.projected_deficit for p in periods]
    stress = calculate_schedule_stress_metrics(deficits)
    total_interest = sum(p.interest for p in periods)
    total_repayment = sum(p.payment for p in periods)

    return ScheduleMetrics(
        peak_deficit=stress["peak_deficit"],
        total_deficit=stress["total_deficit"],
        high_stress_periods=stress["high_stress_periods"],
        critical_stress_periods=stress["critical_stress_periods"],
        total_interest=round(total_interest, 2),
        total_repayment=round(total_repayment, 2),
        original_tenure=original_tenure,
        optimized_tenure=len(periods),
        extension_periods=extension_periods,
    )


def build_period(
    period_number: int,
    beginning_balance: float,
    payment: float,
    interest: float,
    principal_paid: float,
    ending_balance: float,
    medical_expense: float,
    income: float,
    household_expenses: float,
    is_completed: bool = False,
    explanation: Optional[str] = None,
) -> RepaymentPeriod:
    """Construct a RepaymentPeriod from raw financial values."""
    available = income - household_expenses - medical_expense
    cashflow = available - payment
    deficit = calculate_projected_deficit(income, household_expenses, medical_expense, payment)
    stress = get_stress_level(deficit)

    return RepaymentPeriod(
        period=period_number,
        medical_expense=round(medical_expense, 2),
        income=round(income, 2),
        household_expenses=round(household_expenses, 2),
        available_cash_before_payment=round(available, 2),
        payment=round(payment, 2),
        interest=round(interest, 2),
        principal=round(principal_paid, 2),
        beginning_balance=round(beginning_balance, 2),
        ending_balance=round(max(0.0, ending_balance), 2),
        cashflow_after_payment=round(cashflow, 2),
        projected_deficit=round(deficit, 2),
        stress_level=stress,
        is_completed=is_completed,
        explanation=explanation,
    )


# ── Traditional Schedule ─────────────────────────────────────────────────────

def calculate_traditional_schedule(case: CareFlowCase) -> TraditionalResult:
    """
    Generate a standard fixed-EMI repayment schedule.

    EMI is calculated once from the loan profile and held constant
    for all periods except the final one, which is adjusted to close
    the balance exactly.
    """
    amort = calculate_amortization(
        principal=case.loan.principal,
        annual_interest_rate=case.loan.annual_interest_rate,
        periods=case.loan.remaining_periods,
    )

    periods: List[RepaymentPeriod] = []
    for row in amort:
        t = row["period"] - 1
        medical = _get_medical(case.treatment_costs, t)
        periods.append(
            build_period(
                period_number=row["period"],
                beginning_balance=row["beginning_balance"],
                payment=row["payment"],
                interest=row["interest"],
                principal_paid=row["principal"],
                ending_balance=row["ending_balance"],
                medical_expense=medical,
                income=case.income,
                household_expenses=case.monthly_household_expenses,
            )
        )

    metrics = _compute_schedule_metrics(
        periods,
        original_tenure=case.loan.remaining_periods,
    )
    return TraditionalResult(schedule=periods, metrics=metrics)


# ── CareFlow Adaptive Schedule ───────────────────────────────────────────────

def calculate_careflow_schedule(case: CareFlowCase) -> CareFlowResult:
    """
    Generate a CareFlow adaptive repayment schedule via LP optimization.

    Payment amounts vary by period: higher in low-medical periods,
    lower in high-medical periods. The optimizer minimizes projected
    cashflow stress subject to lender constraints.
    """
    r = monthly_rate(case.loan.annual_interest_rate)

    result = optimize_careflow(
        remaining_balance=case.loan.principal,
        monthly_rate=r,
        n_remaining_periods=case.loan.remaining_periods,
        max_extension_periods=case.constraints.maximum_extension_periods,
        medical_expenses=case.treatment_costs,
        income=case.income,
        household_expenses=case.monthly_household_expenses,
        min_payment=case.constraints.minimum_payment,
        max_payment=case.constraints.maximum_payment,
    )

    if result.status == OptimizationStatus.INFEASIBLE:
        return CareFlowResult(
            schedule=[],
            metrics=ScheduleMetrics(
                peak_deficit=0, total_deficit=0,
                high_stress_periods=0, critical_stress_periods=0,
                total_interest=0, total_repayment=0,
                original_tenure=case.loan.remaining_periods,
                optimized_tenure=0, extension_periods=0,
            ),
            optimization_status=OptimizationStatus.INFEASIBLE,
            infeasibility_reason=result.infeasibility_reason,
        )

    T = len(result.payments)
    periods: List[RepaymentPeriod] = []

    for t in range(T):
        payment = result.payments[t]
        beginning_balance = result.balances[t]
        interest = beginning_balance * r
        principal_paid = payment - interest
        ending_balance = result.balances[t + 1]

        # Final period: force exactly zero to absorb floating-point residual
        if t == T - 1:
            ending_balance = 0.0

        medical = _get_medical(case.treatment_costs, t)

        periods.append(
            build_period(
                period_number=t + 1,
                beginning_balance=beginning_balance,
                payment=payment,
                interest=interest,
                principal_paid=principal_paid,
                ending_balance=ending_balance,
                medical_expense=medical,
                income=case.income,
                household_expenses=case.monthly_household_expenses,
            )
        )

    metrics = _compute_schedule_metrics(
        periods,
        original_tenure=case.loan.remaining_periods,
        extension_periods=result.extension_periods,
    )

    return CareFlowResult(
        schedule=periods,
        metrics=metrics,
        optimization_status=result.status,
    )


# ── Replanning: reconstruct completed periods ────────────────────────────────

def reconstruct_completed_periods(
    case: CareFlowCase,
    n_completed: int,
    completed_payments: List[float],
) -> List[RepaymentPeriod]:
    """
    Rebuild completed period data from actual payments made.
    These periods are frozen — they will not be re-optimized.
    """
    r = monthly_rate(case.loan.annual_interest_rate)
    balance = case.loan.principal
    periods: List[RepaymentPeriod] = []

    for i in range(n_completed):
        payment = completed_payments[i]
        interest = balance * r
        principal_paid = payment - interest
        ending_balance = max(0.0, balance - principal_paid)
        medical = _get_medical(case.treatment_costs, i)

        periods.append(
            build_period(
                period_number=i + 1,
                beginning_balance=balance,
                payment=payment,
                interest=interest,
                principal_paid=principal_paid,
                ending_balance=ending_balance,
                medical_expense=medical,
                income=case.income,
                household_expenses=case.monthly_household_expenses,
                is_completed=True,
            )
        )
        balance = ending_balance

    return periods


def calculate_careflow_schedule_from_balance(
    case: CareFlowCase,
    remaining_balance: float,
    n_remaining: int,
    future_medical: List[float],
    period_offset: int,
) -> CareFlowResult:
    """
    Run CareFlow optimization starting from a known remaining balance.
    Used for replanning after completed periods.

    period_offset: number to add to period numbers (for display continuity).
    """
    r = monthly_rate(case.loan.annual_interest_rate)

    result = optimize_careflow(
        remaining_balance=remaining_balance,
        monthly_rate=r,
        n_remaining_periods=n_remaining,
        max_extension_periods=case.constraints.maximum_extension_periods,
        medical_expenses=future_medical,
        income=case.income,
        household_expenses=case.monthly_household_expenses,
        min_payment=case.constraints.minimum_payment,
        max_payment=case.constraints.maximum_payment,
    )

    if result.status == OptimizationStatus.INFEASIBLE:
        return CareFlowResult(
            schedule=[],
            metrics=ScheduleMetrics(
                peak_deficit=0, total_deficit=0,
                high_stress_periods=0, critical_stress_periods=0,
                total_interest=0, total_repayment=0,
                original_tenure=n_remaining,
                optimized_tenure=0, extension_periods=0,
            ),
            optimization_status=OptimizationStatus.INFEASIBLE,
            infeasibility_reason=result.infeasibility_reason,
        )

    T = len(result.payments)
    periods: List[RepaymentPeriod] = []

    for t in range(T):
        payment = result.payments[t]
        beginning_balance = result.balances[t]
        interest = beginning_balance * r
        principal_paid = payment - interest
        ending_balance = result.balances[t + 1]

        if t == T - 1:
            ending_balance = 0.0

        medical = future_medical[t] if t < len(future_medical) else 0.0

        periods.append(
            build_period(
                period_number=period_offset + t + 1,
                beginning_balance=beginning_balance,
                payment=payment,
                interest=interest,
                principal_paid=principal_paid,
                ending_balance=ending_balance,
                medical_expense=medical,
                income=case.income,
                household_expenses=case.monthly_household_expenses,
            )
        )

    metrics = _compute_schedule_metrics(
        periods,
        original_tenure=n_remaining,
        extension_periods=result.extension_periods,
    )

    return CareFlowResult(
        schedule=periods,
        metrics=metrics,
        optimization_status=result.status,
    )
