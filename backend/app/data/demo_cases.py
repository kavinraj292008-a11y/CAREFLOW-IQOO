"""
Canonical CareFlow demonstration cases.

All data is synthetic and illustrative.
Not based on real patient data.
"""

from app.schemas.case import CareFlowCase, LoanProfile, LenderConstraints


def get_canonical_demo_case() -> CareFlowCase:
    """
    The canonical CareFlow Day 1 demonstration case.

    A borrower undergoing a 6-period chemotherapy treatment
    while managing a 12-month loan obligation.

    Financial profile (illustrative):
      Monthly income:           70,000
      Monthly household:        20,000
      Loan:                     6,00,000 at 10% annual, 12 periods
      Treatment costs (6 mo):   [80k, 15k, 110k, 20k, 90k, 15k]
      Remaining periods 7-12:   no treatment cost

    This scenario demonstrates the CareFlow core concept:
    Treatment timing creates irregular cashflow pressure that a
    fixed EMI schedule does not account for.
    """
    return CareFlowCase(
        income=70_000,
        monthly_household_expenses=20_000,
        loan=LoanProfile(
            principal=600_000,
            annual_interest_rate=10.0,
            remaining_periods=12,
        ),
        treatment_costs=[80_000, 15_000, 110_000, 20_000, 90_000, 15_000],
        constraints=LenderConstraints(
            minimum_payment=5_000,
            maximum_payment=100_000,
            maximum_extension_periods=3,
        ),
    )


def get_demo_cases() -> dict:
    """Return all available demo cases as a dict keyed by name."""
    return {
        "canonical": {
            "name": "Chemotherapy Demo — Canonical",
            "description": (
                "Borrower undergoing 6-period chemotherapy treatment "
                "with a 12-period loan. Illustrates the core CareFlow concept."
            ),
            "case": get_canonical_demo_case().model_dump(),
        }
    }
