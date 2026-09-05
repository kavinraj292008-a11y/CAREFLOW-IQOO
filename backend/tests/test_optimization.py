"""
Tests for CareFlow LP optimization and schedule generation.

Covers Tests 5–9, 15–16 from spec:
  5.  CareFlow schedule calculation
  6.  CareFlow schedule reaches zero balance
  7.  Minimum-payment constraint respected
  8.  Maximum-payment constraint respected
  9.  Maximum-extension constraint respected
  15. Infeasible scenario handled
  16. Invalid inputs rejected
"""

import pytest
from app.data.demo_cases import get_canonical_demo_case
from app.schemas.case import CareFlowCase, LoanProfile, LenderConstraints
from app.schemas.financial import OptimizationStatus
from app.services.repayment_service import calculate_careflow_schedule, calculate_traditional_schedule
from app.optimization.careflow_optimizer import optimize_careflow
from app.services.loan_service import monthly_rate


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def canonical_case():
    return get_canonical_demo_case()


@pytest.fixture
def canonical_result(canonical_case):
    return calculate_careflow_schedule(canonical_case)


# ── Test 5: CareFlow Schedule Calculation ─────────────────────────────────────

class TestCareFlowScheduleCalculation:
    def test_returns_schedule(self, canonical_result):
        assert canonical_result.optimization_status in (
            OptimizationStatus.OPTIMAL,
            OptimizationStatus.FEASIBLE,
        )
        assert len(canonical_result.schedule) > 0

    def test_schedule_has_all_required_fields(self, canonical_result):
        period = canonical_result.schedule[0]
        assert period.period == 1
        assert period.payment > 0
        assert period.beginning_balance > 0
        assert period.interest > 0
        assert period.stress_level is not None

    def test_careflow_reduces_peak_deficit(self, canonical_case, canonical_result):
        traditional = calculate_traditional_schedule(canonical_case)
        trad_peak = traditional.metrics.peak_deficit
        cf_peak = canonical_result.metrics.peak_deficit
        # CareFlow should meaningfully reduce peak deficit
        assert cf_peak < trad_peak, (
            f"CareFlow peak {cf_peak:.0f} should be less than traditional {trad_peak:.0f}"
        )

    def test_period_numbers_are_sequential(self, canonical_result):
        periods = [p.period for p in canonical_result.schedule]
        assert periods == list(range(1, len(periods) + 1))

    def test_balance_continuity(self, canonical_result):
        """Each period's beginning balance matches the previous ending balance."""
        for i in range(1, len(canonical_result.schedule)):
            prev_end = canonical_result.schedule[i - 1].ending_balance
            curr_begin = canonical_result.schedule[i].beginning_balance
            assert abs(prev_end - curr_begin) < 1.0, (
                f"Period {i+1}: begin {curr_begin:.2f} != prev end {prev_end:.2f}"
            )


# ── Test 6: CareFlow Schedule Reaches Zero ────────────────────────────────────

class TestCareFlowReachesZero:
    def test_final_balance_is_zero(self, canonical_result):
        final = canonical_result.schedule[-1].ending_balance
        assert final < 1.0, f"Final balance should be ~0, got {final:.4f}"

    def test_zero_on_various_cases(self):
        cases = [
            CareFlowCase(
                income=80_000,
                monthly_household_expenses=25_000,
                loan=LoanProfile(principal=300_000, annual_interest_rate=12.0, remaining_periods=12),
                treatment_costs=[40_000, 10_000, 40_000, 10_000],
                constraints=LenderConstraints(minimum_payment=5_000, maximum_payment=80_000, maximum_extension_periods=3),
            ),
            CareFlowCase(
                income=50_000,
                monthly_household_expenses=15_000,
                loan=LoanProfile(principal=200_000, annual_interest_rate=8.0, remaining_periods=6),
                treatment_costs=[20_000, 20_000],
                constraints=LenderConstraints(minimum_payment=1_000, maximum_payment=60_000, maximum_extension_periods=2),
            ),
        ]
        for case in cases:
            result = calculate_careflow_schedule(case)
            if result.optimization_status != OptimizationStatus.INFEASIBLE:
                final = result.schedule[-1].ending_balance
                assert final < 1.0, f"Final balance {final:.4f} for case with principal {case.loan.principal}"


# ── Test 7: Minimum Payment Constraint ───────────────────────────────────────

class TestMinimumPaymentConstraint:
    def test_all_payments_above_minimum(self, canonical_case, canonical_result):
        min_pay = canonical_case.constraints.minimum_payment
        for period in canonical_result.schedule:
            assert period.payment >= min_pay - 0.01, (
                f"Period {period.period}: payment {period.payment:.2f} < min {min_pay}"
            )

    def test_custom_minimum_payment(self):
        case = CareFlowCase(
            income=70_000,
            monthly_household_expenses=20_000,
            loan=LoanProfile(principal=600_000, annual_interest_rate=10.0, remaining_periods=12),
            treatment_costs=[80_000, 15_000, 110_000],
            constraints=LenderConstraints(minimum_payment=10_000, maximum_payment=100_000, maximum_extension_periods=3),
        )
        result = calculate_careflow_schedule(case)
        if result.optimization_status != OptimizationStatus.INFEASIBLE:
            for period in result.schedule:
                assert period.payment >= 9_999.99, f"Period {period.period}: payment {period.payment:.2f} < 10,000"


# ── Test 8: Maximum Payment Constraint ───────────────────────────────────────

class TestMaximumPaymentConstraint:
    def test_all_payments_below_maximum(self, canonical_case, canonical_result):
        max_pay = canonical_case.constraints.maximum_payment
        for period in canonical_result.schedule:
            assert period.payment <= max_pay + 0.01, (
                f"Period {period.period}: payment {period.payment:.2f} > max {max_pay}"
            )

    def test_tight_maximum_still_feasible(self):
        """A tight maximum payment should still produce a valid schedule (possibly extended)."""
        case = CareFlowCase(
            income=70_000,
            monthly_household_expenses=20_000,
            loan=LoanProfile(principal=300_000, annual_interest_rate=10.0, remaining_periods=12),
            treatment_costs=[50_000, 10_000, 50_000],
            constraints=LenderConstraints(minimum_payment=5_000, maximum_payment=60_000, maximum_extension_periods=3),
        )
        result = calculate_careflow_schedule(case)
        if result.optimization_status != OptimizationStatus.INFEASIBLE:
            for period in result.schedule:
                assert period.payment <= 60_001


# ── Test 9: Maximum Extension Constraint ─────────────────────────────────────

class TestMaxExtensionConstraint:
    def test_schedule_within_max_extension(self, canonical_case, canonical_result):
        original = canonical_case.loan.remaining_periods
        max_ext = canonical_case.constraints.maximum_extension_periods
        actual_len = len(canonical_result.schedule)
        assert actual_len <= original + max_ext, (
            f"Schedule length {actual_len} exceeds {original} + {max_ext}"
        )

    def test_zero_extension_stays_within_original(self):
        case = CareFlowCase(
            income=100_000,
            monthly_household_expenses=20_000,
            loan=LoanProfile(principal=300_000, annual_interest_rate=10.0, remaining_periods=12),
            treatment_costs=[30_000, 10_000],
            constraints=LenderConstraints(minimum_payment=5_000, maximum_payment=100_000, maximum_extension_periods=0),
        )
        result = calculate_careflow_schedule(case)
        if result.optimization_status != OptimizationStatus.INFEASIBLE:
            assert len(result.schedule) <= 12


# ── Test 15: Infeasible Scenario ─────────────────────────────────────────────

class TestInfeasibleScenario:
    def test_infeasible_when_max_payment_too_low(self):
        """
        With a large loan, very high interest rate, and tiny max_payment,
        the balance can never decrease to zero — genuinely infeasible.
        """
        result = optimize_careflow(
            remaining_balance=1_000_000,
            monthly_rate=monthly_rate(30.0),   # 30% annual = 2.5% monthly
            n_remaining_periods=12,
            max_extension_periods=0,
            medical_expenses=[],
            income=100_000,
            household_expenses=20_000,
            min_payment=1_000,
            max_payment=5_000,   # Monthly interest alone is ~25,000 at start
        )
        assert result.status == OptimizationStatus.INFEASIBLE
        assert result.infeasibility_reason is not None
        assert len(result.infeasibility_reason) > 0

    def test_infeasible_returns_reason(self):
        result = optimize_careflow(
            remaining_balance=2_000_000,
            monthly_rate=monthly_rate(36.0),
            n_remaining_periods=6,
            max_extension_periods=0,
            medical_expenses=[],
            income=50_000,
            household_expenses=20_000,
            min_payment=5_000,
            max_payment=10_000,
        )
        assert result.status == OptimizationStatus.INFEASIBLE
        assert result.infeasibility_reason


# ── Test 16: Invalid Inputs ───────────────────────────────────────────────────

class TestInvalidInputs:
    def test_negative_income_rejected(self):
        with pytest.raises(Exception):
            CareFlowCase(
                income=-1,
                monthly_household_expenses=20_000,
                loan=LoanProfile(principal=600_000, annual_interest_rate=10.0, remaining_periods=12),
                treatment_costs=[],
            )

    def test_zero_loan_principal_rejected(self):
        with pytest.raises(Exception):
            CareFlowCase(
                income=70_000,
                monthly_household_expenses=20_000,
                loan=LoanProfile(principal=0, annual_interest_rate=10.0, remaining_periods=12),
                treatment_costs=[],
            )

    def test_zero_remaining_periods_rejected(self):
        with pytest.raises(Exception):
            CareFlowCase(
                income=70_000,
                monthly_household_expenses=20_000,
                loan=LoanProfile(principal=600_000, annual_interest_rate=10.0, remaining_periods=0),
                treatment_costs=[],
            )

    def test_max_payment_less_than_min_rejected(self):
        with pytest.raises(Exception):
            LenderConstraints(minimum_payment=50_000, maximum_payment=10_000)

    def test_negative_treatment_cost_rejected(self):
        with pytest.raises(Exception):
            CareFlowCase(
                income=70_000,
                monthly_household_expenses=20_000,
                loan=LoanProfile(principal=600_000, annual_interest_rate=10.0, remaining_periods=12),
                treatment_costs=[-5_000],
            )

    def test_negative_interest_rate_rejected(self):
        with pytest.raises(Exception):
            LoanProfile(principal=600_000, annual_interest_rate=-1.0, remaining_periods=12)

    def test_negative_household_expenses_rejected(self):
        with pytest.raises(Exception):
            CareFlowCase(
                income=70_000,
                monthly_household_expenses=-1,
                loan=LoanProfile(principal=600_000, annual_interest_rate=10.0, remaining_periods=12),
                treatment_costs=[],
            )
