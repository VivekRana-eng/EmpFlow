import { useEffect, useState } from 'react'
import { Check, Plus, Search, ShieldCheck } from 'lucide-react'

const initialEmployees = [
  { name: 'Nisha Verma', initials: 'NV', date: '2026-07-15', status: 'In Progress', employeeId: 'EMP-4821' },
  { name: 'Sara Khan', initials: 'SK', date: '2026-07-21', status: 'Pending Approval', employeeId: 'EMP-7364' },
  { name: 'Vivek Rana', initials: 'VR', date: '2026-07-24', status: 'In Progress', employeeId: 'EMP-1947' },
  { name: 'Aditi Deshmukh', initials: 'AD', date: '2026-07-28', status: 'Draft', employeeId: 'EMP-6083' },
  { name: 'Rahul Sharma', initials: 'RS', date: '2026-08-01', status: 'In Progress', employeeId: 'EMP-2759' },
]

const documents = [
  { name: 'Identity proof', hint: 'Document to collect', status: 'Verified', complete: true },
  { name: 'Bank details', hint: 'Document to collect', status: 'Verified', complete: true },
  { name: 'Offer Letter', hint: 'Document to generate', status: 'Signed', complete: true, action: 'View' },
  { name: 'NDA Agreement', hint: 'Document to generate', status: 'Pending', complete: false, action: 'Generate' },
]

function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-[#edf3ef] text-[#426759]',
    amber: 'bg-[#fff3dc] text-[#bd7100]',
    green: 'bg-[#e5f7f0] text-[#138564]',
    slate: 'bg-[#f1f3f6] text-[#7a8797]',
  }
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>
}

function Step({ number, label, active, done }) {
  return <div className="relative flex min-w-0 flex-1 flex-col items-center">
    <div className={`z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full border text-[11px] font-medium ${done ? 'border-[#426759] bg-[#426759] text-white' : active ? 'border-[#eea528] bg-white text-[#df9219]' : 'border-[#d5dce6] bg-white text-[#9aa6b7]'}`}>{done ? <Check size={13} strokeWidth={3} /> : number}</div>
    <span className={`mt-2 text-[10px] font-medium ${done ? 'text-[#426759]' : active ? 'text-[#e09a25]' : 'text-[#8490a1]'}`}>{label}</span>
  </div>
}

export default function Onboarding({ onAction }) {
  const [employees, setEmployees] = useState(() => {
    try {
      const savedEmployees = JSON.parse(localStorage.getItem('empflow-employees'))
      if (Array.isArray(savedEmployees) && savedEmployees.length) {
        const savedNames = new Set(savedEmployees.map((employee) => employee.name))
        const missingMockEmployees = initialEmployees.filter((employee) => !savedNames.has(employee.name))
        return normalizeEmployees([...savedEmployees, ...missingMockEmployees].slice(0, initialEmployees.length))
      }
      return normalizeEmployees(initialEmployees)
    } catch { return initialEmployees }
  })
  const [selected, setSelected] = useState('Sara Khan')
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('empflow-document-checks')) || documents.map((item) => item.complete) } catch { return documents.map((item) => item.complete) }
  })
  const [modal, setModal] = useState(null)
  const [approvalRequested, setApprovalRequested] = useState(() => {
    try { return JSON.parse(localStorage.getItem('empflow-approval-requested')) || false } catch { return false }
  })
  const current = employees.find((employee) => employee.name === selected) || employees[0] || initialEmployees[1]
  const currentDetails = current?.draft || {}
  const completedDocuments = checked.filter(Boolean).length
  const progress = Math.round((completedDocuments / documents.length) * 100)

  useEffect(() => localStorage.setItem('empflow-employees', JSON.stringify(employees)), [employees])
  useEffect(() => localStorage.setItem('empflow-document-checks', JSON.stringify(checked)), [checked])
  useEffect(() => localStorage.setItem('empflow-approval-requested', JSON.stringify(approvalRequested)), [approvalRequested])

  const toggleDocument = (index) => {
    setChecked((items) => items.map((value, itemIndex) => itemIndex === index ? !value : value))
    onAction?.(`${documents[index].name} updated`)
  }

  return <div className="onboarding-page min-h-screen bg-[#e9e8e1] px-5 py-3.5 text-[#10233e] sm:px-7 lg:px-5">
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8794a8]">New hire journey</p>
          <h1 className="text-[27px] font-bold leading-none tracking-[-0.035em] text-[#0d1f39]">Onboarding</h1>
          <p className="mt-2 text-sm text-[#8290a3]">Guide new team members from offer to their first day.</p>
        </div>
        <button onClick={() => setModal({ type: 'initiate' })} className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-[#426759] px-4 text-[11px] font-semibold text-white shadow-[0_4px_9px_rgba(66,103,89,.2)] transition hover:bg-[#315447]"><Plus size={15} />Initiate onboarding</button>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="rounded-[11px] border border-[#e0e6ee] bg-white px-3 py-3.5 lg:min-h-[628px]">
          <div className="flex items-start justify-between px-1.5">
            <div><h2 className="text-[14px] font-bold text-[#11243f]">Active processes</h2><p className="mt-1 text-xs text-[#8a96a7]">{employees.length} processes in progress</p></div>
            <Search size={17} className="mt-1 text-[#8998ad]" />
          </div>
          <div className="mt-6 space-y-1.5">
            {employees.map((employee) => <button key={employee.name} onClick={() => { setSelected(employee.name); if (employee.status === 'Draft') setModal({ type: 'initiate', draft: employee.draft }) }} className={`flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-left transition ${selected === employee.name ? 'bg-[#edf3ef]' : 'hover:bg-slate-50'}`}>
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#edf3ef] text-[10px] font-semibold text-[#426759]">{employee.initials}</span>
              <span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-[#182c48]">{employee.name}</span><span className="mt-1 block text-[10px] text-[#8997aa]">Started · {employee.date}</span></span>
              <Badge tone={employee.status === 'Pending Approval' ? 'amber' : 'blue'}>{employee.status}</Badge>
            </button>)}
          </div>
        </aside>

        <section className="rounded-[11px] border border-[#e0e6ee] bg-white px-5 py-5 sm:px-5 lg:min-h-[628px]">
          {modal?.type === 'initiate' ? <OnboardingForm employeeId={createEmployeeId(employees)} initialData={modal.draft} onClose={() => setModal(null)} onCreated={(employee) => { setEmployees((items) => items.some((item) => item.name === employee.name) ? items.map((item) => item.name === employee.name ? employee : item) : [...items, employee]); setSelected(employee.name); setModal(null); onAction?.('Onboarding created') }} /> : <>
          <div className="flex items-start justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8794a8]">Onboarding process</p><h2 className="mt-2 text-[22px] font-bold leading-none text-[#11243f]">{current.name}</h2><p className="mt-2 text-sm text-[#8391a4]">{currentDetails.designation || 'Software Engineer'} · {currentDetails.department || 'Engineering'}</p><p className="mt-1 text-[10px] text-[#9aa6b4]">{current.employeeId || 'Employee ID pending'}</p></div>
            <Badge tone={current.status === 'Pending Approval' ? 'amber' : current.status === 'Draft' ? 'slate' : 'blue'}>{current.status || 'Draft'}</Badge>
          </div>

          <div className="relative mt-6 border-t border-[#e1e6ed] pt-[-1px]"><div className="-mt-3 flex"><Step number="1" label="Draft" done /><Step number="2" label="In progress" done /><Step number="3" label="Pending approval" active /><Step number="4" label="Complete" /></div></div>

          <div className="mt-7"><div className="mb-2 flex items-center justify-between"><span className="text-[12px] font-bold text-[#11243f]">Overall progress</span><span className="text-[12px] font-bold text-[#426759]">{progress}%</span></div><div className="h-[5px] overflow-hidden rounded-full bg-[#e9edf2]"><div className="h-full rounded-full bg-[#426759] transition-all" style={{ width: `${progress}%` }} /></div></div>

          <div className="my-6 border-t border-[#e5e9ef]" />
          <div><h3 className="text-[14px] font-bold text-[#11243f]">Document checklist</h3><p className="mt-1 text-[11px] text-[#8a97a9]">{completedDocuments} of {documents.length} items complete</p></div>
          <div className="mt-3 divide-y divide-[#edf0f4]">
            {documents.map((document, index) => <div key={document.name} className="flex min-h-[57px] items-center gap-2.5">
              <button aria-label={`Toggle ${document.name}`} onClick={() => toggleDocument(index)} className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] border ${checked[index] ? 'border-[#426759] bg-[#426759] text-white' : 'border-[#d5dde8] bg-white text-transparent'}`}><Check size={13} strokeWidth={3} /></button>
              <div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-[#172a45]">{document.name}</p><p className="mt-1 text-[10px] text-[#92a0b1]">{document.hint}</p></div>
              <Badge tone={document.status === 'Pending' ? 'slate' : 'green'}>{document.status}</Badge>
              {document.action && <button onClick={() => setModal({ type: document.action.toLowerCase(), name: document.name })} className="ml-1 rounded-md border border-[#dce3eb] px-2.5 py-1.5 text-[10px] font-semibold text-[#203653] hover:border-[#9eabe0]">{document.action}</button>}
            </div>)}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-[#edf3ef] px-3.5 py-3"><div className="flex items-center gap-2.5"><ShieldCheck size={18} className="text-[#426759]" /><div><p className="text-[12px] font-bold text-[#426759]">Approval workflow</p><p className="mt-1 text-[10px] text-[#7e8cab]">Documents marked Signed can be submitted for manager approval.</p></div></div><button onClick={() => { setApprovalRequested(true); onAction?.('Approval requested') }} className="rounded-md border border-[#d9dfeb] bg-white px-3.5 py-2 text-[10px] font-semibold text-[#334663] shadow-sm">{approvalRequested ? 'Approval requested' : 'Request approval'}</button></div>
          </>}</section>
      </div>
    </div>
    {modal && modal.type !== 'initiate' && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4" onClick={() => setModal(null)}><div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      {modal.type === 'initiate' ? <OnboardingForm employeeId={createEmployeeId(employees)} initialData={modal.draft} onClose={() => setModal(null)} onCreated={(employee) => { setEmployees((items) => items.some((item) => item.name === employee.name) ? items.map((item) => item.name === employee.name ? employee : item) : [...items, employee]); setSelected(employee.name); setModal(null); onAction?.('Onboarding created') }} /> : <><h3 className="text-base font-bold text-[#11243f]">{modal.type === 'view' ? modal.name : `${modal.name} generated`}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{modal.type === 'view' ? 'Document preview is ready for review.' : 'The document has been generated for this onboarding process.'}</p><button onClick={() => { setModal(null); onAction?.(`${modal.name} ${modal.type === 'view' ? 'viewed' : 'generated'}`) }} className="mt-4 rounded-md bg-[#426759] px-3 py-2 text-xs font-semibold text-white">Done</button></>}
    </div></div>}
  </div>
}

const personalFields = [
  ['fullName', 'Full Name'], ['profilePhoto', 'Profile Photo', 'file'], ['dob', 'Date of Birth', 'date'], ['gender', 'Gender', 'gender'], ['personalEmail', 'Personal Email', 'email'], ['mobile', 'Mobile Number', 'tel'], ['alternateMobile', 'Alternate Mobile Number', 'tel'], ['currentAddress', 'Current Address'], ['permanentAddress', 'Permanent Address'], ['emergencyName', 'Emergency Contact Name'], ['emergencyNumber', 'Emergency Contact Number', 'tel'], ['emergencyRelationship', 'Relationship with Emergency Contact'],
]

const employmentFields = [
  ['employeeId', 'Employee ID'], ['department', 'Department'], ['designation', 'Designation'], ['employmentType', 'Employment Type', 'select'], ['reportingManager', 'Reporting Manager'], ['workLocation', 'Work Location'], ['joiningDate', 'Joining Date', 'date'], ['probation', 'Probation Period'], ['shift', 'Shift / Working Hours'], ['employmentStatus', 'Employment Status'],
]

function createEmployeeId(existingEmployees) {
  const usedIds = new Set(existingEmployees.map((employee) => employee.employeeId).filter(Boolean))
  let id = ''
  do { id = `EMP-${String(Math.floor(1000 + Math.random() * 9000))}` } while (usedIds.has(id))
  return id
}

function normalizeEmployees(items) {
  return items.map((employee, index) => ({ ...employee, employeeId: employee.employeeId || `EMP-${String(1000 + index * 137).slice(-4)}` }))
}

function OnboardingForm({ onClose, onCreated, initialData, employeeId }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => {
    try { return { employmentType: '', profilePhoto: '', ...(JSON.parse(localStorage.getItem('empflow-onboarding-draft')) || {}), ...(initialData || {}), employeeId: initialData?.employeeId || employeeId } } catch { return { employeeId: initialData?.employeeId || employeeId, employmentType: '', profilePhoto: '' } }
  })
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  useEffect(() => localStorage.setItem('empflow-onboarding-draft', JSON.stringify(form)), [form])
  const fields = step === 1 ? personalFields : employmentFields
  const allFields = [...personalFields, ...employmentFields]
  const complete = allFields.every(([field]) => String(form[field] || '').trim())
  const save = (isDraft) => {
    if (!isDraft && !complete) return
    const name = form.fullName || 'New hire'
    onCreated({ name, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), date: form.joiningDate || new Date().toISOString().slice(0, 10), status: isDraft ? 'Draft' : 'In Progress', employeeId: form.employeeId, draft: form })
  }
  return <form onSubmit={(event) => { event.preventDefault(); save(false) }} className="w-full max-w-none">
    <div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-[#11243f]">Initiate onboarding</h3><p className="mt-1 text-xs text-slate-500">Complete the new hire details in two sections.</p></div><button type="button" onClick={onClose} className="text-xl text-slate-400">×</button></div>
    <div className="mt-5 flex items-center gap-2"><span className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#426759]' : 'bg-slate-200'}`} /><span className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#426759]' : 'bg-slate-200'}`} /></div>
    <p className="mt-2 text-[11px] font-semibold text-[#426759]">Step {step} of 2 · {step === 1 ? 'Personal Information' : 'Employment Details'}</p>
    <div className="mt-4 grid max-h-[55vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      {fields.map(([field, label, type = 'text', placeholder]) => <label key={field} className="text-xs font-semibold text-slate-600"><span className="mb-1.5 block">{label}</span>{type === 'select' || type === 'gender' ? <select required value={form[field] || ''} onChange={(event) => update(field, event.target.value)} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-[#426759]"><option value="">{type === 'gender' ? 'Select gender' : 'Select employment type'}</option>{(type === 'gender' ? ['Male', 'Female', 'Other'] : ['Full Time', 'Part Time', 'Intern', 'Contract']).map((option) => <option key={option}>{option}</option>)}</select> : <input required type={type} value={form[field] || ''} readOnly={field === 'employeeId'} onChange={(event) => update(field, type === 'file' ? event.target.files?.[0]?.name || '' : event.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-[#426759] read-only:bg-slate-100" />}</label>)}
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => save(true)} className="rounded-md border border-[#426759] px-3 py-2 text-xs font-semibold text-[#426759]">Save draft</button><div className="flex gap-2"><button type="button" onClick={step === 1 ? onClose : () => setStep(1)} className="rounded-md border border-slate-200 px-3 py-2 text-xs">{step === 1 ? 'Cancel' : 'Previous'}</button>{step === 1 ? <button type="button" onClick={() => setStep(2)} className="rounded-md bg-[#426759] px-3 py-2 text-xs font-semibold text-white">Next</button> : <button type="submit" disabled={!complete} className="rounded-md bg-[#426759] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Save</button>}</div></div>
  </form>
}
