import { ExternalLink, MapPin, Building2, Clock, ShieldCheck, AlertTriangle, BookOpen, Briefcase, DollarSign, Sparkles } from 'lucide-react'
import { useState } from 'react'
import GapBridgeModal from './GapBridgeModal'

function ATSBar({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Excellent Match' : score >= 50 ? 'Good Match' : 'Low Match'
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500">ATS Match Score</span>
        <span className="text-xs font-bold" style={{ color }}>{score}/100 · {label}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full score-bar-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? 'from-emerald-500 to-teal-500' : score >= 50 ? 'from-amber-400 to-orange-400' : 'from-red-400 to-rose-500'
  const label = score >= 75 ? 'EXCELLENT' : score >= 50 ? 'GOOD' : 'LOW'
  return (
    <div className={`w-20 h-24 rounded-xl bg-gradient-to-br ${color} flex flex-col items-center justify-center flex-shrink-0 shadow-lg`}>
      <span className="text-white text-2xl font-black leading-none">{score}%</span>
      <span className="text-white/80 text-[9px] font-bold mt-1 tracking-wider">{label}</span>
      <span className="text-white/60 text-[8px]">MATCH</span>
    </div>
  )
}

function CompanyAvatar({ company }) {
  const initials = company?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'CO'
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700']
  const color = colors[company?.length % colors.length] || colors[0]
  return (
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center font-bold text-sm flex-shrink-0 border border-white shadow-sm`}>
      {initials}
    </div>
  )
}

export default function JobCard({ job, learningResources, index, onApply, onInvestigate, onOpenCopilot }) {
  const [showGap, setShowGap] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const ev = job.evaluation

  const isFresher = ev?.experienceAudit?.tag === 'Verified Fresher Friendly'
  const isSenior  = ev?.experienceAudit?.tag === 'Experienced (Risk of Rejection)'
  const score     = ev?.matchScore ?? 0
  const applyUrl  = ev?.applyUrl || job.shareLink || '#'
  const postedDate = (job.extensions || []).find(e => /ago|today|hour|day/i.test(e)) || ''
  const jobType   = (job.extensions || []).find(e => /full.time|part.time|internship|contract/i.test(e)) || 'Full-time'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 p-5 fade-in">
      <div className="flex gap-4">
        <CompanyAvatar company={job.company} />

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug">{job.title}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{job.company} · {job.via?.replace('via ', '')}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isFresher && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  <ShieldCheck size={9} /> Fresher OK
                </span>
              )}
              {isSenior && (
                <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  <AlertTriangle size={9} /> Senior Risk
                </span>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase size={11} />{jobType}</span>
            {postedDate && <span className="flex items-center gap-1"><Clock size={11} />{postedDate}</span>}
            <span className="flex items-center gap-1 text-indigo-500 font-medium">
              <ShieldCheck size={11} />Verified Source
            </span>
          </div>

          {/* ATS Bar */}
          <ATSBar score={score} />

          {/* Score breakdown pills */}
          <div className="flex flex-wrap gap-2 text-[10px] mb-3">
            <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              Skills {ev?.scoreBreakdown?.skillScore ?? 0}/45
            </span>
            <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              Role {ev?.scoreBreakdown?.roleScore ?? 0}/25
            </span>
            <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              Eligibility {ev?.scoreBreakdown?.eligibilityScore ?? 0}/20
            </span>
            <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              Recency {ev?.scoreBreakdown?.recencyScore ?? 0}/10
            </span>
          </div>

          {/* Skill pills */}
          <div className="flex flex-col gap-2 mb-3">
            {/* 1. Matched Skills (Green) */}
            {(ev?.matchedSkills || []).length > 0 && (
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold text-emerald-600 mr-1">Matched:</span>
                {ev.matchedSkills.map(s => (
                  <span key={s} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium capitalize">
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}

            {/* 2. Truly Missing Skills that Job Demands (Cross only if company asked for it and you lack it) */}
            {(ev?.missingSkills || []).length > 0 && (
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold text-rose-500 mr-1">Job Demands (Missing):</span>
                {ev.missingSkills.map(s => (
                  <span key={s} className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-medium capitalize">
                    ✗ {s}
                  </span>
                ))}
              </div>
            )}

            {/* 3. Extra Bonus Skills (Candidate has, job didn't even ask - POSITIVE BONUS!) */}
            {((ev?.extraSkills || []).length > 0) && (
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold text-indigo-500 mr-1">Extra Bonus Skills:</span>
                {(ev.extraSkills || []).slice(0, 6).map(s => (
                  <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-medium capitalize">
                    + {s}
                  </span>
                ))}
                {(ev.extraSkills || []).length > 6 && (
                  <span className="text-[10px] text-slate-400">+{(ev.extraSkills || []).length - 6} more</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {expanded && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 mb-3 leading-relaxed border border-slate-100">
              {job.description || 'No description available.'}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Apply Button — real direct link + track application */}
            <a
              href={applyUrl && applyUrl !== '#' ? applyUrl : (job.shareLink || '#')}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => onApply && onApply(job)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink size={12} /> Apply Now
            </a>

            {/* Career Copilot Suite (Recruiter, Resume ATS, Interview) */}
            {onOpenCopilot && (
              <button
                onClick={() => onOpenCopilot(job)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm shadow-indigo-200"
              >
                <Sparkles size={12} className="text-amber-300" /> Copilot Prep & Pitch
              </button>
            )}

            {/* OpportunityShield Investigation Button */}
            {onInvestigate && (
              <button
                onClick={() => onInvestigate(job.company, job.title)}
                title="Investigate company authenticity with OpportunityShield"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <ShieldCheck size={13} className="text-indigo-500" /> Verify Shield
              </button>
            )}

            {/* Extra platform buttons (LinkedIn, Naukri, etc.) */}
            {(job.applyOptions || []).slice(1, 3).map((opt, i) => (
              <a key={i} href={opt.link} target="_blank" rel="noreferrer noopener"
                onClick={() => onApply && onApply(job)}
                className="flex items-center gap-1 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                <ExternalLink size={11} />
                {opt.title?.replace('Apply on ', '').replace('Apply via ', '') || `Option ${i + 2}`}
              </a>
            ))}

            {(ev?.missingSkills?.length > 0) && (
              <button onClick={() => setShowGap(true)}
                className="flex items-center gap-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                <BookOpen size={12} /> Skill Gap Bridge
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto">
              {expanded ? 'Hide' : 'View'} description
            </button>
          </div>
        </div>

        {/* Score Badge */}
        <ScoreBadge score={score} />
      </div>

      {showGap && (
        <GapBridgeModal
          missingSkills={ev?.missingSkills || []}
          learningResources={learningResources}
          onClose={() => setShowGap(false)}
        />
      )}
    </div>
  )
}
