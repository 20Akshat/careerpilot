import { Briefcase, ExternalLink } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">CareerPilot AI</span>
            <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Powered by SerpApi
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full text-xs font-medium">
            AI Agents Track
          </span>
          <a href="https://serpapi.com" target="_blank" rel="noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors">
            SerpApi <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </nav>
  )
}
