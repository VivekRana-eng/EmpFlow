import { Palette, UserRound } from 'lucide-react'

export default function EmployeeSettings({ currentUser, themeColor, setThemeColor }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="theme-accent-text mb-1 text-[13px] font-medium">Personal settings</p>
        <h2 className="text-[26px] font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your portal preferences.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="theme-accent-soft flex h-10 w-10 items-center justify-center rounded-lg theme-accent-text"><UserRound size={18} /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile</h3>
              <p className="text-xs text-slate-500">Your employee account</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div><p className="text-xs text-slate-400">Name</p><p className="font-semibold text-slate-800">{currentUser.name}</p></div>
            <div><p className="text-xs text-slate-400">Designation</p><p className="font-semibold text-slate-800">{currentUser.designation}</p></div>
            <div><p className="text-xs text-slate-400">Employee ID</p><p className="font-semibold text-slate-800">{currentUser.employeeId || '—'}</p></div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="theme-accent-soft flex h-10 w-10 items-center justify-center rounded-lg theme-accent-text"><Palette size={18} /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Appearance</h3>
              <p className="text-xs text-slate-500">Personalize your portal accent color</p>
            </div>
          </div>
          <label className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-700">
            Accent color
            <input aria-label="Appearance color" type="color" value={themeColor} onChange={(event) => setThemeColor(event.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
          </label>
          <p className="mt-3 text-[11px] text-slate-400">This preference is saved automatically.</p>
        </section>
      </div>
    </div>
  )
}
