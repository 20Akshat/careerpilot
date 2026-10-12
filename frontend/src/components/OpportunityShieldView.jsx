import { useState } from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, ExternalLink, CheckCircle2, XCircle, HelpCircle, Loader2, Sparkles, Building2 } from 'lucide-react'
import { API } from '../config'

export default function OpportunityShieldView({ initialCompany = '', initialRole = '' }) {
  const [company, setCompany] = useState(initialCompany)
  const [role, setRole] = useState(initialRole)
  const [jobUrl, setJobUrl] = useState('')
  const [offerDetails, setOfferDetails] = useState('')
  const [investigating, setInvestigating] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  async function handleInvestigate(e) {
    e?.preventDefault()
    if (!company.trim() && !role.trim() && !offerDetails.trim() && !jobUrl.trim()) {
      setError('Please provide at least a company name, role, or offer text.')
      return
    }

    setInvestigating(true)
    setError('')
    setReport(null)

    try {
      const res = await fetch(`${API}/api/shield/investigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, jobUrl, offerDetails }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to investigate')
      setReport(data.report)
    } catch (err) {
      setError(err.message || 'Error running investigation')
    } finally {
      setInvestigating(false)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <ShieldCheck size={16} /> Autonomous Verification Agent
          </div>
          <h2 className="text-2xl font-black mb-2">OpportunityShield AI</h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Protect yourself from fake internships, suspicious recruiters, misleading job descriptions, and expired postings. Our AI cross-examines official domains, scam complaints, and payment demands in real-time.
          </p>
        </div>
      </div>

      {/* Investigation Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleInvestigate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Google, TechSol India, CyberTech Ltd"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job / Internship Title
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer Intern"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Posting or Application Link (Optional)
            </label>
            <input
              type="url"
              value={jobUrl}
              onChange={e => setJobUrl(e.target.value)}
              placeholder="e.g. https://linkedin.com/jobs/view/... or company career page"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Paste Offer Letter Text, Recruiter Email, or WhatsApp Message
            </label>
            <textarea
              rows={3}
              value={offerDetails}
              onChange={e => setOfferDetails(e.target.value)}
              placeholder="e.g. 'Dear candidate, you have been selected. Send ₹1500 registration fee to hr@gmail.com for laptop delivery...'"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              ⚠️ {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={investigating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              {investigating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Investigating Web Records & Signals...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Investigate Opportunity
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Investigation Evidence Report */}
      {report && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 fade-in">
          {/* Verdict Banner */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
            report.verdictColor === 'emerald'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : report.verdictColor === 'rose'
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                report.verdictColor === 'emerald' ? 'bg-emerald-600' : report.verdictColor === 'rose' ? 'bg-rose-600' : 'bg-amber-500'
              }`}>
                {report.verdictColor === 'emerald' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black">{report.verdict}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/80 shadow-xs border">
                    {report.badge}
                  </span>
                </div>
                <p className="text-xs opacity-80 mt-0.5">
                  Opportunity Analysis for <strong className="font-semibold">{report.company}</strong> ({report.role})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">Trust Score</span>
              <span className="text-3xl font-black tracking-tight">{report.trustScore}%</span>
            </div>
          </div>

          {/* Tri-Part Evidence Report */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. What was Confirmed */}
            <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3">
                  <CheckCircle2 size={16} /> What Was Confirmed
                </div>
                <ul className="space-y-2">
                  {report.evidenceReport.confirmed.length > 0 ? (
                    report.evidenceReport.confirmed.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 italic">No positive confirmation found in records.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* 2. What Contradicts */}
            <div className="border border-rose-100 bg-rose-50/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-3">
                  <XCircle size={16} /> Conflicting / Scam Signals
                </div>
                <ul className="space-y-2">
                  {report.evidenceReport.contradictions.length > 0 ? (
                    report.evidenceReport.contradictions.map((item, idx) => (
                      <li key={idx} className="text-xs text-rose-700 font-medium flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 mt-0.5 font-bold">✗</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 pt-1">
                      <span>✓</span> Zero conflicting scam markers identified.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* 3. Unverified Caveats */}
            <div className="border border-amber-100 bg-amber-50/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-3">
                  <HelpCircle size={16} /> Unverified / Needs Caution
                </div>
                <ul className="space-y-2">
                  {report.evidenceReport.unverified.length > 0 ? (
                    report.evidenceReport.unverified.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 mt-0.5 font-bold">?</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 italic">All baseline indicators were verified.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Web Evidence Citations */}
          {report.sources && report.sources.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Web Footprint & Official Citations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {report.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all group block"
                  >
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate flex items-center gap-1">
                      {src.title} <ExternalLink size={11} className="opacity-60" />
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {src.snippet}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
