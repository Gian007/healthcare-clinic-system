export const doctorProfileSeed = {
  doctor_id: 'DOC-12345',
  full_name: 'Dr. Sarah Johnson',
  specialization: 'Cardiology',
  license_number: 'MD-2024-5678',
  contact_number: '+1 (555) 123-4567',
  email: 'sarah.johnson@healthcare.com',
  clinic_location: 'Building A, 2nd Floor, Room 204',
  daily_booking_limit: 20,
  status: 'Available',
  start_time: '08:00 AM',
  end_time: '05:00 PM',
};

export const scheduleSeed = [
  { id: 1, day: 'Monday', start: '08:00 AM', end: '05:00 PM', slot_limit: 20, booked: 12, active: true },
  { id: 2, day: 'Tuesday', start: '08:00 AM', end: '05:00 PM', slot_limit: 20, booked: 12, active: true },
  { id: 3, day: 'Wednesday', start: '08:00 AM', end: '05:00 PM', slot_limit: 20, booked: 12, active: true },
  { id: 4, day: 'Thursday', start: '09:00 AM', end: '03:00 PM', slot_limit: 15, booked: 12, active: true },
  { id: 5, day: 'Friday', start: '08:00 AM', end: '05:00 PM', slot_limit: 20, booked: 12, active: true },
  { id: 6, day: 'Saturday', start: '09:00 AM', end: '01:00 PM', slot_limit: 10, booked: 8, active: true },
];

export const appointmentsSeed = [
  { id: 1, queue_no: 'Q-041', patient: 'John Doe', service: 'General Checkup', date: 'May 9', time: '09:00 AM - 09:30 AM', check_in: '08:50 AM', status: 'Confirmed', notes: 'Routine checkup and BP monitoring.' },
  { id: 2, queue_no: 'Q-042', patient: 'Maria Garcia', service: 'Follow-up Consultation', date: 'May 9', time: '09:30 AM - 10:00 AM', check_in: '09:20 AM', status: 'Confirmed', notes: 'Follow-up for prescription review.' },
  { id: 3, queue_no: 'Q-043', patient: 'James Wilson', service: 'Heart Screening', date: 'May 9', time: '10:00 AM - 10:30 AM', check_in: '09:50 AM', status: 'Confirmed', notes: 'ECG and cardiac screening.' },
  { id: 4, queue_no: 'Q-044', patient: 'Emma Davis', service: 'ECG Test', date: 'May 9', time: '10:30 AM - 11:00 AM', check_in: '10:20 AM', status: 'Pending', notes: 'Waiting for confirmation.' },
  { id: 5, queue_no: 'Q-045', patient: 'Robert Chen', service: 'Blood Pressure Monitoring', date: 'May 10', time: '08:00 AM - 08:30 AM', check_in: '07:50 AM', status: 'Confirmed', notes: 'Priority patient.' },
];

export const queueSeed = [
  { id: 45, number: '045', patient: 'Robert Chen', waiting: 15, priority: 1, status: 'In Progress' },
  { id: 46, number: '046', patient: 'Lisa Anderson', waiting: 25, priority: 2, status: 'Waiting' },
  { id: 47, number: '047', patient: 'Michael Brown', waiting: 35, priority: 3, status: 'Waiting' },
  { id: 48, number: '048', patient: 'Sarah Miller', waiting: 45, priority: 4, status: 'Waiting' },
  { id: 49, number: '049', patient: 'David Lee', waiting: 55, priority: 5, status: 'Waiting' },
];

export const completedQueueSeed = [
  { id: 41, number: '041', patient: 'John Doe', completed_at: '8:45 AM' },
  { id: 42, number: '042', patient: 'Maria Garcia', completed_at: '9:15 AM' },
  { id: 43, number: '043', patient: 'James Wilson', completed_at: '9:45 AM' },
];

export const dayOffSeed = [
  { id: 1, date: 'May 15, 2026', reason: 'Medical Conference', requested_on: 'May 1, 2026', status: 'Approved' },
  { id: 2, date: 'May 20, 2026', reason: 'Family Emergency', requested_on: 'May 5, 2026', status: 'Pending' },
  { id: 3, date: 'Apr 10, 2026', reason: 'Personal Leave', requested_on: 'Apr 1, 2026', status: 'Approved' },
  { id: 4, date: 'Mar 25, 2026', reason: 'Sick Leave', requested_on: 'Mar 24, 2026', status: 'Rejected' },
];

export const attendanceSeed = [
  { id: 1, date: 'May 8, 2026', time_in: '08:05 AM', time_out: '05:10 PM', total: '9h 5m', status: 'Present' },
  { id: 2, date: 'May 7, 2026', time_in: '07:55 AM', time_out: '05:00 PM', total: '9h 5m', status: 'Present' },
  { id: 3, date: 'May 6, 2026', time_in: '08:10 AM', time_out: '05:15 PM', total: '9h 5m', status: 'Present' },
  { id: 4, date: 'May 5, 2026', time_in: '08:00 AM', time_out: '05:05 PM', total: '9h 5m', status: 'Present' },
  { id: 5, date: 'May 2, 2026', time_in: '--', time_out: '--', total: '0h', status: 'Absent' },
];
