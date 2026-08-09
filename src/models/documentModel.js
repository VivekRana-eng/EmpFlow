export const initialDocumentTemplates = [
  { id: 't1', name: 'Offer Letter Agreement', type: 'PDF', file_path: '/templates/offer_letter_v2.html' },
  { id: 't2', name: 'Relieving & Experience Certificate', type: 'PDF', file_path: '/templates/relieving_certificate_v1.html' },
  { id: 't3', name: 'Experience Certificate', type: 'PDF', file_path: '/templates/experience_cert_v1.html' },
  { id: 't4', name: 'Clearance NOC', type: 'PDF', file_path: '/templates/clearance_noc_v3.html' },
]

export const initialGeneratedDocuments = [
  { id: 'g1', template_id: 't1', process_id: 'op2', status: 'Pending Approval', generated_at: '2025-05-28 10:30' },
  { id: 'g2', template_id: 't2', process_id: 'fp1', status: 'Pending Approval', generated_at: '2025-05-28 11:15' },
  { id: 'g3', template_id: 't3', process_id: 'fp2', status: 'Pending Approval', generated_at: '2025-05-28 14:00' },
  { id: 'g4', template_id: 't4', process_id: 'fp1', status: 'Pending Approval', generated_at: '2025-05-28 15:45' },
  { id: 'g5', template_id: 't1', process_id: 'op3', status: 'Draft', generated_at: '2025-06-03 09:20' },
  { id: 'g6', template_id: 't3', process_id: 'fp3', status: 'Pending Approval', generated_at: '2025-06-04 16:10' },
]
