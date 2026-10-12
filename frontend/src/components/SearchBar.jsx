import { useState, useRef } from 'react'
import { MapPin, Loader2, Rocket, Upload, FileText, X, CheckCircle, ChevronDown, Sparkles } from 'lucide-react'
import { API } from '../config'

const ROLE_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'React Developer', 'Node.js Developer', 'MERN Stack Developer',
  'MEAN Stack Developer', 'Next.js Developer', 'Vue.js Developer',
  'Android Developer', 'iOS Developer', 'Flutter Developer', 'React Native Developer',
  'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'AI/ML Engineer',
  'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'Data Engineer',
  'DevOps Engineer', 'Cloud Engineer', 'AWS Cloud Engineer', 'Site Reliability Engineer',
  'Cybersecurity Analyst', 'Ethical Hacker', 'Penetration Tester', 'SOC Analyst',
  'UI/UX Designer', 'Product Designer', 'Software Engineer', 'QA Engineer',
  'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer',
]

export default function SearchBar({ onSearch, isLoading, totalFound }) {
  const [mode, setMode]           = useState('resume') // 'resume' | 'manual'
  const [role, setRole]           = useState('')
  const [skillInput, setSkill]    = useState('')
  const [location, setLocation]   = useState('Bengaluru, India')
  const [isRemote, setRemote]     = useState(false)
  const [showSuggest, setShow]    = useState(false)

  // Resume state
  const [resumeFile, setResumeFile]     = useState(null)
  const [parsing, setParsing]           = useState(false)
  const [parsed, setParsed]             = useState(null)  // extracted data
  const [parseError, setParseError]     = useState('')
  const [dragOver, setDragOver]         = useState(false)
  const fileRef = useRef()

  const skills = skillInput.split(',').map(s => s.trim()).filter(Boolean)

  // ── Resume Upload & Parse ──────────────────────────────────────
  async function handleResumeUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      setParseError('Please upload a PDF file only.')
      return
    }
    setResumeFile(file)
    setParsing(true)
    setParseError('')
    setParsed(null)

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res  = await fetch(`${API}/api/resume/parse`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setParsed(data)
      try {
        localStorage.setItem('cp_parsed_resume', JSON.stringify(data))
      } catch (e) {}
      if (data.isImageBased || !data.skills || data.skills.length === 0) {
        setParseError('Resume uploaded! Text is minimal/scanned — you can also pick your target role below.')
      } else {
        setParseError('')
      }
      if (data.targetRole) setRole(data.targetRole)
      if (data.skills?.length) setSkill(data.skills.join(', '))
      if (data.location) setLocation(data.location)
    } catch (err) {
      setParseError(err.message || 'Failed to read PDF. You can select role & location directly below.')
    } finally {
      setParsing(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleResumeUpload(file)
  }

  function clearResume() {
    setResumeFile(null)
    setParsed(null)
    setParseError('')
    setRole('')
    setSkill('')
  }

  // ── Search Submit ──────────────────────────────────────────────
  function handleSubmit(e) {
    e?.preventDefault()
    if (!role.trim()) return
    onSearch({
      targetRole: role,
      skills: skills.length ? skills : [role],
      location: isRemote ? 'Remote India' : location
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">

      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Job Search Active
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalFound != null ? `${totalFound} opportunities found` : 'Upload resume or fill manually'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={() => setMode('resume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'resume' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            <FileText size={12} /> Resume
          </button>
          <button onClick={() => setMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            <Sparkles size={12} /> Manual
          </button>
        </div>

        <button onClick={handleSubmit} disabled={isLoading || !role.trim()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm">
          {isLoading ? <><Loader2 size={15} className="animate-spin" /> Searching...</> : <><Rocket size={15} /> Launch Agent</>}
        </button>
      </div>

      {/* ── RESUME MODE ── */}
      {mode === 'resume' && (
        <div className="space-y-3">
          {!resumeFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
            >
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => handleResumeUpload(e.target.files[0])} />
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload size={22} className="text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Drop your resume here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse · PDF only · max 5MB</p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              {/* File info row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{resumeFile.name}</p>
                  <p className="text-xs text-slate-400">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                </div>
                {parsing
                  ? <Loader2 size={16} className="animate-spin text-indigo-500 flex-shrink-0" />
                  : <button onClick={clearResume} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={16} /></button>
                }
              </div>

              {parsing && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                  <Loader2 size={12} className="animate-spin" />
                  Analyzing your resume with AI...
                </div>
              )}

              {parseError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{parseError}</p>
              )}

              {parsed && !parsing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                    <CheckCircle size={13} />
                    {parsed.skillCount} skills detected · Role: {parsed.targetRole}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.skills?.slice(0, 12).map(s => (
                      <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                    {parsed.skills?.length > 12 && (
                      <span className="text-[10px] text-slate-400">+{parsed.skills.length - 12} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL MODE SKILLS ── */}
      {mode === 'manual' && (
        <div className="mb-3">
          <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Your Skills (Comma Separated)</label>
          <input type="text" value={skillInput} onChange={e => setSkill(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. React, Node.js, Python, PostgreSQL..." />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {skills.slice(0, 6).map(s => (
              <span key={s} className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-full font-medium">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── COMMON TARGET ROLE & PREFERRED LOCATION (Always synced) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
        {/* Target Role */}
        <div className="relative">
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Target Role *
          </label>
          <div className="relative">
            <input type="text" value={role}
              onChange={e => { setRole(e.target.value); setShow(true) }}
              onFocus={() => setShow(true)}
              onBlur={() => setTimeout(() => setShow(false), 200)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
              placeholder="e.g. Cybersecurity Analyst, Frontend Developer" required />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {showSuggest && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-56 overflow-y-auto">
              {ROLE_SUGGESTIONS
                .filter(r => role.trim() === '' || r.toLowerCase().includes(role.toLowerCase()))
                .map(r => (
                  <button key={r} type="button"
                    onMouseDown={() => { setRole(r); setShow(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 border-b border-slate-50 last:border-0 cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    {r}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Preferred Location */}
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Preferred Location *
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} disabled={isRemote}
              className="w-full pl-8 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              placeholder="e.g. Indore, India or Mumbai, India" />
          </div>
          <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
            <input type="checkbox" checked={isRemote} onChange={e => setRemote(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600 rounded" />
            <span className="text-[11px] text-slate-500 font-medium">Remote Only (Nationwide)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
