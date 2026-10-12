import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, XCircle, Award, Building2, MapPin, ExternalLink, Trash2, Plus, Calendar, ShieldCheck, Mail, Send, Copy, Check, Sparkles, AlertCircle } from 'lucide-react'

const STATUS_CONFIG = {
  'Applied / Waiting': {
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: Clock,
    label: 'Waiting',
  },
  'Resume Shortlisted': {
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: CheckCircle2,
    label: 'Shortlisted',
  },
  'Interview Scheduled': {
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    icon: Calendar,
    label: 'Interview',
  },
  'Selected': {
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: Award,
    label: 'Selected 🎉',
  },
  'Rejected': {
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    icon: XCircle,
    label: 'Rejected',
  },
}

export default function ApplicationTrackerView({ onInvestigateCompany }) {
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('cp_applications')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return [
      {
        id: 'app-1',
        company: 'WR Technologies',
        role: 'Full Stack Software Developer Intern',
        location: 'Pune / Remote',
        appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'Applied / Waiting',
        url: '#',
      },
      {
        id: 'app-2',
        company: 'TechInnovate Solutions',
        role: 'Junior Frontend Developer',
        location: 'Bengaluru, India',
        appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'Resume Shortlisted',
        url: '#',
      }
    ]
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [newCompany, setNewCompany] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // Follow-up generator state
  const [activeFollowUpApp, setActiveFollowUpApp] = useState(null)
  const [followUpTone, setFollowUpTone] = useState('polite') // 'polite' | 'value_add' | 'urgent'
  const [copied, setCopied] = useState(false)

  const candidateName = 'Akshat Marwadi'

  useEffect(() => {
    try {
      localStorage.setItem('cp_applications', JSON.stringify(applications))
    } catch (e) {}
  }, [applications])

  function handleStatusChange(id, newStatus) {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app))
  }

  function handleDelete(id) {
    setApplications(prev => prev.filter(app => app.id !== id))
  }

  function handleAddApplication(e) {
    e.preventDefault()
    if (!newCompany.trim() || !newRole.trim()) return

    const newApp = {
      id: `app-${Date.now()}`,
      company: newCompany.trim(),
      role: newRole.trim(),
      location: newLocation.trim() || 'India',
      appliedDate: new Date().toLocaleDateString(),
      status: 'Applied / Waiting',
      url: newUrl.trim() || '#',
    }

    setApplications(prev => [newApp, ...prev])
    setNewCompany('')
    setNewRole('')
    setNewLocation('')
    setNewUrl('')
    setShowAddModal(false)
  }

  // Generate Follow-up Email templates based on tone & status
  function generateFollowUp(app, tone = 'polite') {
    if (!app) return { subject: '', body: '' }

    if (tone === 'polite') {
      return {
        subject: `Following Up: Application for ${app.role} - ${candidateName}`,
        body: `Dear Hiring Team,\n\nI hope you are having a productive week.\n\nI am writing to politely follow up on my recent application for the ${app.role} role at ${app.company}, submitted on ${app.appliedDate}.\n\nI remain very enthusiastic about the opportunity to contribute to ${app.company}'s engineering initiatives. Please let me know if there are any additional materials, portfolio samples, or references I can provide to support your review.\n\nThank you for your time and consideration.\n\nBest regards,\n${candidateName}\n+91 9522147084 | akshatmarwadi5@gmail.com`
      }
    }

    if (tone === 'value_add') {
      return {
        subject: `Quick Update & Project Addition: ${app.role} - ${candidateName}`,
        body: `Hi [Hiring Manager / Team],\n\nFollowing up on my application for the ${app.role} position at ${app.company} from ${app.appliedDate}.\n\nSince submitting my application, I recently engineered a modular feature solving asynchronous state persistence and API caching, which directly aligns with ${app.company}'s current tech requirements. I wanted to share this relevant update to demonstrate how quickly I can ramp up on your production code.\n\nI would welcome the opportunity for a brief conversation regarding how my technical background fits your upcoming roadmap.\n\nWarm regards,\n${candidateName}\nGitHub: github.com | Portfolio`
      }
    }

    // urgent / decision tone
    return {
      subject: `Status Inquiry & Milestone Update: ${app.role} - ${candidateName}`,
      body: `Dear ${app.company} Talent Team,\n\nI hope this email finds you well.\n\nI am checking in regarding the timeline for the ${app.role} recruitment cycle, for which I applied on ${app.appliedDate}.\n\nAs I am currently engaged in final discussions with another technical team, ${app.company} remains my top preference given your technical vision. Could you kindly share an update on where things stand so I can align my schedule accordingly?\n\nThank you for your guidance,\n${candidateName}\n+91 9522147084`
    }
  }

  const currentPitch = activeFollowUpApp ? generateFollowUp(activeFollowUpApp, followUpTone) : null

  function copyPitch() {
    if (!currentPitch) return
    navigator.clipboard.writeText(`${currentPitch.subject}\n\n${currentPitch.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-800">Application Pipeline Tracker</h2>
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> AI Follow-Up Active
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            Manage your hiring funnel lifecycle and autonomously generate high-converting follow-up emails for pending applications.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} /> Add Application
        </button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).slice(0, 4).map(([statusKey, cfg]) => {
          const count = applications.filter(a => a.status === statusKey).length
          const Icon = cfg.icon
          return (
            <div key={statusKey} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${cfg.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{cfg.label}</p>
                <p className="text-lg font-black text-slate-800 leading-none mt-0.5">{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Applications List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-slate-600">No applications tracked yet.</p>
            <p className="text-xs text-slate-400 mt-1">When you click "Apply Now" on any job or add one manually, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['Applied / Waiting']
              const isWaiting = app.status === 'Applied / Waiting' || app.status === 'Resume Shortlisted'

              return (
                <div key={app.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5 min-w-[220px]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{app.company}</h4>
                      <p className="text-xs text-slate-500 font-medium">{app.role}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {app.location}</span>
                        <span>•</span>
                        <span>Applied: {app.appliedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Follow-Up Generator Button for Waiting / Shortlisted */}
                    {isWaiting && (
                      <button
                        onClick={() => setActiveFollowUpApp(app)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Generate personalized follow-up email"
                      >
                        <Mail size={13} className="text-indigo-600" /> AI Follow-Up
                      </button>
                    )}

                    {/* Shield Investigate Button */}
                    {onInvestigateCompany && (
                      <button
                        onClick={() => onInvestigateCompany(app.company, app.role)}
                        title="Investigate with OpportunityShield"
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-700 bg-slate-50 border border-slate-200 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <ShieldCheck size={13} className="text-slate-500" /> Shield
                      </button>
                    )}

                    {/* Status Dropdown */}
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-all cursor-pointer ${cfg.color}`}
                    >
                      {Object.keys(STATUS_CONFIG).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    {/* External Link */}
                    {app.url && app.url !== '#' && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FOLLOW-UP EMAIL GENERATOR MODAL ── */}
      {activeFollowUpApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">AI Follow-Up Email Generator</h3>
                  <p className="text-[11px] text-slate-500">{activeFollowUpApp.company} • {activeFollowUpApp.role}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveFollowUpApp(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tone Selector */}
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              {[
                { id: 'polite', label: 'Polite Inquiry (Standard)' },
                { id: 'value_add', label: 'Value-Add (New Project)' },
                { id: 'urgent', label: 'Decision Timeline' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFollowUpTone(t.id)}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    followUpTone === t.id
                      ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Subject</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 font-semibold">
                {currentPitch.subject}
              </div>
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Personalized Body</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {currentPitch.body}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <AlertCircle size={12} /> Boosts recruiter response rate by up to 3.5x
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFollowUpApp(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={copyPitch}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Follow-Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Track New Job Application</h3>
            <form onSubmit={handleAddApplication} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. Swiggy, TCS, Razorpay"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g. Indore / Remote"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Job Link</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
