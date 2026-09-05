"""
Borrower cashflow calculation for CareFlow.

Models the per-period cashflow position of a borrower who is simultaneously
managing household expenses, medical treatment costs, and a loan obligation.

Terminology:
  "available_cash_before_payment" — income remaining after household and medical.
  "cashflow_after_payment"        — cash remaining after the loan payment.
  "projected cashflow deficit"    — the shortfall when obligations exceed income.

The system never labels a projected deficit as "default".
A deficit is a projected cashflow pressure point, not a legal event.
"""

from __future__ import annotations
from typing import List


def calculate_available_cash(
    income: float,
    household_expenses: float,
    medical_expense: float,
) -> float:
    """
    Cash available before making any loan payment.

    available_cash = income - household_expenses - medical_expense

    A negative result means treatment and household costs already exceed income
    in this period — any loan payment adds to that pressure.
    """
    return income - household_expenses - medical_expense


def calculate_cashflow_after_payment(
    income: float,
    household_expenses: float,
    medical_expense: float,
    payment: float,
) -> float:
    """
    Net cashflow after all obligations for a single period.

    cashflow_after_payment = income - household_expenses - medical_expense - payment

    Negative = projected cashflow deficit.
    Positive = projected cashflow surplus.
    """
    available = calculate_available_cash(income, household_expenses, medical_expense)
    return available - payment


def calculate_period_cashflows(
    income: float,
    household_expenses: float,
    medical_expenses: List[float],
    payments: List[float],
) -> List[dict]:
    """
    Calculate cashflow metrics for every period in a schedule.

    Returns a list of dicts, one per period, containing:
      period, medical_expense, available_before_payment,
      payment, cashflow_after_payment, projected_deficit

    Lengths of medical_expenses and payments must match.
    """
    if len(medical_expenses) != len(payments):
        raise ValueError(
            f"medical_expenses ({len(medical_expenses)}) and "
            f"payments ({len(payments)}) must have the same length"
        )

    results = []
    for i, (medical, payment) in enumerate(zip(medical_expenses, payments)):
        available = calculate_available_cash(income, household_expenses, medical)
        cashflow = available - payment
        deficit = max(0.0, -cashflow)

        results.append({
            "period": i + 1,
            "medical_expense": medical,
            "available_cash_before_payment": round(available, 2),
            "payment": round(payment, 2),
            "cashflow_after_payment": round(cashflow, 2),
            "projected_deficit": round(deficit, 2),
        })

    return results


def total_projected_deficit(
    income: float,
    household_expenses: float,
    medical_expenses: List[float],
    payments: List[float],
) -> float:
    """Sum of projected deficits across all periods."""
    cashflows = calculate_period_cashflows(income, household_expenses, medical_expenses, payments)
    return sum(c["projected_deficit"] for c in cashflows)


def peak_projected_deficit(
    income: float,
    household_expenses: float,
    medical_expenses: List[float],
    payments: List[float],
) -> float:
    """Maximum single-period projected deficit."""
    cashflows = calculate_period_cashflows(income, household_expenses, medical_expenses, payments)
    return max((c["projected_deficit"] for c in cashflows), default=0.0)
