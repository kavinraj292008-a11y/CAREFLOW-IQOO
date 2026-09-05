"""
Tests for dynamic replanning and simulation events.

Covers Tests 11–14:
  11. Additional treatment cycle
  12. Treatment delay
  13. Additional expense
  14. Completed periods remain unchanged after replanning
"""

import pytest
from app.data.demo_cases import get_canonical_demo_case
from app.schemas.case import CareFlowCase, LoanProfile, LenderConstraints
from app.schemas.simulation import SimulationEvent, ReplanRequest
from app.schemas.financial import OptimizationStatus
from app.services.optimization_service import apply_simulation_event
from app.services.repayment_service import (
    calculate_careflow_schedule,
    reconstruct_completed_periods,
    calculate_careflow_schedule_from_balance,
)
from app.services.loan_service import calculate_emi, calculate_remaining_balance, monthly_rate


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def canonical_case():
    return get_canonical_demo_case()


@pytest.fixture
def initial_schedule(canonical_case):
    return calculate_careflow_schedule(canonical_case)


def make_replan(case, n_completed, event):
    """Helper: calculate completed payments from EMI, then replan."""
    emi = calculate_emi(case.loan.principal, case.loan.annual_interest_rate, case.loan.remaining_periods)
    completed_payments = [emi] * n_completed

    remaining_balance = calculate_remaining_balance(
        case.loan.principal, case.loan.annual_interest_rate, completed_payments
    )
    updated_medical = apply_simulation_event(
        case.treatment_costs, event, n_completed
    )
    future_medical = updated_medical[n_completed:]
    n_remaining = case.loan.remaining_periods - n_completed

    return calculate_careflow_schedule_from_balance(
        case=case,
        remaining_balance=remaining_balance,
        n_remaining=n_remaining,
        future_medical=future_medical,
        period_offset=n_completed,
    )


# ── Test 11: Additional Treatment Cycle ──────────────────────────────────────

class TestAdditionalCycle:
    def test_additional_cycle_increases_target_cost(self, canonical_case):
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="additional_cycle",
            target_period=7,
            additional_cost=75_000,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        # Period 7 (index 6) should now have 75,000
        assert updated[6] == 75_000

    def test_additional_cycle_does_not_affect_other_periods(self, canonical_case):
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="additional_cycle",
            target_period=7,
            additional_cost=75_000,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        # Periods 1-6 unchanged
        for i in range(6):
            assert updated[i] == original_costs[i]

    def test_replan_after_additional_cycle(self, canonical_case):
        event = SimulationEvent(
            event_type="additional_cycle",
            target_period=7,
            additional_cost=75_000,
        )
        result = make_replan(canonical_case, n_completed=3, event=event)
        assert result.optimization_status in (
            OptimizationStatus.OPTIMAL, OptimizationStatus.FEASIBLE
        )
        assert len(result.schedule) > 0

    def test_additional_cycle_updates_final_balance_to_zero(self, canonical_case):
        event = SimulationEvent(
            event_type="additional_cycle",
            target_period=7,
            additional_cost=75_000,
        )
        result = make_replan(canonical_case, n_completed=3, event=event)
        if result.optimization_status != OptimizationStatus.INFEASIBLE:
            assert result.schedule[-1].ending_balance < 1.0


# ── Test 12: Treatment Delay ──────────────────────────────────────────────────

class TestTreatmentDelay:
    def test_delay_moves_cost_forward(self, canonical_case):
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="treatment_delay",
            source_period=5,
            delay_periods=1,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        # Period 5 (index 4) cost should be zeroed
        assert updated[4] == 0.0
        # Period 6 (index 5) should have period-5's cost added
        assert updated[5] == original_costs[5] + original_costs[4]

    def test_delay_preserves_total_cost(self, canonical_case):
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="treatment_delay",
            source_period=5,
            delay_periods=2,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        # Total treatment cost must be preserved
        assert abs(sum(updated) - sum(original_costs)) < 0.01

    def test_delay_past_list_extends_list(self):
        costs = [10_000, 20_000, 30_000]
        event = SimulationEvent(
            event_type="treatment_delay",
            source_period=3,
            delay_periods=2,
        )
        updated = apply_simulation_event(costs, event, completed_periods=0)
        # Index 4 (period 5) should now have the cost
        assert len(updated) >= 5
        assert updated[4] == 30_000

    def test_completed_source_period_ignored(self, canonical_case):
        """Completed period source events should be safely ignored."""
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="treatment_delay",
            source_period=2,  # already completed
            delay_periods=1,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        # No change since period 2 is completed
        assert updated == original_costs


# ── Test 13: Additional Expense ───────────────────────────────────────────────

class TestAdditionalExpense:
    def test_additional_expense_adds_to_period(self, canonical_case):
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="additional_expense",
            target_period=5,
            additional_cost=50_000,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        expected = original_costs[4] + 50_000
        assert abs(updated[4] - expected) < 0.01

    def test_replan_after_additional_expense(self, canonical_case):
        event = SimulationEvent(
            event_type="additional_expense",
            target_period=5,
            additional_cost=50_000,
        )
        result = make_replan(canonical_case, n_completed=3, event=event)
        assert result.optimization_status in (
            OptimizationStatus.OPTIMAL, OptimizationStatus.FEASIBLE,
        )

    def test_additional_expense_in_new_period(self, canonical_case):
        """Adding expense in a period beyond the original treatment list."""
        original_costs = list(canonical_case.treatment_costs)
        event = SimulationEvent(
            event_type="additional_expense",
            target_period=9,
            additional_cost=30_000,
        )
        updated = apply_simulation_event(original_costs, event, completed_periods=3)
        assert updated[8] == 30_000


# ── Test 14: Completed Periods Remain Unchanged ───────────────────────────────

class TestCompletedPeriodsUnchanged:
    def test_completed_periods_frozen_in_replan(self, canonical_case):
        """
        After replanning, periods 1–k must have identical data to the
        original optimized schedule. Only future periods may change.
        """
        # Get initial schedule
        initial = calculate_careflow_schedule(canonical_case)
        assert initial.optimization_status != OptimizationStatus.INFEASIBLE

        n_completed = 3
        # Use first 3 payments from initial schedule
        completed_payments = [p.payment for p in initial.schedule[:n_completed]]

        # Reconstruct the completed periods
        completed_schedule = reconstruct_completed_periods(
            case=canonical_case,
            n_completed=n_completed,
            completed_payments=completed_payments,
        )

        # Verify period numbers are correct
        assert [p.period for p in completed_schedule] == [1, 2, 3]

        # Verify payments match
        for i, period in enumerate(completed_schedule):
            assert abs(period.payment - completed_payments[i]) < 0.01

        # Verify is_completed flag
        for period in completed_schedule:
            assert period.is_completed is True

    def test_completed_periods_marked(self, canonical_case):
        initial = calculate_careflow_schedule(canonical_case)
        if initial.optimization_status == OptimizationStatus.INFEASIBLE:
            pytest.skip("Initial optimization infeasible")

        completed_payments = [p.payment for p in initial.schedule[:3]]
        completed = reconstruct_completed_periods(
            canonical_case, 3, completed_payments
        )
        assert all(p.is_completed for p in completed)

    def test_future_periods_are_not_completed(self, canonical_case):
        initial = calculate_careflow_schedule(canonical_case)
        if initial.optimization_status == OptimizationStatus.INFEASIBLE:
            pytest.skip("Initial optimization infeasible")

        completed_payments = [p.payment for p in initial.schedule[:3]]
        remaining_balance = calculate_remaining_balance(
            canonical_case.loan.principal,
            canonical_case.loan.annual_interest_rate,
            completed_payments,
        )
        event = SimulationEvent(
            event_type="additional_cycle",
            target_period=7,
            additional_cost=75_000,
        )
        updated_medical = apply_simulation_event(canonical_case.treatment_costs, event, 3)
        future_medical = updated_medical[3:]

        future = calculate_careflow_schedule_from_balance(
            case=canonical_case,
            remaining_balance=remaining_balance,
            n_remaining=9,
            future_medical=future_medical,
            period_offset=3,
        )

        if future.optimization_status != OptimizationStatus.INFEASIBLE:
            assert all(not p.is_completed for p in future.schedule)
            # Future periods should start from period 4
            assert future.schedule[0].period == 4
