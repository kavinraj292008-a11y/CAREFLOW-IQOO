"""
Input data schemas for CareFlow case submission.
All amounts in INR.
"""

from __future__ import annotations
from pydantic import BaseModel, Field, model_validator
from typing import Optional, List


class LoanProfile(BaseModel):
    """Describes the loan under management."""
    principal: float = Field(..., gt=0, description="Loan principal in INR")
    annual_interest_rate: float = Field(..., ge=0, description="Annual interest rate as percentage (e.g. 10 for 10%)")
    remaining_periods: int = Field(..., gt=0, description="Remaining monthly repayment periods")


class LenderConstraints(BaseModel):
    """Lender-defined hard constraints on repayment."""
    minimum_payment: float = Field(default=5_000, ge=0, description="Minimum monthly payment in INR")
    maximum_payment: float = Field(default=100_000, gt=0, description="Maximum monthly payment in INR")
    maximum_extension_periods: int = Field(default=3, ge=0, description="Max extra periods beyond original tenure")

    @model_validator(mode="after")
    def max_must_exceed_min(self) -> "LenderConstraints":
        if self.maximum_payment < self.minimum_payment:
            raise ValueError("maximum_payment must be >= minimum_payment")
        return self


class TreatmentPeriod(BaseModel):
    """Single period in a treatment plan."""
    period: int = Field(..., ge=1)
    phase: Optional[str] = None
    expected_cost: float = Field(..., ge=0, description="Illustrative expected treatment expense (INR)")
    lower_cost_bound: Optional[float] = Field(default=None, ge=0)
    upper_cost_bound: Optional[float] = Field(default=None, ge=0)
    confidence: Optional[float] = Field(default=None, ge=0, le=1)
    status: str = Field(default="projected", description="projected | actual")


class TreatmentPlan(BaseModel):
    """
    Synthetic illustrative treatment scenario.
    NOT clinical recommendations. NOT medical advice.
    """
    name: str
    description: str
    disclaimer: str = (
        "Illustrative expected treatment expense. "
        "Prototype estimate. Demonstration scenario only. "
        "Not medical advice."
    )
    periods: List[TreatmentPeriod]


class CareFlowCase(BaseModel):
    """
    Complete input for a CareFlow repayment analysis.
    treatment_costs is a list of per-period amounts (INR).
    Periods beyond the list are assumed to have zero treatment cost.
    """
    income: float = Field(..., ge=0, description="Monthly income in INR")
    monthly_household_expenses: float = Field(..., ge=0, description="Monthly household expenses in INR")
    loan: LoanProfile
    treatment_costs: List[float] = Field(
        ...,
        description="Expected treatment cost per period (INR). Zero-padded for periods beyond this list."
    )
    constraints: LenderConstraints = Field(default_factory=LenderConstraints)

    @model_validator(mode="after")
    def validate_treatment_costs(self) -> "CareFlowCase":
        for i, cost in enumerate(self.treatment_costs):
            if cost < 0:
                raise ValueError(f"treatment_costs[{i}] must be >= 0")
        return self
