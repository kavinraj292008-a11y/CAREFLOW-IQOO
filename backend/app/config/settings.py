"""
CareFlow application settings.
All financial thresholds are configurable here — not hardcoded in business logic.
"""


class StressThresholds:
    """Configurable thresholds for cashflow stress classification (INR)."""
    MODERATE: float = 0       # deficit > 0
    HIGH: float = 10_000      # deficit > 10,000
    CRITICAL: float = 30_000  # deficit > 30,000


class Settings:
    APP_NAME: str = "CareFlow Financial Engine"
    APP_VERSION: str = "1.0.0-day1"
    APP_DESCRIPTION: str = (
        "Treatment doesn't follow an EMI schedule. Neither should repayment."
    )
    DEBUG: bool = False

    # Optimization
    LP_SOLVER: str = "GLOP"
    SECONDARY_OBJECTIVE_WEIGHT: float = 0.001  # small weight for total deficit

    # Disclaimer
    SYNTHETIC_DATA_DISCLAIMER: str = (
        "This prototype uses synthetic illustrative treatment and financial scenarios "
        "and is not medical advice, financial advice, or a loan approval system."
    )

    stress = StressThresholds()


settings = Settings()
