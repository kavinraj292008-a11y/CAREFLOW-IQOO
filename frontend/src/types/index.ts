// ===== Shared enums / unions =====

export type StressLevel = 'low' | 'moderate' | 'high' | 'critical'

export type CaseStatus = 'stable' | 'review' | 'replan' | 'closed'

export type TreatmentType =
  | 'chemotherapy'
  | 'dialysis'
  | 'cardiac_surgery'
  | 'custom'

// ===== Treatment =====

export interface TreatmentPhase {
  id: string
  period: number // month index, 1-based
  label: string // e.g. "Cycle 3", "Recovery"
  expectedCost: number
  lowerBound?: number
  upperBound?: number
  confidence?: number // 0-1
  status: StressLevel
}

export interface TreatmentCostPoint {
  period: number
  label: string
  expectedCost: number
  lowerBound?: number
  upperBound?: number
}

export interface TreatmentPlan {
  id: string
  type: TreatmentType
  name: string
  durationMonths: number
  frequencyLabel: string
  confidence: number
  status: StressLevel
  phases: TreatmentPhase[]
}

// ===== Financial profile =====

export interface FinancialProfile {
  monthlyIncome: number
  monthlyHouseholdExpenses: number
}

export interface LoanProfile {
  outstandingPrincipal: number
  annualInterestRate: number // decimal, e.g. 0.10
  currentMonthlyPayment: number
  remainingTenureMonths: number
}

export interface LenderConstraints {
  minPayment: number
  maxPayment: number
  maxExtensionMonths: number
}

// ===== Cashflow =====

export interface CashflowPoint {
  period: number
  label: string
  income: number
  householdExpenses: number
  treatmentExpenses: number
  repayment: number
  remainingCash: number
}

// ===== Repayment / optimization =====

export interface RepaymentPeriod {
  period: number
  label: string
  medicalCost: number
  traditionalPayment: number
  careflowPayment: number
  availableCash: number
  stress: StressLevel
  beginningBalance: number
  interest: number
  principal: number
  endingBalance: number
  changeReason?: string
}

export interface RepaymentSchedule {
  caseId: string
  periods: RepaymentPeriod[]
}

export interface ComparisonMetrics {
  peakDeficitTraditional: number
  peakDeficitCareflow: number
  highStressPeriodsTraditional: number
  highStressPeriodsCareflow: number
  totalRepaymentTraditional: number
  totalRepaymentCareflow: number
  interestImpact: number
}

export interface OptimizationResult {
  caseId: string
  schedule: RepaymentSchedule
  comparison: ComparisonMetrics
  generatedAt: string
  isDemo: boolean
}

// ===== Simulation =====

export type SimulationEventType =
  | 'add_cycle'
  | 'unexpected_expense'
  | 'delay_treatment'
  | 'increase_frequency'

export interface SimulationEvent {
  id: string
  type: SimulationEventType
  label: string
  additionalCost?: number
  targetPeriod?: number
  delayMonths?: number
}

export interface SimulationResult {
  caseId: string
  event: SimulationEvent
  originalSchedule: RepaymentSchedule
  updatedSchedule: RepaymentSchedule
  changedFromPeriod: number
}

// ===== Lender =====

export interface LenderPolicyCheck {
  label: string
  passed: boolean
}

export interface LenderAnalysis {
  caseId: string
  outstandingPrincipal: number
  currentPayment: number
  proposedPayment: number
  remainingTenureMonths: number
  extensionMonths: number
  projectedStress: StressLevel
  totalRepayment: number
  interestImpact: number
  policyChecks: LenderPolicyCheck[]
}

// ===== AI Assistant =====

export interface AIExplanation {
  prompt: string
  response: string
  generatedAt: string
}

// ===== Case =====

export interface Case {
  id: string
  patientLabel: string
  treatment: TreatmentPlan
  currentPhaseLabel: string
  financial: FinancialProfile
  loan: LoanProfile
  constraints: LenderConstraints
  outstanding: number
  currentPayment: number
  projectedStress: StressLevel
  status: CaseStatus
  lastUpdated: string
  createdAt: string
}

export interface CaseActivity {
  id: string
  caseId: string
  timestamp: string
  actor: string
  description: string
}

export interface PortfolioMetrics {
  activeCases: number
  casesUnderReview: number
  highStressCases: number
  activeRestructurings: number
}

export interface PortfolioStressPoint {
  period: number
  label: string
  traditionalStressIndex: number
  careflowStressIndex: number
}
