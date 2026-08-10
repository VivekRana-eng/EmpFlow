import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Search, Plus, FileText, Edit2, Trash2, Check, X, FileEdit, Users, Sparkles, HelpCircle, Eye, ArrowRight } from 'lucide-react'

const defaultTemplates = [
  {
    id: 'temp_1',
    name: 'Offer Letter Agreement',
    category: 'Employment',
    description: 'Standard employment offer letter detailing position, joining date, salary, and reporting structure.',
    content: `Ref: EMP-OFF-2026
Date: {{current_date}}

Dear {{employee_name}},

We are pleased to offer you employment at EmpFlow in the position of {{designation}}. You will be reporting directly to {{manager_name}}.

Your employment will commence on {{joining_date}}.
Your annual CTC will be {{salary_ctc}} per annum.

Please review this offer and sign below to signify your acceptance.

Sincerely,
Aditi Deshmukh
HR Operations Manager`
  },
  {
    id: 'temp_2',
    name: 'Non-Disclosure Agreement',
    category: 'Compliance',
    description: 'Confidentiality agreement protecting proprietary source code, credentials, and user data.',
    content: `NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT

This Agreement is entered into on {{current_date}} between EmpFlow and the Employee, {{employee_name}}, holding ID {{employee_id}}.

1. Confidential Information:
   The Employee agrees to keep confidential all proprietary source code, client records, passwords, and strategic operational plans of EmpFlow.
   
2. Term:
   This confidentiality obligation remains in effect indefinitely, even after termination of employment.
   
By signing this document, the Employee agrees to these terms.`
  },
  {
    id: 'temp_3',
    name: 'Clearance NOC',
    category: 'Offboarding',
    description: 'No Objection Certificate issued upon successful return of company laptop and assets.',
    content: `NO OBJECTION CERTIFICATE

Date: {{current_date}}

To Whom It May Concern,

This is to certify that {{employee_name}} (Employee ID: {{employee_id}}) was employed at EmpFlow as a {{designation}} from {{joining_date}} to {{exit_date}}.

All company property, including laptops and access keys, has been successfully returned, and there are no outstanding dues. EmpFlow has no objection to their future employment.

Sincerely,
Vikram Rana
Super Admin`
  }
]

const variableTags = [
  { key: 'employee_name', label: 'Employee Name', example: 'Rahul Sharma' },
  { key: 'employee_id', label: 'Employee ID', example: 'EMP-1002' },
  { key: 'designation', label: 'Designation', example: 'Senior Frontend Developer' },
  { key: 'joining_date', label: 'Joining Date', example: '01 Aug 2026' },
  { key: 'salary_ctc', label: 'Salary CTC', example: '₹12,00,000' },
  { key: 'manager_name', label: 'Manager Name', example: 'Rohan Mehta' },
  { key: 'exit_date', label: 'Exit Date', example: '10 Sep 2026' },
  { key: 'current_date', label: 'Current Date', example: '10 Aug 2026' }
]

export default function TemplateManagement({ currentUser, employeeRecordsState, departments, designations, showToast }) {
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-document-templates')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    } catch {}
    return defaultTemplates
  })

  useEffect(() => {
    localStorage.setItem('empflow-document-templates', JSON.stringify(templates))
  }, [templates])

  useEffect(() => {
    const shouldOpen = localStorage.getItem('empflow-auto-create-template')
    if (shouldOpen === 'true') {
      setActiveView('create')
      localStorage.removeItem('empflow-auto-create-template')
    }
  }, [])

  const [activeView, setActiveView] = useState('list') // 'list', 'edit', 'create'
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Creator/Editor Form States
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Employment')
  const [formDescription, setFormDescription] = useState('')
  const [formContent, setFormContent] = useState('')
  const textareaRef = useRef(null)

  // Generator Modal States
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false)
  const [selectedTemplateForGen, setSelectedTemplateForGen] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [customVars, setCustomVars] = useState({
    salary_ctc: '₹12,00,000',
    manager_name: 'Rohan Mehta',
    exit_date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  })

  const categories = ['All', 'Employment', 'Compliance', 'Offboarding', 'KYC', 'Finance']

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  const handleEditClick = (template) => {
    setEditingTemplate(template)
    setFormName(template.name)
    setFormCategory(template.category)
    setFormDescription(template.description)
    setFormContent(template.content)
    setActiveView('edit')
  }

  const handleCreateClick = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormCategory('Employment')
    setFormDescription('')
    setFormContent('')
    setActiveView('create')
  }

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updated = templates.filter(t => t.id !== id)
      setTemplates(updated)
      showToast('Template deleted successfully')
    }
  }

  const handleSaveForm = (e) => {
    e.preventDefault()
    if (!formName.trim() || !formContent.trim()) {
      showToast('Please fill out Name and Content')
      return
    }

    if (activeView === 'create') {
      const newTemplate = {
        id: 'temp_' + Date.now(),
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        content: formContent
      }
      setTemplates([...templates, newTemplate])
      showToast('Template created successfully')
    } else if (activeView === 'edit' && editingTemplate) {
      const updated = templates.map(t => {
        if (t.id === editingTemplate.id) {
          return {
            ...t,
            name: formName.trim(),
            category: formCategory,
            description: formDescription.trim(),
            content: formContent
          }
        }
        return t
      })
      setTemplates(updated)
      showToast('Template updated successfully')
    }

    setActiveView('list')
  }

  const insertVariable = (key) => {
    if (!textareaRef.current) return
    const txtarea = textareaRef.current
    const start = txtarea.selectionStart
    const end = txtarea.selectionEnd
    const text = txtarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    const tag = `{{${key}}}`
    const newVal = before + tag + after
    setFormContent(newVal)
    
    setTimeout(() => {
      txtarea.focus()
      txtarea.selectionStart = txtarea.selectionEnd = start + tag.length
    }, 0)
  }

  // Live variable preview resolver
  const resolvedContent = useMemo(() => {
    if (!selectedTemplateForGen) return ''
    const content = selectedTemplateForGen.content
    
    // Find selected employee
    const employee = employeeRecordsState.find(e => e.id === selectedEmployeeId)
    
    if (!content) return ''
    let resolved = content
    
    const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    
    // Standard mapping
    const empName = employee?.name || '[Employee Name]'
    const empId = employee ? (employee.employeeId || `EMP-${employee.id.slice(1).padStart(3, '0')}`) : '[Employee ID]'
    const matchedDesig = employee ? (designations.find(d => d.id === employee.designation_id)?.title || '—') : '[Designation]'
    const joiningDate = employee?.joiningDate || '[Joining Date]'
    
    const salary = customVars.salary_ctc || '₹12,00,000'
    const manager = customVars.manager_name || 'Rohan Mehta'
    const exitDate = customVars.exit_date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })

    resolved = resolved.replace(/\{\{employee_name\}\}/g, empName)
    resolved = resolved.replace(/\{\{employee_id\}\}/g, empId)
    resolved = resolved.replace(/\{\{designation\}\}/g, matchedDesig)
    resolved = resolved.replace(/\{\{joining_date\}\}/g, joiningDate)
    resolved = resolved.replace(/\{\{salary_ctc\}\}/g, salary)
    resolved = resolved.replace(/\{\{manager_name\}\}/g, manager)
    resolved = resolved.replace(/\{\{exit_date\}\}/g, exitDate)
    resolved = resolved.replace(/\{\{current_date\}\}/g, dateStr)
    
    return resolved
  }, [selectedTemplateForGen, selectedEmployeeId, customVars, employeeRecordsState, designations])

  const handleOpenGenerator = (template) => {
    setSelectedTemplateForGen(template)
    setSelectedEmployeeId(employeeRecordsState[0]?.id || '')
    setCustomVars({
      salary_ctc: '₹12,00,000',
      manager_name: 'Rohan Mehta',
      exit_date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    })
    setGeneratorModalOpen(true)
  }

  const handleGenerateAndPublish = () => {
    const employee = employeeRecordsState.find(e => e.id === selectedEmployeeId)
    if (!employee) {
      showToast('Please select a valid employee')
      return
    }

    const empName = employee.name
    const empIdStr = employee.employeeId || `EMP-${employee.id.slice(1).padStart(3, '0')}`

    const newDoc = {
      name: selectedTemplateForGen.name,
      type: selectedTemplateForGen.category || 'General',
      status: 'Pending Review',
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      file: selectedTemplateForGen.name.toLowerCase().replace(/\s+/g, '_') + '.pdf',
      resolvedContent: resolvedContent,
      generatedBy: currentUser.role
    }

    // Save to target employee documents store
    let savedDocsKey = 'empflow-employee-documents';
    if (empName !== 'Rahul Sharma') {
      savedDocsKey = `empflow-documents-${employee.id}`;
    }

    try {
      const saved = localStorage.getItem(savedDocsKey)
      const docs = saved ? JSON.parse(saved) : [
        { name: 'Offer Letter', type: 'Employment', status: 'Verified & Signed', date: '15 Jul 2026', file: 'offer_letter_rahul.pdf' },
        { name: 'Identity Proof (Aadhaar/PAN)', type: 'KYC', status: 'Verified', date: '16 Jul 2026', file: 'kyc_rahul.pdf' },
        { name: 'Bank Account & PAN details', type: 'Finance', status: 'Verified', date: '16 Jul 2026', file: 'bank_details_rahul.pdf' },
        { name: 'Non-Disclosure Agreement', type: 'Compliance', status: 'Pending Signature', date: 'Pending', file: 'nda_rahul.pdf' }
      ]
      
      const filteredDocs = docs.filter(d => d.name !== newDoc.name)
      filteredDocs.unshift(newDoc)
      localStorage.setItem(savedDocsKey, JSON.stringify(filteredDocs))
      if (empName === 'Rahul Sharma') {
        localStorage.setItem('empflow-employee-documents', JSON.stringify(filteredDocs))
      }
    } catch (e) {
      console.error(e)
    }

    // 2. Generate Notification for Employee
    const notifId = 'notif_gen_' + Date.now();
    const newNotif = {
      id: notifId,
      type: 'DOCUMENT_GENERATED',
      employeeId: empIdStr,
      employeeName: empName,
      documentName: selectedTemplateForGen.name,
      documentType: selectedTemplateForGen.category,
      uploadedAt: new Date().toISOString(),
      status: 'Pending Review',
      targetRoles: ['EMPLOYEE'],
      message: `A new document "${selectedTemplateForGen.name}" has been generated for your review and signature.`,
      readBy: [],
      actionRequired: true
    }

    try {
      const savedNotifs = localStorage.getItem('empflow-notifications')
      const notifications = savedNotifs ? JSON.parse(savedNotifs) : []
      notifications.unshift(newNotif)
      localStorage.setItem('empflow-notifications', JSON.stringify(notifications))
    } catch (e) { console.error(e) }

    // 3. Generate Audit Log
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    }

    const auditId = 'l_' + Date.now();
    const newAudit = {
      id: auditId,
      action: `${currentUser.role} generated document "${selectedTemplateForGen.name}" for ${empName}`,
      timestamp: formatDate(new Date()),
      user: currentUser.name,
      employeeId: empIdStr
    }
    
    try {
      const savedAudits = localStorage.getItem('empflow-audit-logs')
      const audits = savedAudits ? JSON.parse(savedAudits) : []
      audits.unshift(newAudit)
      localStorage.setItem('empflow-audit-logs', JSON.stringify(audits))
    } catch (e) { console.error(e) }

    window.dispatchEvent(new Event('storage'));
    setGeneratorModalOpen(false);
    showToast(`Successfully generated and published document for ${empName}`);
  }

  return (
    <div className="mx-auto max-w-[1440px] font-sans">
      {/* HEADER SECTION */}
      {activeView === 'list' && (
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-[13px] font-medium text-indigo-600">HR Toolkit</p>
            <h2 className="text-[26px] font-bold tracking-tight text-slate-900 text-left">Template Management</h2>
            <p className="mt-1 text-sm text-slate-500 text-left">Design, customize, and compile operational HR templates dynamically.</p>
          </div>
          <button 
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#426759] hover:bg-[#315447] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            Create Template
          </button>
        </div>
      )}

      {/* VIEW 1: TEMPLATE LIST */}
      {activeView === 'list' && (
        <div className="mt-6 space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, keyword or variables..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-[#426759] focus:ring-1 focus:ring-[#426759]/10"
              />
            </div>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${selectedCategory === cat ? 'bg-[#edf3ef] text-[#426759]' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TEMPLATE CARDS GRID */}
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <FileText size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No templates found</h3>
              <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or create a new template.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map(template => (
                <article 
                  key={template.id} 
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.015)] transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${template.category === 'Compliance' ? 'bg-amber-50 text-amber-700' : template.category === 'Offboarding' ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {template.category}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(template)}
                          title="Edit Template"
                          className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-[#426759] cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(template.id)}
                          title="Delete Template"
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-800 text-left">{template.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500 text-left">{template.description}</p>
                    
                    {/* Variables pill list */}
                    <div className="mt-4 flex flex-wrap gap-1 text-[9px]">
                      {(() => {
                        const matches = template.content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
                        const uniqueMatches = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
                        if (!uniqueMatches.length) return <span className="text-slate-400 italic text-left">No variables</span>;
                        return uniqueMatches.map(v => (
                          <span key={v} className="bg-slate-50 border border-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {v}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {template.content.length} chars
                    </span>
                    <button
                      onClick={() => handleOpenGenerator(template)}
                      className="inline-flex items-center gap-1 rounded bg-[#426759] hover:bg-[#315447] text-white px-3 py-1.5 text-[10px] font-bold tracking-wide transition cursor-pointer"
                    >
                      <Eye size={12} />
                      Use Template
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: EDITOR / CREATOR FORM */}
      {(activeView === 'edit' || activeView === 'create') && (
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="text-left">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <FileEdit size={18} className="text-[#426759]" />
                {activeView === 'create' ? 'Create New Template' : `Edit Template: ${editingTemplate?.name}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Define document properties, content and insert variables dynamically.</p>
            </div>
            <button 
              onClick={() => setActiveView('list')}
              className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Editor Text Fields */}
            <div className="space-y-4 text-left">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">Template Title</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Relieving and Experience Certificate"
                    className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs font-semibold outline-none transition focus:border-[#426759] focus:ring-1 focus:ring-[#426759]/10"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none transition focus:border-[#426759]"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">Brief Description</label>
                <input 
                  type="text" 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide a short overview of when this template should be used..."
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs font-medium outline-none transition focus:border-[#426759]"
                />
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">Template Content (Text/Markdown)</label>
                <textarea 
                  ref={textareaRef}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={14}
                  required
                  placeholder="Write the document body here. Use variable tags like {{employee_name}} to make it dynamic..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-mono outline-none transition focus:border-[#426759]"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="rounded-lg px-4 py-2.5 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg px-4 py-2.5 text-xs font-bold bg-[#426759] hover:bg-[#315447] text-white cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </div>

            {/* Helper Tags Sidebar */}
            <div className="space-y-4 text-left border-l border-slate-100 pl-6">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 text-left">
                  <Sparkles size={14} className="text-[#426759]" />
                  Dynamic Tags
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal text-left">
                  Click any tag below to insert it at your current cursor position inside the editor. These resolve automatically during compile time.
                </p>
              </div>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {variableTags.map(tag => (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => insertVariable(tag.key)}
                    className="flex flex-col w-full text-left rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:border-[#b9d0c1] hover:bg-[#edf3ef] transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-700 group-hover:text-[#426759] text-left">
                        {"{{"}{tag.key}{"}}"}
                      </span>
                      <span className="text-[9px] text-slate-400">Insert tag</span>
                    </div>
                    <div className="mt-1 text-[9px] text-slate-500 text-left">
                      <b>Matches:</b> {tag.label} (e.g. <i>{tag.example}</i>)
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-lg bg-indigo-50/50 border border-indigo-100/50 p-3.5 text-[10px] text-indigo-700 leading-normal flex items-start gap-2 text-left">
                <HelpCircle size={15} className="shrink-0 text-indigo-600 mt-0.5" />
                <div>
                  <b>Need Custom Variables?</b>
                  <p className="mt-0.5 text-indigo-600">You can use tags like <code>{"{{salary_ctc}}"}</code> or <code>{"{{manager_name}}"}</code> to define custom parameters which can be entered during generation!</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* GENERATOR MODAL */}
      {generatorModalOpen && selectedTemplateForGen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]" onClick={() => setGeneratorModalOpen(false)}>
          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={16} className="text-[#426759]" />
                  Generate Document: {selectedTemplateForGen.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Select an employee and fill custom values to build the final document.</p>
              </div>
              <button 
                onClick={() => setGeneratorModalOpen(false)}
                className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Split Panel */}
            <div className="flex-1 overflow-y-auto grid lg:grid-cols-2">
              {/* Inputs Column */}
              <div className="p-6 border-r border-slate-100 space-y-5 text-left">
                {/* Employee selector */}
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">
                    Select Target Employee
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs font-semibold outline-none transition focus:border-[#426759] focus:ring-2 focus:ring-[#edf3ef]"
                    >
                      {employeeRecordsState.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({designations.find(d => d.id === emp.designation_id)?.title || '—'} · ID: {emp.employeeId || `EMP-${emp.id.slice(1).padStart(3, '0')}`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional Custom Variables Inputs */}
                <div className="border-t border-slate-50 pt-4 space-y-4 text-left">
                  <h4 className="text-xs font-bold text-slate-700 text-left">Custom Template Parameters</h4>
                  
                  {/* Salary CTC */}
                  {selectedTemplateForGen.content.includes('{{salary_ctc}}') && (
                    <div className="text-left">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-left">
                        Salary CTC (per annum)
                      </label>
                      <input 
                        type="text" 
                        value={customVars.salary_ctc}
                        onChange={(e) => setCustomVars({ ...customVars, salary_ctc: e.target.value })}
                        placeholder="e.g. ₹12,00,000"
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#426759]"
                      />
                    </div>
                  )}

                  {/* Manager Name */}
                  {selectedTemplateForGen.content.includes('{{manager_name}}') && (
                    <div className="text-left">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-left">
                        Reporting Manager
                      </label>
                      <input 
                        type="text" 
                        value={customVars.manager_name}
                        onChange={(e) => setCustomVars({ ...customVars, manager_name: e.target.value })}
                        placeholder="e.g. Rohan Mehta"
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#426759]"
                      />
                    </div>
                  )}

                  {/* Exit Date */}
                  {selectedTemplateForGen.content.includes('{{exit_date}}') && (
                    <div className="text-left">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1 text-left">
                        Last Working Date
                      </label>
                      <input 
                        type="text" 
                        value={customVars.exit_date}
                        onChange={(e) => setCustomVars({ ...customVars, exit_date: e.target.value })}
                        placeholder="e.g. 15 Sep 2026"
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#426759]"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-[#edf3ef] border border-[#b9d0c1]/40 p-4 text-xs text-slate-600 leading-normal flex items-start gap-3 text-left">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#426759] text-white shrink-0 text-[10px] font-bold">✓</div>
                  <div className="text-left">
                    <b>Interconnected Action:</b>
                    <p className="mt-0.5 text-slate-500 text-left">
                      Generating this document compiles all placeholder values and publishes a copies-verified document directly to the employee's portal for review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Column */}
              <div className="p-6 bg-slate-50 flex flex-col justify-between h-[60vh] lg:h-auto text-left">
                <div className="flex-1 flex flex-col text-left">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 text-left">
                      <Eye size={12} />
                      Live Resolved Document Preview
                    </p>
                    <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                      Dynamic View
                    </span>
                  </div>
                  <div className="flex-1 border border-slate-200 rounded-xl bg-white p-5 font-mono text-[10px] leading-relaxed text-slate-600 text-left overflow-y-auto whitespace-pre-wrap max-h-[35vh] lg:max-h-[42vh]">
                    {resolvedContent}
                  </div>
                </div>

                {/* Modal Footer actions */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-end gap-2.5">
                  <button 
                    onClick={() => setGeneratorModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleGenerateAndPublish}
                    className="rounded-lg px-4 py-2 text-xs font-bold bg-[#426759] hover:bg-[#315447] text-white inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Generate & Publish
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
