import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LandingPage } from '@/features/dashboard/LandingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CasesListPage } from '@/features/cases/CasesListPage'
import { CaseDetailPage } from '@/features/cases/CaseDetailPage'
import { CaseOverviewTab } from '@/features/cases/CaseOverviewTab'
import { CaseTreatmentTab } from '@/features/cases/CaseTreatmentTab'
import { CaseCashflowTab } from '@/features/cases/CaseCashflowTab'
import { CaseRepaymentTab } from '@/features/cases/CaseRepaymentTab'
import { CaseSimulationTab } from '@/features/cases/CaseSimulationTab'
import { CaseLenderTab } from '@/features/cases/CaseLenderTab'
import { CaseActivityTab } from '@/features/cases/CaseActivityTab'
import { TreatmentPage } from '@/features/treatment/TreatmentPage'
import { CashflowPage } from '@/features/cashflow/CashflowPage'
import { RepaymentOptimizerPage } from '@/features/repayment/RepaymentOptimizerPage'
import { SimulationPage } from '@/features/simulation/SimulationPage'
import { LenderPage } from '@/features/lender/LenderPage'
import { DEMO_CASE_ID } from '@/stores/caseStore'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: '/', element: <LandingPage /> }],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'cases', element: <CasesListPage /> },
      {
        path: 'cases/:caseId',
        element: <CaseDetailPage />,
        children: [
          { index: true, element: <CaseOverviewTab /> },
          { path: 'treatment', element: <CaseTreatmentTab /> },
          { path: 'cashflow', element: <CaseCashflowTab /> },
          { path: 'repayment', element: <CaseRepaymentTab /> },
          { path: 'simulation', element: <CaseSimulationTab /> },
          { path: 'lender', element: <CaseLenderTab /> },
          { path: 'activity', element: <CaseActivityTab /> },
        ],
      },
      { path: 'treatment', element: <TreatmentPage /> },
      { path: 'cashflow', element: <CashflowPage /> },
      { path: 'repayment', element: <RepaymentOptimizerPage /> },
      { path: 'simulation', element: <SimulationPage /> },
      { path: 'lender', element: <LenderPage /> },
    ],
  },
])
