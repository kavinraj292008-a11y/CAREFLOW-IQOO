"""
CareFlow Adaptive Repayment Optimizer.

Uses Google OR-Tools GLOP (linear programming) to find the payment schedule
that minimizes projected cashflow stress while respecting lender constraints.

Optimization model:
  Decision variables:
    p[t]  — payment in period t  (min_payment <= p[t] <= max_payment)
    b[t]  — loan balance after period t  (b[t] >= 0)
    d[t]  — projected deficit in period t  (d[t] >= 0)
    z     — maximum deficit across all periods (the minimax variable)

  Constraints:
    b[0] = remaining_balance
    b[t] = b[t-1] * (1+r) - p[t]   (balance recurrence — linear in LP vars)
    b[T] = 0                         (loan fully repaid by end of horizon)
    b[t] >= 0                        (no over-repayment)
    d[t] >= household + medical[t] + p[t] - income
    z    >= d[t]  for all t

  Objective:
    minimize z + 0.001 * sum(d[t])
    (primary: minimize peak deficit; secondary weight breaks ties toward lower total deficit)

The optimizer tries increasing horizons from n_remaining to
n_remaining + max_extension_periods, returning the first feasible solution.

IMPORTANT: Financial values are computed by the LP solver. Results are never
fabricated or hardcoded. If no feasible solution exists, status="infeasible"
is returned with an explanatory reason.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional
import logging

from ortools.linear_solver import pywraplp

from app.schemas.financial import OptimizationStatus
from app.config.settings import settings

logger = logging.getLogger(__name__)


@dataclass
class OptimizerResult:
    """Output from the CareFlow LP optimizer."""
    status: OptimizationStatus
    payments: List[float] = field(default_factory=list)
    balances: List[float] = field(default_factory=list)
    extension_periods: int = 0
    infeasibility_reason: Optional[str] = None
    objective_value: Optional[float] = None


def optimize_careflow(
    remaining_balance: float,
    monthly_rate: float,
    n_remaining_periods: int,
    max_extension_periods: int,
    medical_expenses: List[float],
    income: float,
    household_expenses: float,
    min_payment: float,
    max_payment: float,
) -> OptimizerResult:
    """
    Find the CareFlow adaptive repayment schedule via linear programming.

    Tries increasing horizons from n_remaining_periods up to
    n_remaining_periods + max_extension_periods.

    Args:
        remaining_balance:     Current outstanding loan balance (INR)
        monthly_rate:          Monthly interest rate (decimal, e.g. 0.00833 for 10% annual)
        n_remaining_periods:   Original remaining loan periods
        max_extension_periods: Maximum extra periods allowed by lender
        medical_expenses:      Expected treatment cost per future period (INR list)
        income:                Monthly income (INR)
        household_expenses:    Monthly household expenses (INR)
        min_payment:           Lender minimum monthly payment (INR)
        max_payment:           Lender maximum monthly payment (INR)

    Returns:
        OptimizerResult with status, payment schedule, and balance trajectory
    """
    last_reason: Optional[str] = None

    for extension in range(max_extension_periods + 1):
        T = n_remaining_periods + extension

        # Pad or trim medical expenses to match horizon
        medical: List[float] = list(medical_expenses)
        while len(medical) < T:
            medical.append(0.0)
        medical = medical[:T]

        result = _solve_lp(
            remaining_balance=remaining_balance,
            monthly_rate=monthly_rate,
            T=T,
            medical=medical,
            income=income,
            household=household_expenses,
            min_pay=min_payment,
            max_pay=max_payment,
            extension=extension,
        )

        if result.status in (OptimizationStatus.OPTIMAL, OptimizationStatus.FEASIBLE):
            logger.info(
                "CareFlow LP solved: status=%s T=%d extension=%d obj=%.2f",
                result.status, T, extension,
                result.objective_value or 0,
            )
            return result

        last_reason = result.infeasibility_reason

    max_T = n_remaining_periods + max_extension_periods
    descriptive_reason = (
        f"No feasible repayment schedule found within {max_T} periods. "
        f"Minimum payment ({min_payment:.0f} INR) and "
        f"maximum payment ({max_payment:.0f} INR) "
        f"at {monthly_rate * 12 * 100:.1f}% annual interest "
        f"cannot bring the remaining balance ({remaining_balance:.0f} INR) "
        f"to zero within the allowed horizon. "
        f"Consider increasing maximum_payment or maximum_extension_periods."
    )
    return OptimizerResult(
        status=OptimizationStatus.INFEASIBLE,
        infeasibility_reason=descriptive_reason,
    )


def _solve_lp(
    remaining_balance: float,
    monthly_rate: float,
    T: int,
    medical: List[float],
    income: float,
    household: float,
    min_pay: float,
    max_pay: float,
    extension: int,
) -> OptimizerResult:
    """
    Solve a single LP instance for a fixed horizon T.

    All constraints are linear. The balance recurrence b[t] = b[t-1]*(1+r) - p[t]
    is linear because (1+r) is a constant, not a decision variable.
    """
    solver = pywraplp.Solver.CreateSolver(settings.LP_SOLVER)
    if solver is None:
        logger.warning("GLOP unavailable, falling back to SCIP")
        solver = pywraplp.Solver.CreateSolver("SCIP")
    if solver is None:
        return OptimizerResult(
            status=OptimizationStatus.ERROR,
            infeasibility_reason="Could not create LP solver (GLOP/SCIP unavailable)",
        )

    INF = solver.infinity()
    r = monthly_rate

    # ── Decision variables ──────────────────────────────────────────────────
    # p[t]: payment in period t
    p = [solver.NumVar(min_pay, max_pay, f"p_{t}") for t in range(T)]
    # b[t]: loan balance AFTER period t (b[0] = initial balance before any payment)
    b = [solver.NumVar(0.0, INF, f"b_{t}") for t in range(T + 1)]
    # d[t]: projected deficit in period t
    d = [solver.NumVar(0.0, INF, f"d_{t}") for t in range(T)]
    # z: maximum deficit (minimax variable)
    z = solver.NumVar(0.0, INF, "z")

    # ── Constraint: Initial balance ─────────────────────────────────────────
    # b[0] = remaining_balance  →  1*b[0] = remaining_balance
    ct = solver.Constraint(remaining_balance, remaining_balance)
    ct.SetCoefficient(b[0], 1.0)

    # ── Constraint: Balance recurrence ──────────────────────────────────────
    # b[t+1] = b[t]*(1+r) - p[t]
    # Rewritten: b[t+1] - b[t]*(1+r) + p[t] = 0
    for t in range(T):
        ct = solver.Constraint(0.0, 0.0)
        ct.SetCoefficient(b[t + 1], 1.0)
        ct.SetCoefficient(b[t], -(1.0 + r))
        ct.SetCoefficient(p[t], 1.0)

    # ── Constraint: Final balance = 0 ───────────────────────────────────────
    # b[T] = 0
    ct = solver.Constraint(0.0, 0.0)
    ct.SetCoefficient(b[T], 1.0)

    # ── Constraint: Deficit >= cashflow shortfall ────────────────────────────
    # d[t] >= household + medical[t] + p[t] - income
    # Rewritten: d[t] - p[t] >= household + medical[t] - income
    for t in range(T):
        rhs = household + medical[t] - income
        ct = solver.Constraint(rhs, INF)
        ct.SetCoefficient(d[t], 1.0)
        ct.SetCoefficient(p[t], -1.0)

    # ── Constraint: z >= d[t] for all t ─────────────────────────────────────
    # z - d[t] >= 0
    for t in range(T):
        ct = solver.Constraint(0.0, INF)
        ct.SetCoefficient(z, 1.0)
        ct.SetCoefficient(d[t], -1.0)

    # ── Objective: minimize peak deficit (primary) + total deficit (secondary)
    # Secondary weight (0.001) breaks ties toward lower total deficit
    # without overriding the primary minimax goal.
    w = settings.SECONDARY_OBJECTIVE_WEIGHT
    objective = solver.Objective()
    objective.SetCoefficient(z, 1.0)
    for t in range(T):
        objective.SetCoefficient(d[t], w)
    objective.SetMinimization()

    # ── Solve ────────────────────────────────────────────────────────────────
    solver_status = solver.Solve()

    if solver_status in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
        opt_status = (
            OptimizationStatus.OPTIMAL
            if solver_status == pywraplp.Solver.OPTIMAL
            else OptimizationStatus.FEASIBLE
        )
        return OptimizerResult(
            status=opt_status,
            payments=[p[t].solution_value() for t in range(T)],
            balances=[b[t].solution_value() for t in range(T + 1)],
            extension_periods=extension,
            objective_value=solver.Objective().Value(),
        )

    return OptimizerResult(
        status=OptimizationStatus.INFEASIBLE,
        infeasibility_reason=f"LP infeasible with horizon T={T}",
    )
