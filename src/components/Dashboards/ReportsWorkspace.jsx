import React, { useState, useMemo } from 'react'
import { Search, BarChart3, Users, Clock, ShieldCheck, Download, Calendar, Activity, ChevronDown, ListFilter, Code, Sparkles, Coins, Cpu } from 'lucide-react'

export default function ReportsWorkspace({ currentUser, employeeRecordsState, departments, designations, offboardings, showToast }) {
  const [reportType, setReportType] = useState('workforce') // 'workforce', 'documents', 'onboarding', 'audit'
  const [searchQuery, setSearchQuery] = useState('')

  // KPI Calculations
  const totalCount = employeeRecordsState.length
  const onboardingCount = employeeRecordsState.filter(e => e.status === 'Onboarding').length
  const activeCount = employeeRecordsState.filter(e => e.status === 'Active').length
  
  const complianceRate = useMemo(() => {
    // Read from localStorage to evaluate Rahul Sharma and others
    let totalDocs = 0
    let verifiedDocs = 0
    
    // Count Rahul Sharma docs
    try {
      const savedRahul = localStorage.getItem('empflow-employee-documents')
      if (savedRahul) {
        const docs = JSON.parse(savedRahul)
        totalDocs += docs.length
        verifiedDocs += docs.filter(d => d.status === 'Approved' || d.status === 'Verified' || d.status === 'Verified & Signed').length
      } else {
        totalDocs += 4
        verifiedDocs += 3 // Preloaded compliance
      }
    } catch {}
    
    // Fallback/standard preloads for compliance rate
    return totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 85
  }, [])

  // Department Headcount breakdown data
  const deptBreakdown = useMemo(() => {
    const counts = {}
    employeeRecordsState.forEach(emp => {
      const deptName = departments.find(d => d.id === emp.department_id)?.name || 'Other'
      counts[deptName] = (counts[deptName] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / Math.max(1, totalCount)) * 100)
    })).sort((a, b) => b.count - a.count)
  }, [employeeRecordsState, departments, totalCount])

  // Lifecycle Stages breakdown
  const lifecycleBreakdown = useMemo(() => {
    const stages = { Hiring: 2, Onboarding: onboardingCount, Active: activeCount, Exiting: offboardings.filter(o => o.status !== 'Completed').length }
    const total = Object.values(stages).reduce((a, b) => a + b, 0)
    return Object.entries(stages).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / Math.max(1, total)) * 100)
    }))
  }, [onboardingCount, activeCount, offboardings])

  // Build the active report tabular data
  const reportData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    
    if (reportType === 'workforce') {
      const data = employeeRecordsState.map(emp => {
        const dept = departments.find(d => d.id === emp.department_id)?.name || '—'
        const desig = designations.find(d => d.id === emp.designation_id)?.title || '—'
        return {
          'Employee ID': emp.employeeId || `EMP-${emp.id.slice(1).padStart(3, '0')}`,
          'Full Name': emp.name,
          'Email Address': emp.email,
          'Department': dept,
          'Designation': desig,
          'Employment Status': emp.status
        }
      })
      
      return data.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
      )
    } 
    
    if (reportType === 'documents') {
      // Load docs for primary test user Rahul Sharma
      let docs = []
      try {
        const saved = localStorage.getItem('empflow-employee-documents')
        if (saved) {
          docs = JSON.parse(saved).map(d => ({
            'Employee Name': 'Rahul Sharma',
            'Document Name': d.name,
            'Category': d.type,
            'Verification Status': d.status,
            'Verified By': d.verifiedBy || '—',
            'Issue Date': d.date
          }))
        } else {
          docs = [
            { 'Employee Name': 'Rahul Sharma', 'Document Name': 'Offer Letter', 'Category': 'Employment', 'Verification Status': 'Verified & Signed', 'Verified By': 'HR', 'Issue Date': '15 Jul 2026' },
            { 'Employee Name': 'Rahul Sharma', 'Document Name': 'Identity Proof (Aadhaar/PAN)', 'Category': 'KYC', 'Verification Status': 'Verified', 'Verified By': 'Admin', 'Issue Date': '16 Jul 2026' },
            { 'Employee Name': 'Rahul Sharma', 'Document Name': 'Bank Account & PAN details', 'Category': 'Finance', 'Verification Status': 'Verified', 'Verified By': 'Admin', 'Issue Date': '16 Jul 2026' },
            { 'Employee Name': 'Rahul Sharma', 'Document Name': 'Non-Disclosure Agreement', 'Category': 'Compliance', 'Verification Status': 'Pending Signature', 'Verified By': '—', 'Issue Date': 'Pending' }
          ]
        }
      } catch {}
      
      return docs.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
      )
    }

    if (reportType === 'onboarding') {
      // Seed pipeline statistics
      const pipelines = [
        { 'Employee Name': 'Rahul Sharma', 'Department': 'Engineering', 'Joining Date': '12 Aug 2026', 'Step Progress': '80%', 'Status': 'In Progress' },
        { 'Employee Name': 'Priya Singh', 'Department': 'Human Resources', 'Joining Date': '14 Aug 2026', 'Step Progress': '100%', 'Status': 'Completed' },
        { 'Employee Name': 'Aman Verma', 'Department': 'Finance', 'Joining Date': '18 Aug 2026', 'Step Progress': '45%', 'Status': 'Pending' }
      ]
      return pipelines.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
      )
    }

    if (reportType === 'audit') {
      let logs = []
      try {
        const saved = localStorage.getItem('empflow-audit-logs')
        if (saved) {
          logs = JSON.parse(saved).map(l => ({
            'Timestamp': l.timestamp,
            'Activity Detail': l.action,
            'Performed By': l.user,
            'Employee Reference': l.employeeId || '—'
          }))
        } else {
          logs = [
            { 'Timestamp': '10 Aug 2026, 07:00', 'Activity Detail': 'System setup completed successfully.', 'Performed By': 'System', 'Employee Reference': '—' },
            { 'Timestamp': '10 Aug 2026, 07:05', 'Activity Detail': 'Preloaded company records with 5 core departments, 8 primary designations, and 9 employees.', 'Performed By': 'Admin', 'Employee Reference': '—' },
            { 'Timestamp': '10 Aug 2026, 07:10', 'Activity Detail': 'Active directory directory accounts verified for Super Admin.', 'Performed By': 'System', 'Employee Reference': '—' }
          ]
        }
      } catch {}
      return logs.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
      )
    }

    return []
  }, [reportType, searchQuery, employeeRecordsState, departments, designations])

  // Export CSV Handler
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      showToast('No records available to export')
      return
    }

    const headers = Object.keys(reportData[0])
    const csvRows = [
      headers.join(','), // Header row
      ...reportData.map(row => 
        headers.map(header => {
          const val = row[header] ? String(row[header]).replace(/"/g, '""') : ''
          return `"${val}"`
        }).join(',')
      )
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', `empflow_${reportType}_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Report CSV downloaded successfully')
  }

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-[13px] font-medium text-indigo-600">HR Workspace</p>
          <h2 className="text-[26px] font-bold tracking-tight text-slate-900 text-left">Reports & Insights</h2>
          <p className="mt-1 text-sm text-slate-500 text-left">Monitor workforce operational health, verification rates, and export structured audits.</p>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY RESPONSIVE GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.015)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Users size={18} /></div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+4.8% MoM</span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left">Active Headcount</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 text-left">{activeCount} / {totalCount}</h3>
          <p className="text-[10px] text-slate-400 mt-1 text-left">{onboardingCount} onboarding processes</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.015)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock size={18} /></div>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Optimized</span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left">Avg. Onboarding</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 text-left">4.2 days</h3>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.015)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck size={18} /></div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Secure</span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left">File Compliance Rate</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 text-left">{complianceRate}%</h3>
          <p className="text-[10px] text-slate-400 mt-1 text-left">Pending reviews highlighted</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.015)]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600"><Activity size={18} /></div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">Annualized</span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left">Attrition Rate</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 text-left">5.2%</h3>
          <p className="text-[10px] text-slate-400 mt-1 text-left">Industry avg: 12%</p>
        </div>
      </div>

      {/* GRAPHICAL breakdown ROW (RESPONSIVE SPLIT) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Department Headcount Bars */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.015)] text-left">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900">Workforce by Department</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Headcount allocation per functional block</p>
          </div>
          <div className="space-y-4">
            {deptBreakdown.map(dept => {
              const getDeptIcon = (name) => {
                if (name.includes('Engineering') || name.includes('Software')) return <div className="p-2 bg-[#edf3ef] rounded-lg shrink-0"><Code size={14} className="text-[#426759]" /></div>
                if (name.includes('Resources') || name.includes('HR')) return <div className="p-2 bg-indigo-50 rounded-lg shrink-0"><Users size={14} className="text-indigo-600" /></div>
                if (name.includes('Product') || name.includes('Design')) return <div className="p-2 bg-amber-50 rounded-lg shrink-0"><Sparkles size={14} className="text-amber-600" /></div>
                if (name.includes('Finance') || name.includes('Treasury')) return <div className="p-2 bg-emerald-50 rounded-lg shrink-0"><Coins size={14} className="text-emerald-600" /></div>
                return <div className="p-2 bg-slate-50 rounded-lg shrink-0"><Cpu size={14} className="text-slate-600" /></div>
              }
              
              return (
                <div key={dept.name} className="flex items-center gap-3.5 group">
                  {getDeptIcon(dept.name)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700 transition-colors group-hover:text-[#426759] truncate">{dept.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50 shrink-0">
                        {dept.count} pax ({dept.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className="h-full bg-gradient-to-r from-[#426759] to-[#629f87] rounded-full transition-all duration-1000 ease-out shadow-[0_1px_3px_rgba(66,103,89,0.15)] group-hover:shadow-[0_1px_6px_rgba(66,103,89,0.3)] group-hover:scale-y-[1.1]" 
                        style={{ width: `${dept.pct}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lifecycle Stages Circular Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.015)] text-left flex flex-col justify-between">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900">Lifecycle Stage Distribution</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Distribution of people across operational stages</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            {lifecycleBreakdown.map(stage => {
              const radius = 26
              const circumference = 2 * Math.PI * radius
              const strokeDashoffset = circumference - (stage.pct / 100) * circumference
              
              const colorConfig = {
                Hiring: { from: '#4f46e5', to: '#6366f1', text: 'text-indigo-600' },
                Onboarding: { from: '#d946ef', to: '#f43f5e', text: 'text-pink-600' },
                Active: { from: '#10b981', to: '#059669', text: 'text-emerald-600' },
                Exiting: { from: '#f59e0b', to: '#ea580c', text: 'text-amber-600' }
              }[stage.name] || { from: '#64748b', to: '#475569', text: 'text-slate-600' }

              return (
                <div 
                  key={stage.name} 
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-slate-50 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden"
                >
                  <div className={`absolute -right-6 -bottom-6 w-14 h-14 rounded-full opacity-[0.03] blur-lg transition-all duration-500 group-hover:scale-150 ${colorConfig.text}`} />
                  
                  <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <defs>
                        <linearGradient id={`grad_${stage.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={colorConfig.from} />
                          <stop offset="100%" stopColor={colorConfig.to} />
                        </linearGradient>
                      </defs>
                      <circle cx="32" cy="32" r={radius} stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r={radius} 
                        stroke={`url(#grad_${stage.name})`} 
                        strokeWidth="4.5" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{
                          transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[11px] font-bold text-slate-800 tracking-tight">{stage.pct}%</span>
                      <span className="text-[8px] font-mono font-medium text-slate-400">{stage.count} pax</span>
                    </div>
                  </div>
                  <span className="mt-3 text-[10.5px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">
                    {stage.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* INTERACTIVE REPORTS BUILDER W/ EXPORT */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.015)]">
        {/* Builder Toolbar */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Report Selector */}
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setSearchQuery(''); }}
                className="appearance-none h-9 rounded-lg border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold outline-none focus:border-[#426759] cursor-pointer"
              >
                <option value="workforce">Workforce Directory</option>
                <option value="documents">Document Verification Audits</option>
                <option value="onboarding">Onboarding Progress Pipelines</option>
                <option value="audit">Audit Log Actions</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none text-slate-400" />
            </div>
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matching cells..."
                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-[#426759]"
              />
            </div>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm cursor-pointer transition"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Dynamic Table Card (Horizontal Scroll Support) */}
        {reportData.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ListFilter size={32} className="text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No matching records</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Try widening your search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  {Object.keys(reportData[0]).map(header => (
                    <th key={header} className="px-6 py-3 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, index) => (
                  <tr key={index} className="transition hover:bg-slate-50/50">
                    {Object.values(row).map((val, cellIdx) => (
                      <td key={cellIdx} className="px-6 py-3.5 whitespace-nowrap">
                        {String(val) === 'Active' || String(val) === 'Completed' || String(val) === 'Approved' || String(val) === 'Verified' || String(val) === 'Verified & Signed' ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{val}</span>
                        ) : String(val) === 'Onboarding' || String(val) === 'In Progress' || String(val) === 'Pending Review' ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{val}</span>
                        ) : String(val) === 'Pending' || String(val) === 'Pending Signature' || String(val) === 'Draft' ? (
                          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{val}</span>
                        ) : (
                          <span className="font-medium text-slate-700">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
