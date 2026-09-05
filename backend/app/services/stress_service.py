"""
Financial stress measurement for CareFlow.

Stress reflects projected cashflow deficit after all obligations —
household expenses, treatment costs, and loan repayment.

Terminology:
  "Projected cashflow deficit" — not "default".
  The system never labels projected deficits as defaults.
"""

from typing import List
from app.schemas.financial import StressLevel
from app.config.settings import settings


def calculate_projected_deficit(
    income: float,
    household_expenses: float,
    medical_expense: float,
    payment: float,
) -> float:
    """
    Projected cashflow deficit for a single period.

    projected_deficit = max(0, household + medical + payment - income)

    A zero result means no projected deficit. A positive result represents
    the amount by which obligations exceed income in this period.
    """
    shortfall = household_expenses + medical_expense + payment - income
    return max(0.0, shortfall)


def get_stress_level(projected_deficit: float) -> StressLevel:
    """
    Classify projected deficit into a stress level.

    Thresholds are configurable in app/config/settings.py.

    LOW:      deficit == 0
    MODERATE: 0 < deficit <= 10,000
    HIGH:     10,000 < deficit <= 30,000
    CRITICAL: deficit > 30,000
    """
    t = settings.stress
    if projected_deficit <= t.MODERATE:
        return StressLevel.LOW
    elif projected_deficit <= t.HIGH:
        return StressLevel.MODERATE
    elif projected_deficit <= t.CRITICAL:
        return StressLevel.HIGH
    else:
        return StressLevel.CRITICAL


def calculate_schedule_stress_metrics(
    deficits: List[float],
) -> dict:
    """
    Aggregate stress metrics across an entire schedule.

    Returns:
        peak_deficit, total_deficit, high_stress_periods, critical_stress_periods
    """
    t = settings.stress
    peak = max(deficits) if deficits else 0.0
    total = sum(deficits)
    high = sum(1 for d in deficits if t.HIGH < d <= t.CRITICAL)
    critical = sum(1 for d in deficits if d > t.CRITICAL)

    return {
        "peak_deficit": round(peak, 2),
        "total_deficit": round(total, 2),
        "high_stress_periods": high,
        "critical_stress_periods": critical,
    }
