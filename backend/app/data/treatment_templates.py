"""
Synthetic illustrative treatment scenarios for the CareFlow prototype.

IMPORTANT DISCLAIMER:
These are synthetic demonstration scenarios only.
They are NOT clinical recommendations.
They are NOT medical advice.
They do NOT represent actual treatment protocols or universal cost benchmarks.
Values are illustrative for prototype purposes only.
"""

from app.schemas.case import TreatmentPlan, TreatmentPeriod

DISCLAIMER = (
    "Illustrative expected treatment expense. Prototype estimate. "
    "Demonstration scenario only. Not medical advice or a clinical recommendation."
)


def get_chemotherapy_demo() -> TreatmentPlan:
    """
    Chemotherapy Demo — canonical CareFlow demonstration scenario.

    6-period treatment with clustered high-expense cycles
    alternating with lower-expense recovery periods.
    This illustrates the core CareFlow concept: irregular treatment expense
    driving the need for adaptive repayment.
    """
    return TreatmentPlan(
        name="Chemotherapy Demo",
        description=(
            "Synthetic 6-period chemotherapy scenario illustrating "
            "clustered treatment expense with alternating cycles."
        ),
        disclaimer=DISCLAIMER,
        periods=[
            TreatmentPeriod(period=1, phase="Cycle 1",    expected_cost=80_000,  status="projected"),
            TreatmentPeriod(period=2, phase="Recovery 1", expected_cost=15_000,  status="projected"),
            TreatmentPeriod(period=3, phase="Cycle 2",    expected_cost=110_000, status="projected"),
            TreatmentPeriod(period=4, phase="Recovery 2", expected_cost=20_000,  status="projected"),
            TreatmentPeriod(period=5, phase="Cycle 3",    expected_cost=90_000,  status="projected"),
            TreatmentPeriod(period=6, phase="Recovery 3", expected_cost=15_000,  status="projected"),
        ],
    )


def get_dialysis_demo() -> TreatmentPlan:
    """
    Dialysis Demo — recurring high-frequency treatment expense.

    Dialysis typically occurs multiple times per week.
    This scenario illustrates a more consistent but sustained expense pattern.
    """
    return TreatmentPlan(
        name="Dialysis Demo",
        description=(
            "Synthetic 12-period dialysis scenario illustrating "
            "sustained recurring treatment expense."
        ),
        disclaimer=DISCLAIMER,
        periods=[
            TreatmentPeriod(period=1,  phase="Dialysis Month 1",  expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=2,  phase="Dialysis Month 2",  expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=3,  phase="Dialysis Month 3",  expected_cost=38_000, status="projected"),
            TreatmentPeriod(period=4,  phase="Dialysis Month 4",  expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=5,  phase="Dialysis Month 5",  expected_cost=40_000, status="projected"),
            TreatmentPeriod(period=6,  phase="Dialysis Month 6",  expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=7,  phase="Dialysis Month 7",  expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=8,  phase="Dialysis Month 8",  expected_cost=38_000, status="projected"),
            TreatmentPeriod(period=9,  phase="Dialysis Month 9",  expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=10, phase="Dialysis Month 10", expected_cost=35_000, status="projected"),
            TreatmentPeriod(period=11, phase="Dialysis Month 11", expected_cost=40_000, status="projected"),
            TreatmentPeriod(period=12, phase="Dialysis Month 12", expected_cost=35_000, status="projected"),
        ],
    )


def get_cardiac_surgery_demo() -> TreatmentPlan:
    """
    Cardiac Surgery + Follow-up Demo — front-loaded large expense with declining follow-up.

    Surgery creates a large upfront cost followed by diminishing
    follow-up and rehabilitation costs.
    """
    return TreatmentPlan(
        name="Cardiac Surgery + Follow-up Demo",
        description=(
            "Synthetic 6-period cardiac surgery scenario with "
            "front-loaded surgical expense followed by rehabilitation."
        ),
        disclaimer=DISCLAIMER,
        periods=[
            TreatmentPeriod(period=1, phase="Surgery",          expected_cost=250_000, status="projected"),
            TreatmentPeriod(period=2, phase="ICU & Recovery",   expected_cost=80_000,  status="projected"),
            TreatmentPeriod(period=3, phase="Rehabilitation 1", expected_cost=40_000,  status="projected"),
            TreatmentPeriod(period=4, phase="Rehabilitation 2", expected_cost=25_000,  status="projected"),
            TreatmentPeriod(period=5, phase="Follow-up",        expected_cost=15_000,  status="projected"),
            TreatmentPeriod(period=6, phase="Review",           expected_cost=10_000,  status="projected"),
        ],
    )


TREATMENT_TEMPLATES = {
    "chemotherapy_demo": get_chemotherapy_demo,
    "dialysis_demo": get_dialysis_demo,
    "cardiac_surgery_demo": get_cardiac_surgery_demo,
}
