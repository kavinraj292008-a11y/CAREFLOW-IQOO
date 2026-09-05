# CareFlow Financial Engine — Day 1

> **Treatment doesn't follow an EMI schedule. Neither should repayment.**

---

## Product Overview

CareFlow is a decision-support prototype that treats medical treatment timing as a financial variable.

Conventional loan repayment schedules assume regular, predictable obligations. Medical treatment does not follow this assumption — treatment generates irregular, clustered, treatment-driven expenses that can create severe cashflow pressure when combined with a fixed EMI obligation.

CareFlow models this tension explicitly and uses mathematical optimization to generate adaptive repayment schedules that reduce projected cashflow stress while respecting lender-defined constraints.

---

## The Problem

A borrower undergoing chemotherapy faces:

- **Period 1:** Treatment cost 80,000 + EMI 52,750 + household 20,000 = 152,750 against 70,000 income
- **Period 3:** Treatment cost 110,000 + EMI 52,750 + household 20,000 = 182,750 against 70,000 income

A fixed EMI schedule creates projected deficits of **112,750** in the worst period.

---

## Core Insight

Treatment timing is a financial input.

```
Treatment Timeline
→ Treatment Expense Curve
→ Borrower Cashflow
→ Financial Stress
→ Repayment Optimization (LP)
→ Adaptive Repayment
→ Dynamic Replanning
```

In high-treatment periods: reduce repayment pressure.  
In low-treatment periods: capture greater repayment capacity.  
The result: lower peak deficit, fewer critically stressed periods.

---

## Architecture

```
backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── api/
│   │   ├── health.py              # GET /health
│   │   ├── repayment.py           # GET /api/demo-case
│   │   │                          # POST /api/repayment/analyze
│   │   │                          # POST /api/repayment/optimize
│   │   └── simulation.py          # POST /api/simulation/replan
│   ├── schemas/
│   │   ├── case.py                # Input: CareFlowCase, LoanProfile, LenderConstraints
│   │   ├── financial.py           # StressLevel, OptimizationStatus
│   │   ├── repayment.py           # Output: RepaymentPeriod, ScheduleMetrics, ...
│   │   └── simulation.py          # SimulationEvent, ReplanRequest, ReplanResult
│   ├── services/
│   │   ├── loan_service.py        # EMI, amortization, remaining balance
│   │   ├── stress_service.py      # Deficit calculation, stress classification
│   │   ├── repayment_service.py   # Traditional + CareFlow schedule generation
│   │   └── optimization_service.py# Explanations, comparison, event processing
│   ├── optimization/
│   │   └── careflow_optimizer.py  # LP solver (OR-Tools GLOP)
│   ├── config/
│   │   └── settings.py            # Configurable thresholds and settings
│   └── data/
│       ├── demo_cases.py          # Canonical demonstration case
│       └── treatment_templates.py # Synthetic treatment scenarios
├── tests/
│   ├── test_loan.py               # EMI, amortization, balance (17 tests)
│   ├── test_stress.py             # Deficit, stress levels (16 tests)
│   ├── test_optimization.py       # CareFlow LP, constraints, infeasibility (22 tests)
│   └── test_simulation.py         # Replanning, events, frozen periods (14 tests)
└── scripts/
    └── test_demo.py               # End-to-end demonstration script
```

---

## Financial Model

### Traditional (Fixed EMI)

```
r     = annual_interest_rate / 12 / 100
EMI   = P × r × (1+r)^n / ((1+r)^n − 1)
```

Each period:
- `interest[t]     = balance[t-1] × r`
- `principal[t]    = EMI − interest[t]`
- `balance[t]      = balance[t-1] − principal[t]`

The final payment is adjusted to close the balance exactly.

### Cashflow

```
available_cash_before_payment = income − household_expenses − medical_expense
cashflow_after_payment        = available_cash_before_payment − payment
projected_deficit             = max(0, household + medical + payment − income)
```

### Stress Classification

| Level    | Projected Deficit           |
|----------|-----------------------------|
| LOW      | = 0                         |
| MODERATE | 0 < deficit ≤ 10,000        |
| HIGH     | 10,000 < deficit ≤ 30,000   |
| CRITICAL | deficit > 30,000            |

Thresholds are configurable in `app/config/settings.py`.

---

## Optimization Model

CareFlow uses **Google OR-Tools GLOP** (linear programming) to find the payment schedule that minimizes projected cashflow stress.

### Decision Variables

| Variable | Description |
|----------|-------------|
| `p[t]`   | Payment in period t |
| `b[t]`   | Loan balance after period t |
| `d[t]`   | Projected deficit in period t |
| `z`      | Maximum deficit (minimax variable) |

### Constraints

```
b[0]    = remaining_balance
b[t]    = b[t−1] × (1+r) − p[t]    (linear — r is a constant)
b[T]    = 0                          (loan fully repaid)
b[t]    ≥ 0                          (no over-repayment)
d[t]    ≥ household + medical[t] + p[t] − income
d[t]    ≥ 0
z       ≥ d[t]  for all t
min_pay ≤ p[t] ≤ max_pay
```

### Objective

```
minimize z + 0.001 × Σ d[t]
```

Primary: minimize maximum projected deficit (minimax).  
Secondary weight (0.001) breaks ties toward lower total deficit without overriding the primary goal.

### Extension Handling

The optimizer tries horizons from `n_remaining` to `n_remaining + max_extension_periods`.  
Returns the first feasible solution. If none found: `optimization_status = "infeasible"`.

---

## Dynamic Replanning

```
POST /api/simulation/replan

1. Freeze completed periods (immutable)
2. Recalculate remaining balance from actual completed payments
3. Apply simulation event to future treatment costs
4. Re-run CareFlow LP optimization for remaining periods
5. Return: frozen completed schedule + new optimized future schedule
```

### Supported Events

| Event Type          | Description |
|---------------------|-------------|
| `additional_cycle`  | Add treatment cycle cost at a future period |
| `additional_expense`| Add one-off extra expense at a future period |
| `treatment_delay`   | Shift treatment cost from source_period by N periods |

Completed periods are never modified regardless of event type.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Service liveness check |
| `GET`  | `/api/demo-case` | Canonical demo case |
| `POST` | `/api/repayment/analyze` | Traditional schedule only |
| `POST` | `/api/repayment/optimize` | Full traditional + CareFlow analysis |
| `POST` | `/api/simulation/replan` | Dynamic replanning after treatment event |
| `GET`  | `/docs` | Swagger UI |
| `GET`  | `/redoc` | ReDoc |

---

## Demo Case

**Canonical scenario — Chemotherapy Demo:**

| Field | Value |
|-------|-------|
| Monthly Income | 70,000 |
| Monthly Household | 20,000 |
| Loan Principal | 6,00,000 |
| Annual Rate | 10% |
| Loan Periods | 12 months |
| Treatment M1 | 80,000 |
| Treatment M2 | 15,000 |
| Treatment M3 | 1,10,000 |
| Treatment M4 | 20,000 |
| Treatment M5 | 90,000 |
| Treatment M6 | 15,000 |
| Min Payment | 5,000 |
| Max Payment | 1,00,000 |
| Max Extension | 3 periods |

**Traditional EMI:** ~52,750/month  
**CareFlow peak deficit:** 65,000 (period 3, unavoidable — treatment alone exceeds income)  
**Traditional peak deficit:** 112,750  
**Peak deficit reduction:** ~47,750 (42%)

---

## Example Request

```http
POST /api/repayment/optimize
Content-Type: application/json

{
  "income": 70000,
  "monthly_household_expenses": 20000,
  "loan": {
    "principal": 600000,
    "annual_interest_rate": 10,
    "remaining_periods": 12
  },
  "treatment_costs": [80000, 15000, 110000, 20000, 90000, 15000],
  "constraints": {
    "minimum_payment": 5000,
    "maximum_payment": 100000,
    "maximum_extension_periods": 3
  }
}
```

## Example Response (abbreviated)

```json
{
  "case_summary": {
    "income": 70000,
    "loan_principal": 600000,
    "total_treatment_cost": 330000
  },
  "traditional": {
    "metrics": {
      "peak_deficit": 112749.53,
      "critical_stress_periods": 3,
      "total_interest": 32994.40
    }
  },
  "careflow": {
    "optimization_status": "optimal",
    "metrics": {
      "peak_deficit": 65000.0,
      "critical_stress_periods": 6,
      "total_interest": 32408.73,
      "extension_periods": 0
    }
  },
  "comparison": {
    "peak_deficit_reduction": 47749.53,
    "high_stress_period_reduction": 3,
    "interest_difference": -585.67,
    "tenure_difference": 0
  },
  "explanations": [
    {
      "period": 1,
      "explanation_type": "payment_reduced",
      "message": "Payment was reduced to 35,000 (vs standard 52,750) because projected treatment expense of 80,000 creates significant cashflow pressure in this period."
    }
  ]
}
```

---

## Installation

```bash
# Clone and enter the backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Requirements:**
- Python 3.11+
- fastapi, uvicorn, pydantic, ortools, pytest

---

## Running

```bash
cd backend

# Development server
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

API is available at `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

---

## Testing

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run by module
python -m pytest tests/test_loan.py -v
python -m pytest tests/test_optimization.py -v
python -m pytest tests/test_simulation.py -v
```

**69 tests across 4 modules** covering:
- EMI and amortization correctness
- Zero-interest edge case
- Schedule arithmetic (balance continuity, reaches zero)
- CareFlow LP optimization
- Minimum/maximum/extension constraints
- Stress metric calculation
- All three simulation event types
- Completed-period immutability
- Infeasible scenario detection
- Input validation

---

## Demo Script

```bash
cd backend
python scripts/test_demo.py
```

Runs the full pipeline:
1. Load canonical chemotherapy case
2. Generate traditional schedule
3. Generate CareFlow schedule
4. Print stress comparison
5. Simulate additional treatment cycle in period 7
6. Replan remaining schedule
7. Print before/after summary

All output numbers are generated by the actual engine — no fabricated values.

---

## Assumptions

- Loan periods are monthly.
- Income and household expenses are constant across all periods.
- Treatment costs are projections, not clinical certainties.
- The LP optimizer assumes payments are continuous (not restricted to whole rupees). Results are rounded to 2 decimal places for display.
- The final payment in a schedule may differ from others to close the balance exactly (standard amortization practice).
- Interest accrues monthly on the outstanding balance.
- The optimization model is a linear program (GLOP). All constraints are linear because the monthly rate is a fixed constant, not a decision variable.

---

## Limitations

- **No real patient data:** All treatment scenarios are synthetic and illustrative.
- **No banking integration:** Repayment is simulated, not processed.
- **No authentication:** Day 1 prototype, single-user.
- **Constant income/expenses:** The model does not currently account for income variability.
- **No credit scoring:** The engine does not assess creditworthiness.
- **No lender approval workflow:** Schedules are optimization outputs, not approved loan products.
- **Extension may cost more interest:** If CareFlow requires extension periods, additional interest will accrue. This is explicitly reported in `comparison.interest_difference`.
- **Infeasibility is possible:** When lender constraints are too tight relative to the loan balance and interest rate, no valid schedule can be found. The API explicitly reports this.

---

## Future Architecture (Day 2+)

```
POST /api/ai/parse-treatment     → Natural language → structured treatment plan
POST /api/ai/explain-optimization → Human-readable optimization explanation
POST /api/ai/summarize-case      → Case summary for borrower
POST /api/ai/interpret-scenario  → Scenario interpretation

Natural Language → AI → Pydantic Validation → Financial Engine → Optimization
```

AI assists with interpretation. AI never directly determines payment amounts.

---

## Synthetic Data Disclaimer

**This prototype uses synthetic illustrative treatment and financial scenarios and is not medical advice, financial advice, or a loan approval system.**

Treatment cost values are demonstration figures only. They do not represent universal benchmarks, clinical protocols, or actual cost data from any medical institution. The three treatment templates (Chemotherapy Demo, Dialysis Demo, Cardiac Surgery Demo) are purely illustrative.

No real patient data is used or processed anywhere in this codebase.

---

## What CareFlow Does NOT Do

- Eliminate or forgive debt
- Guarantee treatment continuity
- Guarantee default prevention
- Guarantee lender acceptance of optimized schedules
- Automatically approve or reject loan applications
- Provide medical advice
- Provide regulated financial advice

CareFlow is a **decision-support and optimization demonstration** system.
