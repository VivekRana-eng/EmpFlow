import React, { useState, useEffect } from 'react'
import { FileText, Download, Eye, Send, CheckCircle2, AlertCircle, Clock, ShieldAlert, Sparkles, Building2, User, Plus } from 'lucide-react'

const SAMPLE_EMPLOYEE_DOCUMENTS = [
  { name: 'Offer Letter', type: 'Employment', status: 'Verified & Signed', date: '15 Jul 2026', file: 'offer_letter_rahul.pdf' },
  { name: 'Identity Proof (Aadhaar/PAN)', type: 'KYC', status: 'Verified', date: '16 Jul 2026', file: 'kyc_rahul.pdf' },
  { name: 'Bank Account & PAN details', type: 'Finance', status: 'Verified', date: '16 Jul 2026', file: 'bank_details_rahul.pdf' },
  { name: 'Degree Certificate', type: 'Academic', status: 'Verified', date: '17 Jul 2026', file: 'degree_certificate_rahul.pdf' },
  { name: 'Address Proof', type: 'KYC', status: 'Verified', date: '17 Jul 2026', file: 'address_proof_rahul.pdf' },
  { name: 'Non-Disclosure Agreement', type: 'Compliance', status: 'Pending Signature', date: 'Pending', file: 'nda_rahul.pdf' }
]

export default function EmployeeDashboard({ currentUser, onAction, documentsOnly = false }) {
  const [resignation, setResignation] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-offboardings')
      if (saved) {
        const list = JSON.parse(saved)
        return list.find(r => r.employee_id === 'e2') || null
      }
    } catch (e) {
      console.error(e)
    }
    return null
  })

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewerDoc, setViewerDoc] = useState(null)

  // Manage documents list state
  const [documentsList, setDocumentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('empflow-employee-documents')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return SAMPLE_EMPLOYEE_DOCUMENTS
  })

  useEffect(() => {
    if (Array.isArray(documentsList)) {
      localStorage.setItem('empflow-employee-documents', JSON.stringify(documentsList))
    }
  }, [documentsList])

  // Cross-tab synchronization & polling for documents list
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'empflow-employee-documents') {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed) && JSON.stringify(parsed) !== JSON.stringify(documentsList)) {
            setDocumentsList(parsed)
          }
        } catch (err) {
          console.error(err)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem('empflow-employee-documents')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && JSON.stringify(parsed) !== JSON.stringify(documentsList)) {
            setDocumentsList(parsed)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [documentsList])

  // Upload document modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadCategory, setUploadCategory] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadFileBase64, setUploadFileBase64] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadFile(file)
    
    const reader = new FileReader()
    reader.onload = () => {
      setUploadFileBase64(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    if (!uploadName || !uploadCategory || !uploadFile) return

    const newDoc = {
      name: uploadName,
      type: uploadCategory,
      status: 'Pending Review',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      file: uploadFile.name,
      dataUrl: uploadFileBase64
    }

    const updatedDocs = [...documentsList, newDoc]
    setDocumentsList(updatedDocs)
    localStorage.setItem('empflow-employee-documents', JSON.stringify(updatedDocs))

    // Formatted timestamp helper
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    }

    // 1. Create Notification Event
    const notifId = 'notif_' + Date.now()
    const newNotif = {
      id: notifId,
      type: "DOCUMENT_UPLOADED",
      employeeId: currentUser.employeeId || "EMP-1002",
      employeeName: currentUser.name || "Rahul Sharma",
      documentName: uploadName,
      documentType: uploadCategory,
      uploadedAt: new Date().toISOString(),
      status: "Pending Review",
      targetRoles: ["ADMIN", "HR"],
      readBy: [],
      actionRequired: true
    }

    try {
      const savedNotifs = localStorage.getItem('empflow-notifications')
      const notifications = savedNotifs ? JSON.parse(savedNotifs) : []
      notifications.unshift(newNotif)
      localStorage.setItem('empflow-notifications', JSON.stringify(notifications))
    } catch (err) {
      console.error(err)
    }

    // 2. Create Audit Log
    const auditId = 'l_' + Date.now()
    const newAudit = {
      id: auditId,
      action: `${currentUser.name || "Rahul Sharma"} uploaded ${uploadName}`,
      timestamp: formatDate(new Date()),
      user: currentUser.name || "Rahul Sharma",
      employeeId: currentUser.employeeId || "EMP-1002"
    }

    try {
      const savedAudits = localStorage.getItem('empflow-audit-logs')
      const audits = savedAudits ? JSON.parse(savedAudits) : []
      audits.unshift(newAudit)
      localStorage.setItem('empflow-audit-logs', JSON.stringify(audits))
    } catch (err) {
      console.error(err)
    }

    // Notify storage events for cross-tab updates
    window.dispatchEvent(new Event('storage'))

    setUploadModalOpen(false)
    setUploadName('')
    setUploadCategory('')
    setUploadFile(null)
    setUploadFileBase64('')
    onAction(`Uploaded "${newDoc.name}" successfully`)
  }

  const handleResign = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const newRequest = {
        id: 'fp_' + Date.now(),
        employee_id: 'e2',
        employee_name: 'Rahul Sharma',
        department: 'Software Engineering',
        designation: 'Senior Frontend Developer',
        last_working_date: date,
        reason: reason,
        comments: comments,
        status: 'Pending',
        created_at: new Date().toISOString().split('T')[0]
      }

      try {
        const saved = localStorage.getItem('empflow-offboardings')
        const currentList = saved ? JSON.parse(saved) : [
          { id: 'fp1', employee_id: 'e3', employee_name: 'Manoj Kumar', department: 'Finance & Treasury', last_working_date: '2026-08-29', status: 'In Progress' },
          { id: 'fp2', employee_id: 'e9', employee_name: 'Sneha Iyer', department: 'Human Resources', last_working_date: '2026-08-28', status: 'In Progress' },
          { id: 'fp3', employee_id: 'e15', employee_name: 'Ankit Gupta', department: 'Information Technology', last_working_date: '2026-09-15', status: 'Pending' }
        ]
        
        currentList.push(newRequest)
        localStorage.setItem('empflow-offboardings', JSON.stringify(currentList))
      } catch (err) {
        console.error(err)
      }

      setResignation(newRequest)
      setLoading(false)
      onAction('Resignation request submitted successfully')
    }, 800)
  }

  const handleDownload = (doc) => {
    if (doc.dataUrl) {
      const link = document.createElement('a');
      link.href = doc.dataUrl;
      link.download = doc.file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onAction(`Downloaded ${doc.name} successfully`);
      return;
    }
    const textContent = `EMPFLOW HR PORTAL DOCUMENT
---------------------------
Document Name  : ${doc.name}
Category       : ${doc.type}
Status         : ${doc.status}
Issue Date     : ${doc.date}
---------------------------
Employee Name  : Rahul Sharma
Employee ID    : EMP-1002
Department     : Software Engineering
Designation    : Senior Frontend Developer

This document serves as an official company record of employment history and credentials.
    `;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.file.replace('.pdf', '_record.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAction(`Downloaded ${doc.name} successfully`);
  }

  const clearanceSteps = [
    { dept: 'Information Technology', status: resignation?.status === 'Approved' ? 'Completed' : 'Pending', note: 'Return company assets (Laptop, Access Card)' },
    { dept: 'Finance & Treasury', status: resignation?.status === 'Approved' ? 'Completed' : 'Pending', note: 'Full & final settlement review' },
    { dept: 'Human Resources', status: 'Pending', note: 'Exit interview & relieving letters' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-end ${documentsOnly ? 'hidden' : ''}`}>
        <div>
          <p className="mb-1 text-[13px] font-medium text-[#426759]">Employee Self-Service</p>
          <h2 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[30px]">
            Welcome back, Rahul <span className="text-2xl">👋</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">Manage your employment details, documents, and exit clearances.</p>
        </div>
      </section>

      {documentsOnly && (
        <section>
          <p className="mb-1 text-[13px] font-medium text-[#426759]">Employee Self-Service</p>
          <h2 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[30px]">My Documents</h2>
          <p className="mt-1 text-sm text-slate-500">Access, review, download, or upload your employment documents.</p>
        </section>
      )}

      {/* Grid of Profile & Documents */}
      <div className={`grid grid-cols-1 gap-6 ${documentsOnly ? '' : 'lg:grid-cols-[1.2fr_1fr]'}`}>
        
        {/* Profile Card */}
        <div className={`${documentsOnly ? 'hidden' : ''} rounded-xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.025)]`}>
          <div className="mb-5 flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf3ef] text-xl font-bold text-[#426759]">
              RS
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Rahul Sharma</h3>
              <p className="text-xs text-[#426759] font-medium">Senior Frontend Developer</p>
              <p className="text-[10px] text-slate-400 mt-0.5">EMP-1002 · Software Engineering</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Email</span>
                <span className="font-semibold text-slate-700">employee@empflow.local</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Phone</span>
                <span className="font-semibold text-slate-700">+91 98123 45670</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Emergency Contact</span>
                <span className="font-semibold text-slate-700">Sunita Sharma (Spouse)</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Emergency Phone</span>
                <span className="font-semibold text-slate-700">+91 98717 39210</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Office Location</span>
                <span className="font-semibold text-slate-700">New Delhi, India</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Joining Date</span>
                <span className="font-semibold text-slate-700">15 Aug 2026</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Current Address</span>
              <span className="font-semibold text-slate-700">11, Green Park, New Delhi, India</span>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Documents</h3>
              <p className="text-xs text-slate-400 mt-0.5">Access and review your digital documents</p>
            </div>
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex h-[32px] items-center gap-1.5 rounded-lg bg-[#426759] px-3 text-[10px] font-semibold text-white shadow-sm hover:bg-[#315447] transition cursor-pointer"
            >
              <Plus size={13} />
              Upload
            </button>
          </div>

          <div className="space-y-3">
            {documentsList.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf3ef] text-[#426759]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{doc.type} · {doc.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => { setViewerDoc(doc); onAction(`Viewing ${doc.name}`) }} 
                    className="p-1.5 rounded bg-white border border-slate-200 hover:border-[#426759] hover:text-[#426759] transition cursor-pointer"
                    title="View"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={() => handleDownload(doc)} 
                    className="p-1.5 rounded bg-white border border-slate-200 hover:border-[#426759] hover:text-[#426759] transition cursor-pointer"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relieving / Offboarding Section */}
      <div className={`${documentsOnly ? 'hidden' : ''} rounded-xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.025)]`}>
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900">Resignation & Relieving Request</h3>
          <p className="text-xs text-slate-400 mt-0.5">Submit resignation or monitor your exit clearance status</p>
        </div>

        {resignation ? (
          <div className="space-y-6">
            {/* Resignation Status Panel */}
            <div className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              resignation.status === 'Approved' 
                ? 'bg-emerald-50/70 border-emerald-100' 
                : resignation.status === 'Pending' 
                ? 'bg-amber-50/70 border-amber-100' 
                : 'bg-[#edf3ef]/70 border-slate-100'
            }`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {resignation.status === 'Approved' ? (
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  ) : resignation.status === 'Pending' ? (
                    <Clock className="text-amber-600 animate-pulse" size={20} />
                  ) : (
                    <AlertCircle className="text-slate-500" size={20} />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Exit Process Status: <span className={
                      resignation.status === 'Approved' 
                        ? 'text-emerald-700' 
                        : resignation.status === 'Pending' 
                        ? 'text-amber-700' 
                        : 'text-slate-700'
                    }>{resignation.status}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Requested Last Working Day: <b>{resignation.last_working_date}</b>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Submitted on {resignation.created_at || 'today'}
                  </p>
                </div>
              </div>

              {resignation.status === 'Pending' && (
                <div className="text-[11px] font-semibold text-amber-700 bg-amber-100/60 rounded-lg px-3 py-1.5 border border-amber-200 self-start sm:self-auto">
                  Awaiting HR & Manager Approval
                </div>
              )}
            </div>

            {/* Exit Clearance Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-3">Exit Clearance Progress</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clearanceSteps.map((step) => (
                  <div key={step.dept} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{step.dept}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        step.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>{step.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{step.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResign} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Requested Last Working Day
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs outline-none focus:border-[#426759] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reason for Exit
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs outline-none focus:border-[#426759] focus:bg-white"
                >
                  <option value="">Select a reason</option>
                  <option value="Better Career Opportunity">Better Career Opportunity</option>
                  <option value="Personal / Family Reasons">Personal / Family Reasons</option>
                  <option value="Higher Education">Higher Education</option>
                  <option value="Health Issues">Health Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please share any feedback or additional details regarding your transition..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs outline-none focus:border-[#426759] focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white shadow-md shadow-rose-950/10 hover:bg-rose-700 active:scale-[0.98] transition disabled:opacity-50"
            >
              <Send size={14} />
              {loading ? 'Submitting...' : 'Submit Resignation Request'}
            </button>
          </form>
        )}
      </div>

      {/* Simple Document Viewer Modal */}
      {viewerDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]" onClick={() => setViewerDoc(null)}>
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">{viewerDoc.name}</h4>
              <button onClick={() => setViewerDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            
            <div className="py-5 px-4 bg-slate-50 border border-slate-100 rounded-xl my-4 text-left max-h-[300px] overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed text-slate-600">
              <div className="text-center font-bold text-slate-800 text-xs border-b border-slate-200 pb-2 uppercase">
                EmpFlow Portal · {viewerDoc.name}
              </div>
              <div className="space-y-1">
                <p><b>Employee:</b> Rahul Sharma (EMP-1002)</p>
                <p><b>Category:</b> {viewerDoc.type}</p>
                <p><b>Issue Date:</b> {viewerDoc.date}</p>
                <p><b>Document Status:</b> {viewerDoc.status}</p>
              </div>
              <div className="border-t border-slate-200 pt-3 text-[10px]">
                {viewerDoc.resolvedContent ? (
                  <div className="whitespace-pre-wrap font-sans text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-3.5 rounded-lg border border-slate-100 mb-2">
                    {viewerDoc.resolvedContent}
                  </div>
                ) : viewerDoc.dataUrl && viewerDoc.dataUrl.startsWith('data:image/') ? (
                  <div className="text-center space-y-2">
                    <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Uploaded Image Preview</p>
                    <img src={viewerDoc.dataUrl} className="mx-auto max-h-[180px] rounded-lg border border-slate-200 shadow-sm" alt={viewerDoc.name} />
                  </div>
                ) : viewerDoc.name === 'Offer Letter' ? (
                  <div className="space-y-2">
                    <p>Dear Rahul Sharma,</p>
                    <p>We are pleased to offer you employment at EmpFlow as a Senior Frontend Developer. Your joining date is set for August 15, 2026. You will report directly to Rohan Mehta.</p>
                    <p>Sincerely,<br/>Aditi Deshmukh (HR Department)</p>
                  </div>
                ) : viewerDoc.name === 'Identity Proof (Aadhaar/PAN)' ? (
                  <div className="space-y-2">
                    <p><b>IDENTITY VERIFICATION RECORD</b></p>
                    <p>Permanent Account Number (PAN): XXXXX8827X</p>
                    <p>Aadhaar Card: XXXX-XXXX-4927</p>
                    <p className="text-emerald-600 font-bold">Status: Bio-metric verification succeeded via government portal.</p>
                  </div>
                ) : viewerDoc.name === 'Bank Account & PAN details' ? (
                  <div className="space-y-2">
                    <p><b>SALARY ACCOUNT DISBURSEMENT RECORD</b></p>
                    <p>Bank Name: HDFC Bank Ltd</p>
                    <p>Account Number: XXXXXX9928192</p>
                    <p>IFSC Code: HDFC0000240</p>
                    <p className="text-emerald-600 font-bold">Status: Salary account active and connected to payroll system.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><b>CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT</b></p>
                    <p>This agreement outlines the responsibilities regarding confidential and proprietary company assets, codebases, and customer information.</p>
                    <p className="text-amber-600 font-bold">Status: {viewerDoc.status === 'Uploaded' ? 'Uploaded document copy.' : 'Awaiting digital signature. Please click "Sign" or return a signed copy to HR.'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setViewerDoc(null)} className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                Close
              </button>
              <button onClick={() => { setViewerDoc(null); handleDownload(viewerDoc) }} className="px-3.5 py-2 text-xs font-semibold text-white bg-[#426759] rounded-lg hover:bg-[#315447] cursor-pointer">
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]" onClick={() => setUploadModalOpen(false)}>
          <form onSubmit={handleUploadSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Upload Document</h4>
              <button type="button" onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Degree Certificate"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 outline-none focus:border-[#426759] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <select
                  required
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 outline-none focus:border-[#426759] focus:bg-white"
                >
                  <option value="">Select a category</option>
                  <option value="KYC">KYC</option>
                  <option value="Finance">Finance</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Academic">Academic</option>
                  <option value="Technical">Technical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select File (Image/Text)
                </label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept="image/*,text/plain,application/pdf"
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#426759] hover:file:bg-slate-200 cursor-pointer file:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setUploadModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-3.5 py-2 text-xs font-semibold text-white bg-[#426759] rounded-lg hover:bg-[#315447] cursor-pointer">
                Upload Document
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
