"""
Tests for cashflow_service.py — borrower cashflow calculation.
"""

import pytest
from app.services.cashflow_service import (
    calculate_available_cash,
    calculate_cashflow_after_payment,
    calculate_period_cashflows,
    total_projected_deficit,
    peak_projected_deficit,
)


class TestAvailableCash:
    def test_positive_available(self):
        result = calculate_available_cash(70_000, 20_000, 0)
        assert result == 50_000

    def test_negative_available_high_medical(self):
        # Income 70k, household 20k, medical 110k → -60k
        result = calculate_available_cash(70_000, 20_000, 110_000)
        assert result == -60_000

    def test_zero_medical(self):
        result = calculate_available_cash(70_000, 20_000, 0)
        assert result == 50_000


class TestCashflowAfterPayment:
    def test_positive_cashflow(self):
        result = calculate_cashflow_after_payment(100_000, 20_000, 0, 30_000)
        assert result == 50_000

    def test_negative_cashflow(self):
        result = calculate_cashflow_after_payment(70_000, 20_000, 80_000, 5_000)
        # available = -30_000, after payment = -35_000
        assert result == -35_000

    def test_zero_cashflow(self):
        result = calculate_cashflow_after_payment(70_000, 20_000, 0, 50_000)
        assert result == 0


class TestPeriodCashflows:
    def test_correct_length(self):
        medicals = [80_000, 15_000, 110_000]
        payments = [5_000, 50_000, 5_000]
        result = calculate_period_cashflows(70_000, 20_000, medicals, payments)
        assert len(result) == 3

    def test_period_numbers_sequential(self):
        result = calculate_period_cashflows(70_000, 20_000, [10_000, 20_000], [30_000, 30_000])
        assert [r["period"] for r in result] == [1, 2]

    def test_deficit_non_negative(self):
        result = calculate_period_cashflows(70_000, 20_000, [80_000, 0], [5_000, 50_000])
        for r in result:
            assert r["projected_deficit"] >= 0

    def test_deficit_calculation(self):
        # Period 1: income=70k, hh=20k, med=80k, pay=5k → cashflow=-35k, deficit=35k
        result = calculate_period_cashflows(70_000, 20_000, [80_000], [5_000])
        assert abs(result[0]["projected_deficit"] - 35_000) < 0.01
        assert abs(result[0]["cashflow_after_payment"] - (-35_000)) < 0.01

    def test_length_mismatch_raises(self):
        with pytest.raises(ValueError):
            calculate_period_cashflows(70_000, 20_000, [10_000, 20_000], [5_000])

    def test_surplus_period_has_zero_deficit(self):
        result = calculate_period_cashflows(100_000, 20_000, [0], [30_000])
        assert result[0]["projected_deficit"] == 0
        assert result[0]["cashflow_after_payment"] == 50_000


class TestAggregates:
    def test_total_deficit(self):
        # Two periods each with 35k deficit
        total = total_projected_deficit(70_000, 20_000, [80_000, 80_000], [5_000, 5_000])
        assert abs(total - 70_000) < 0.01

    def test_peak_deficit(self):
        peak = peak_projected_deficit(70_000, 20_000, [80_000, 110_000, 15_000], [5_000, 5_000, 5_000])
        # Period 3 (medical=110k): 20+110+5-70=65k
        assert abs(peak - 65_000) < 0.01

    def test_zero_deficit_when_income_covers_all(self):
        peak = peak_projected_deficit(200_000, 20_000, [50_000, 30_000], [50_000, 50_000])
        assert peak == 0.0
