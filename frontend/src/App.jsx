import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import JobCard from './components/JobCard'
import AgentStatus from './components/AgentStatus'
import AIChatPanel from './components/AIChatPanel'
import OpportunityShieldView from './components/OpportunityShieldView'
import ApplicationTrackerView from './components/ApplicationTrackerView'
import CareerCopilotModal from './components/CareerCopilotModal'
import { Briefcase, SearchX, Database, Trophy, Target, TrendingUp } from 'lucide-react'
import { API } from './config'

const OFFLINE_JOBS = [
  {
    id: 'offline-1', title: 'Junior React Developer', company: 'TechInnovate Solutions',
    location: 'Bengaluru, Karnataka, India', via: 'via LinkedIn',
    description: 'Looking for a junior React developer. Freshers welcome. React, JavaScript required.',
    shareLink: '#', extensions: ['Today', 'Full-time'],
    applyOptions: [{ title: 'Apply on LinkedIn', link: '#' }],
    evaluation: {
      matchScore: 88,
      scoreBreakdown: { skillScore: 40, roleScore: 25, eligibilityScore: 20, recencyScore: 3 },
      matchedSkills: ['react', 'javascript'], missingSkills: ['tailwind css'],
      experienceAudit: { tag: 'Verified Fresher Friendly', isFresherEligible: true, confidence: 'HIGH' },
      applyUrl: '#', verifiedSource: { platform: 'Demo', hasDirectApply: false, isGroundTruth: false }
    }
  },
  {
    id: 'offline-2', title: 'Full Stack Developer Intern', company: 'CloudSphere India',
    location: 'Remote, India', via: 'via Naukri.com',
    description: 'Node.js, React, MongoDB. 0-1 years. Freshers can apply. Great learning environment.',
    shareLink: '#', extensions: ['2 days ago', 'Internship'],
    applyOptions: [{ title: 'Apply on Naukri', link: '#' }],
    evaluation: {
      matchScore: 72,
      scoreBreakdown: { skillScore: 32, roleScore: 25, eligibilityScore: 10, recencyScore: 5 },
      matchedSkills: ['react', 'node.js'], missingSkills: ['mongodb', 'typescript'],
      experienceAudit: { tag: 'Verified Fresher Friendly', isFresherEligible: true, confidence: 'HIGH' },
      applyUrl: '#', verifiedSource: { platform: 'Demo', hasDirectApply: false, isGroundTruth: false }
    }
  }
]

function StatsBar({ jobs }) {
  if (!jobs?.length) return null
  const avgScore = Math.round(jobs.reduce((s, j) => s + (j.evaluation?.matchScore || 0), 0) / jobs.length)
  const fresherCount = jobs.filter(j => j.evaluation?.experienceAudit?.tag === 'Verified Fresher Friendly').length
  const topScore = Math.max(...jobs.map(j => j.evaluation?.matchScore || 0))

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { icon: Trophy, label: 'Top Match', value: `${topScore}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { icon: Target, label: 'Avg Score', value: `${avgScore}%`, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { icon: TrendingUp, label: 'Fresher OK', value: `${fresherCount}/${jobs.length}`, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
      ].map(stat => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className={`${stat.bg} border rounded-xl p-3 flex items-center gap-3`}>
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <Icon size={16} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [user, setUser]           = useState(() => {
    const stored = localStorage.getItem('cp_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken]         = useState(() => localStorage.getItem('cp_token') || null)
  const [activeTab, setActiveTab] = useState('jobs')
  const [results, setResults]     = useState(null)
  const [isLoading, setLoading]   = useState(false)
  const [agentStep, setStep]      = useState(0)
  const [isOffline, setOffline]   = useState(false)

  // OpportunityShield State for quick investigation
  const [shieldTarget, setShieldTarget] = useState({ company: '', role: '' })

  // Career Copilot Suite Active Job
  const [activeCopilotJob, setActiveCopilotJob] = useState(null)

  const delay = ms => new Promise(r => setTimeout(r, ms))

  const handleLogin = (u, t) => {
    setUser(u)
    setToken(t)
    if (t) {
      localStorage.setItem('cp_token', t)
      localStorage.setItem('cp_user', JSON.stringify(u))
    }
  }

  const handleLogout = () => {
    setUser(null); setToken(null); setResults(null)
    localStorage.removeItem('cp_token')
    localStorage.removeItem('cp_user')
  }

  // Auto-record job in Application Tracker when applying
  const handleJobApply = (job) => {
    try {
      const stored = localStorage.getItem('cp_applications')
      const existing = stored ? JSON.parse(stored) : []
      if (!existing.some(a => a.company === job.company && a.role === job.title)) {
        const newApp = {
          id: `app-${Date.now()}`,
          company: job.company,
          role: job.title,
          location: job.location || 'India',
          appliedDate: new Date().toLocaleDateString(),
          status: 'Applied / Waiting',
          url: job.evaluation?.applyUrl || job.shareLink || '#',
        }
        localStorage.setItem('cp_applications', JSON.stringify([newApp, ...existing]))
      }
    } catch (e) {}
  }

  // Switch to OpportunityShield with company pre-filled
  const handleInvestigateOpportunity = (company, role) => {
    setShieldTarget({ company, role })
    setActiveTab('shield')
  }

  const runSearch = async (profile) => {
    setLoading(true); setResults(null); setOffline(false)
    setStep(1); await delay(500)
    setStep(2); await delay(700)
    setStep(3); await delay(500)
    setStep(4)

    try {
      const endpoint = token ? `${API}/api/pipeline` : `${API}/api/pipeline/demo`
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(profile) })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      await delay(300)
      setResults(data)
    } catch (err) {
      console.warn('Backend unreachable, using offline mock')
      setOffline(true)
      setResults({ success: true, totalFound: OFFLINE_JOBS.length, learningResources: [], jobs: OFFLINE_JOBS })
    } finally {
      setLoading(false); setStep(0)
    }
  }

  if (!user) return <AuthPage onLogin={handleLogin} />

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Sidebar */}
      <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 ml-16 lg:ml-56 mr-0 lg:mr-80 min-h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* VIEW 1: OPPORTUNITY SHIELD */}
          {activeTab === 'shield' && (
            <OpportunityShieldView
              initialCompany={shieldTarget.company}
              initialRole={shieldTarget.role}
            />
          )}

          {/* VIEW 2: APPLIED TRACKER */}
          {activeTab === 'applied' && (
            <ApplicationTrackerView
              onInvestigateCompany={handleInvestigateOpportunity}
            />
          )}

          {/* VIEW 3: JOBS & SEARCH (DEFAULT) */}
          {(activeTab === 'jobs' || activeTab === 'queue' || activeTab === 'matches' || activeTab === 'archive') && (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-800">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Discover verified internships and entry-level jobs matched to your skills
                </p>
              </div>

              {/* Offline Banner */}
              {isOffline && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-amber-700 text-xs">
                  <Database size={14} />
                  <p>Demo mode — offline data shown. Start backend server for live SerpApi results.</p>
                </div>
              )}

              {/* Search Bar with Resume Upload */}
              <SearchBar onSearch={runSearch} isLoading={isLoading} totalFound={results?.totalFound} />

              {/* Agent Progress */}
              <AgentStatus currentStep={agentStep} isLoading={isLoading} />

              {/* Stats */}
              {results && !isLoading && <StatsBar jobs={results.jobs} />}

              {/* Secondary Navigation Filter */}
              {results && !isLoading && (
                <div className="flex items-center gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
                  {['Queue', 'Matches', 'Applied'].map(tab => (
                    <button key={tab}
                      onClick={() => {
                        if (tab.toLowerCase() === 'applied') {
                          setActiveTab('applied')
                        } else {
                          setActiveTab(tab.toLowerCase())
                        }
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${activeTab === tab.toLowerCase() || (tab === 'Queue' && activeTab === 'jobs')
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'}`}>
                      {tab}
                      {tab === 'Queue' && results?.totalFound ? (
                        <span className="ml-1.5 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {results.totalFound}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}

              {/* Job Results */}
              {results && !isLoading && (
                results.jobs?.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
                    <SearchX size={40} />
                    <p className="text-sm font-medium">No jobs found. Try broader role or different location.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {results.jobs.map((job, i) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        index={i}
                        learningResources={results.learningResources || []}
                        onApply={handleJobApply}
                        onInvestigate={handleInvestigateOpportunity}
                        onOpenCopilot={(j) => setActiveCopilotJob(j)}
                      />
                    ))}
                  </div>
                )
              )}

              {/* Empty state */}
              {!results && !isLoading && (
                <div className="text-center py-20 text-slate-400">
                  <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-base font-medium text-slate-500">Drop your resume or configure profile to launch discovery agent</p>
                  <p className="text-sm mt-1">Real-time anti-hallucination verified results from Google Jobs via SerpApi</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Right AI Chat Panel */}
      <AIChatPanel jobs={results?.jobs || []} />

      {/* Career Copilot Modal */}
      {activeCopilotJob && (
        <CareerCopilotModal
          job={activeCopilotJob}
          candidateName={user?.name || 'Candidate'}
          candidateSkills={results?.query?.skills || []}
          onClose={() => setActiveCopilotJob(null)}
        />
      )}
    </div>
  )
}
