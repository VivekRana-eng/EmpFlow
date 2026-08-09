export const initialDepartments = [
  { id: 'd1', name: 'Software Engineering' },
  { id: 'd2', name: 'Human Resources' },
  { id: 'd3', name: 'Finance & Treasury' },
  { id: 'd4', name: 'Product & Design' },
  { id: 'd5', name: 'Information Technology' },
]

export const initialDesignations = [
  { id: 'de1', title: 'Senior Frontend Developer' },
  { id: 'de2', title: 'Talent Acquisition Specialist' },
  { id: 'de3', title: 'Lead UI/UX Designer' },
  { id: 'de4', title: 'Principal Data Analyst' },
  { id: 'de5', title: 'DevOps Infrastructure Engineer' },
  { id: 'de6', title: 'Chief Financial Officer' },
  { id: 'de7', title: 'HR Operations Manager' },
  { id: 'de8', title: 'IT Helpdesk Lead' },
]

export const initialEmployees = [
  { id: 'e1', employeeId: 'EMP-1001', name: 'Aditi Deshmukh', email: 'aditi.deshmukh@elop.com', department_id: 'd2', designation_id: 'de7', status: 'Active' },
  { id: 'e2', employeeId: 'EMP-1002', name: 'Rahul Sharma', email: 'rahul.sharma@elop.com', department_id: 'd1', designation_id: 'de1', status: 'Active' },
  { id: 'e3', employeeId: 'EMP-1003', name: 'Manoj Kumar', email: 'manoj.kumar@elop.com', department_id: 'd3', designation_id: 'de6', status: 'Offboarding' },
  { id: 'e4', employeeId: 'EMP-1004', name: 'Rohan Mehta', email: 'rohan.mehta@elop.com', department_id: 'd4', designation_id: 'de3', status: 'Active' },
  { id: 'e5', employeeId: 'EMP-1005', name: 'Priya Verma', email: 'priya.verma@elop.com', department_id: 'd2', designation_id: 'de2', status: 'Onboarding' },
  { id: 'e6', employeeId: 'EMP-1006', name: 'Neha Singh', email: 'neha.singh@elop.com', department_id: 'd4', designation_id: 'de4', status: 'Active' },
  { id: 'e7', employeeId: 'EMP-1007', name: 'Karan Patel', email: 'karan.patel@elop.com', department_id: 'd1', designation_id: 'de5', status: 'Active' },
  { id: 'e8', employeeId: 'EMP-1008', name: 'Arjun Sharma', email: 'arjun.sharma@elop.com', department_id: 'd1', designation_id: 'de1', status: 'Onboarding' },
  { id: 'e9', employeeId: 'EMP-1009', name: 'Sneha Iyer', email: 'sneha.iyer@elop.com', department_id: 'd2', designation_id: 'de7', status: 'Offboarding' },
  { id: 'e10', employeeId: 'EMP-1010', name: 'Kavya Iyer', email: 'kavya.iyer@elop.com', department_id: 'd4', designation_id: 'de3', status: 'Active' },
  { id: 'e11', employeeId: 'EMP-1011', name: 'Aditya Rao', email: 'aditya.rao@elop.com', department_id: 'd5', designation_id: 'de8', status: 'Onboarding' },
  { id: 'e12', employeeId: 'EMP-1012', name: 'Meera Joshi', email: 'meera.joshi@elop.com', department_id: 'd3', designation_id: 'de6', status: 'Active' },
  { id: 'e13', employeeId: 'EMP-1013', name: 'Sameer Khan', email: 'sameer.khan@elop.com', department_id: 'd1', designation_id: 'de5', status: 'Active' },
  { id: 'e14', employeeId: 'EMP-1014', name: 'Divya Menon', email: 'divya.menon@elop.com', department_id: 'd2', designation_id: 'de2', status: 'Active' },
  { id: 'e15', employeeId: 'EMP-1015', name: 'Ankit Gupta', email: 'ankit.gupta@elop.com', department_id: 'd5', designation_id: 'de8', status: 'Offboarding' },
]

const mockPhoneNumbers = ['+91 98765 43210', '+91 98123 45670', '+91 97654 32108', '+91 98220 11445', '+91 98989 12034', '+91 97001 88442', '+91 98670 33219', '+91 97979 45120', '+91 98450 66321', '+91 99110 77884', '+91 97555 34012', '+91 98888 21045', '+91 97220 55670', '+91 98111 90342', '+91 96770 44129']

initialEmployees.forEach((employee, index) => { employee.phone = mockPhoneNumbers[index] })

const mockEmergencyNames = ['Rajesh Deshmukh', 'Sunita Sharma', 'Mahesh Kumar', 'Kavita Mehta', 'Rakesh Verma', 'Anita Singh', 'Pooja Patel', 'Suresh Sharma', 'Meena Iyer', 'Vijay Iyer', 'Kiran Rao', 'Anil Joshi', 'Ritu Khan', 'Sanjay Menon', 'Neel Gupta']
initialEmployees.forEach((employee, index) => {
  employee.emergencyContactName = mockEmergencyNames[index]
  employee.emergencyContactNumber = `+91 98${String(70000000 + index * 173921).slice(0, 8)}`
  employee.emergencyRelationship = index % 3 === 0 ? 'Parent' : index % 3 === 1 ? 'Spouse' : 'Sibling'
  employee.currentAddress = `${10 + index}, Green Park, New Delhi`
  employee.permanentAddress = `${20 + index}, Civil Lines, New Delhi`
  employee.employmentType = index % 4 === 0 ? 'Part Time' : 'Full Time'
  employee.joiningDate = `2026-0${(index % 8) + 1}-15`
})
