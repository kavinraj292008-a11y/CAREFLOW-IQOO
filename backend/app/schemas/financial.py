"""
Core financial type definitions for CareFlow.
"""

from enum import Enum


class StressLevel(str, Enum):
    """
    Cashflow stress classification based on projected deficit.
    Thresholds are configurable in app/config/settings.py.
    """
    LOW = "LOW"           # projected_deficit == 0
    MODERATE = "MODERATE" # 0 < deficit <= 10,000
    HIGH = "HIGH"         # 10,000 < deficit <= 30,000
    CRITICAL = "CRITICAL" # deficit > 30,000


class OptimizationStatus(str, Enum):
    OPTIMAL = "optimal"
    FEASIBLE = "feasible"
    INFEASIBLE = "infeasible"
    ERROR = "error"
