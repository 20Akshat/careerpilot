import { useState } from 'react'
import { Briefcase, Search, FileText, Archive, ShieldAlert, Settings, LogOut, Zap, Bell, ChevronDown } from 'lucide-react'

const NAV_ITEMS = [
  { icon: Briefcase, label: 'Jobs', id: 'jobs' },
  { icon: ShieldAlert, label: 'OpportunityShield', id: 'shield' },
  { icon: FileText, label: 'Applied Tracker', id: 'applied' },
  { icon: Archive, label: 'Archive', id: 'archive' },
]

export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="w-16 lg:w-56 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <span className="hidden lg:block font-bold text-slate-800 text-sm">CareerPilot AI</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium w-full
                ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
              `}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer group">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
          </div>
          <button onClick={onLogout} className="hidden lg:block text-slate-300 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
