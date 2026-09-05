// Central synthetic demo dataset for CareFlow.
// All figures here are illustrative prototype data — see IS_DEMO flags used throughout the UI.
import type {
  Case,
  CaseActivity,
  ComparisonMetrics,
  LenderAnalysis,
  PortfolioMetrics,
  PortfolioStressPoint,
  RepaymentPeriod,
  TreatmentPlan,
} from '@/types'

export const IS_DEMO = true

const treatmentCosts = [80000, 15000, 110000, 20000, 90000, 15000]
const cycleLabels = ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4', 'Cycle 5', 'Cycle 6']

function stressForCost(cost: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (cost >= 100000) return 'critical'
  if (cost >= 70000) return 'high'
  if (cost >= 30000) return 'moderate'
  return 'low'
}

export const demoTreatmentPlan: TreatmentPlan = {
  id: 'tp-chemo-demo',
  type: 'chemotherapy',
  name: 'Chemotherapy Demo',
  durationMonths: 6,
  frequencyLabel: 'Monthly cycle',
  confidence: 0.72,
  status: 'high',
  phases: treatmentCosts.map((cost, i) => ({
    id: `phase-${i + 1}`,
    period: i + 1,
    label: cycleLabels[i],
    expectedCost: cost,
    lowerBound: Math.round(cost * 0.85),
    upperBound: Math.round(cost * 1.2),
    confidence: 0.6 + (i % 3) * 0.08,
    status: stressForCost(cost),
  })),
}

export const treatmentPresets: Record<string, TreatmentPlan> = {
  chemotherapy: demoTreatmentPlan,
  dialysis: {
    id: 'tp-dialysis-demo',
    type: 'dialysis',
    name: 'Dialysis Demo',
    durationMonths: 6,
    frequencyLabel: 'Weekly sessions, billed monthly',
    confidence: 0.81,
    status: 'moderate',
    phases: [42000, 42000, 45000, 42000, 48000, 42000].map((cost, i) => ({
      id: `dial-${i + 1}`,
      period: i + 1,
      label: `Month ${i + 1}`,
      expectedCost: cost,
      lowerBound: Math.round(cost * 0.92),
      upperBound: Math.round(cost * 1.1),
      confidence: 0.78,
      status: stressForCost(cost),
    })),
  },
  cardiac_surgery: {
    id: 'tp-cardiac-demo',
    type: 'cardiac_surgery',
    name: 'Cardiac Surgery + Follow-up Demo',
    durationMonths: 6,
    frequencyLabel: 'Single procedure + follow-up visits',
    confidence: 0.68,
    status: 'critical',
    phases: [320000, 25000, 15000, 12000, 10000, 10000].map((cost, i) => ({
      id: `card-${i + 1}`,
      period: i + 1,
      label: i === 0 ? 'Procedure' : `Follow-up ${i}`,
      expectedCost: cost,
      lowerBound: Math.round(cost * 0.9),
      upperBound: Math.round(cost * 1.25),
      confidence: 0.65,
      status: stressForCost(cost),
    })),
  },
}

export const demoCase: Case = {
  id: 'CF-1042',
  patientLabel: 'Anonymous Patient A',
  treatment: demoTreatmentPlan,
  currentPhaseLabel: 'Cycle 3',
  financial: {
    monthlyIncome: 70000,
    monthlyHouseholdExpenses: 20000,
  },
  loan: {
    outstandingPrincipal: 600000,
    annualInterestRate: 0.1,
    currentMonthlyPayment: 30000,
    remainingTenureMonths: 24,
  },
  constraints: {
    minPayment: 12000,
    maxPayment: 42000,
    maxExtensionMonths: 6,
  },
  outstanding: 420000,
  currentPayment: 30000,
  projectedStress: 'high',
  status: 'review',
  lastUpdated: '2026-08-29T10:15:00Z',
  createdAt: '2026-03-12T09:00:00Z',
}

export const demoCasesList: Case[] = [
  demoCase,
  {
    ...demoCase,
    id: 'CF-1038',
    patientLabel: 'Anonymous Patient B',
    treatment: treatmentPresets.cardiac_surgery,
    currentPhaseLabel: 'Recovery',
    outstanding: 280000,
    projectedStress: 'low',
    status: 'stable',
    lastUpdated: '2026-08-30T14:20:00Z',
  },
  {
    ...demoCase,
    id: 'CF-1031',
    patientLabel: 'Anonymous Patient C',
    currentPhaseLabel: 'Cycle 5',
    outstanding: 540000,
    projectedStress: 'critical',
    status: 'replan',
    lastUpdated: '2026-08-31T08:05:00Z',
  },
  {
    ...demoCase,
    id: 'CF-1029',
    patientLabel: 'Anonymous Patient D',
    treatment: treatmentPresets.dialysis,
    currentPhaseLabel: 'Month 4',
    outstanding: 165000,
    projectedStress: 'moderate',
    status: 'review',
    lastUpdated: '2026-08-27T11:40:00Z',
  },
  {
    ...demoCase,
    id: 'CF-1017',
    patientLabel: 'Anonymous Patient E',
    currentPhaseLabel: 'Cycle 2',
    outstanding: 95000,
    projectedStress: 'low',
    status: 'stable',
    lastUpdated: '2026-08-20T16:00:00Z',
  },
]

export const demoPortfolioMetrics: PortfolioMetrics = {
  activeCases: 128,
  casesUnderReview: 14,
  highStressCases: 8,
  activeRestructurings: 23,
}

export const demoPortfolioStress: PortfolioStressPoint[] = cycleLabels.map((label, i) => ({
  period: i + 1,
  label,
  traditionalStressIndex: [38, 52, 88, 60, 76, 44][i],
  careflowStressIndex: [30, 34, 48, 40, 42, 32][i],
}))

// ----- Repayment optimization demo -----

const traditionalPayment = 30000

// Simple illustrative CareFlow re-weighting: reduce payment during cost peaks,
// raise it slightly in low-cost periods, always bounded by lender constraints.
function careflowPaymentFor(cost: number): number {
  if (cost >= 100000) return 15000
  if (cost >= 70000) return 20000
  if (cost <= 15000) return 38000
  return 30000
}

function reasonFor(cost: number, cfPayment: number): string {
  if (cfPayment < traditionalPayment) {
    return 'Projected treatment expense creates significant cashflow pressure in this period. Repayment is redistributed toward lower-cost periods.'
  }
  if (cfPayment > traditionalPayment) {
    return 'Low projected treatment expense in this period. Additional repayment capacity is used to offset reductions elsewhere.'
  }
  return 'Projected cashflow is broadly in line with the standard schedule for this period.'
}

export function buildDemoRepaymentPeriods(): RepaymentPeriod[] {
  let balance = demoCase.loan.outstandingPrincipal
  const monthlyRate = demoCase.loan.annualInterestRate / 12

  return treatmentCosts.map((cost, i) => {
    const cfPayment = careflowPaymentFor(cost)
    const interest = Math.round(balance * monthlyRate)
    const principal = cfPayment - interest
    const beginningBalance = balance
    const endingBalance = Math.max(0, balance - principal)
    balance = endingBalance

    const availableCash =
      demoCase.financial.monthlyIncome - demoCase.financial.monthlyHouseholdExpenses - cost - cfPayment

    return {
      period: i + 1,
      label: cycleLabels[i],
      medicalCost: cost,
      traditionalPayment,
      careflowPayment: cfPayment,
      availableCash,
      stress: stressForCost(cost),
      beginningBalance,
      interest,
      principal,
      endingBalance,
      changeReason: reasonFor(cost, cfPayment),
    }
  })
}

export function buildDemoComparisonMetrics(periods: RepaymentPeriod[]): ComparisonMetrics {
  const deficits = periods.map(
    (p) => -(demoCase.financial.monthlyIncome - demoCase.financial.monthlyHouseholdExpenses - p.medicalCost - p.traditionalPayment),
  )
  const cfDeficits = periods.map((p) => -p.availableCash)

  return {
    peakDeficitTraditional: Math.max(0, ...deficits),
    peakDeficitCareflow: Math.max(0, ...cfDeficits),
    highStressPeriodsTraditional: periods.filter((p) => p.stress === 'high' || p.stress === 'critical').length,
    highStressPeriodsCareflow: periods.filter((p) => p.careflowPayment < p.traditionalPayment).length - 1 >= 0
      ? Math.max(0, periods.filter((p) => p.stress === 'critical').length - 1)
      : 0,
    totalRepaymentTraditional: periods.reduce((sum, p) => sum + p.traditionalPayment, 0),
    totalRepaymentCareflow: periods.reduce((sum, p) => sum + p.careflowPayment, 0),
    interestImpact: 4200,
  }
}

export const demoLenderAnalysis: LenderAnalysis = {
  caseId: demoCase.id,
  outstandingPrincipal: demoCase.loan.outstandingPrincipal,
  currentPayment: demoCase.loan.currentMonthlyPayment,
  proposedPayment: 20000,
  remainingTenureMonths: demoCase.loan.remainingTenureMonths,
  extensionMonths: 3,
  projectedStress: 'moderate',
  totalRepayment: 612000,
  interestImpact: 4200,
  policyChecks: [
    { label: 'Minimum payment', passed: true },
    { label: 'Maximum payment', passed: true },
    { label: 'Maximum extension', passed: true },
    { label: 'Loan completion within policy horizon', passed: true },
  ],
}

export const demoActivity: CaseActivity[] = [
  { id: 'a1', caseId: demoCase.id, timestamp: '2026-08-31T09:12:00Z', actor: 'CareFlow Engine', description: 'Re-optimization run completed for Cycle 3 cost update.' },
  { id: 'a2', caseId: demoCase.id, timestamp: '2026-08-29T10:15:00Z', actor: 'Reviewer — S. Rao', description: 'Case moved to Under Review pending lender sign-off.' },
  { id: 'a3', caseId: demoCase.id, timestamp: '2026-08-22T15:40:00Z', actor: 'CareFlow Engine', description: 'Treatment cost forecast updated from provider estimate.' },
  { id: 'a4', caseId: demoCase.id, timestamp: '2026-08-12T08:00:00Z', actor: 'System', description: 'Case created from intake form CF-INTK-0442.' },
]
