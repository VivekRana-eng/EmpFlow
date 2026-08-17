import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, ShieldAlert, Sparkles, FolderLock, ListCollapse, Check } from 'lucide-react'
import { initialDepartments, initialDesignations } from '../../models/employeeModel'

export default function AdminSettings({ onAction, themeColor, setThemeColor, departments: depts, setDepartments: setDepts, designations: desigs, setDesignations: setDesigs, employeeRecordsState, onUpdateEmployeeRole }) {
  const [subTab, setSubTab] = useState('Users & Roles')
  
  // Users list mapped dynamically from employeeRecordsState
  const users = (employeeRecordsState || []).map(emp => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role || (emp.name === 'Vikram Rana' ? 'Admin' : emp.name === 'Aditi Deshmukh' ? 'HR' : emp.name === 'Rohan Mehta' ? 'Manager' : 'Employee')
  }))

  // Workflows list
  const [workflows, setWorkflows] = useState([
    { id: 'wf1', name: 'Standard Onboarding Approval', stages: ['HR Review', 'IT Provisioning', 'Manager E-Sign'], active: true },
    { id: 'wf2', name: 'Executive Onboarding Approval', stages: ['HR Review', 'IT Provisioning', 'CFO Signoff', 'CEO Welcome'], active: true },
    { id: 'wf3', name: 'Standard Resignation Relief', stages: ['Manager Approval', 'IT Asset Verification', 'HR Exit Interview'], active: true }
  ])

  // User Management
  const handleRoleChange = (userId, newRole) => {
    onUpdateEmployeeRole(userId, newRole)
  }

  // Department CRUD
  const [newDeptName, setNewDeptName] = useState('')
  const addDept = (e) => {
    e.preventDefault()
    if (!newDeptName.trim()) return
    const newDept = { id: 'd' + (depts.length + 1), name: newDeptName.trim() }
    setDepts([...depts, newDept])
    setNewDeptName('')
    onAction(`Department "${newDept.name}" added`)
  }
  const deleteDept = (id) => {
    const dept = depts.find(d => d.id === id)
    setDepts(depts.filter(d => d.id !== id))
    onAction(`Department "${dept?.name}" deleted`)
  }

  // Designation CRUD
  const [newDesigTitle, setNewDesigTitle] = useState('')
  const addDesig = (e) => {
    e.preventDefault()
    if (!newDesigTitle.trim()) return
    const newDesig = { id: 'de' + (desigs.length + 1), title: newDesigTitle.trim() }
    setDesigs([...desigs, newDesig])
    setNewDesigTitle('')
    onAction(`Designation "${newDesig.title}" added`)
  }
  const deleteDesig = (id) => {
    const desig = desigs.find(d => d.id === id)
    setDesigs(desigs.filter(d => d.id !== id))
    onAction(`Designation "${desig?.title}" deleted`)
  }

  // Workflow toggle
  const toggleWorkflow = (id) => {
    setWorkflows(curr => curr.map(w => w.id === id ? { ...w, active: !w.active } : w))
    onAction(`Workflow status updated`)
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <p className="mb-1 text-[13px] font-medium text-[#426759]">System Configuration</p>
        <h2 className="text-[26px] font-bold tracking-tight text-slate-900">Admin Control Center</h2>
        <p className="mt-1 text-sm text-slate-500">Configure global organizational variables, users, and automated workflows.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {['Users & Roles', 'Organization Master', 'Approval Workflows', 'Appearance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`pb-3 text-xs font-bold transition border-b-2 px-1 relative ${
              subTab === tab 
                ? 'theme-accent-border theme-accent-text text-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'Appearance' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-800">Navigation & tab colors</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">Choose an accent that fits your team. It applies to active navigation, tabs, badges, and key actions.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold text-slate-600">Accent presets</p>
              <div className="flex flex-wrap gap-2.5">
                {[['Sage', '#426759'], ['Ocean', '#2563eb'], ['Violet', '#7c3aed'], ['Rose', '#db2777'], ['Amber', '#d97706']].map(([name, color]) => (
                  <button key={name} onClick={() => setThemeColor(color)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${themeColor.toLowerCase() === color ? 'border-slate-800 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />{name}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              Custom color
              <input aria-label="Custom navigation color" type="color" value={themeColor} onChange={(event) => setThemeColor(event.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
            </label>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: themeColor }} />
            Your selected color is saved automatically for this workspace.
          </div>
        </div>
      )}

      {/* Panels */}
      {subTab === 'Users & Roles' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">User & Role Directory</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Control employee authorization levels</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email ID</th>
                  <th className="py-3 text-right pr-6">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 font-semibold text-slate-700">{user.name}</td>
                    <td className="py-3 text-slate-400">{user.email}</td>
                    <td className="py-3 text-right">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-[#426759]"
                      >
                        <option value="Admin">👑 Admin</option>
                        <option value="HR">👨💼 HR</option>
                        <option value="Manager">👨💻 Manager</option>
                        <option value="Employee">👤 Employee</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'Organization Master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Department Master */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Department Master</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Create and delete organizational divisions</p>
            </div>

            <form onSubmit={addDept} className="flex gap-2">
              <input
                type="text"
                required
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g. Sales & Marketing"
                className="h-9 flex-1 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#426759]"
              />
              <button type="submit" className="h-9 flex items-center justify-center gap-1.5 rounded-xl bg-[#426759] px-3.5 text-xs font-semibold text-white hover:bg-[#315447]">
                <Plus size={14} /> Add
              </button>
            </form>

            <div className="max-h-[220px] overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50">
              {depts.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50">
                  <span className="font-semibold text-slate-700">{d.name}</span>
                  <button 
                    onClick={() => deleteDept(d.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Designation Master */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Designation Master</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Define corporate job titles</p>
            </div>

            <form onSubmit={addDesig} className="flex gap-2">
              <input
                type="text"
                required
                value={newDesigTitle}
                onChange={(e) => setNewDesigTitle(e.target.value)}
                placeholder="e.g. Senior Business Analyst"
                className="h-9 flex-1 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#426759]"
              />
              <button type="submit" className="h-9 flex items-center justify-center gap-1.5 rounded-xl bg-[#426759] px-3.5 text-xs font-semibold text-white hover:bg-[#315447]">
                <Plus size={14} /> Add
              </button>
            </form>

            <div className="max-h-[220px] overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50">
              {desigs.map((de) => (
                <div key={de.id} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50">
                  <span className="font-semibold text-slate-700">{de.title}</span>
                  <button 
                    onClick={() => deleteDesig(de.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {subTab === 'Approval Workflows' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Approval Workflow Configuration</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Automate document compliance and offboarding authorizations</p>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{wf.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    {wf.stages.map((stage, idx) => (
                      <React.Fragment key={stage}>
                        <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          {stage}
                        </span>
                        {idx < wf.stages.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${wf.active ? 'text-[#426759]' : 'text-slate-400'}`}>
                    {wf.active ? 'Active' : 'Deactivated'}
                  </span>
                  <button 
                    onClick={() => toggleWorkflow(wf.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      wf.active ? 'bg-[#426759]' : 'bg-slate-200'
                    }`}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        wf.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
