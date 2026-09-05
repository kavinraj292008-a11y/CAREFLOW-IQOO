"""
Output schemas for repayment schedules and analysis results.
Designed for direct frontend consumption.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.financial import StressLevel, OptimizationStatus


class RepaymentPeriod(BaseModel):
    """Single period in a repayment schedule."""
    period: int
    medical_expense: float
    income: float
    household_expenses: float
    available_cash_before_payment: float
    payment: float
    interest: float
    principal: float
    beginning_balance: float
    ending_balance: float
    cashflow_after_payment: float
    projected_deficit: float
    stress_level: StressLevel
    is_completed: bool = False
    explanation: Optional[str] = None


class ScheduleMetrics(BaseModel):
    """Aggregate metrics for a repayment schedule."""
    peak_deficit: float
    total_deficit: float
    high_stress_periods: int
    critical_stress_periods: int
    total_interest: float
    total_repayment: float
    original_tenure: int
    optimized_tenure: int
    extension_periods: int = 0


class ComparisonMetrics(BaseModel):
    """Side-by-side comparison between Traditional and CareFlow schedules."""
    peak_deficit_reduction: float         # positive = CareFlow is better
    total_deficit_reduction: float        # positive = CareFlow is better
    high_stress_period_reduction: int     # positive = fewer high-stress periods
    critical_stress_period_reduction: int
    interest_difference: float            # positive = CareFlow costs more interest
    tenure_difference: int                # positive = CareFlow takes longer


class Explanation(BaseModel):
    """Deterministic explanation for a payment decision."""
    period: int
    explanation_type: str   # payment_reduced | payment_increased | extension | treatment_driven
    message: str


class TraditionalResult(BaseModel):
    schedule: List[RepaymentPeriod]
    metrics: ScheduleMetrics


class CareFlowResult(BaseModel):
    schedule: List[RepaymentPeriod]
    metrics: ScheduleMetrics
    optimization_status: OptimizationStatus
    infeasibility_reason: Optional[str] = None


class CareFlowAnalysisResponse(BaseModel):
    """Complete response for /api/repayment/optimize — frontend-ready."""
    case_summary: Dict[str, Any]
    traditional: TraditionalResult
    careflow: CareFlowResult
    comparison: ComparisonMetrics
    explanations: List[Explanation]
