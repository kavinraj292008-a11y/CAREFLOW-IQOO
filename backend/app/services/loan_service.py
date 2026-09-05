"""
Standard loan mathematics.

Implements deterministic amortization with no ML or LLM involvement.
All calculations are transparent and auditable.
"""

from typing import List, Dict


def monthly_rate(annual_interest_rate: float) -> float:
    """Convert annual interest rate (percentage) to monthly decimal rate."""
    return annual_interest_rate / 12.0 / 100.0


def calculate_emi(principal: float, annual_interest_rate: float, periods: int) -> float:
    """
    Calculate Equal Monthly Installment for a standard amortizing loan.

    Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    For zero-interest loans: EMI = P / n

    Args:
        principal: Loan amount (INR)
        annual_interest_rate: Annual rate as percentage (e.g. 10.0 for 10%)
        periods: Total number of monthly repayment periods

    Returns:
        Monthly installment amount (INR)
    """
    if annual_interest_rate == 0:
        return principal / periods

    r = monthly_rate(annual_interest_rate)
    factor = (1.0 + r) ** periods
    return principal * r * factor / (factor - 1.0)


def calculate_amortization(
    principal: float,
    annual_interest_rate: float,
    periods: int,
) -> List[Dict]:
    """
    Generate a complete standard amortization schedule.

    Each period includes:
      period, beginning_balance, payment, interest, principal, ending_balance

    The final payment is adjusted to exactly close the remaining balance,
    eliminating floating-point residuals.

    Returns:
        List of period dicts (1-indexed).
    """
    r = monthly_rate(annual_interest_rate)

    if annual_interest_rate == 0:
        emi = principal / periods
    else:
        emi = calculate_emi(principal, annual_interest_rate, periods)

    schedule: List[Dict] = []
    balance = principal

    for i in range(periods):
        interest = balance * r
        is_final = (i == periods - 1)

        if is_final:
            # Adjust final payment to close balance exactly.
            payment = balance + interest
            principal_paid = balance
            ending_balance = 0.0
        else:
            payment = emi
            principal_paid = payment - interest
            ending_balance = balance - principal_paid

        schedule.append({
            "period": i + 1,
            "beginning_balance": round(balance, 2),
            "payment": round(payment, 2),
            "interest": round(interest, 2),
            "principal": round(principal_paid, 2),
            "ending_balance": round(max(0.0, ending_balance), 2),
        })

        balance = max(0.0, ending_balance)

    return schedule


def calculate_remaining_balance(
    principal: float,
    annual_interest_rate: float,
    completed_payments: List[float],
) -> float:
    """
    Calculate the loan balance remaining after a series of actual payments.

    Used for replanning — computes the exact balance after completed periods.

    Args:
        principal: Original loan amount (INR)
        annual_interest_rate: Annual rate as percentage
        completed_payments: List of actual payment amounts made

    Returns:
        Remaining loan balance (INR), clamped to >= 0
    """
    r = monthly_rate(annual_interest_rate)
    balance = principal

    for payment in completed_payments:
        interest = balance * r
        principal_paid = payment - interest
        balance = balance - principal_paid

    return max(0.0, balance)
