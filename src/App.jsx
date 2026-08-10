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
import { initialAuditLogs } from './models/auditModel'
import Onboarding from './pages/Onboarding'

import LoginPage from './components/Login/LoginPage'
import EmployeeDashboard from './components/Dashboards/EmployeeDashboard'
import ManagerDashboard from './components/Dashboards/ManagerDashboard'
import AdminSettings from './components/Dashboards/AdminSettings'

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

const getRelativeTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const isUnreadForRole = (notification, role) => {
  if (!role || !notification || !Array.isArray(notification.readBy)) return true;
  const roleUpper = role.toUpperCase();
  return !notification.readBy.some(r => r && r.role === roleUpper);
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [activePage, setActivePage] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [autoOpenDocName, setAutoOpenDocName] = useState(null)

  // Centralized system states
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-depts')
      if (saved) return JSON.parse(saved)
    } catch {}
    return initialDepartments
  })

  const [designations, setDesignations] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-desigs')
      if (saved) return JSON.parse(saved)
    } catch {}
    return initialDesignations
  })

  const [employeeRecordsState, setEmployeeRecordsState] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-employees')
      if (saved) {
        const parsed = JSON.parse(saved)
        const validEmployeeRecords = Array.isArray(parsed) ? parsed.filter((employee) => employee?.id && employee?.department_id) : []
        if (validEmployeeRecords.length) {
          const savedIds = new Set(validEmployeeRecords.map((employee) => employee.id))
          return [...validEmployeeRecords, ...employeeRecords.filter((employee) => !savedIds.has(employee.id))].slice(0, employeeRecords.length)
        }
      }
    } catch {}
    return employeeRecords
  })

  const [offboardings, setOffboardings] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-offboardings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length) return parsed.slice(0, 3)
      }
    } catch {}
    return [
      { id: 'fp1', employee_id: 'e3', employee_name: 'Manoj Kumar', department: 'Finance & Treasury', last_working_date: '2026-08-29', status: 'In Progress' },
      { id: 'fp2', employee_id: 'e9', employee_name: 'Sneha Iyer', department: 'Human Resources', last_working_date: '2026-08-28', status: 'In Progress' },
      { id: 'fp3', employee_id: 'e15', employee_name: 'Ankit Gupta', department: 'Information Technology', last_working_date: '2026-09-15', status: 'Pending' }
    ]
  })

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.every(n => n && Array.isArray(n.targetRoles))) {
          return parsed
        }
      }
    } catch {}
    return [
      {
        id: "init_1",
        type: "DOCUMENT_UPLOADED",
        employeeId: "EMP-1002",
        employeeName: "Rahul Sharma",
        documentName: "Degree.pdf",
        documentType: "Academic",
        uploadedAt: new Date(Date.now() - 60 * 1000).toISOString(),
        status: "Pending Review",
        targetRoles: ["ADMIN", "HR"],
        readBy: [],
        actionRequired: true
      },
      {
        id: "init_2",
        type: "DOCUMENT_UPLOADED",
        employeeId: "EMP-1005",
        employeeName: "Priya Verma",
        documentName: "Identity Proof",
        documentType: "KYC",
        uploadedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "Pending Review",
        targetRoles: ["ADMIN", "HR"],
        readBy: [],
        actionRequired: true
      },
      {
        id: "init_3",
        type: "DOCUMENT_UPLOADED",
        employeeId: "EMP-1003",
        employeeName: "Manoj Kumar",
        documentName: "Exit Document",
        documentType: "Compliance",
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "Approved",
        targetRoles: ["ADMIN", "HR"],
        readBy: [
          { role: "ADMIN", readAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
          { role: "HR", readAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() }
        ],
        actionRequired: false
      }
    ]
  })

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-audit-logs')
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      { id: 'l1', action: 'System setup completed successfully.', timestamp: '10 Aug 2026, 07:00', user: 'System' },
      { id: 'l2', action: 'Preloaded company records with 5 core departments, 8 primary designations, and 9 employees.', timestamp: '10 Aug 2026, 07:05', user: 'Admin' },
      { id: 'l3', action: 'Active directory directory accounts verified for Super Admin.', timestamp: '10 Aug 2026, 07:10', user: 'System' },
      { id: 'l4', action: 'Uploaded corporate document templates v2.4 (Offer Letter, Relieving Certificate, NOC).', timestamp: '10 Aug 2026, 07:12', user: 'Aditi Deshmukh' }
    ]
  })

  useEffect(() => {
    localStorage.setItem('empflow-depts', JSON.stringify(departments))
  }, [departments])

  useEffect(() => {
    localStorage.setItem('empflow-desigs', JSON.stringify(designations))
  }, [designations])

  useEffect(() => {
    localStorage.setItem('empflow-employees', JSON.stringify(employeeRecordsState))
  }, [employeeRecordsState])

  useEffect(() => {
    localStorage.setItem('empflow-offboardings', JSON.stringify(offboardings))
  }, [offboardings])

  useEffect(() => {
    localStorage.setItem('empflow-notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('empflow-audit-logs', JSON.stringify(auditLogs))
  }, [auditLogs])

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'empflow-notifications') {
          const parsed = JSON.parse(e.newValue)
          if (parsed && JSON.stringify(parsed) !== JSON.stringify(notifications)) {
            setNotifications(parsed)
          }
        }
        if (e.key === 'empflow-audit-logs') {
          const parsed = JSON.parse(e.newValue)
          if (parsed && JSON.stringify(parsed) !== JSON.stringify(auditLogs)) {
            setAuditLogs(parsed)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [notifications, auditLogs])

  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => {
      try {
        const savedOff = localStorage.getItem('empflow-offboardings')
        if (savedOff) {
          const parsed = JSON.parse(savedOff)
          if (JSON.stringify(parsed) !== JSON.stringify(offboardings)) {
            setOffboardings(parsed)
          }
        }
        const savedDepts = localStorage.getItem('empflow-depts')
        if (savedDepts) {
          const parsed = JSON.parse(savedDepts)
          if (JSON.stringify(parsed) !== JSON.stringify(departments)) {
            setDepartments(parsed)
          }
        }
        const savedDesigs = localStorage.getItem('empflow-desigs')
        if (savedDesigs) {
          const parsed = JSON.parse(savedDesigs)
          if (JSON.stringify(parsed) !== JSON.stringify(designations)) {
            setDesignations(parsed)
          }
        }
        const savedEmps = localStorage.getItem('empflow-employees')
        if (savedEmps) {
          const parsed = JSON.parse(savedEmps)
          const validEmployeeRecords = Array.isArray(parsed) ? parsed.filter((employee) => employee?.id && employee?.department_id) : []
          const savedIds = new Set(validEmployeeRecords.map((employee) => employee.id))
          const normalizedEmployees = [...validEmployeeRecords, ...employeeRecords.filter((employee) => !savedIds.has(employee.id))].slice(0, employeeRecords.length)
          if (JSON.stringify(normalizedEmployees) !== JSON.stringify(employeeRecordsState)) {
            setEmployeeRecordsState(normalizedEmployees)
          }
        }
        const savedNotifs = localStorage.getItem('empflow-notifications')
        if (savedNotifs) {
          const parsed = JSON.parse(savedNotifs)
          if (JSON.stringify(parsed) !== JSON.stringify(notifications)) {
            setNotifications(parsed)
          }
        }
        const savedAudit = localStorage.getItem('empflow-audit-logs')
        if (savedAudit) {
          const parsed = JSON.parse(savedAudit)
          if (JSON.stringify(parsed) !== JSON.stringify(auditLogs)) {
            setAuditLogs(parsed)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [currentUser, offboardings, departments, designations, employeeRecordsState, notifications, auditLogs])

  const handleUpdateEmployee = (updatedEmp, newDesigTitle) => {
    if (newDesigTitle) {
      const existingDesig = designations.find(d => d.title.toLowerCase() === newDesigTitle.toLowerCase());
      if (!existingDesig) {
        const newDesig = { id: updatedEmp.designation_id, title: newDesigTitle };
        setDesignations([...designations, newDesig]);
      }
    }
    setEmployeeRecordsState(curr => curr.map(e => e.id === updatedEmp.id ? updatedEmp : e))
    showToast(`Employee ${updatedEmp.name} updated successfully`)
  }

  const handleUpdateEmployeeRole = (empId, newRole) => {
    setEmployeeRecordsState(curr => curr.map(e => e.id === empId ? { ...e, role: newRole } : e))
    showToast(`User role updated successfully`)
  }

  const handleLogin = (user) => {
    localStorage.setItem('empflow-session', JSON.stringify(user))
    setCurrentUser(user)
    setActivePage('Dashboard')
    setSelectedEmployee(null)
    setAutoOpenDocName(null)
    showToast(`Logged in as ${user.name}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('empflow-session')
    setCurrentUser(null)
    setActivePage('Dashboard')
    setSelectedEmployee(null)
    setAutoOpenDocName(null)
    setShowProfileMenu(false)
  }

  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : currentHour < 21 ? 'Good evening' : 'Good night'
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  
  const totalEmployees = employeeRecordsState.length
  const newJoiners = employeeRecordsState.filter((employee) => employee.status === 'Onboarding').length
  const activeOnboarding = initialOnboardingProcesses.filter((process) => process.status === 'In Progress').length
  
  const employeesLeaving = offboardings.filter((process) => process.status !== 'Completed').length
  
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

  const userNotifications = useMemo(() => {
    if (!currentUser) return []
    const roleUpper = currentUser.role.toUpperCase()
    const filtered = notifications.filter(n => {
      if (!n || !Array.isArray(n.targetRoles)) return false;
      if (roleUpper === 'EMPLOYEE') {
        return n.targetRoles.includes('EMPLOYEE') && n.employeeId === currentUser.employeeId;
      }
      return n.targetRoles.includes(roleUpper);
    })

    return filtered.map(n => {
      let title = n.title;
      let message = n.message;
      let status = n.status || 'Pending Review';

      if (n.type === 'DOCUMENT_UPLOADED') {
        title = 'New document uploaded';
        message = `${n.employeeName} uploaded ${n.documentName}.`;
      } else if (n.type === 'DOCUMENT_APPROVED') {
        title = 'Document Approved';
        message = n.message || `${n.documentName} submitted by ${n.employeeName} was approved.`;
      } else if (n.type === 'DOCUMENT_REJECTED') {
        title = 'Document Rejected';
        message = n.message || `${n.documentName} submitted by ${n.employeeName} was rejected.`;
      }

      return {
        ...n,
        title,
        message,
        time: getRelativeTime(n.uploadedAt),
        unread: isUnreadForRole(n, currentUser.role),
        statusText: status
      }
    })
  }, [notifications, currentUser])

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => n.unread).length;
  }, [userNotifications])

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  const allowedPages = {
    Admin: ['Dashboard', 'Employees', 'Onboarding', 'Offboarding', 'Template Management', 'Reports', 'Settings'],
    HR: ['Dashboard', 'Employees', 'Onboarding', 'Offboarding', 'Template Management', 'Reports'],
    Manager: ['Dashboard', 'Employees', 'Reports'],
    Employee: ['Dashboard'],
  }[currentUser.role] || ['Dashboard']

  const filteredNavItems = navItems.filter((item) => allowedPages.includes(item.label))

  const handleNotificationClick = (notification) => {
    const roleUpper = currentUser.role.toUpperCase()
    if (!notification.readBy.some(r => r.role === roleUpper)) {
      const updatedNotifications = notifications.map(n => {
        if (n.id === notification.id) {
          return {
            ...n,
            readBy: [...n.readBy, { role: roleUpper, readAt: new Date().toISOString() }]
          }
        }
        return n;
      });
      setNotifications(updatedNotifications);
      localStorage.setItem('empflow-notifications', JSON.stringify(updatedNotifications));
      window.dispatchEvent(new Event('storage'));
    }

    if (notification.employeeId) {
      const emp = employeeRecordsState.find(e => 
        e.employeeId === notification.employeeId || 
        ('EMP-' + e.id.slice(1).padStart(3, '0')) === notification.employeeId
      );
      if (emp) {
        setActivePage('Employees');
        setSelectedEmployee(emp);
        setAutoOpenDocName(notification.documentName);
      }
    }
    setShowNotifications(false);
  }

  const handleMarkAllRead = () => {
    const roleUpper = currentUser.role.toUpperCase()
    const updatedNotifications = notifications.map(n => {
      if (n.targetRoles.includes(roleUpper) && !n.readBy.some(r => r.role === roleUpper)) {
        return {
          ...n,
          readBy: [...n.readBy, { role: roleUpper, readAt: new Date().toISOString() }]
        }
      }
      return n;
    });
    setNotifications(updatedNotifications);
    localStorage.setItem('empflow-notifications', JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event('storage'));
    showToast('Marked all as read');
  }

  return (
    <div className="min-h-screen bg-[#e9e8e1] p-3 text-slate-900 sm:p-6 lg:p-8">
      <aside className={`fixed bottom-8 left-8 top-8 z-50 hidden rounded-[22px] border border-white/80 bg-white shadow-[0_12px_30px_rgba(53,65,59,0.08)] transition-all duration-200 lg:flex lg:flex-col ${collapsed ? 'w-[68px]' : 'w-[232px]'}`}>
        <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#426759] text-white shadow-sm shadow-emerald-900/20"><Sparkles size={19} strokeWidth={2.5} /></div>
          {!collapsed && <div className="ml-3"><div className="text-[15px] font-bold tracking-tight text-slate-900">Emp<span className="text-indigo-600">Flow</span></div><div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">People operations</div></div>}
        </div>
        <div className="sidebar-scroll flex-1 overflow-x-hidden overflow-y-auto px-3 py-6">
          {!collapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
          <nav className="space-y-1">
            {filteredNavItems.map(({ label, icon: Icon, count }) => <button key={label} onClick={() => setActivePage(label)} title={collapsed ? label : undefined} className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${activePage === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={18} className={`shrink-0 ${activePage === label ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} /><>{!collapsed && <><span className="ml-3 flex-1">{label}</span>{count && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">{count}</span>}</>}{collapsed && <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{label}{count && <span className="ml-2 text-emerald-300">{count}</span>}</span>}</></button>)}
          </nav>
        </div>
        <div className="border-t border-slate-100 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#426759] text-[11px] font-semibold text-white">
                {currentUser.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{currentUser.designation}</p>
              </div>
              <button 
                onClick={handleLogout} 
                title="Log Out" 
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
          {collapsed && (
            <button 
              onClick={handleLogout} 
              title="Log Out" 
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut size={18} />
            </button>
          )}
          <button title={collapsed ? 'Collapse sidebar' : undefined} onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">{collapsed ? <Menu size={18} /> : <><ChevronRight size={16} className="rotate-180" /><span className="ml-2 text-xs">Collapse sidebar</span></>}</button>
        </div>
      </aside>
      {mobileMenuOpen && <div className="mobile-menu-overlay fixed inset-0 z-[100] bg-slate-900/30" onClick={() => setMobileMenuOpen(false)}><aside className="h-full w-[260px] bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#426759] text-white"><Sparkles size={18} /></div><span className="font-bold text-slate-900">Emp<span className="text-indigo-600">Flow</span></span></div><button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate-400"><X size={18} /></button></div><nav className="space-y-1">{filteredNavItems.map(({ label, icon: Icon, count }) => <button key={label} onClick={() => { setActivePage(label); setMobileMenuOpen(false) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium ${activePage === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><Icon size={18} /><span className="flex-1">{label}</span>{count && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700">{count}</span>}</button>)}</nav></aside></div>}

      <main className={`w-full transition-all duration-200 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[248px]'}`}>
        <header className={`sticky top-0 z-40 flex h-[76px] items-center justify-between border-0 bg-transparent px-4 transition-all duration-200 sm:px-7 ${isScrolled ? 'backdrop-blur-[2px] backdrop-saturate-100' : ''}`}>
          <div className="flex items-center gap-3">
            <button onPointerDown={() => setMobileMenuOpen(true)} onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation" className="mobile-menu-trigger rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden"><Menu size={20} /></button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400"><span>Workspace</span><ChevronRight size={13} /><span className="font-medium text-slate-600">{activePage}</span></div><h1 className="mt-0.5 text-[17px] font-bold tracking-tight text-slate-900">{activePage}</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-[#426759] focus:bg-white focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); setShowProfileMenu(false); }}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-1 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 animate-fade-in"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
                    {userNotifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      userNotifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-left transition hover:bg-slate-50 cursor-pointer ${n.unread ? 'bg-indigo-50/40' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] text-slate-800 ${n.unread ? 'font-bold' : 'font-medium'}`}>
                              {n.unread && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />}
                              {n.title}
                            </span>
                            <span className="text-[9px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-500 leading-normal font-normal">{n.message}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[9px] text-slate-400 capitalize">{n.documentType || 'General'} · Status: <span className={n.statusText === 'Approved' ? 'text-emerald-600 font-semibold' : n.statusText === 'Rejected' ? 'text-rose-500 font-semibold' : 'text-amber-600 font-semibold'}>{n.statusText}</span></span>
                            {n.actionRequired && n.unread && (
                              <span className="rounded bg-rose-50 px-1 py-0.5 text-[8px] font-bold text-rose-600 ring-1 ring-inset ring-rose-500/10">Action Required</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative hidden sm:block">
              <button 
                onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); setShowProfileMenu(false) }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <CircleHelp size={18} />
              </button>
              {showHelp && (
                <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-left space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Help & Information</span>
                    <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">×</button>
                  </div>
                  <div className="text-xs text-slate-600 space-y-2">
                    <p className="font-bold text-[10px] uppercase text-indigo-600 tracking-wider">Workspace Quick Guide</p>
                    <p className="leading-relaxed">Welcome to <b>EmpFlow</b>, your enterprise employee directory and lifecycle hub.</p>

                    <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                      Need further assistance? Contact <a href="mailto:support@empflow.local" className="text-indigo-600 underline">support@empflow.local</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100/50 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#426759] text-[11px] font-semibold text-white">
                  {currentUser.initials}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={13} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-2 pb-8 sm:p-5 sm:pb-8">
          {currentUser.role === 'Employee' ? (
            <EmployeeDashboard currentUser={currentUser} onAction={showToast} />
          ) : currentUser.role === 'Manager' ? (
            activePage === 'Employees' ? (
              <EmployeeDirectory search={search} onAction={showToast} currentUser={currentUser} employeeRecordsState={employeeRecordsState} departments={departments} designations={designations} onUpdateEmployee={handleUpdateEmployee} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} autoOpenDocName={autoOpenDocName} setAutoOpenDocName={setAutoOpenDocName} />
            ) : activePage === 'Reports' ? (
              <ModulePlaceholder page={activePage} onAction={showToast} />
            ) : activePage === 'Offboarding' ? (
              <OffboardingBoard offboardings={offboardings} />
            ) : (
              <ManagerDashboard onAction={showToast} />
            )
          ) : activePage === 'Employees' ? (
            <EmployeeDirectory search={search} onAction={showToast} currentUser={currentUser} employeeRecordsState={employeeRecordsState} departments={departments} designations={designations} onUpdateEmployee={handleUpdateEmployee} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} autoOpenDocName={autoOpenDocName} setAutoOpenDocName={setAutoOpenDocName} />
          ) : activePage === 'Onboarding' ? (
            <Onboarding onAction={showToast} />
          ) : activePage === 'Offboarding' ? (
            <OffboardingBoard offboardings={offboardings} />
          ) : activePage === 'Settings' ? (
            <AdminSettings onAction={showToast} departments={departments} setDepartments={setDepartments} designations={designations} setDesignations={setDesignations} employeeRecordsState={employeeRecordsState} onUpdateEmployeeRole={handleUpdateEmployeeRole} />
          ) : activePage !== 'Dashboard' ? (
            <ModulePlaceholder page={activePage} onAction={showToast} />
          ) : (
            <>
              <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1 text-[13px] font-medium text-indigo-600">{formattedDate}</p>
                  <h2 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[30px]">
                    {greeting}, {currentUser.name.split(' ')[0]} <span className="text-2xl">👋</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Here's what's happening across your employee lifecycle today.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast('Onboarding flow started')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#b9d0c1] hover:text-indigo-700"><UserPlus size={16} />Start onboarding</button>
                  <button onClick={() => showToast('Add employee form opened')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#426759] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#426759]/20 transition hover:bg-[#315447]"><Plus size={16} />Add employee</button>
                </div>
              </section>

              <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{dynamicKpis.map(({ label, value, note, icon: Icon, trend, iconClass }) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]"><div className="mb-4 flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}><Icon size={18} /></div>{trend === 'up' ? <ArrowUpRight size={16} className="text-emerald-500" /> : trend === 'down' ? <ArrowDownRight size={16} className="text-rose-400" /> : <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}</div><p className="text-[12px] font-medium text-slate-500">{label}</p><div className="mt-1 flex items-end justify-between"><span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span><span className={`text-[10px] font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>{note}</span></div></div>)}</section>

            <section className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Employee lifecycle overview</h3><p className="mt-1 text-xs text-slate-400">Current workforce distribution by stage</p></div><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View details <ChevronRight size={13} className="inline" /></button></div><div className="relative grid grid-cols-5 gap-1">{lifecycleStages.map(([stage, amount, bg, color], index) => <div key={stage} className="relative text-center"><div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${bg} ${color} text-lg font-bold ring-4 ring-white sm:h-16 sm:w-16`}>{amount}</div>{index < 4 && <div className="absolute left-[calc(50%+34px)] top-7 hidden h-px w-[calc(100%-52px)] bg-slate-200 sm:block" />}<p className="text-[10px] font-semibold text-slate-600 sm:text-[11px]">{stage}</p><p className="mt-1 text-[10px] text-slate-400">{index === 2 ? 'employees' : 'people'}</p></div>)}</div><div className="mt-7 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check size={14} /></div><span className="text-xs font-medium text-slate-600">Lifecycle health is looking good</span></div><span className="text-xs font-bold text-emerald-600">{Math.round((employeeRecords.filter((employee) => employee.status === 'Active').length / Math.max(1, totalEmployees)) * 100)}% on track</span></div></div><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Quick actions</h3><p className="mt-1 text-xs text-slate-400">Common HR workflows</p></div><MoreHorizontal size={17} className="text-slate-400" /></div><div className="grid grid-cols-2 gap-2.5">{[[UserPlus, 'Add employee', 'Create profile'], [ClipboardCheck, 'Start onboarding', 'Begin a workflow'], [Archive, 'Initiate relieving', 'Start exit process'], [FileText, 'Upload template', 'Add a document'], [Activity, 'Generate report', 'View insights'], [CalendarDays, 'View calendar', 'Upcoming events']].map(([Icon, title, subtitle]) => <button key={title} onClick={() => showToast(`${title} selected`)} className="group rounded-lg border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"><Icon size={17} className="mb-2 text-indigo-600" /><p className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-700">{title}</p><p className="mt-0.5 text-[10px] text-slate-400">{subtitle}</p></button>)}</div></div></section>

              <section className="mb-7 rounded-xl border border-slate-200 bg-white"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6"><div><h3 className="text-sm font-bold text-slate-900">Recent onboarding</h3><p className="mt-1 text-xs text-slate-400">Track your newest team members</p></div><div className="flex gap-2"><button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600"><Filter size={14} />Filter</button><button className="text-xs font-semibold text-indigo-600">View all <ChevronRight size={13} className="inline" /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3 font-semibold">Employee</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Joining date</th><th className="px-4 py-3 font-semibold">Progress</th><th className="px-4 py-3 font-semibold">Documents</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filteredEmployees.map((employee) => <tr key={employee.name} className="transition hover:bg-slate-50/70"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${employee.color}`}>{employee.initials}</div><span className="text-xs font-semibold text-slate-700">{employee.name}</span></div></td><td className="px-4 py-3.5 text-xs text-slate-500">{employee.department}</td><td className="px-4 py-3.5 text-xs text-slate-500">{employee.date}</td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${employee.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${employee.progress}%` }} /></div><span className="text-[10px] font-semibold text-slate-500">{employee.progress}%</span></div></td><td className="px-4 py-3.5 text-xs font-medium text-slate-500">{employee.docs}</td><td className="px-4 py-3.5"><StatusBadge status={employee.status} /></td><td className="px-4 py-3.5"><button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div></section>

              <section className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Employee growth</h3><p className="mt-1 text-xs text-slate-400">Total headcount over the last 6 months</p></div><button className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">Last 6 months <ChevronDown size={13} /></button></div><div className="flex h-44 items-end gap-3 border-b border-l border-slate-100 px-3 pb-0 pt-5 sm:gap-7"><div className="flex h-full flex-1 flex-col justify-between pb-5 text-[9px] text-slate-300"><span>260</span><span>240</span><span>220</span><span>200</span></div><div className="relative flex h-full flex-1 items-end justify-between gap-2 pb-5"><div className="absolute inset-x-0 top-[23%] border-t border-dashed border-slate-100" /><div className="absolute inset-x-0 top-[54%] border-t border-dashed border-slate-100" /><div className="absolute inset-x-0 top-[85%] border-t border-dashed border-slate-100" /><svg className="absolute inset-0 h-[calc(100%-20px)] w-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#426759" stopOpacity=".18" /><stop offset="1" stopColor="#426759" stopOpacity="0" /></linearGradient></defs><path d="M0,100 C60,95 70,76 120,82 S185,57 230,67 S295,43 335,50 S405,22 500,28 L500,120 L0,120Z" fill="url(#area)" /><path d="M0,100 C60,95 70,76 120,82 S185,57 230,67 S295,43 335,50 S405,22 500,28" fill="none" stroke="#426759" strokeLinecap="round" strokeWidth="3" /></svg>{['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month) => <span key={month} className="z-10 translate-y-5 text-[9px] text-slate-400">{month}</span>)}</div></div></div><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Onboarding status</h3><p className="mt-1 text-xs text-slate-400">Current workflow split</p></div><MoreHorizontal size={17} className="text-slate-400" /></div><div className="flex items-center gap-7"><div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: 'conic-gradient(#10b981 0 52%, #426759 52% 79%, #fbbf24 79% 100%)' }}><div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-bold text-slate-900">24</span><span className="text-[10px] text-slate-400">total</span></div></div><div className="space-y-3 text-xs"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-slate-500">Completed</span><b className="ml-3 text-slate-700">12</b></div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" /><span className="text-slate-500">In progress</span><b className="ml-3 text-slate-700">6</b></div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-slate-500">Pending</span><b className="ml-3 text-slate-700">6</b></div></div></div></div></section>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                    <div><h3 className="text-sm font-bold text-slate-900">Upcoming relieving</h3><p className="mt-1 text-xs text-slate-400">Employees exiting soon</p></div>
                    <button className="text-xs font-semibold text-indigo-600">View all <ChevronRight size={13} className="inline" /></button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {offboardings.slice(-3).map((process) => (
                      <div key={process.id} className="flex items-center justify-between gap-3 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {process.employee_name ? process.employee_name.split(' ').map((n) => n[0]).join('') : 'EE'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{process.employee_name || 'Employee'}</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">{process.department || 'Engineering'} · Last day {process.last_working_date}</p>
                          </div>
                        </div>
                        <StatusBadge status={process.status} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Pending tasks</h3><p className="mt-1 text-xs text-slate-400">Your attention is needed</p></div><span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600">4 open</span></div><div className="space-y-3">{tasks.map(({ icon: Icon, title, meta, priority, tone }) => <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone === 'rose' ? 'bg-rose-50 text-rose-500' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}><Icon size={15} /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-slate-700">{title}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{meta}</p></div><span className="hidden text-[10px] font-semibold text-slate-400 sm:block">{priority}</span><button onClick={() => showToast('Task marked for review')} className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600">Review</button></div>)}</div></div>
              </section>
            </>
          )}
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"><Check size={15} className="text-emerald-400" />{toast}<button onClick={() => setToast('')} className="ml-2 text-slate-400 hover:text-white"><X size={14} /></button></div>}
    </div>
  )
}

function OffboardingBoard({ offboardings }) {
  return <div className="mx-auto max-w-[1440px]">
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8794a8]">Employee lifecycle</p><h2 className="text-2xl font-bold tracking-tight text-slate-900">Offboarding</h2><p className="mt-1 text-sm text-slate-500">Manage employees leaving the organization.</p></div>
      <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">{offboardings.length} active processes</span>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {offboardings.map((process) => <article key={process.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ef] text-xs font-bold text-[#426759]">{(process.employee_name || 'Employee').split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><h3 className="text-sm font-bold text-slate-800">{process.employee_name || 'Employee'}</h3><p className="mt-1 text-xs text-slate-500">{process.department || 'Department'}</p></div></div><StatusBadge status={process.status} /></div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4"><div><p className="text-[10px] uppercase tracking-wide text-slate-400">Last working date</p><p className="mt-1 text-xs font-semibold text-slate-700">{process.last_working_date || 'Not set'}</p></div><div><p className="text-[10px] uppercase tracking-wide text-slate-400">Employee ID</p><p className="mt-1 text-xs font-semibold text-slate-700">{process.employee_id || '—'}</p></div></div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500"><Check size={14} className="text-[#426759]" />Exit process is being tracked</div>
      </article>)}
    </div>
  </div>
}

function ModulePlaceholder({ page, onAction }) {
  const content = { Employees: ['Employee directory', 'Manage profiles, departments and employee records in one place.', Users], Onboarding: ['Onboarding workspace', 'Track every new joiner from document collection to completion.', UserPlus], Offboarding: ['Offboarding & relieving', 'Manage clearances, exit interviews and relieving documents.', Archive], 'Template Management': ['Template management', 'Create reusable HR documents and map fields to employee data.', FileText], Reports: ['Reports & insights', 'Turn lifecycle data into clear, actionable workforce insights.', Activity], Settings: ['Workspace settings', 'Configure users, roles, departments and approval workflows.', Settings] }[page] || ['Dashboard', 'Your employee lifecycle workspace.', LayoutDashboard]
  const Icon = content[2]
  return <div className="flex min-h-[620px] items-center justify-center"><div className="max-w-md text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={28} /></div><h2 className="text-2xl font-bold tracking-tight text-slate-900">{content[0]}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{content[1]}</p><button onClick={() => onAction(`${page} module opened`)} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"><Plus size={16} />Create new</button></div></div>
}

function EmployeeDirectory({ search, onAction, currentUser, employeeRecordsState, departments, designations, onUpdateEmployee, selectedEmployee, setSelectedEmployee, autoOpenDocName, setAutoOpenDocName }) {
  const [department, setDepartment] = useState('All departments')
  const [status, setStatus] = useState('All statuses')
  const [page, setPage] = useState(1)

  useEffect(() => setPage(1), [search])

  const rows = employeeRecordsState.map((employee, index) => ({ ...employee, id: mockEmployeeIds[index] ? mockEmployeeIds[index].replace('EMP-', 'e') : employee.id })).filter((employee) => {
    const departmentName = departments.find((item) => item.id === employee.department_id)?.name || ''
    const matchesSearch = `${employee.name} ${employee.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = department === 'All departments' || departmentName === department
    const matchesStatus = status === 'All statuses' || employee.status === status
    const matchesTeam = currentUser?.role !== 'Manager' || employee.department_id === 'd1'
    return matchesSearch && matchesDepartment && matchesStatus && matchesTeam
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
    {selectedEmployee && <EmployeeProfileCard employee={selectedEmployee} onClose={() => { setSelectedEmployee(null); setAutoOpenDocName && setAutoOpenDocName(null); }} onAction={onAction} currentUser={currentUser} onUpdateEmployee={onUpdateEmployee} departments={departments} designations={designations} autoOpenDocName={autoOpenDocName} setAutoOpenDocName={setAutoOpenDocName} />}
  </div>
}

function EmployeeProfileCard({ employee, onClose, onAction, currentUser, onUpdateEmployee, departments, designations, autoOpenDocName, setAutoOpenDocName }) {
  const department = departments.find((item) => item.id === employee.department_id)?.name || '—'
  const designation = designations.find((item) => item.id === employee.designation_id)?.title || '—'
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
  const [profileViewerDoc, setProfileViewerDoc] = useState(null)

  const [showAuditLogs, setShowAuditLogs] = useState(false)
  const [showRejectionInput, setShowRejectionInput] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const employeeDocs = (() => {
    if (employee.name === 'Rahul Sharma') {
      try {
        const saved = localStorage.getItem('empflow-employee-documents')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return [
      { name: 'Offer Letter', type: 'Employment', status: 'Verified & Signed', date: '15 Jul 2026', file: 'offer_letter.pdf' },
      { name: 'Identity Proof (Aadhaar/PAN)', type: 'KYC', status: 'Verified', date: '16 Jul 2026', file: 'kyc.pdf' },
      { name: 'Bank Account & PAN details', type: 'Finance', status: 'Verified', date: '16 Jul 2026', file: 'bank_details.pdf' },
      { name: 'Non-Disclosure Agreement', type: 'Compliance', status: 'Pending Signature', date: 'Pending', file: 'nda.pdf' }
    ]
  })()

  useEffect(() => {
    if (autoOpenDocName) {
      setDocumentsOpen(true)
      const doc = employeeDocs.find(d => d.name === autoOpenDocName)
      if (doc) {
        setProfileViewerDoc(doc)
      }
    }
  }, [autoOpenDocName])

  const handleSave = () => {
    let desigId = employee.designation_id;
    const trimmedDesig = editDesignation.trim();
    if (trimmedDesig) {
      const existingDesig = designations.find(d => d.title.toLowerCase() === trimmedDesig.toLowerCase());
      if (existingDesig) {
        desigId = existingDesig.id;
      } else {
        desigId = 'de' + (designations.length + 1);
      }
    }
    const updated = {
      ...employee,
      name: editName,
      email: editEmail,
      phone: editPhone,
      designation_id: desigId,
      emergencyContactName: emergencyName,
      emergencyContactNumber: emergencyNumber,
      emergencyRelationship: emergencyRelationship,
      currentAddress: address,
      employmentType: employmentType,
      joiningDate: joiningDate,
    }
    onUpdateEmployee(updated, trimmedDesig);
    setEditOpen(false);
  }

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }

  const handleApprove = () => {
    const updatedDocs = employeeDocs.map(d => {
      if (d.name === profileViewerDoc.name) {
        return { ...d, status: 'Approved', verifiedBy: currentUser.role }
      }
      return d
    });
    
    if (employee.name === 'Rahul Sharma') {
      localStorage.setItem('empflow-employee-documents', JSON.stringify(updatedDocs));
    }
    
    const auditId = 'l_' + Date.now();
    const newAudit = {
      id: auditId,
      action: `${currentUser.role} approved ${profileViewerDoc.name} for ${employee.name}`,
      timestamp: formatDate(new Date()),
      user: currentUser.name,
      employeeId: employee.employeeId || 'EMP-1002'
    }
    
    try {
      const savedAudits = localStorage.getItem('empflow-audit-logs')
      const audits = savedAudits ? JSON.parse(savedAudits) : []
      audits.unshift(newAudit)
      localStorage.setItem('empflow-audit-logs', JSON.stringify(audits))
    } catch (e) { console.error(e) }

    const notifId1 = 'notif_' + Date.now() + '_1';
    const notifId2 = 'notif_' + Date.now() + '_2';
    
    const employeeNotif = {
      id: notifId1,
      type: "DOCUMENT_APPROVED",
      employeeId: employee.employeeId || 'EMP-1002',
      employeeName: employee.name,
      documentName: profileViewerDoc.name,
      documentType: profileViewerDoc.type,
      uploadedAt: new Date().toISOString(),
      status: "Approved",
      targetRoles: ["EMPLOYEE"],
      message: `Your ${profileViewerDoc.name} has been approved by ${currentUser.role}.`,
      readBy: [],
      actionRequired: false
    }

    const peerRole = currentUser.role === 'Admin' ? 'HR' : 'ADMIN';
    const peerNotif = {
      id: notifId2,
      type: "DOCUMENT_APPROVED",
      employeeId: employee.employeeId || 'EMP-1002',
      employeeName: employee.name,
      documentName: profileViewerDoc.name,
      documentType: profileViewerDoc.type,
      uploadedAt: new Date().toISOString(),
      status: "Approved",
      targetRoles: [peerRole],
      message: `${profileViewerDoc.name} submitted by ${employee.name} was approved by ${currentUser.role}.`,
      readBy: [],
      actionRequired: false
    }

    try {
      const savedNotifs = localStorage.getItem('empflow-notifications')
      const notifications = savedNotifs ? JSON.parse(savedNotifs) : []
      notifications.unshift(employeeNotif, peerNotif)
      localStorage.setItem('empflow-notifications', JSON.stringify(notifications))
    } catch (e) { console.error(e) }

    window.dispatchEvent(new Event('storage'));
    
    setProfileViewerDoc({ ...profileViewerDoc, status: 'Approved' });
    onAction?.(`${profileViewerDoc.name} approved successfully`);
  }

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) return;
    
    const updatedDocs = employeeDocs.map(d => {
      if (d.name === profileViewerDoc.name) {
        return { ...d, status: 'Rejected', rejectionReason: rejectionReason.trim(), verifiedBy: currentUser.role }
      }
      return d
    });
    
    if (employee.name === 'Rahul Sharma') {
      localStorage.setItem('empflow-employee-documents', JSON.stringify(updatedDocs));
    }
    
    const auditId = 'l_' + Date.now();
    const newAudit = {
      id: auditId,
      action: `${currentUser.role} rejected ${profileViewerDoc.name} for ${employee.name}. Reason: ${rejectionReason.trim()}`,
      timestamp: formatDate(new Date()),
      user: currentUser.name,
      employeeId: employee.employeeId || 'EMP-1002'
    }
    
    try {
      const savedAudits = localStorage.getItem('empflow-audit-logs')
      const audits = savedAudits ? JSON.parse(savedAudits) : []
      audits.unshift(newAudit)
      localStorage.setItem('empflow-audit-logs', JSON.stringify(audits))
    } catch (e) { console.error(e) }

    const notifId1 = 'notif_' + Date.now() + '_1';
    const notifId2 = 'notif_' + Date.now() + '_2';
    
    const employeeNotif = {
      id: notifId1,
      type: "DOCUMENT_REJECTED",
      employeeId: employee.employeeId || 'EMP-1002',
      employeeName: employee.name,
      documentName: profileViewerDoc.name,
      documentType: profileViewerDoc.type,
      uploadedAt: new Date().toISOString(),
      status: "Rejected",
      targetRoles: ["EMPLOYEE"],
      message: `Your ${profileViewerDoc.name} was rejected by ${currentUser.role}. Reason: ${rejectionReason.trim()}`,
      readBy: [],
      actionRequired: false
    }

    const peerRole = currentUser.role === 'Admin' ? 'HR' : 'ADMIN';
    const peerNotif = {
      id: notifId2,
      type: "DOCUMENT_REJECTED",
      employeeId: employee.employeeId || 'EMP-1002',
      employeeName: employee.name,
      documentName: profileViewerDoc.name,
      documentType: profileViewerDoc.type,
      uploadedAt: new Date().toISOString(),
      status: "Rejected",
      targetRoles: [peerRole],
      message: `${profileViewerDoc.name} submitted by ${employee.name} was rejected by ${currentUser.role}. Reason: ${rejectionReason.trim()}`,
      readBy: [],
      actionRequired: false
    }

    try {
      const savedNotifs = localStorage.getItem('empflow-notifications')
      const notifications = savedNotifs ? JSON.parse(savedNotifs) : []
      notifications.unshift(employeeNotif, peerNotif)
      localStorage.setItem('empflow-notifications', JSON.stringify(notifications))
    } catch (e) { console.error(e) }

    window.dispatchEvent(new Event('storage'));
    
    setProfileViewerDoc({ ...profileViewerDoc, status: 'Rejected', rejectionReason: rejectionReason.trim() });
    setShowRejectionInput(false);
    onAction?.(`${profileViewerDoc.name} rejected successfully`);
  }

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[2px]" onClick={onClose}>
    <div className="employee-profile-card relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="absolute right-16 top-6 z-10"><button aria-label="Employee actions" onClick={() => setMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white"><MoreVertical size={17} /></button>{menuOpen && <div className="absolute right-0 top-10 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{(currentUser?.role === 'Admin' || currentUser?.role === 'HR') && <button onClick={() => { setMenuOpen(false); setEditOpen(true) }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-[#edf3ef] hover:text-[#426759]">Edit</button>}<button onClick={() => { setMenuOpen(false); setDetailsOpen(true); onAction?.('Employee details viewed') }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-[#edf3ef] hover:text-[#426759]">View details</button><button onClick={() => { setMenuOpen(false); setDocumentsOpen(true) }} className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 transition hover:bg-[#edf3ef] hover:text-[#426759]">View documents</button></div>}</div>
      <div className="flex items-start justify-between bg-[#426759] p-6 text-white"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold">{employee.name.split(' ').map((name) => name[0]).join('')}</div><div><p className="text-xl font-bold">{employee.name}</p><p className="mt-1 text-xs text-emerald-100">{designation}</p></div></div><button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={18} /></button></div>
      <div className="grid gap-5 p-6 sm:grid-cols-2"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal information</p><div className="space-y-3"><EditableProfileField label="Full name" value={editName} editing={editOpen} onChange={setEditName} /><EditableProfileField label="Email address" value={editEmail} editing={editOpen} onChange={setEditEmail} /><EditableProfileField label="Phone number" value={editPhone} editing={editOpen} onChange={setEditPhone} /><ProfileField label="Employee ID" value={employee.employeeId || `EMP-${employee.id.slice(1).padStart(3, '0')}`} /></div></div><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employment information</p><div className="space-y-3"><ProfileField label="Department" value={department} /><EditableProfileField label="Designation" value={editDesignation} editing={editOpen} onChange={setEditDesignation} /><div className="flex items-center justify-between border-b border-slate-100 pb-2"><span className="text-xs text-slate-400">Current status</span><EmployeeStatusBadge status={employee.status} /></div></div></div></div>
      {detailsOpen && <div className="grid gap-5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:grid-cols-2"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact details</p><div className="space-y-3"><EditableProfileField label="Emergency contact" value={emergencyName} editing={editOpen} onChange={setEmergencyName} /><EditableProfileField label="Emergency number" value={emergencyNumber} editing={editOpen} onChange={setEmergencyNumber} /><EditableProfileField label="Relationship" value={emergencyRelationship} editing={editOpen} onChange={setEmergencyRelationship} /><EditableProfileField label="Address" value={address} editing={editOpen} onChange={setAddress} /></div></div><div><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional employment</p><div className="space-y-3"><EditableProfileField label="Employment type" value={employmentType} editing={editOpen} onChange={setEmploymentType} /><EditableProfileField label="Joining date" value={joiningDate} editing={editOpen} onChange={setJoiningDate} /></div></div></div>}
      <div className="flex items-end justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee activity</p><div className="flex flex-wrap gap-2"><button onClick={() => { setDetailsOpen(true); setDocumentsOpen(false); setShowAuditLogs(false); onAction?.('Viewing personal details history') }} className="rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.97] cursor-pointer">Profile created</button><button onClick={() => { setDocumentsOpen(true); setDetailsOpen(false); setShowAuditLogs(false); }} className="rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.97] cursor-pointer">Documents: {employeeDocs.length}</button><button onClick={() => { setShowAuditLogs(true); setDocumentsOpen(false); setDetailsOpen(false); }} className="rounded-full bg-white px-3 py-1.5 text-[11px] text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.97] cursor-pointer">View Audit History</button></div></div>{editOpen && <button onClick={handleSave} className="rounded-md bg-[#426759] px-3.5 py-2 text-xs font-semibold text-white shadow-sm cursor-pointer">Save changes</button>}</div>
      {editOpen && <div className="absolute inset-x-0 top-[101px] z-20 border-y border-slate-100 bg-white p-6 shadow-lg"><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Edit employee details</p><div className="grid gap-3 sm:grid-cols-2"><input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Full name" /><input value={editEmail} onChange={(event) => setEditEmail(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Email" /><input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Phone number" /><input value={editDesignation} onChange={(event) => setEditDesignation(event.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-xs" placeholder="Designation" /></div><button onClick={handleSave} className="mt-3 rounded-md bg-[#426759] px-3 py-2 text-xs font-semibold text-white cursor-pointer">Save changes</button></div>}
      
      {showAuditLogs && (
        <div className="border-t border-slate-100 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Employee Activity History / Audit Logs</p>
            <button onClick={() => setShowAuditLogs(false)} className="text-xs text-slate-400 cursor-pointer">Close</button>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-2.5 divide-y divide-slate-50">
            {(() => {
              let logs = [];
              try {
                const saved = localStorage.getItem('empflow-audit-logs');
                if (saved) {
                  const parsed = JSON.parse(saved);
                  if (Array.isArray(parsed)) {
                    logs = parsed;
                  }
                }
              } catch (e) {}
              
              const empId = employee.employeeId || 'EMP-1002';
              const filteredLogs = logs.filter(log => log.employeeId === empId || log.action.includes(employee.name));
              
              if (filteredLogs.length === 0) {
                return <div className="py-6 text-center text-xs text-slate-400">No activity logged for this employee.</div>
              }
              
              return filteredLogs.map((log) => (
                <div key={log.id} className="pt-2 text-xs flex justify-between gap-4 font-sans">
                  <div className="text-slate-600 leading-normal text-left">
                    • <span className="font-semibold text-slate-700">{log.action}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {documentsOpen && (
        <div className="border-t border-slate-100 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee documents</p>
            <button onClick={() => setDocumentsOpen(false)} className="text-xs text-slate-400 cursor-pointer">Close</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {employeeDocs.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">{doc.name}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{doc.type} · <span className={doc.status === 'Approved' ? 'text-emerald-600 font-semibold' : doc.status === 'Rejected' ? 'text-rose-500 font-semibold' : 'text-amber-600 font-semibold'}>{doc.status}</span></p>
                </div>
                <button 
                  onClick={() => { setProfileViewerDoc(doc); setShowRejectionInput(false); }} 
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition text-[10px] font-semibold cursor-pointer"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Profile Document Viewer Modal */}
      {profileViewerDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]" onClick={() => setProfileViewerDoc(null)}>
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">{profileViewerDoc.name}</h4>
              <button onClick={() => setProfileViewerDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            
            <div className="py-5 px-4 bg-slate-50 border border-slate-100 rounded-xl my-4 text-left max-h-[300px] overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed text-slate-600">
              <div className="text-center font-bold text-slate-800 text-xs border-b border-slate-200 pb-2 uppercase">
                EmpFlow Portal · {profileViewerDoc.name}
              </div>
              <div className="space-y-1">
                <p><b>Employee:</b> {employee.name}</p>
                <p><b>Category:</b> {profileViewerDoc.type}</p>
                <p><b>Issue Date:</b> {profileViewerDoc.date}</p>
                <p><b>Document Status:</b> <span className={profileViewerDoc.status === 'Approved' ? 'text-emerald-600 font-bold' : profileViewerDoc.status === 'Rejected' ? 'text-rose-500 font-bold' : 'text-amber-600 font-bold'}>{profileViewerDoc.status}</span></p>
                {profileViewerDoc.rejectionReason && <p className="text-rose-600"><b>Rejection Reason:</b> {profileViewerDoc.rejectionReason}</p>}
              </div>
              <div className="border-t border-slate-200 pt-3 text-[10px]">
                {profileViewerDoc.dataUrl && profileViewerDoc.dataUrl.startsWith('data:image/') ? (
                  <div className="text-center space-y-2">
                    <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Uploaded Image Preview</p>
                    <img src={profileViewerDoc.dataUrl} className="mx-auto max-h-[180px] rounded-lg border border-slate-200 shadow-sm" alt={profileViewerDoc.name} />
                  </div>
                ) : profileViewerDoc.name.includes('Offer Letter') ? (
                  <div className="space-y-2 font-sans text-xs">
                    <p>Dear {employee.name},</p>
                    <p>We are pleased to offer you employment at EmpFlow. Your joining date is set for {joiningDate}. You will report directly to Rohan Mehta.</p>
                    <p>Sincerely,<br/>Aditi Deshmukh (HR Department)</p>
                  </div>
                ) : profileViewerDoc.name.includes('Identity') || profileViewerDoc.type === 'KYC' ? (
                  <div className="space-y-2 font-sans text-xs">
                    <p><b>IDENTITY VERIFICATION RECORD</b></p>
                    <p>Permanent Account Number (PAN): XXXXX8827X</p>
                    <p>Aadhaar Card: XXXX-XXXX-4927</p>
                    <p className="text-emerald-600 font-bold">Status: Bio-metric verification succeeded via government portal.</p>
                  </div>
                ) : profileViewerDoc.name.includes('Bank') || profileViewerDoc.type === 'Finance' ? (
                  <div className="space-y-2 font-sans text-xs">
                    <p><b>SALARY ACCOUNT DISBURSEMENT RECORD</b></p>
                    <p>Bank Name: HDFC Bank Ltd</p>
                    <p>Account Number: XXXXXX9928192</p>
                    <p>IFSC Code: HDFC0000240</p>
                    <p className="text-emerald-600 font-bold">Status: Salary account active and connected to payroll system.</p>
                  </div>
                ) : (
                  <div className="space-y-2 font-sans text-xs">
                    <p><b>CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT</b></p>
                    <p>This agreement outlines the responsibilities regarding confidential and proprietary company assets, codebases, and customer information.</p>
                    <p className="text-amber-600 font-bold">Status: Verified & Stored copy.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin and HR Review Panel */}
            {(currentUser.role === 'Admin' || currentUser.role === 'HR') && (
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Review Action ({currentUser.role})</p>
                {showRejectionInput ? (
                  <div className="space-y-2">
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-rose-500 font-sans"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setShowRejectionInput(false)}
                        className="rounded px-2.5 py-1.5 text-[10px] font-semibold border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleConfirmReject}
                        className="rounded px-2.5 py-1.5 text-[10px] font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={handleApprove}
                      disabled={profileViewerDoc.status === 'Approved'}
                      className="rounded px-3 py-1.5 text-[10px] font-bold bg-[#426759] hover:bg-[#315447] disabled:opacity-40 text-white cursor-pointer"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => { setShowRejectionInput(true); setRejectionReason(''); }}
                      disabled={profileViewerDoc.status === 'Rejected'}
                      className="rounded px-3 py-1.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
 
            <div className="flex justify-end mt-4 border-t border-slate-100 pt-3">
              <button onClick={() => setProfileViewerDoc(null)} className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
