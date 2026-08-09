import React, { useState, useEffect } from 'react'
import { Key, Mail, ShieldAlert, Sparkles } from 'lucide-react'

const ACCOUNTS = [
  {
    role: 'Admin',
    icon: '👑',
    email: 'admin@empflow.local',
    password: 'Admin@123',
    name: 'Vikram Rana',
    initials: 'VR',
    designation: 'Super Admin',
    color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50',
  },
  {
    role: 'HR',
    icon: '👨💼',
    email: 'hr@empflow.local',
    password: 'HR@123',
    name: 'Aditi Deshmukh',
    initials: 'AD',
    designation: 'HR Operations Manager',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50',
  },
  {
    role: 'Manager',
    icon: '👨💻',
    email: 'manager@empflow.local',
    password: 'Manager@123',
    name: 'Rohan Mehta',
    initials: 'RM',
    designation: 'Lead UI/UX Designer',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50',
  },
  {
    role: 'Employee',
    icon: '👤',
    email: 'employee@empflow.local',
    password: 'Employee@123',
    name: 'Rahul Sharma',
    initials: 'RS',
    designation: 'Senior Frontend Developer',
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50',
  },
]

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('empflow-saved-credentials')
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved)
        setEmail(savedEmail)
        setPassword(savedPassword)
        setRememberMe(true)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate small delay for premium feel
    setTimeout(() => {
      const match = ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase() && acc.password === password
      )

      if (match) {
        if (rememberMe) {
          localStorage.setItem('empflow-saved-credentials', JSON.stringify({ email, password }))
        } else {
          localStorage.removeItem('empflow-saved-credentials')
        }
        onLogin({
          email: match.email,
          role: match.role,
          name: match.name,
          initials: match.initials,
          designation: match.designation,
        })
      } else {
        setError('Invalid email address or password. Please try again.')
        setLoading(false)
      }
    }, 600)
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e9e8e1] p-4 font-sans text-slate-800">
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/60 bg-white/95 p-8 shadow-[0_20px_50px_rgba(53,65,59,0.12)] backdrop-blur-md transition-all duration-300">
        
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#426759] text-white shadow-lg shadow-emerald-900/10 animate-fade-in">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Emp<span className="text-[#426759]">Flow</span> Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium tracking-wide uppercase">
            People operations & lifecycle
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-semibold text-rose-700 animate-shake">
            <ShieldAlert size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@empflow.local"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-[#426759] focus:bg-white focus:ring-2 focus:ring-[#edf3ef]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-[#426759] focus:bg-white focus:ring-2 focus:ring-[#edf3ef]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pb-1">
            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#426759] focus:ring-[#426759]/20 accent-[#426759] cursor-pointer"
              />
              <span>Remember me / Save credentials</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-[#426759] text-xs font-bold text-white shadow-md shadow-emerald-955/10 transition-all hover:bg-[#315447] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>


      </div>
    </div>
  )
}
