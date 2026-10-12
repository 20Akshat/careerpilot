import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, TrendingUp, MapPin, Star, Lightbulb, ChevronRight, Loader2 } from 'lucide-react'

const QUICK_PROMPTS = [
  { icon: Star,        label: 'Best match for me',         prompt: 'What is my best job match?' },
  { icon: TrendingUp,  label: 'Show 80%+ matches',         prompt: 'Show me all jobs with 80% or higher match score' },
  { icon: MapPin,      label: 'Remote opportunities',      prompt: 'Which jobs are remote friendly?' },
  { icon: Lightbulb,   label: 'Skills I should learn',     prompt: 'What skills am I missing most across all jobs?' },
]

function getAgentResponse(prompt, jobs) {
  const p = prompt.toLowerCase()

  if (p.includes('best') || p.includes('top')) {
    const top = jobs?.[0]
    if (!top) return `Run a search first and I'll analyze your best matches! 🔍`
    const isFresher = top.evaluation?.experienceAudit?.tag === 'Verified Fresher Friendly'
    return `Your strongest match right now:\n\n🏆 **${top.title}**\n🏢 ${top.company}\n📊 ATS Score: **${top.evaluation?.matchScore}%**\n${isFresher ? '✅ Fresher Friendly' : '⚠️ Check eligibility'}\n\nMatched skills: ${top.evaluation?.matchedSkills?.join(', ') || 'None'}`
  }

  if (p.includes('remote')) {
    const remote = (jobs || []).filter(j => /remote/i.test(j.location))
    if (!remote.length) return `No remote jobs in current results. Try searching with location set to "Remote India"! 🌍`
    return `Found **${remote.length} remote** opportunities:\n\n${remote.map((j, i) => `${i + 1}. ${j.title} at ${j.company}\n   📊 ${j.evaluation?.matchScore}% match`).join('\n\n')}`
  }

  if (p.includes('80') || p.includes('higher') || p.includes('match score')) {
    const high = (jobs || []).filter(j => (j.evaluation?.matchScore || 0) >= 80)
    if (!high.length) return `No 80%+ matches yet. Add more skills to your profile to improve scores! 💪`
    return `**${high.length} jobs** with 80%+ match score:\n\n${high.map((j, i) => `${i + 1}. ${j.title}\n   🎯 ${j.evaluation?.matchScore}% · ${j.company}`).join('\n\n')}`
  }

  if (p.includes('skill') || p.includes('learn') || p.includes('missing')) {
    const allMissing = (jobs || []).flatMap(j => j.evaluation?.missingSkills || [])
    if (!allMissing.length) return `Great news — your current skills cover most job requirements! 🎉`
    const freq = allMissing.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc }, {})
    const top3 = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3)
    return `Top skills to boost your matches:\n\n${top3.map(([s, c], i) => `${['🥇','🥈','🥉'][i]} **${s}**\n   Missing in ${c} job${c > 1 ? 's' : ''}`).join('\n\n')}\n\n💡 Click "Skill Gap Bridge" on any card for free tutorials!`
  }

  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
    return `Hey there! 👋 I'm your CareerPilot AI assistant.\n\nI can help you:\n• Analyze your job match scores\n• Find remote opportunities\n• Identify missing skills\n• Compare job listings\n\nRun a search first, then ask me anything!`
  }

  if (!jobs?.length) {
    return `I don't have any job data yet. Launch a search from the left panel and I'll help you analyze the results! 🚀`
  }

  return `I analyzed **${jobs.length} job listings** for you.\n\nTop match: **${jobs[0]?.title}** at ${jobs[0]?.evaluation?.matchScore}%\n\nTry asking:\n• "What is my best match?"\n• "Which skills should I learn?"\n• "Show remote jobs"`
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant'

  // Bold text between **
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*([^*]+)\*\*/g)
      return (
        <span key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className={`flex gap-2.5 items-end ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
        ${isBot
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
          : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
        {isBot
          ? <Bot size={13} className="text-white" />
          : <User size={13} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm
        ${isBot
          ? 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
          : 'bg-indigo-600 text-white rounded-br-sm'}`}>
        {formatText(msg.text)}
        <p className={`text-[9px] mt-1.5 ${isBot ? 'text-slate-300' : 'text-indigo-300'}`}>
          {msg.time}
        </p>
      </div>
    </div>
  )
}

export default function AIChatPanel({ jobs }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm CareerPilot AI. 👋\n\nLaunch a job search and I'll help you analyze matches, skill gaps, and find the best opportunities for you!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: msg, time }])
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: getAgentResponse(msg, jobs),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }, 1000 + Math.random() * 500)
  }

  return (
    <aside className="w-80 h-screen bg-slate-50 border-l border-slate-200 flex flex-col fixed right-0 top-0 z-30">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 leading-none">CareerPilot AI</p>
          <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">● Always online</p>
        </div>
        <div className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-medium">
          {jobs?.length || 0} jobs
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white border-b border-slate-100 px-3 py-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Actions</p>
        <div className="flex flex-col gap-1.5">
          {QUICK_PROMPTS.map(q => {
            const Icon = q.icon
            return (
              <button
                key={q.label}
                onClick={() => sendMessage(q.prompt)}
                className="flex items-center gap-2.5 w-full text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-2 transition-all group"
              >
                <div className="w-6 h-6 bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 transition-all">
                  <Icon size={11} className="text-slate-500 group-hover:text-indigo-600" />
                </div>
                <span className="text-xs text-slate-600 group-hover:text-indigo-700 font-medium flex-1">{q.label}</span>
                <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-400" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 p-3">
        <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask about your job matches..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none leading-relaxed py-0.5 max-h-20"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
            className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
          >
            {typing
              ? <Loader2 size={12} className="text-slate-400 animate-spin" />
              : <Send size={12} className="text-white" />
            }
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-300 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </aside>
  )
}
