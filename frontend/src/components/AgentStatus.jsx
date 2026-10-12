import { Brain, Search, ShieldCheck, BarChart3, CheckCircle2, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Planner Agent',      sub: 'Expanding query variants',     icon: Brain },
  { id: 2, label: 'JobSearch Agent',    sub: 'Fetching live SerpApi data',   icon: Search },
  { id: 3, label: 'Verification Agent', sub: 'Anti-hallucination check',     icon: ShieldCheck },
  { id: 4, label: 'Matching Agent',     sub: 'Scoring & ranking results',    icon: BarChart3 },
]

export default function AgentStatus({ currentStep, isLoading }) {
  if (!isLoading && currentStep === 0) return null

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-semibold">
        🤖 Multi-Agent Pipeline Running...
      </p>
      <div className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const Icon = step.icon
          const isDone    = currentStep > step.id
          const isActive  = currentStep === step.id

          return (
            <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
              ${isDone   ? 'border-emerald-500/30 bg-emerald-500/5'  : ''}
              ${isActive ? 'border-indigo-500/50 bg-indigo-500/10'   : ''}
              ${!isDone && !isActive ? 'border-slate-700/50 opacity-40' : ''}
            `}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${isDone   ? 'bg-emerald-500/20 text-emerald-400' : ''}
                ${isActive ? 'bg-indigo-500/20 text-indigo-400'   : ''}
                ${!isDone && !isActive ? 'bg-slate-700 text-slate-500' : ''}
              `}>
                {isDone
                  ? <CheckCircle2 size={16} />
                  : isActive
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Icon size={16} />
                }
              </div>
              <div>
                <p className={`text-sm font-semibold ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-500">{step.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
