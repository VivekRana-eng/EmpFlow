import React, { useState, useMemo, useEffect } from 'react'
import { Check, X, FileCheck2, Users, Activity, Clock, Filter, Eye, ChevronRight } from 'lucide-react'
import { initialEmployees, initialDepartments, initialDesignations } from '../../models/employeeModel'

export default function ManagerDashboard({ onAction }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  
  // Software Engineering team (department d1)
  const teamMembers = useMemo(() => {
    return initialEmployees.filter(emp => emp.department_id === 'd1')
  }, [])

  // Manage state of approvals dynamically
  const [approvals, setApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-approvals')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return [
      { id: 'ap1', name: 'Rahul Sharma', doc: 'Non-Disclosure Agreement', status: 'Pending', type: 'compliance' },
      { id: 'ap2', name: 'Arjun Sharma', doc: 'Bank account & PAN details', status: 'Pending', type: 'finance' },
      { id: 'ap3', name: 'Karan Patel', doc: 'Developer Asset Signoff', status: 'Pending', type: 'it' }
    ]
  })

  // Watch for resignation requests in localStorage to display to manager
  const [resignations, setResignations] = useState([])
  useEffect(() => {
    try {
      const savedOffboardings = localStorage.getItem('empflow-offboardings')
      if (savedOffboardings) {
        const offboardings = JSON.parse(savedOffboardings)
        // Managers only see pending exits for their team (e2 is Rahul Sharma)
        const teamExits = offboardings.filter(o => o.employee_id === 'e2')
        setResignations(teamExits)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('empflow-approvals', JSON.stringify(approvals))
  }, [approvals])

  const handleApproval = (id, approved) => {
    setApprovals(current => 
      current.map(app => app.id === id ? { ...app, status: approved ? 'Approved' : 'Rejected' } : app)
    )
    onAction(`Document ${approved ? 'approved' : 'rejected'} successfully`)
  }

  const handleResignationApproval = (id, approved) => {
    try {
      const saved = localStorage.getItem('empflow-offboardings')
      if (saved) {
        const list = JSON.parse(saved)
        const updated = list.map(item => {
          if (item.id === id) {
            return { ...item, status: approved ? 'Approved' : 'Rejected' }
          }
          return item
        })
        localStorage.setItem('empflow-offboardings', JSON.stringify(updated))
        setResignations(updated.filter(o => o.employee_id === 'e2'))
        onAction(`Resignation ${approved ? 'Approved' : 'Rejected'}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length + resignations.filter(r => r.status === 'Pending').length

  const getDeptName = (id) => initialDepartments.find(d => d.id === id)?.name || '—'
  const getDesigTitle = (id) => initialDesignations.find(d => d.id === id)?.title || '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-[13px] font-medium text-[#426759]">Team Dashboard</p>
          <h2 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[30px]">
            Good morning, Rohan <span className="text-2xl">👋</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">Manage Software Engineering team approvals, view records, and monitor performance.</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-200/60 p-1">
          {['Overview', 'My Team', 'Approvals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {tab === 'Approvals' && pendingApprovalsCount > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] text-white">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Areas */}
      {activeTab === 'Overview' && (
        <>
          {/* Team KPIs */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Team Headcount</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3ef] text-[#426759]">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 mt-2">{teamMembers.length}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Software Engineering department</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 mt-2">{pendingApprovalsCount}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Requires your review & e-sign</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Team Engagement</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Activity size={16} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 mt-2">96%</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Tasks & onboarding on-track</p>
            </div>
          </section>

          {/* Quick Team Status List */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Software Engineering Team Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Designation</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Onboarding Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {teamMembers.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                      <td className="py-3 font-semibold text-slate-700">{emp.name}</td>
                      <td className="py-3 text-slate-500">{getDesigTitle(emp.designation_id)}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>{emp.status}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div 
                              className={`h-full rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: emp.status === 'Active' ? '100%' : '50%' }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {emp.status === 'Active' ? '100%' : '50%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'My Team' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {teamMembers.map((emp) => (
            <div 
              key={emp.id} 
              onClick={() => setSelectedEmployee(emp)}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#426759] transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf3ef] text-sm font-bold text-[#426759]">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{getDesigTitle(emp.designation_id)}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#426759] transition" />
              </div>
              
              <div className="mt-4 border-t border-slate-50 pt-3 text-[10px] text-slate-500 space-y-1">
                <p>📧 <span className="font-medium">{emp.email}</span></p>
                <p>📞 <span className="font-medium">{emp.phone}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Approvals' && (
        <div className="space-y-4">
          {/* Documents Approvals */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Pending Document Approvals</h3>
            {approvals.filter(a => a.status === 'Pending').length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No pending document approvals.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {approvals.filter(a => a.status === 'Pending').map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{app.doc}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted by: <b>{app.name}</b></p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApproval(app.id, false)}
                        className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      >
                        <X size={14} />
                      </button>
                      <button 
                        onClick={() => handleApproval(app.id, true)}
                        className="p-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resignation Approvals */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Resignation / Offboarding Requests</h3>
            {resignations.filter(r => r.status === 'Pending').length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No pending team resignation requests.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {resignations.filter(r => r.status === 'Pending').map((res) => (
                  <div key={res.id} className="py-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Exit Request: {res.employee_name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Reason: {res.reason}</p>
                        <p className="text-[10px] text-slate-400">Requested Last Day: <b>{res.last_working_date}</b></p>
                        {res.comments && <p className="text-[10px] italic text-slate-500 mt-1">"{res.comments}"</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleResignationApproval(res.id, false)}
                          className="px-2.5 py-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold transition"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleResignationApproval(res.id, true)}
                          className="px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold transition"
                        >
                          Approve Exit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Detail Drawer/Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[2px]" onClick={() => setSelectedEmployee(null)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-[#426759] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{selectedEmployee.name}</h4>
                  <p className="text-[10px] text-emerald-100">{getDesigTitle(selectedEmployee.designation_id)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-white/80 hover:text-white font-bold text-lg">×</button>
            </div>
            
            <div className="p-5 text-xs space-y-3.5">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Employee ID</span>
                <span className="font-semibold text-slate-700">EMP-{selectedEmployee.id.slice(1).padStart(3, '0')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-700">{selectedEmployee.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold text-slate-700">{selectedEmployee.phone || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Department</span>
                <span className="font-semibold text-slate-700">{getDeptName(selectedEmployee.department_id)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Emergency Contact</span>
                <span className="font-semibold text-slate-700">{selectedEmployee.emergencyContactName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Relationship</span>
                <span className="font-semibold text-slate-700">{selectedEmployee.emergencyRelationship || '—'}</span>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedEmployee(null)} className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
