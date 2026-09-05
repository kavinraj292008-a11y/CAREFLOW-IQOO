import { Link } from 'react-router-dom'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { DemoDataBadge } from '@/components/feedback/DemoDataBadge'

const heroData = [
  { label: 'M1', treatment: 80000, traditional: 30000, careflow: 15000 },
  { label: 'M2', treatment: 15000, traditional: 30000, careflow: 38000 },
  { label: 'M3', treatment: 110000, traditional: 30000, careflow: 15000 },
  { label: 'M4', treatment: 20000, traditional: 30000, careflow: 38000 },
  { label: 'M5', treatment: 90000, traditional: 30000, careflow: 20000 },
  { label: 'M6', treatment: 15000, traditional: 30000, careflow: 38000 },
]

const capabilities = [
  { title: 'Treatment cost modeling', body: 'Represent treatment phases, expected costs, and confidence ranges as structured financial inputs.' },
  { title: 'Cashflow forecasting', body: 'Project income, household expenses, treatment costs, and repayment across the treatment horizon.' },
  { title: 'Repayment optimization', body: 'Redistribute repayment across periods within lender-defined payment and tenure constraints.' },
  { title: 'Dynamic replanning', body: 'Re-optimize the remaining schedule when treatment circumstances change, without altering completed periods.' },
  { title: 'Stress analysis', body: 'Surface projected cashflow deficits and high-stress periods before they become missed payments.' },
  { title: 'Lender decision support', body: 'Present policy checks and restructuring recommendations in a lender-facing, compliance-aware format.' },
]

export function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[12px] font-medium text-accent-tealLight tracking-wide mb-4">
              Treatment-aware financial infrastructure
            </p>
            <h1 className="text-[32px] md:text-[42px] font-semibold leading-[1.15] text-text-primary mb-5">
              Treatment doesn't follow an EMI schedule.
              <br />
              Neither should repayment.
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-8 max-w-md">
              CareFlow helps medical-financing providers align repayment schedules with
              treatment-driven cashflow, reducing peak repayment stress while respecting
              lender constraints.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/app"
                className="text-[14px] font-semibold bg-accent-teal text-bg-primary px-5 py-2.5 rounded-sm hover:bg-accent-tealLight transition-colors"
              >
                Explore Demo
              </Link>
              <a
                href="#how-it-works"
                className="text-[14px] font-medium text-text-secondary hover:text-text-primary px-5 py-2.5 border border-border rounded-sm hover:border-white/20 transition-colors"
              >
                How CareFlow Works
              </a>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-medium text-text-secondary">6-month treatment horizon</p>
              <DemoDataBadge label="Illustrative synthetic prototype scenario" />
            </div>
            <RepaymentComparisonChart data={heroData} height={280} />
          </div>
        </div>
      </section>

      {/* Problem / Insight */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <p className="label-eyebrow mb-2">The problem</p>
            <p className="text-[20px] text-text-primary leading-snug">
              Medical expenses are irregular. Repayment schedules often are not.
            </p>
          </div>
          <div>
            <p className="label-eyebrow mb-2">The insight</p>
            <p className="text-[20px] text-text-primary leading-snug">
              What if treatment timing became a financial input?
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="label-eyebrow mb-8">How CareFlow works</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 'Forecast', body: 'Model expected treatment costs by phase, with confidence ranges over the treatment horizon.' },
              { step: 'Optimize', body: 'Redistribute repayment across periods to reduce peak stress, within lender-defined constraints.' },
              { step: 'Replan', body: 'When treatment circumstances change, re-optimize the remaining schedule without touching completed periods.' },
            ].map((item) => (
              <div key={item.step} className="panel p-5">
                <p className="text-[15px] font-semibold text-accent-tealLight mb-2">{item.step}</p>
                <p className="text-[13px] text-text-secondary leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="label-eyebrow mb-8">Product capabilities</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {capabilities.map((c) => (
              <div key={c.title}>
                <p className="text-[14px] font-semibold text-text-primary mb-1.5">{c.title}</p>
                <p className="text-[13px] text-text-secondary leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="label-eyebrow mb-8">Built for every side of the transaction</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { role: 'Lenders', body: 'Evaluate restructuring proposals against policy constraints before approving.' },
              { role: 'Healthcare providers', body: 'Share treatment timing data that informs financing decisions, without exposing clinical detail.' },
              { role: 'Patients', body: 'Experience a repayment schedule that flexes around treatment, not against it.' },
            ].map((s) => (
              <div key={s.role} className="panel p-5">
                <p className="text-[14px] font-semibold text-text-primary mb-1.5">{s.role}</p>
                <p className="text-[13px] text-text-secondary leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-[22px] md:text-[26px] font-semibold text-text-primary mb-6">
            See how repayment changes when treatment changes.
          </p>
          <Link
            to="/app"
            className="inline-flex text-[14px] font-semibold bg-accent-teal text-bg-primary px-6 py-3 rounded-sm hover:bg-accent-tealLight transition-colors"
          >
            Explore Demo
          </Link>
        </div>
      </section>
    </div>
  )
}
