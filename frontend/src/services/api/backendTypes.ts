// Backend DTO types — exact contract with the FastAPI backend.
// Do NOT modify these to match old frontend types; adapt frontend types to these instead.

export interface LoanProfileDto {
  principal: number
  annual_interest_rate: number // percentage e.g. 10.0 = 10%
  remaining_periods: number
}

export interface LenderConstraintsDto {
  minimum_payment: number
  maximum_payment: number
  maximum_extension_periods: number
}

export interface CareFlowCaseRequest {
  income: number
  monthly_household_expenses: number
  loan: LoanProfileDto
  treatment_costs: number[]
  constraints: LenderConstraintsDto
}

export interface DemoCaseEntry {
  name: string
  description: string
  case: CareFlowCaseRequest
}

export interface DemoCaseResponse {
  disclaimer: string
  cases: {
    canonical: DemoCaseEntry
  }
}

export type BackendStressLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
export type OptimizationStatus = 'optimal' | 'feasible' | 'infeasible' | 'error'

export interface RepaymentPeriodDto {
  period: number
  medical_expense: number
  income: number
  household_expenses: number
  available_cash_before_payment: number
  payment: number
  interest: number
  principal: number
  beginning_balance: number
  ending_balance: number
  cashflow_after_payment: number
  projected_deficit: number
  stress_level: BackendStressLevel
  is_completed: boolean
  explanation: string | null
}

export interface ScheduleMetricsDto {
  peak_deficit: number
  total_deficit: number
  high_stress_periods: number
  critical_stress_periods: number
  total_interest: number
  total_repayment: number
  original_tenure: number
  optimized_tenure: number
  extension_periods: number
}

export interface TraditionalResultDto {
  schedule: RepaymentPeriodDto[]
  metrics: ScheduleMetricsDto
}

export interface CareFlowResultDto {
  schedule: RepaymentPeriodDto[]
  metrics: ScheduleMetricsDto
  optimization_status: OptimizationStatus
  infeasibility_reason: string | null
}

export interface ComparisonMetricsDto {
  peak_deficit_reduction: number
  total_deficit_reduction: number
  high_stress_period_reduction: number
  critical_stress_period_reduction: number
  interest_difference: number
  tenure_difference: number
}

export interface ExplanationDto {
  period: number
  explanation_type: string
  message: string
}

export interface CaseSummaryDto {
  income: number
  monthly_household_expenses: number
  loan_principal: number
  annual_interest_rate: number
  remaining_periods: number
  treatment_periods: number
  minimum_payment: number
  maximum_payment: number
  maximum_extension_periods: number
}

export interface CareFlowAnalysisResponse {
  case_summary: CaseSummaryDto
  traditional: TraditionalResultDto
  careflow: CareFlowResultDto
  comparison: ComparisonMetricsDto
  explanations: ExplanationDto[]
}

// Simulation DTOs
export type SimulationEventType = 'additional_cycle' | 'additional_expense' | 'treatment_delay'

export interface SimulationEventDto {
  event_type: SimulationEventType
  target_period?: number | null
  source_period?: number | null
  additional_cost?: number | null
  delay_periods?: number | null
  description?: string | null
}

export interface ReplanRequestDto {
  case: CareFlowCaseRequest
  completed_periods: number
  completed_payments: number[]
  event: SimulationEventDto
}

export interface ReplanResultDto {
  event: SimulationEventDto
  replan_status: OptimizationStatus
  balance_at_replan: number
  updated_medical_expenses: number[]
  completed_schedule: RepaymentPeriodDto[]
  new_future_schedule: RepaymentPeriodDto[]
  full_schedule: RepaymentPeriodDto[]
  new_metrics: ScheduleMetricsDto
  explanations: ExplanationDto[]
  infeasibility_reason: string | null
}

export interface HealthResponse {
  status: string
}
