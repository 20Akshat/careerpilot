import { useState } from 'react'
import { Rocket, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'

const API = 'http://localhost:5000'

export default function AuthPage({ onLogin }) {
  const [mode, setMode]       = useState('login') // login | register
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, name: form.name }

    try {
      const res  = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (mode === 'register') {
        // Auto-login after register
        const loginRes  = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        })
        const loginData = await loginRes.json()
        if (!loginRes.ok) throw new Error(loginData.error)
        localStorage.setItem('cp_token', loginData.token)
        localStorage.setItem('cp_user', JSON.stringify(loginData.user))
        onLogin(loginData.user, loginData.token)
      } else {
        localStorage.setItem('cp_token', data.token)
        localStorage.setItem('cp_user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDemo() {
    onLogin({ name: 'Demo User', email: 'demo@careerpilot.ai' }, null)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* Left gradient panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-violet-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Rocket size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">CareerPilot AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Find Jobs That<br />Actually Match You
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed mb-8">
            Real-time job discovery powered by SerpApi. AI-ranked by your exact skills. Anti-hallucination verified.
          </p>
          <div className="flex flex-col gap-3">
            {[
              'Live Google Jobs via SerpApi',
              'AI-powered skill match scoring',
              'Anti-hallucination job verification',
              'Skill gap bridge with free tutorials'
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-300 flex-shrink-0" />
                <span className="text-indigo-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300 text-xs">SerpApi India Hackathon 2026 · AI Agents Track</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">CareerPilot AI</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm shadow-sm"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleDemo}
            className="w-full border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
          >
            🚀 Continue with Demo Account
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">No signup needed for demo mode</p>
        </div>
      </div>
    </div>
  )
}
