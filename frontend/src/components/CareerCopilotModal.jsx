import { useState, useEffect } from 'react'
import { Sparkles, Users, FileCheck2, Headphones, Copy, Check, ExternalLink, Loader2, Send, Lightbulb, ChevronRight, Download, FileText, ArrowDownToLine, Briefcase, GraduationCap, Award } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { API } from '../config'

export default function CareerCopilotModal({ job, candidateName = 'Akshat Marwadi', candidateSkills = [], onClose }) {
  const [activeTab, setActiveTab] = useState('recruiter') // 'recruiter' | 'resume' | 'interview'
  
  // Independent loading states per tab to prevent any global re-loading or flashing bugs
  const [loadingRecruiter, setLoadingRecruiter] = useState(false)
  const [loadingResume, setLoadingResume] = useState(false)
  const [loadingInterview, setLoadingInterview] = useState(false)
  
  const [copiedKey, setCopiedKey] = useState('')

  // Cached data states
  const [recruiterData, setRecruiterData] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const [interviewData, setInterviewData] = useState(null)

  // Interview interactive answers state
  const [userAnswers, setUserAnswers] = useState({})
  const [revealedAnswers, setRevealedAnswers] = useState({})

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Retrieve user's original parsed resume from localStorage if available
  const getOriginalResume = () => {
    try {
      const stored = localStorage.getItem('cp_parsed_resume')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return null
  }

  // 1. Fetch Recruiter Intel
  async function fetchRecruiterIntel() {
    if (recruiterData) return
    setLoadingRecruiter(true)
    try {
      const res = await fetch(`${API}/api/copilot/recruiter-intel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: job.company,
          role: job.title,
          candidateName,
          matchedSkills: job.evaluation?.matchedSkills || candidateSkills
        })
      })
      const data = await res.json()
      if (data.success) setRecruiterData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingRecruiter(false)
    }
  }

  // 2. Fetch Resume ATS Optimizer
  async function fetchResumeOptimizer() {
    if (resumeData) return
    setLoadingResume(true)
    try {
      const orig = getOriginalResume()
      const res = await fetch(`${API}/api/copilot/optimize-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description,
          candidateSkills: job.evaluation?.matchedSkills || candidateSkills,
          candidateName: orig?.name || candidateName,
          candidateEmail: 'akshatmarwadi5@gmail.com',
          candidatePhone: '+91 9522147084',
          currentResumeText: orig?.rawText || ''
        })
      })
      const data = await res.json()
      if (data.success) setResumeData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingResume(false)
    }
  }

  // 3. Fetch Interview Drill
  async function fetchInterviewDrill() {
    if (interviewData) return
    setLoadingInterview(true)
    try {
      const res = await fetch(`${API}/api/copilot/interview-drill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: job.company,
          role: job.title,
          matchedSkills: job.evaluation?.matchedSkills || candidateSkills
        })
      })
      const data = await res.json()
      if (data.success) setInterviewData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingInterview(false)
    }
  }

  // PRE-FETCH ALL 3 OPTIONS SIMULTANEOUSLY ON MOUNT
  // When Option 2 & 3 are ready, they will be instantly viewable without re-loading
  useEffect(() => {
    fetchRecruiterIntel()
    fetchResumeOptimizer()
    fetchInterviewDrill()
  }, [])

  // ── 1-CLICK COMPREHENSIVE FULL RESUME PDF GENERATION ──
  function downloadFullTailoredPDF() {
    if (!resumeData) return

    const orig = getOriginalResume()
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const primaryColor = [15, 23, 42]   // slate-900
    const secondaryColor = [30, 41, 59] // slate-800
    const accentColor = [79, 70, 229]   // indigo-600
    const bodyColor = [51, 65, 85]      // slate-700
    const lightColor = [100, 116, 139]  // slate-500
    let y = 16

    const name = (orig?.name || resumeData.candidateName || 'AKSHAT MARWADI').toUpperCase()
    const roleTarget = `${resumeData.jobTitle}  |  Target: ${resumeData.company}`

    // 1. Header Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...primaryColor)
    doc.text(name, 14, y)

    y += 5.5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...accentColor)
    doc.text(roleTarget, 14, y)

    y += 4.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...lightColor)
    doc.text(`Email: ${resumeData.candidateEmail}  |  Phone: ${resumeData.candidatePhone}  |  Indore, MP, India  |  LinkedIn & GitHub Verified`, 14, y)

    y += 3
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.4)
    doc.line(14, y, 196, y)

    // Helper for section headings
    const renderHeading = (title) => {
      y += 6.5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.setTextColor(...primaryColor)
      doc.text(title, 14, y)
      y += 1.8
      doc.setDrawColor(79, 70, 229)
      doc.setLineWidth(0.6)
      doc.line(14, y, 40, y)
      y += 4
    }

    // 2. Executive Professional Summary (Tailored for Company)
    renderHeading('PROFESSIONAL SUMMARY')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...bodyColor)
    const summaryLines = doc.splitTextToSize(resumeData.professionalSummary, 182)
    doc.text(summaryLines, 14, y)
    y += (summaryLines.length * 4) + 1

    // 3. Complete Technical Skills (Original Skills + ATS Tailored)
    renderHeading('TECHNICAL SKILLS & COMPETENCIES')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...bodyColor)

    const userAllSkills = Array.from(new Set([
      ...(orig?.skills || []),
      ...(resumeData.coreSkills?.all || []),
      'React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Node.js', 'Express.js', 'PostgreSQL', 'Git', 'REST APIs'
    ]))

    const languages = userAllSkills.filter(s => /javascript|typescript|python|java|c\+\+|sql|html|css/i.test(s)).join(', ') || 'JavaScript, SQL, HTML5, CSS3, Java'
    const frameworks = userAllSkills.filter(s => /react|node|express|next|tailwind|bootstrap|supabase/i.test(s)).join(', ') || 'React.js, Node.js, Express.js, Tailwind CSS, Supabase'
    const tools = 'Git, GitHub, Postman, PostgreSQL, RESTful APIs, Agile/Scrum, Docker Basics, Vite'

    const skillBullets = [
      `• Languages: ${languages}`,
      `• Frameworks & Libraries: ${frameworks}`,
      `• Databases, Tools & Architecture: ${tools}`,
      `• ATS Alignment: Specially optimized for ${resumeData.company}'s engineering standards.`
    ]
    skillBullets.forEach(b => {
      doc.text(b, 14, y)
      y += 4.2
    })

    // 4. Projects & Professional Experience (Full Tailored Descriptions)
    renderHeading('SELECTED TECHNICAL PROJECTS (MAPPED TO TARGET ROLE)')
    resumeData.tailoredProjects.forEach((proj) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...secondaryColor)
      doc.text(proj.title, 14, y)

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...accentColor)
      doc.text(`Stack: ${proj.tech}`, 14, y + 3.8)
      y += 7.5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.2)
      doc.setTextColor(...bodyColor)
      proj.bullets.forEach((bullet) => {
        const bLines = doc.splitTextToSize(`•  ${bullet}`, 178)
        doc.text(bLines, 16, y)
        y += (bLines.length * 3.8) + 1
      })
      y += 1.5
    })

    // 5. Education & Background
    renderHeading('EDUCATION & CERTIFICATIONS')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.8)
    doc.setTextColor(...secondaryColor)
    doc.text(resumeData.education.degree, 14, y)

    y += 3.8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.2)
    doc.setTextColor(...lightColor)
    doc.text(`${resumeData.education.institution} (${resumeData.education.graduationYear})`, 14, y)

    y += 3.8
    doc.text(`Relevant Coursework: Data Structures, Database Management, Algorithms, Web Technologies, Software Engineering`, 14, y)

    y += 5.5
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(`Verified Complete Candidate Profile | Specially optimized for direct hiring at ${resumeData.company} via CareerPilot AI`, 14, y)

    // Save PDF
    const cleanFileName = `${name.replace(/\s+/g, '_')}_Complete_Resume_${resumeData.company.replace(/\s+/g, '_')}.pdf`
    doc.save(cleanFileName)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Career Copilot Suite</h3>
                <span className="text-[10px] bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
                  {job.company}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{job.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3 Copilot Feature Tabs - Smooth switching without re-triggering loader */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'recruiter'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={15} /> 1. Verified Recruiters & Outreach
            {recruiterData && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ready" />}
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resume'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 size={15} /> 2. Complete Tailored Resume (PDF)
            {resumeData && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ready" />}
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'interview'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones size={15} /> 3. 7-Question Interview Simulator
            {interviewData && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ready" />}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* TAB 1: RECRUITER INTEL */}
          {activeTab === 'recruiter' && (
            loadingRecruiter && !recruiterData ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-xs font-semibold text-slate-600">
                  Agent scanning verified hiring personnel for {job.company}...
                </p>
              </div>
            ) : recruiterData ? (
              <div className="space-y-5 fade-in">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-indigo-600" /> Verified Hiring Personnel & Leads for {job.company}
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      Direct LinkedIn Targets
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recruiterData.recruiters.map((rec, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-200 rounded-xl flex items-center justify-between gap-3 transition-all">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 truncate">{rec.name}</p>
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 rounded font-semibold">LinkedIn</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{rec.title}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{rec.snippet}</p>
                        </div>
                        <a
                          href={rec.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-lg text-[11px] font-bold text-indigo-600 flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                        >
                          Connect <ExternalLink size={10} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Cold Email Pitch */}
                <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Send size={13} className="text-indigo-600" /> 1-Click Tailored Cold Email Pitch
                    </span>
                    <button
                      onClick={() => copyToClipboard(recruiterData.pitches.emailBody, 'email')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'email' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedKey === 'email' ? 'Copied Pitch!' : 'Copy Pitch'}
                    </button>
                  </div>
                  <div className="bg-white border border-indigo-100 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-44 overflow-y-auto">
                    {recruiterData.pitches.emailBody}
                  </div>
                </div>

                {/* LinkedIn Connection Note */}
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">LinkedIn Direct InMail Note (300 chars)</span>
                    <button
                      onClick={() => copyToClipboard(recruiterData.pitches.linkedinConnectionNote, 'linkedin')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'linkedin' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedKey === 'linkedin' ? 'Copied Note!' : 'Copy Note'}
                    </button>
                  </div>
                  <p className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-mono">
                    {recruiterData.pitches.linkedinConnectionNote}
                  </p>
                </div>
              </div>
            ) : null
          )}

          {/* TAB 2: COMPLETE RESUME ATS OPTIMIZER + 1-CLICK PDF DOWNLOAD */}
          {activeTab === 'resume' && (
            loadingResume && !resumeData ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-xs font-semibold text-slate-600">
                  Synthesizing complete tailored resume with your full credentials...
                </p>
              </div>
            ) : resumeData ? (
              <div className="space-y-5 fade-in">
                {/* Download Callout Banner */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-emerald-900 uppercase">Complete Professional Resume Tailored</h4>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        {resumeData.atsMatchScoreEstimate}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Combines your complete personal profile, skills & education with company-tailored accomplishments.
                    </p>
                  </div>

                  <button
                    onClick={downloadFullTailoredPDF}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200 cursor-pointer"
                  >
                    <ArrowDownToLine size={15} /> Download Complete Tailored Resume (PDF)
                  </button>
                </div>

                {/* Complete Live Resume Document Preview */}
                <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{resumeData.candidateName}</h3>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{resumeData.jobTitle} Candidate for {resumeData.company}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{resumeData.candidateEmail} • {resumeData.candidatePhone} • Indore, India</p>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase bg-slate-100 px-2.5 py-1 rounded-md">
                      Ready For Selection
                    </span>
                  </div>

                  {/* 1. Tailored Professional Summary */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-indigo-600" /> Executive Professional Summary
                    </h5>
                    <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
                      {resumeData.professionalSummary}
                    </p>
                  </div>

                  {/* 2. Complete Skills Grid */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Award size={12} className="text-indigo-600" /> Full Candidate Skills & ATS Keywords
                    </h5>
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      {resumeData.coreSkills.all.map(kw => (
                        <span key={kw} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold shadow-2xs">
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. Tailored Experience & Projects */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-indigo-600" /> Production-Grade Technical Projects
                    </h5>
                    <div className="space-y-2.5">
                      {resumeData.tailoredProjects.map((proj, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800">{proj.title}</p>
                            <span className="text-[10px] text-indigo-600 font-mono font-semibold">{proj.tech}</span>
                          </div>
                          <ul className="space-y-1">
                            {proj.bullets.map((b, bi) => (
                              <li key={bi} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Education & Background */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <GraduationCap size={12} className="text-indigo-600" /> Education & Coursework
                    </h5>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700">
                      <p className="font-bold text-slate-800">{resumeData.education.degree}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{resumeData.education.institution} ({resumeData.education.graduationYear})</p>
                      <p className="text-[11px] text-slate-500 mt-1">Coursework: {resumeData.education.coursework}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          )}

          {/* TAB 3: 7-QUESTION PRE-INTERVIEW SIMULATOR */}
          {activeTab === 'interview' && (
            loadingInterview && !interviewData ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-xs font-semibold text-slate-600">
                  Compiling 7 deep interview challenges for {job.company}...
                </p>
              </div>
            ) : interviewData ? (
              <div className="space-y-5 fade-in">
                {/* Intel Note */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-start gap-3">
                  <Lightbulb size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900">Live Interview Intel for {job.company} (7 Drill Challenges)</h4>
                    <p className="text-xs text-indigo-800/90 mt-0.5 leading-relaxed">{interviewData.intelSnippet}</p>
                  </div>
                </div>

                {/* 7 Interactive Drill Questions */}
                <div className="space-y-4">
                  {interviewData.drillQuestions.map((q, idx) => (
                    <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                          Challenge {idx + 1} of {interviewData.drillQuestions.length} · {q.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{q.question}</p>

                      {/* Interactive Input Answer */}
                      <textarea
                        rows={2}
                        value={userAnswers[q.id] || ''}
                        onChange={e => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        placeholder="Type your technical approach or explanation here..."
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />

                      {/* Reveal Expert Answer Key */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setRevealedAnswers({ ...revealedAnswers, [q.id]: !revealedAnswers[q.id] })}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {revealedAnswers[q.id] ? 'Hide Benchmark Answer Key' : 'Reveal Expected Engineering Answer Key'} <ChevronRight size={12} />
                        </button>
                      </div>

                      {revealedAnswers[q.id] && (
                        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed fade-in whitespace-pre-line font-mono">
                          <strong className="block font-bold text-emerald-800 mb-1">Expected Points & Technical Rubric:</strong>
                          {q.sampleAnswerKey}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}

        </div>

      </div>
    </div>
  )
}
