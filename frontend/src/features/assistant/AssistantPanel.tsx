import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { aiApi } from '@/services/api'
import { Button } from '@/components/ui/Button'

const suggestedPrompts = [
  'Explain this repayment change',
  'Summarize this case',
  'What happens if one more cycle is added?',
  'Why is this period high stress?',
  'Explain the lender impact',
]

export function AssistantPanel({ caseId = 'CF-1042' }: { caseId?: string }) {
  const open = useUIStore((s) => s.assistantOpen)
  const setOpen = useUIStore((s) => s.setAssistantOpen)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [pending, setPending] = useState(false)

  if (!open) return null

  async function ask(prompt: string) {
    setMessages((m) => [...m, { role: 'user', text: prompt }])
    setPending(true)
    const result = await aiApi.interpretScenario(caseId, prompt)
    setMessages((m) => [...m, { role: 'assistant', text: result.response }])
    setPending(false)
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-surface/95 backdrop-blur-md border-l border-border flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <span className="text-[13px] font-semibold text-text-primary">CareFlow Assistant</span>
        <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Ask about this case, an optimization result, or how a scenario would change the schedule.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-[13px] text-text-primary' : 'text-[13px] text-text-secondary panel p-3'}
          >
            {m.text}
          </div>
        ))}
        {pending && <p className="text-[12px] text-text-muted">Thinking…</p>}
      </div>

      <div className="border-t border-border p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              className="text-[11px] text-text-secondary border border-border rounded-sm px-2 py-1 hover:text-text-primary hover:border-white/20"
            >
              {p}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" className="w-full" onClick={() => ask('Explain this case')}>
          Ask CareFlow Assistant
        </Button>
      </div>
    </div>
  )
}
