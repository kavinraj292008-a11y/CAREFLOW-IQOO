import type {
  AIExplanation,
  Case,
  CaseActivity,
  CashflowPoint,
  LenderAnalysis,
  OptimizationResult,
  PortfolioMetrics,
  PortfolioStressPoint,
  SimulationEvent,
  SimulationResult,
  TreatmentPlan,
} from '@/types'

export interface CasesApi {
  listCases(): Promise<Case[]>
  getCase(caseId: string): Promise<Case | null>
  getPortfolioMetrics(): Promise<PortfolioMetrics>
  getPortfolioStress(): Promise<PortfolioStressPoint[]>
  getActivity(caseId: string): Promise<CaseActivity[]>
}

export interface TreatmentApi {
  getPlan(caseId: string): Promise<TreatmentPlan>
  listPresets(): Promise<Record<string, TreatmentPlan>>
}

export interface CashflowApi {
  getCashflow(caseId: string): Promise<CashflowPoint[]>
}

export interface RepaymentApi {
  optimize(caseId: string): Promise<OptimizationResult>
}

export interface SimulationApi {
  applyEvent(caseId: string, event: SimulationEvent): Promise<SimulationResult>
}

export interface LenderApi {
  getAnalysis(caseId: string): Promise<LenderAnalysis>
}

export interface AiApi {
  explainOptimization(caseId: string, period?: number): Promise<AIExplanation>
  summarizeCase(caseId: string): Promise<AIExplanation>
  interpretScenario(caseId: string, prompt: string): Promise<AIExplanation>
}
