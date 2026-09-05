"""
Schemas for dynamic replanning simulation.
"""

from __future__ import annotations
from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Any, Dict
from app.schemas.case import CareFlowCase
from app.schemas.repayment import RepaymentPeriod, ScheduleMetrics, Explanation
from app.schemas.financial import OptimizationStatus


class SimulationEvent(BaseModel):
    """
    A treatment event that triggers schedule replanning.

    Supported event types:
      additional_cycle   — adds a new treatment cycle cost at target_period
      additional_expense — adds a one-off extra expense at target_period
      treatment_delay    — shifts treatment cost from source_period by delay_periods
    """
    event_type: str = Field(
        ...,
        description="additional_cycle | additional_expense | treatment_delay"
    )
    target_period: Optional[int] = Field(default=None, ge=1)
    source_period: Optional[int] = Field(default=None, ge=1)
    additional_cost: Optional[float] = Field(default=None, ge=0)
    delay_periods: Optional[int] = Field(default=None, ge=1)
    description: Optional[str] = None

    @model_validator(mode="after")
    def validate_event(self) -> "SimulationEvent":
        if self.event_type in ("additional_cycle", "additional_expense"):
            if self.target_period is None:
                raise ValueError(f"target_period required for event_type={self.event_type}")
            if self.additional_cost is None:
                raise ValueError(f"additional_cost required for event_type={self.event_type}")
        elif self.event_type == "treatment_delay":
            if self.source_period is None:
                raise ValueError("source_period required for treatment_delay")
            if self.delay_periods is None:
                raise ValueError("delay_periods required for treatment_delay")
        else:
            raise ValueError(
                f"Unknown event_type '{self.event_type}'. "
                "Must be: additional_cycle | additional_expense | treatment_delay"
            )
        return self


class ReplanRequest(BaseModel):
    """
    Request body for POST /api/simulation/replan.

    completed_periods: number of periods already executed (frozen)
    completed_payments: actual payments made for completed periods
    event: the treatment event that triggered replanning
    """
    case: CareFlowCase
    completed_periods: int = Field(default=0, ge=0)
    completed_payments: List[float] = Field(default_factory=list)
    event: SimulationEvent

    @model_validator(mode="after")
    def validate_completed(self) -> "ReplanRequest":
        if len(self.completed_payments) != self.completed_periods:
            raise ValueError(
                f"completed_payments length ({len(self.completed_payments)}) "
                f"must match completed_periods ({self.completed_periods})"
            )
        if self.completed_periods >= self.case.loan.remaining_periods:
            raise ValueError(
                "completed_periods must be less than remaining_periods — "
                "no future periods to replan"
            )
        return self


class ReplanResult(BaseModel):
    """Response from /api/simulation/replan."""
    event: SimulationEvent
    replan_status: OptimizationStatus
    balance_at_replan: float
    updated_medical_expenses: List[float]
    completed_schedule: List[RepaymentPeriod]
    new_future_schedule: List[RepaymentPeriod]
    full_schedule: List[RepaymentPeriod]
    new_metrics: ScheduleMetrics
    explanations: List[Explanation]
    infeasibility_reason: Optional[str] = None
