import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { initialEmployees as employeeRecords, initialDepartments, initialDesignations } from './models/employeeModel'
import { initialOnboardingProcesses } from './models/onboardingModel'
import { initialOffboardingProcesses } from './models/offboardingModel'
import { initialGeneratedDocuments } from './models/documentModel'
import { initialChecklistItems } from './models/checklistModel'
import { initialApprovals } from './models/approvalModel'
import Onboarding from './pages/Onboarding'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Employees', icon: Users },
  { label: 'Onboarding', icon: UserPlus, count: initialOnboardingProcesses.filter((process) => process.status !== 'Completed').length },
  { label: 'Offboarding', icon: Archive },
  { label: 'Template Management', icon: FileText },
  { label: 'Reports', icon: Activity },
  { label: 'Settings', icon: Settings },
]

const employees = [
  { name: 'Rahul Sharma', initials: 'RS', color: 'bg-indigo-100 text-indigo-700', department: 'Engineering', date: '12 Aug 2026', progress: 80, docs: '4/5', status: 'In Progress' },
  { name: 'Priya Singh', initials: 'PS', color: 'bg-emerald-100 text-emerald-700', department: 'Human Resources', date: '14 Aug 2026', progress: 100, docs: '5/5', status: 'Completed' },
  { name: 'Aman Verma', initials: 'AV', color: 'bg-amber-100 text-amber-700', department: 'Finance', date: '18 Aug 2026', progress: 45, docs: '2/5', status: 'Pending' },
]

const kpis = [
  { label: 'Total Employees', value: '248', note: '+8.2% from last month', icon: Users, trend: 'up', iconClass: 'bg-indigo-50 text-indigo-600' },
  { label: 'New Joiners', value: '18', note: 'This month', icon: UserPlus, trend: 'up', iconClass: 'bg-blue-50 text-blue-600' },
  { label: 'Active Onboarding', value: '12', note: '4 pending approvals', icon: ClipboardCheck, trend: 'neutral', iconClass: 'bg-violet-50 text-violet-600' },
  { label: 'Employees Leaving', value: '7', note: 'This month', icon: LogOut, trend: 'down', iconClass: 'bg-orange-50 text-orange-600' },
  { label: 'Pending Documents', value: '23', note: 'Requires attention', icon: FileCheck2, trend: 'neutral', iconClass: 'bg-amber-50 text-amber-600' },
  { label: 'Pending Approvals', value: '9', note: 'Awaiting action', icon: Clock3, trend: 'neutral', iconClass: 'bg-rose-50 text-rose-600' },
]

const tasks = [
  { icon: FileCheck2, title: 'Onboarding documents awaiting approval', meta: '5 items need your review', priority: 'High', tone: 'rose' },
  { icon: ClipboardList, title: 'Employee documents missing', meta: '3 employees have incomplete profiles', priority: 'Medium', tone: 'amber' },
  { icon: ShieldCheck, title: 'Exit clearances pending', meta: '2 clearances due this week', priority: 'Medium', tone: 'amber' },
  { icon: Check, title: 'Approvals awaiting HR action', meta: '4 requests are ready to process', priority: 'Low', tone: 'indigo' },
]

const mockEmployeeIds = ['EMP-4827', 'EMP-9361', 'EMP-1748', 'EMP-6503', 'EMP-8216', 'EMP-3974', 'EMP-7082', 'EMP-2549', 'EMP-6147', 'EMP-8830', 'EMP-4295', 'EMP-7618', 'EMP-3056', 'EMP-9724', 'EMP-5389']

function StatusBadge({ status }) {
  const styles = {
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/10',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    Overdue: 'bg-rose-50 text-rose-700 ring-rose-600/10',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>{status}</span>
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : currentHour < 21 ? 'Good evening' : 'Good night'
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const totalEmployees = employeeRecords.length
  const newJoiners = employeeRecords.filter((employee) => employee.status === 'Onboarding').length
  const activeOnboarding = initialOnboardingProcesses.filter((process) => process.status === 'In Progress').length
  const employeesLeaving = initialOffboardingProcesses.filter((process) => process.status !== 'Completed').length
  const pendingDocuments = initialGeneratedDocuments.filter((document) => document.status === 'Pending Approval' || document.status === 'Draft').length + initialChecklistItems.filter((item) => !item.is_complete).length
  const pendingApprovalsCount = initialApprovals.filter((approval) => approval.status === 'Pending').length
  const dynamicKpis = kpis.map((kpi) => {
    const values = {
      'Total Employees': [totalEmployees, `${newJoiners} onboarding`],
      'New Joiners': [newJoiners, 'Current onboarding'],
      'Active Onboarding': [activeOnboarding, `${pendingApprovalsCount} pending approvals`],
      'Employees Leaving': [employeesLeaving, 'Active offboarding'],
      'Pending Documents': [pendingDocuments, 'Requires attention'],
      'Pending Approvals': [pendingApprovalsCount, 'Awaiting action'],
    }[kpi.label]
    return values ? { ...kpi, value: values[0], note: values[1] } : kpi
  })

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleDashboardActions = (event) => {
      const button = event.target.closest?.('button')
      if (!button) return
      const label = button.textContent.trim()
      if (label === 'Start onboarding') setActivePage('Onboarding')
      if (label === 'Add employee') button.style.display = 'none'
    }
    document.querySelectorAll('button').forEach((button) => {
      if (button.textContent.trim() === 'Add employee') button.style.display = 'none'
    })
    document.addEventListener('click', handleDashboardActions)
    return () => document.removeEventListener('click', handleDashboardActions)
  }, [])

  const filteredEmployees = useMemo(() => employees.filter((employee) => employee.name.toLowerCase().includes(search.toLowerCase())), [search])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const lifecycleStages = [
    ['Hiring', Math.max(0, totalEmployees - newJoiners - employeesLeaving), 'bg-slate-100', 'text-slate-600'],
    ['Onboarding', newJoiners, 'bg-indigo-100', 'text-indigo-700'],
    ['Active employee', totalEmployees, 'bg-emerald-100', 'text-emerald-700'],
    ['Offboarding', employeesLeaving, 'bg-amber-100', 'text-amber-700'],
    ['Exited', initialOffboardingProcesses.filter((process) => process.status === 'Completed').length, 'bg-slate-100', 'text-slate-600'],
  ]

  return (
    <div className="min-h-screen bg-[#e9e8e1] p-3 text-slate-900 sm:p-6 lg:p-8">
      <aside className={`fixed bottom-8 left-8 top-8 z-50 hidden rounded-[22px] border border-white/80 bg-white shadow-[0_12px_30px_rgba(53,65,59,0.08)] transition-all duration-200 lg:flex lg:flex-col ${collapsed ? 'w-[68px]' : 'w-[232px]'}`}>
        <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#426759] text-white shadow-sm shadow-emerald-900/20"><Sparkles size={19} strokeWidth={2.5} /></div>
          {!collapsed && <div className="ml-3"><div className="text-[15px] font-bold tracking-tight text-slate-900">Emp<span className="text-indigo-600">Flow</span></div><div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">People operations</div></div>}
        </div>
        <div className="flex-1 px-3 py-6">
          {!collapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, count }) => <button key={label} onClick={() => setActivePage(label)} title={collapsed ? label : undefined} className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${activePage === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={18} className={`shrink-0 ${activePage === label ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} /><>{!collapsed && <><span className="ml-3 flex-1">{label}</span>{count && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">{count}</span>}</>}{collapsed && <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{label}{count && <span className="ml-2 text-emerald-300">{count}</span>}</span>}</></button>)}
          </nav>
          {!collapsed && <div className="mt-8 rounded-xl bg-slate-50 p-3.5"><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold text-slate-600">Storage used</span><span className="text-[11px] font-semibold text-indigo-600">68%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[68%] rounded-full bg-indigo-500" /></div><p className="mt-2 text-[10px] leading-relaxed text-slate-400">You have 3.2 GB of 5 GB available.</p></div>}
        </div>
        <div className="border-t border-slate-100 p-3">
          {!collapsed && <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">AD</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">Aditi Deshmukh</p><p className="text-[10px] text-slate-400">HR Administrator</p></div><MoreHorizontal size={16} className="text-slate-400" /></div>}
          <button title={collapsed ? 'Collapse sidebar' : undefined} onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">{collapsed ? <Menu size={18} /> : <><ChevronRight size={16} className="rotate-180" /><span className="ml-2 text-xs">Collapse sidebar</span></>}</button>
        </div>
      </aside>
      {mobileMenuOpen && <div className="mobile-menu-overlay fixed inset-0 z-[100] bg-slate-900/30" onClick={() => setMobileMenuOpen(false)}><aside className="h-full w-[260px] bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#426759] text-white"><Sparkles size={18} /></div><span className="font-bold text-slate-900">Emp<span className="text-indigo-600">Flow</span></span></div><button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate-400"><X size={18} /></button></div><nav className="space-y-1">{navItems.map(({ label, icon: Icon, count }) => <button key={label} onClick={() => { setActivePage(label); setMobileMenuOpen(false) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium ${activePage === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><Icon size={18} /><span className="flex-1">{label}</span>{count && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700">{count}</span>}</button>)}</nav></aside></div>}

      <main className={`w-full transition-all duration-200 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[248px]'}`}>
        <header className={`sticky top-0 z-40 flex h-[76px] items-center justify-between border-0 bg-transparent px-4 transition-all duration-200 sm:px-7 ${isScrolled ? 'backdrop-blur-[2px] backdrop-saturate-100' : ''}`}>
          <div className="flex items-center gap-3">
            <button onPointerDown={() => setMobileMenuOpen(true)} onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation" className="mobile-menu-trigger rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden"><Menu size={20} /></button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400"><span>Workspace</span><ChevronRight size={13} /><span className="font-medium text-slate-600">{activePage}</span></div><h1 className="mt-0.5 text-[17px] font-bold tracking-tight text-slate-900">{activePage}</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-5"><div className="relative hidden md:block"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100" /></div><button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button><button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-50 sm:block"><CircleHelp size={18} /></button><div className="hidden h-6 w-px bg-slate-200 sm:block" /><button className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">AD</div><ChevronDown size={14} className="text-slate-400" /></button></div>
        </header>

        <div className="p-2 pb-8 sm:p-5 sm:pb-8">
          {activePage === 'Employees' ? <EmployeeDirectory search={search} onAction={showToast} /> : activePage === 'Onboarding' ? <Onboarding onAction={showToast} /> : activePage !== 'Dashboard' ? <ModulePlaceholder page={activePage} onAction={showToast} /> : <>
            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[13px] font-medium text-indigo-600">{formattedDate}</p><h2 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[30px]">{greeting}, Aditi <span className="text-2xl">👋</span></h2><p className="mt-1 text-sm text-slate-500">Here's what's happening across your employee lifecycle today.</p></div><div className="flex gap-2"><button onClick={() => showToast('Onboarding flow started')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"><UserPlus size={16} />Start onboarding</button><button onClick={() => showToast('Add employee form opened')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"><Plus size={16} />Add employee</button></div></section>

            <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{dynamicKpis.map(({ label, value, note, icon: Icon, trend, iconClass }) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]"><div className="mb-4 flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}><Icon size={18} /></div>{trend === 'up' ? <ArrowUpRight size={16} className="text-emerald-500" /> : trend === 'down' ? <ArrowDownRight size={16} className="text-rose-400" /> : <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}</div><p className="text-[12px] font-medium text-slate-500">{label}</p><div className="mt-1 flex items-end justify-between"><span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span><span className={`text-[10px] font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>{note}</span></div></div>)}</section>

            <section className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Employee lifecycle overview</h3><p className="mt-1 text-xs text-slate-400">Current workforce distribution by stage</p></div><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View details <ChevronRight size={13} className="inline" /></button></div><div className="relative grid grid-cols-5 gap-1">{lifecycleStages.map(([stage, amount, bg, color], index) => <div key={stage} className="relative text-center"><div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${bg} ${color} text-lg font-bold ring-4 ring-white sm:h-16 sm:w-16`}>{amount}</div>{index < 4 && <div className="absolute left-[calc(50%+34px)] top-7 hidden h-px w-[calc(100%-52px)] bg-slate-200 sm:block" />}<p className="text-[10px] font-semibold text-slate-600 sm:text-[11px]">{stage}</p><p className="mt-1 text-[10px] text-slate-400">{index === 2 ? 'employees' : 'people'}</p></div>)}</div><div className="mt-7 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check size={14} /></div><span className="text-xs font-medium text-slate-600">Lifecycle health is looking good</span></div><span className="text-xs font-bold text-emerald-600">{Math.round((employeeRecords.filter((employee) => employee.status === 'Active').length / Math.max(1, totalEmployees)) * 100)}% on track</span></div></div><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Quick actions</h3><p className="mt-1 text-xs text-slate-400">Common HR workflows</p></div><MoreHorizontal size={17} className="text-slate-400" /></div><div className="grid grid-cols-2 gap-2.5">{[[UserPlus, 'Add employee', 'Create profile'], [ClipboardCheck, 'Start onboarding', 'Begin a workflow'], [Archive, 'Initiate relieving', 'Start exit process'], [FileText, 'Upload template', 'Add a document'], [Activity, 'Generate report', 'View insights'], [CalendarDays, 'View calendar', 'Upcoming events']].map(([Icon, title, subtitle]) => <button key={title} onClick={() => showToast(`${title} selected`)} className="group rounded-lg border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"><Icon size={17} className="mb-2 text-indigo-600" /><p className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-700">{title}</p><p className="mt-0.5 text-[10px] text-slate-400">{subtitle}</p></button>)}</div></div></section>

            <section className="mb-7 rounded-xl border border-slate-200 bg-white"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6"><div><h3 className="text-sm font-bold text-slate-900">Recent onboarding</h3><p className="mt-1 text-xs text-slate-400">Track your newest team members</p></div><div className="flex gap-2"><button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600"><Filter size={14} />Filter</button><button className="text-xs font-semibold text-indigo-600">View all <ChevronRight size={13} className="inline" /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3 font-semibold">Employee</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Joining date</th><th className="px-4 py-3 font-semibold">Progress</th><th className="px-4 py-3 font-semibold">Documents</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filteredEmployees.map((employee) => <tr key={employee.name} className="transition hover:bg-slate-50/70"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${employee.color}`}>{employee.initials}</div><span className="text-xs font-semibold text-slate-700">{employee.name}</span></div></td><td className="px-4 py-3.5 text-xs text-slate-500">{employee.department}</td><td className="px-4 py-3.5 text-xs text-slate-500">{employee.date}</td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${employee.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${employee.progress}%` }} /></div><span className="text-[10px] font-semibold text-slate-500">{employee.progress}%</span></div></td><td className="px-4 py-3.5 text-xs font-medium text-slate-500">{employee.docs}</td><td className="px-4 py-3.5"><StatusBadge status={employee.status} /></td><td className="px-4 py-3.5"><button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div></section>

            <section className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Employee growth</h3><p className="mt-1 text-xs text-slate-400">Total headcount over the last 6 months</p></div><button className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">Last 6 months <ChevronDown size={13} /></button></div><div className="flex h-44 items-end gap-3 border-b border-l border-slate-100 px-3 pb-0 pt-5 sm:gap-7"><div className="flex h-full flex-1 flex-col justify-between pb-5 text-[9px] text-slate-300"><span>260</span><span>240</span><span>220</span><span>200</span></div><div className="relative flex h-full flex-1 items-end justify-between gap-2 pb-5"><div className="absolute inset-x-0 top-[23%] border-t border-dashed border-slate-100" /><div className="absolute inset-x-0 top-[54%] border-t border-dashed border-slate-100" /><div className="absolute inset-x-0 top-[85%] border-t border-dashed border-slate-100" /><svg className="absolute inset-0 h-[calc(100%-20px)] w-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity=".18" /><stop offset="1" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs><path d="M0,100 C60,95 70,76 120,82 S185,57 230,67 S295,43 335,50 S405,22 500,28 L500,120 L0,120Z" fill="url(#area)" /><path d="M0,100 C60,95 70,76 120,82 S185,57 230,67 S295,43 335,50 S405,22 500,28" fill="none" stroke="#6366f1" strokeLinecap="round" strokeWidth="3" /></svg>{['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month) => <span key={month} className="z-10 translate-y-5 text-[9px] text-slate-400">{month}</span>)}</div></div></div><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Onboarding status</h3><p className="mt-1 text-xs text-slate-400">Current workflow split</p></div><MoreHorizontal size={17} className="text-slate-400" /></div><div className="flex items-center gap-7"><div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: 'conic-gradient(#10b981 0 52%, #6366f1 52% 79%, #fbbf24 79% 100%)' }}><div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-bold text-slate-900">24</span><span className="text-[10px] text-slate-400">total</span></div></div><div className="space-y-3 text-xs"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-slate-500">Completed</span><b className="ml-3 text-slate-700">12</b></div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" /><span className="text-slate-500">In progress</span><b className="ml-3 text-slate-700">6</b></div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-slate-500">Pending</span><b className="ml-3 text-slate-700">6</b></div></div></div></div></section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6"><div><h3 className="text-sm font-bold text-slate-900">Upcoming relieving</h3><p className="mt-1 text-xs text-slate-400">Employees exiting in the next 30 days</p></div><button className="text-xs font-semibold text-indigo-600">View all <ChevronRight size={13} className="inline" /></button></div><div className="divide-y divide-slate-100">{[['Neha Kapoor', 'Product', '20 Aug 2026', 'In Progress'], ['Vikram Nair', 'Engineering', '28 Aug 2026', 'Pending'], ['Sana Khan', 'Marketing', '02 Sep 2026', 'Completed']].map(([name, department, date, status]) => <div key={name} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{name.split(' ').map((n) => n[0]).join('')}</div><div><p className="text-xs font-semibold text-slate-700">{name}</p><p className="mt-0.5 text-[10px] text-slate-400">{department} · Last day {date}</p></div></div><StatusBadge status={status} /></div>)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Pending tasks</h3><p className="mt-1 text-xs text-slate-400">Your attention is needed</p></div><span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600">4 open</span></div><div className="space-y-3">{tasks.map(({ icon: Icon, title, meta, priority, tone }) => <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone === 'rose' ? 'bg-rose-50 text-rose-500' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}><Icon size={15} /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-slate-700">{title}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{meta}</p></div><span className="hidden text-[10px] font-semibold text-slate-400 sm:block">{priority}</span><button onClick={() => showToast('Task marked for review')} className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600">Review</button></div>)}</div></div></section>
          </>}
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"><Check size={15} className="text-emerald-400" />{toast}<button onClick={() => setToast('')} className="ml-2 text-slate-400 hover:text-white"><X size={14} /></button></div>}
    </div>
  )
}

function ModulePlaceholder({ page, onAction }) {
  const content = { Employees: ['Employee directory', 'Manage profiles, departments and employee records in one place.', Users], Onboarding: ['Onboarding workspace', 'Track every new joiner from document collection to completion.', UserPlus], Offboarding: ['Offboarding & relieving', 'Manage clearances, exit interviews and relieving documents.', Archive], 'Template Management': ['Template management', 'Create reusable HR documents and map fields to employee data.', FileText], Reports: ['Reports & insights', 'Turn lifecycle data into clear, actionable workforce insights.', Activity], Settings: ['Workspace settings', 'Configure users, roles, departments and approval workflows.', Settings] }[page] || ['Dashboard', 'Your employee lifecycle workspace.', LayoutDashboard]
  const Icon = content[2]
  return <div className="flex min-h-[620px] items-center justify-center"><div className="max-w-md text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={28} /></div><h2 className="text-2xl font-bold tracking-tight text-slate-900">{content[0]}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{content[1]}</p><button onClick={() => onAction(`${page} module opened`)} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"><Plus size={16} />Create new</button></div></div>
}

function EmployeeDirectory({ search, onAction }) {
  const [department, setDepartment] = useState('All departments')
  const [status, setStatus] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => setPage(1), [search])

  const rows = employeeRecords.map((employee, index) => ({ ...employee, id: mockEmployeeIds[index] ? mockEmployeeIds[index].replace('EMP-', 'e') : employee.id })).filter((employee) => {
    const departmentName = initialDepartments.find((item) => item.id === employee.department_id)?.name || ''
    const matchesSearch = `${employee.name} ${employee.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = department === 'All departments' || departmentName === department
    const matchesStatus = status === 'All statuses' || employee.status === status
    return matchesSearch && matchesDepartment && matchesStatus
  })
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return <div className="employee-directory space-y-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-1 text-[13px] font-medium text-indigo-600">People directory</p><h2 className="text-[26px] font-bold tracking-tight text-slate-900">Employee master</h2><p className="mt-1 text-sm text-slate-500">Manage profiles, departments and employee records in one place.</p></div>
      <button onClick={() => onAction('Add employee form opened')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"><Plus size={16} />Add employee</button>
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="text-sm font-bold text-slate-900">All employees <span className="ml-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">{rows.length}</span></h3><p className="mt-1 text-xs text-slate-400">Search and filter your workforce directory</p></div><div className="flex flex-wrap gap-2"><select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1) }} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-indigo-300"><option>All departments</option>{initialDepartments.map((item) => <option key={item.id}>{item.name}</option>)}</select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-indigo-300"><option>All statuses</option><option>Active</option><option>Onboarding</option><option>Offboarding</option></select><button onClick={() => onAction('Employee filters are ready')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700"><Filter size={14} />Filters</button></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Employee ID</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((employee) => { const dept = initialDepartments.find((item) => item.id === employee.department_id)?.name || '—'; const title = initialDesignations.find((item) => item.id === employee.designation_id)?.title || '—'; return <tr key={employee.id} onClick={() => setSelectedEmployee(employee)} className="cursor-pointer transition hover:bg-slate-50/70"><td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700">{employee.name.split(' ').map((name) => name[0]).join('')}</div><div><p className="text-xs font-semibold text-slate-700">{employee.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{employee.email}</p></div></div></td><td className="px-4 py-3.5 text-xs text-slate-500">{dept}</td><td className="px-4 py-3.5 text-xs text-slate-500">{title}</td><td className="px-4 py-3.5 text-xs font-medium text-slate-500">EMP-{employee.id.slice(1).padStart(3, '0')}</td><td className="px-4 py-3.5"><EmployeeStatusBadge status={employee.status} /></td><td className="px-4 py-3.5"><button onClick={(event) => { event.stopPropagation(); setSelectedEmployee(employee) }} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><MoreHorizontal size={16} /></button></td></tr> })}</tbody></table>{rows.length === 0 && <div className="py-14 text-center text-sm text-slate-400">No employees match the selected filters.</div>}</div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-[11px] text-slate-400">Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, rows.length)} of {rows.length} employees</p><div className="flex items-center gap-1"><button disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">{page} / {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-500 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
    </div>
    {selectedEmployee && <EmployeeProfileCard employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onAction={onAction} />}
  </div>
}

function EmployeeProfileCard({ employee, onClose, onAction }) {
  const department = initialDepartments.find((item) => item.id === employee.department_id)?.name || '—'
  const designation = initialDesignations.find((item) => item.id === employee.designation_id)?.title || '—'
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [emergencyName, setEmergencyName] = useState(employee.emergencyContactName || 'Rajesh Kumar')
  const [emergencyNumber, setEmergencyNumber] = useState(employee.emergencyContactNumber || '+91 98765 00000')
  const [emergencyRelationship, setEmergencyRelationship] = useState(employee.emergencyRelationship || 'Parent')
  const [address, setAddress] = useState(employee.currentAddress || 'New Delhi, India')
  const [employmentType, setEmploymentType] = useState(employee.employmentType || 'Full Time')
  const [joiningDate, setJoiningDate] = useState(employee.joiningDate || '2026-08-01')
  const [editName, setEditName] = useState(employee.name)
  const [editEmail, setEditEmail] = useState(employee.email)
  const [editPhone, setEditPhone] = useState(employee.phone || '')
  const [editDesignation, setEditDesignation] = useState(designation)
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[2px]" onClick={onClose}>
    <div className="employee-profile-card relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="absolute right-16 top-6 z-10"><button aria-label="Employee actions" onClick={() => setMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white"><MoreVertical size={17} /></button>{menuOpen && <div className="absolute right-0 top-10 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button onClick={() => { setMenuOpen(false); setEditOpen(true) }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-[#edf3ef] hover:text-[#426759]">Edit</button><button onClick={() => { setMenuOpen(false); setDetailsOpen(true); onAction?.('Employee details viewed') }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-[#edf3ef] hover:text-[#426759]">View details</button><button onClick={() => { setMenuOpen(false); setDocumentsOpen(true) }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-[#edf3ef] hover:text-[#426759]">View documents</button></div>}</div>
      <div className="flex items-start justify-between bg-[#426759] p-6 text-white"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold">{employee.name.split(' ').map((name) => name[0]).join('')}</div><div><p className="text-xl font-bold">{employee.name}</p><p className="mt-1 text-xs text-emerald-100">{designation}</p></div></div><button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={18} /></button></div>
      <div className="grid gap-5 p-6 sm:grid-cols-2"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal information</p><div className="space-y-3"><EditableProfileField label="Full name" value={editName} editing={editOpen} onChange={setEditName} /><EditableProfileField label="Email address" value={editEmail} editing={editOpen} onChange={setEditEmail} /><EditableProfileField label="Phone number" value={editPhone} editing={editOpen} onChange={setEditPhone} /><ProfileField label="Employee ID" value={`EMP-${employee.id.slice(1).padStart(3, '0')}`} /></div></div><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employment information</p><div className="space-y-3"><ProfileField label="Department" value={department} /><EditableProfileField label="Designation" value={editDesignation} editing={editOpen} onChange={setEditDesignation} /><div className="flex items-center justify-between border-b border-slate-100 pb-2"><span className="text-xs text-slate-400">Current status</span><EmployeeStatusBadge status={employee.status} /></div></div></div></div>
      {detailsOpen && <div className="grid gap-5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:grid-cols-2"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact details</p><div className="space-y-3"><EditableProfileField label="Emergency contact" value={emergencyName} editing={editOpen} onChange={setEmergencyName} /><EditableProfileField label="Emergency number" value={emergencyNumber} editing={editOpen} onChange={setEmergencyNumber} /><EditableProfileField label="Relationship" value={emergencyRelationship} editing={editOpen} onChange={setEmergencyRelationship} /><EditableProfileField label="Address" value={address} editing={editOpen} onChange={setAddress} /></div></div><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional employment</p><div className="space-y-3"><EditableProfileField label="Employment type" value={employmentType} editing={editOpen} onChange={setEmploymentType} /><EditableProfileField label="Joining date" value={joiningDate} editing={editOpen} onChange={setJoiningDate} /></div></div></div>}
      <div className="flex items-end justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee activity</p><div className="flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200">Profile created</span><span className="rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200">Documents: 5</span><span className="rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200">Last updated today</span></div></div>{editOpen && <button onClick={() => { setEditOpen(false); onAction?.(`Employee ${editName} saved`) }} className="rounded-md bg-[#426759] px-3.5 py-2 text-xs font-semibold text-white shadow-sm">Save changes</button>}</div>
      {editOpen && <div className="absolute inset-x-0 top-[101px] z-20 border-y border-slate-100 bg-white p-6 shadow-lg"><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Edit employee details</p><div className="grid gap-3 sm:grid-cols-2"><input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Full name" /><input value={editEmail} onChange={(event) => setEditEmail(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Email" /><input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Phone number" /><input value={editDesignation} onChange={(event) => setEditDesignation(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Designation" /></div><button onClick={() => { setEditOpen(false); onAction?.(`Employee ${editName} updated`) }} className="mt-3 rounded-md bg-[#426759] px-3 py-2 text-xs font-semibold text-white">Save changes</button></div>}
      {documentsOpen && <div className="border-t border-slate-100 bg-white p-6"><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee documents</p><button onClick={() => setDocumentsOpen(false)} className="text-xs text-slate-400">Close</button></div><div className="grid gap-2 sm:grid-cols-2"><button onClick={() => onAction?.('Identity proof viewed')} className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs">Identity proof <span className="float-right text-emerald-600">View</span></button><button onClick={() => onAction?.('Offer letter viewed')} className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs">Offer Letter <span className="float-right text-emerald-600">View</span></button><button onClick={() => onAction?.('Bank details viewed')} className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs">Bank details <span className="float-right text-emerald-600">View</span></button><button onClick={() => onAction?.('NDA viewed')} className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs">NDA Agreement <span className="float-right text-amber-600">Pending</span></button></div></div>}
    </div>
  </div>
}

function EditableProfileField({ label, value, editing, onChange }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2"><span className="text-xs text-slate-400">{label}</span>{editing ? <input value={value} onChange={(event) => onChange(event.target.value)} className="h-7 min-w-0 flex-1 rounded border border-slate-200 px-2 text-right text-xs outline-none focus:border-[#426759]" /> : <span className="text-right text-xs font-semibold text-slate-700">{value}</span>}</div>
}

function ProfileField({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2"><span className="text-xs text-slate-400">{label}</span><span className="text-right text-xs font-semibold text-slate-700">{value}</span></div>
}

function EmployeeStatusBadge({ status }) {
  const styles = { Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10', Onboarding: 'bg-blue-50 text-blue-700 ring-blue-600/10', Offboarding: 'bg-amber-50 text-amber-700 ring-amber-600/10' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${styles[status] || 'bg-slate-50 text-slate-600 ring-slate-600/10'}`}>{status}</span>
}

export default App
