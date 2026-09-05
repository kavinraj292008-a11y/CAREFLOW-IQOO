"""
Tests for cashflow stress calculation.

Test 10 — Stress calculation.
"""

import pytest
from app.services.stress_service import (
    calculate_projected_deficit,
    get_stress_level,
    calculate_schedule_stress_metrics,
)
from app.schemas.financial import StressLevel


class TestProjectedDeficit:
    def test_no_deficit_when_income_covers_all(self):
        deficit = calculate_projected_deficit(
            income=100_000,
            household_expenses=20_000,
            medical_expense=10_000,
            payment=50_000,
        )
        assert deficit == 0.0

    def test_deficit_when_obligations_exceed_income(self):
        deficit = calculate_projected_deficit(
            income=70_000,
            household_expenses=20_000,
            medical_expense=110_000,
            payment=5_000,
        )
        # 20k + 110k + 5k - 70k = 65,000
        assert abs(deficit - 65_000) < 0.01

    def test_deficit_is_zero_not_negative(self):
        deficit = calculate_projected_deficit(
            income=200_000,
            household_expenses=10_000,
            medical_expense=0,
            payment=30_000,
        )
        assert deficit == 0.0

    def test_deficit_formula_matches_spec(self):
        """projected_deficit = max(0, household + medical + payment - income)"""
        hh, med, pay, inc = 20_000, 80_000, 5_000, 70_000
        expected = max(0, hh + med + pay - inc)  # = 35,000
        result = calculate_projected_deficit(inc, hh, med, pay)
        assert abs(result - expected) < 0.01


class TestStressLevel:
    def test_low_stress_zero_deficit(self):
        assert get_stress_level(0.0) == StressLevel.LOW

    def test_moderate_stress(self):
        assert get_stress_level(5_000) == StressLevel.MODERATE

    def test_high_stress(self):
        assert get_stress_level(20_000) == StressLevel.HIGH

    def test_critical_stress(self):
        assert get_stress_level(50_000) == StressLevel.CRITICAL

    def test_boundary_moderate(self):
        # 10,000 is the HIGH threshold — 10,000 itself is MODERATE
        assert get_stress_level(10_000) == StressLevel.MODERATE

    def test_boundary_high(self):
        # 30,000 is the CRITICAL threshold — 30,000 itself is HIGH
        assert get_stress_level(30_000) == StressLevel.HIGH

    def test_just_above_critical(self):
        assert get_stress_level(30_001) == StressLevel.CRITICAL


class TestScheduleStressMetrics:
    def test_peak_deficit(self):
        deficits = [10_000, 50_000, 20_000, 0]
        metrics = calculate_schedule_stress_metrics(deficits)
        assert metrics["peak_deficit"] == 50_000

    def test_total_deficit(self):
        deficits = [10_000, 20_000, 30_000]
        metrics = calculate_schedule_stress_metrics(deficits)
        assert metrics["total_deficit"] == 60_000

    def test_high_stress_count(self):
        # HIGH: 10k < deficit <= 30k
        deficits = [15_000, 25_000, 5_000, 0]
        metrics = calculate_schedule_stress_metrics(deficits)
        assert metrics["high_stress_periods"] == 2

    def test_critical_stress_count(self):
        deficits = [35_000, 65_000, 5_000, 0]
        metrics = calculate_schedule_stress_metrics(deficits)
        assert metrics["critical_stress_periods"] == 2

    def test_empty_schedule(self):
        metrics = calculate_schedule_stress_metrics([])
        assert metrics["peak_deficit"] == 0
        assert metrics["total_deficit"] == 0
