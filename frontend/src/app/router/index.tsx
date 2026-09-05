import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { AppLayout } from '@/app/layouts/AppLayout'
import { LandingPage } from '@/features/dashboard/LandingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CasesListPage } from '@/features/cases/CasesListPage'
import { CaseDetailPage } from '@/features/cases/CaseDetailPage'
import { TreatmentPage } from '@/features/treatment/TreatmentPage'
import { CashflowPage } from '@/features/cashflow/CashflowPage'
import { RepaymentOptimizerPage } from '@/features/repayment/RepaymentOptimizerPage'
import { SimulationPage } from '@/features/simulation/SimulationPage'
import { LenderPage } from '@/features/lender/LenderPage'

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
      { path: 'cases/:caseId', element: <CaseDetailPage /> },
      { path: 'treatment', element: <TreatmentPage /> },
      { path: 'cashflow', element: <CashflowPage /> },
      { path: 'repayment', element: <RepaymentOptimizerPage /> },
      { path: 'simulation', element: <SimulationPage /> },
      { path: 'lender', element: <LenderPage /> },
    ],
  },
])
