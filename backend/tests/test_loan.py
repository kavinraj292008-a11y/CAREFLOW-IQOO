"""
Tests for standard loan calculations.

Covers: EMI calculation, zero-interest, amortization schedule, balance closure.
"""

import pytest
from app.services.loan_service import (
    calculate_emi,
    calculate_amortization,
    calculate_remaining_balance,
    monthly_rate,
)


class TestEMICalculation:
    """Test 1 — Standard EMI calculation."""

    def test_standard_emi_canonical_case(self):
        """Canonical demo: 600k at 10% for 12 periods."""
        emi = calculate_emi(600_000, 10.0, 12)
        # Standard amortization formula result (~52,750 range)
        assert 52_000 < emi < 54_000, f"Expected EMI ~52,750 got {emi:.2f}"

    def test_emi_is_positive(self):
        emi = calculate_emi(100_000, 12.0, 24)
        assert emi > 0

    def test_emi_higher_rate_higher_payment(self):
        emi_low = calculate_emi(100_000, 5.0, 12)
        emi_high = calculate_emi(100_000, 20.0, 12)
        assert emi_high > emi_low

    def test_emi_more_periods_lower_payment(self):
        emi_short = calculate_emi(100_000, 10.0, 12)
        emi_long = calculate_emi(100_000, 10.0, 24)
        assert emi_long < emi_short


class TestZeroInterest:
    """Test 2 — Zero-interest loan calculation."""

    def test_zero_interest_emi(self):
        emi = calculate_emi(120_000, 0.0, 12)
        assert abs(emi - 10_000) < 0.01, f"Expected 10,000 got {emi}"

    def test_zero_interest_amortization_no_interest(self):
        schedule = calculate_amortization(60_000, 0.0, 6)
        for row in schedule:
            assert row["interest"] == 0.0

    def test_zero_interest_amortization_reaches_zero(self):
        schedule = calculate_amortization(60_000, 0.0, 6)
        assert schedule[-1]["ending_balance"] < 0.01


class TestAmortizationSchedule:
    """Test 3 — Traditional schedule structure and arithmetic."""

    def setup_method(self):
        self.schedule = calculate_amortization(600_000, 10.0, 12)

    def test_correct_number_of_periods(self):
        assert len(self.schedule) == 12

    def test_period_numbers_sequential(self):
        periods = [row["period"] for row in self.schedule]
        assert periods == list(range(1, 13))

    def test_beginning_balance_continuity(self):
        """Each period's beginning balance must equal previous ending balance."""
        for i in range(1, len(self.schedule)):
            prev_end = self.schedule[i - 1]["ending_balance"]
            curr_begin = self.schedule[i]["beginning_balance"]
            assert abs(prev_end - curr_begin) < 0.02, (
                f"Period {i+1}: beginning {curr_begin} != previous ending {prev_end}"
            )

    def test_payment_equals_interest_plus_principal(self):
        for row in self.schedule:
            assert abs(row["payment"] - row["interest"] - row["principal"]) < 0.02

    def test_interest_is_balance_times_rate(self):
        r = monthly_rate(10.0)
        for row in self.schedule:
            expected_interest = row["beginning_balance"] * r
            assert abs(row["interest"] - expected_interest) < 0.02


class TestTraditionalScheduleReachesZero:
    """Test 4 — Traditional schedule must reach exactly zero balance."""

    def test_canonical_case_reaches_zero(self):
        schedule = calculate_amortization(600_000, 10.0, 12)
        assert schedule[-1]["ending_balance"] < 0.01

    def test_various_principals_reach_zero(self):
        for principal in [100_000, 250_000, 1_000_000]:
            schedule = calculate_amortization(principal, 10.0, 24)
            assert schedule[-1]["ending_balance"] < 0.10, (
                f"Principal {principal}: ending balance {schedule[-1]['ending_balance']:.4f}"
            )

    def test_zero_interest_reaches_zero(self):
        schedule = calculate_amortization(120_000, 0.0, 12)
        assert schedule[-1]["ending_balance"] < 0.01


class TestRemainingBalance:
    """Test remaining balance calculation for replanning."""

    def test_full_emi_payments_reach_zero(self):
        emi = calculate_emi(600_000, 10.0, 12)
        payments = [emi] * 12
        remaining = calculate_remaining_balance(600_000, 10.0, payments)
        assert remaining < 1.0  # within 1 rupee of zero

    def test_no_payments(self):
        remaining = calculate_remaining_balance(100_000, 10.0, [])
        assert remaining == 100_000
