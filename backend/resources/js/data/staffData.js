export const staffUser = {
  name: "Jane Smith",
  role: "Front Desk Staff",
  email: "jane.smith@healthcareclinic.com",
};

export const doctors = [
  {
    id: 1,
    name: "Dr. Emily Smith",
    shortName: "Dr. Smith",
    queue: "A",
    specialization: "General Practitioner",
    status: "Available",
    schedule: "8:00 AM - 4:00 PM",
    services: [
      { name: "General Consultation", fee: 500 },
      { name: "Physical Examination", fee: 650 },
      { name: "Vaccination", fee: 700 },
    ],
  },
  {
    id: 2,
    name: "Dr. Michael Brown",
    shortName: "Dr. Brown",
    queue: "B",
    specialization: "Cardiologist",
    status: "Available",
    schedule: "9:00 AM - 5:00 PM",
    services: [
      { name: "Cardiology Check", fee: 900 },
      { name: "ECG", fee: 750 },
      { name: "Heart Pressure Monitoring", fee: 850 },
    ],
  },
  {
    id: 3,
    name: "Dr. Sarah Lee",
    shortName: "Dr. Lee",
    queue: "C",
    specialization: "Pediatrician",
    status: "Off-duty",
    schedule: "Off Today",
    services: [
      { name: "Child Check-up", fee: 500 },
      { name: "Vaccination", fee: 650 },
      { name: "Growth Monitoring", fee: 450 },
    ],
  },
];

export const initialQueue = [
  { queueNo: "A001", patientId: "P001", name: "Sarah Johnson", doctor: "Dr. Smith", doctorQueue: "A", service: "General Consultation", checkIn: "8:30 AM", status: "In Progress", wait: "5 min" },
  { queueNo: "A002", patientId: "P002", name: "John Doe", doctor: "Dr. Smith", doctorQueue: "A", service: "Follow-up Check", checkIn: "8:45 AM", status: "Waiting", wait: "15 min" },
  { queueNo: "A003", patientId: "P003", name: "Mary Jane", doctor: "Dr. Smith", doctorQueue: "A", service: "Vaccination", checkIn: "9:00 AM", status: "Waiting", wait: "20 min" },
  { queueNo: "B001", patientId: "P004", name: "Mike Chen", doctor: "Dr. Brown", doctorQueue: "B", service: "Annual Physical", checkIn: "8:35 AM", status: "In Progress", wait: "3 min" },
  { queueNo: "B002", patientId: "P005", name: "Alice Cooper", doctor: "Dr. Brown", doctorQueue: "B", service: "Lab Results Review", checkIn: "8:50 AM", status: "Waiting", wait: "12 min" },
  { queueNo: "C001", patientId: "P006", name: "Tom Wilson", doctor: "Dr. Lee", doctorQueue: "C", service: "Cardiology Check", checkIn: "9:10 AM", status: "Waiting", wait: "18 min" },
];

export const appointments = [
  { time: "8:00 AM", patientId: "P001", patient: "Sarah Johnson", doctor: "Dr. Smith", service: "General Consultation", status: "Confirmed" },
  { time: "8:30 AM", patientId: "P002", patient: "John Doe", doctor: "Dr. Smith", service: "Follow-up Check", status: "Pending" },
  { time: "9:00 AM", patientId: "P004", patient: "Mike Chen", doctor: "Dr. Brown", service: "Annual Physical", status: "Confirmed" },
  { time: "10:00 AM", patientId: "P006", patient: "Tom Wilson", doctor: "Dr. Lee", service: "Vaccination", status: "Cancelled" },
];

export const patients = [
  { id: "P001", name: "Sarah Johnson", age: 35, gender: "Female", phone: "0912-123-4567", lastVisit: "2026-04-25", status: "Active" },
  { id: "P002", name: "John Doe", age: 42, gender: "Male", phone: "0923-234-5678", lastVisit: "2026-04-12", status: "Active" },
  { id: "P003", name: "Mary Jane", age: 28, gender: "Female", phone: "0934-345-6789", lastVisit: "2026-04-10", status: "Active" },
  { id: "P004", name: "Mike Chen", age: 52, gender: "Male", phone: "0945-456-7890", lastVisit: "2026-03-28", status: "Inactive" },
];

export const notifications = [
  { type: "appointment", title: "New Appointment Booked", message: "Sarah Johnson booked an appointment with Dr. Smith for 2:30 PM.", time: "5 minutes ago", link: "/staff/appointments" },
  { type: "cancel", title: "Cancellation Request", message: "Tom Wilson requested to cancel appointment scheduled for 10:00 AM.", time: "15 minutes ago", link: "/staff/appointments" },
  { type: "queue", title: "Queue Delay Alert", message: "Dr. Brown’s queue is experiencing delay. Current wait time: 25 minutes.", time: "30 minutes ago", link: "/staff/queue" },
  { type: "checkin", title: "Patient Checked-in", message: "Mike Chen checked in for his appointment.", time: "1 hour ago", link: "/staff/queue" },
];

export const activities = [
  { time: "2:15 PM", title: "Patient checked-in", name: "Sarah Johnson", status: "Checked-in" },
  { time: "2:00 PM", title: "Appointment confirmed", name: "Mike Chen", status: "Confirmed" },
  { time: "1:45 PM", title: "Walk-in registered", name: "Emma Davis", status: "Waiting" },
  { time: "1:30 PM", title: "Consultation completed", name: "Tom Wilson", status: "Completed" },
];