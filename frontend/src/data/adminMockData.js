export const doctorsSeed = [
  {
    Doctor_ID: 1,
    First_Name: "Alyssa",
    Last_Name: "Santos",
    Specialization_Name: "General Medicine",
    License_Number: "PRC-108834",
    Contact_Number: "0917-245-3312",
    Email: "alyssa.santos@healthcare.test",
    Status: "Available",
    Daily_Booking_Limit: 24,
    Created_At: "2026-04-01",
  },
  {
    Doctor_ID: 2,
    First_Name: "Miguel",
    Last_Name: "Reyes",
    Specialization_Name: "Pediatrics",
    License_Number: "PRC-204451",
    Contact_Number: "0920-992-8841",
    Email: "miguel.reyes@healthcare.test",
    Status: "On Duty",
    Daily_Booking_Limit: 18,
    Created_At: "2026-04-03",
  },
  {
    Doctor_ID: 3,
    First_Name: "Katrina",
    Last_Name: "Lim",
    Specialization_Name: "Cardiology",
    License_Number: "PRC-332019",
    Contact_Number: "0918-551-1200",
    Email: "katrina.lim@healthcare.test",
    Status: "Day Off",
    Daily_Booking_Limit: 14,
    Created_At: "2026-04-05",
  },
  {
    Doctor_ID: 4,
    First_Name: "Ramon",
    Last_Name: "Dela Cruz",
    Specialization_Name: "Dermatology",
    License_Number: "PRC-776120",
    Contact_Number: "0916-774-2188",
    Email: "ramon.delacruz@healthcare.test",
    Status: "Available",
    Daily_Booking_Limit: 20,
    Created_At: "2026-04-06",
  },
];

export const patientsSeed = [
  {
    Patient_ID: 1,
    Patient_Number: "PT-2026-0001",
    First_Name: "John Michael",
    Last_Name: "Gragg",
    Middle_Name: "L.",
    Birth_Date: "2001-09-14",
    Sex: "Male",
    Contact_Number: "0917-100-4921",
    Email: "jm.gragg@example.com",
    Address: "Dasmariñas, Cavite",
    Registration_Type: "Online",
    Account_Status: "Active",
    Verification_Status: "Verified",
    Created_At: "2026-04-20",
  },
  {
    Patient_ID: 2,
    Patient_Number: "PT-2026-0002",
    First_Name: "Maria",
    Last_Name: "Gonzales",
    Middle_Name: "A.",
    Birth_Date: "1998-02-10",
    Sex: "Female",
    Contact_Number: "0928-331-8890",
    Email: "maria.gonzales@example.com",
    Address: "Imus, Cavite",
    Registration_Type: "Walk-in",
    Account_Status: "Active",
    Verification_Status: "Pending",
    Created_At: "2026-04-21",
  },
  {
    Patient_ID: 3,
    Patient_Number: "PT-2026-0003",
    First_Name: "Carlo",
    Last_Name: "Mendoza",
    Middle_Name: "P.",
    Birth_Date: "1989-08-25",
    Sex: "Male",
    Contact_Number: "0999-720-5521",
    Email: "carlo.mendoza@example.com",
    Address: "Bacoor, Cavite",
    Registration_Type: "Online",
    Account_Status: "Warned",
    Verification_Status: "Verified",
    Created_At: "2026-04-22",
  },
  {
    Patient_ID: 4,
    Patient_Number: "PT-2026-0004",
    First_Name: "Elaine",
    Last_Name: "Villanueva",
    Middle_Name: "R.",
    Birth_Date: "2004-12-01",
    Sex: "Female",
    Contact_Number: "0915-882-0013",
    Email: "elaine.v@example.com",
    Address: "General Trias, Cavite",
    Registration_Type: "Online",
    Account_Status: "Active",
    Verification_Status: "Rejected",
    Created_At: "2026-04-23",
  },
];

export const servicesSeed = [
  { Service_ID: 1, Service_Name: "General Consultation", Description: "Basic medical checkup and diagnosis", Base_Fee: 500, Estimated_Duration: "30 mins", Service_Status: "Active" },
  { Service_ID: 2, Service_Name: "Pediatric Consultation", Description: "Child health consultation", Base_Fee: 650, Estimated_Duration: "30 mins", Service_Status: "Active" },
  { Service_ID: 3, Service_Name: "ECG Screening", Description: "Heart monitoring and ECG test", Base_Fee: 850, Estimated_Duration: "45 mins", Service_Status: "Active" },
  { Service_ID: 4, Service_Name: "Skin Checkup", Description: "Dermatology consultation", Base_Fee: 700, Estimated_Duration: "30 mins", Service_Status: "Inactive" },
];

export const staffSeed = [
  { Staff_ID: 1, First_Name: "Leah", Last_Name: "Navarro", Role: "Receptionist", Contact_Number: "0917-221-3456", Email: "leah.navarro@healthcare.test", Account_Status: "Active", Created_At: "2026-03-01" },
  { Staff_ID: 2, First_Name: "Ben", Last_Name: "Castillo", Role: "Queue Manager", Contact_Number: "0921-442-7751", Email: "ben.castillo@healthcare.test", Account_Status: "Active", Created_At: "2026-03-04" },
  { Staff_ID: 3, First_Name: "Nica", Last_Name: "Flores", Role: "Cashier", Contact_Number: "0916-552-1108", Email: "nica.flores@healthcare.test", Account_Status: "Inactive", Created_At: "2026-03-10" },
];

export const appointmentsSeed = [
  { Appointment_ID: 1, Patient_Name: "John Michael Gragg", Doctor_Name: "Dr. Alyssa Santos", Service_Name: "General Consultation", Appointment_Date: "2026-05-10", Start_Time: "09:00", End_Time: "09:30", Booking_Status: "Confirmed", Appointment_Type: "Online" },
  { Appointment_ID: 2, Patient_Name: "Maria Gonzales", Doctor_Name: "Dr. Miguel Reyes", Service_Name: "Pediatric Consultation", Appointment_Date: "2026-05-10", Start_Time: "10:00", End_Time: "10:30", Booking_Status: "Pending", Appointment_Type: "Walk-in" },
  { Appointment_ID: 3, Patient_Name: "Carlo Mendoza", Doctor_Name: "Dr. Katrina Lim", Service_Name: "ECG Screening", Appointment_Date: "2026-05-10", Start_Time: "11:00", End_Time: "11:45", Booking_Status: "Checked-in", Appointment_Type: "Online" },
];

export const queueSeed = [
  { Queue_ID: 1, Queue_Number: "A-001", Display_Name: "John G.", Doctor_Name: "Dr. Santos", Queue_Source: "Appointment", Queue_Status: "Waiting", Estimated_Wait_Time: "12 mins", Priority_Number: 1 },
  { Queue_ID: 2, Queue_Number: "W-014", Display_Name: "Maria G.", Doctor_Name: "Dr. Reyes", Queue_Source: "Walk-in", Queue_Status: "Serving", Estimated_Wait_Time: "Now", Priority_Number: 2 },
  { Queue_ID: 3, Queue_Number: "A-002", Display_Name: "Carlo M.", Doctor_Name: "Dr. Lim", Queue_Source: "Appointment", Queue_Status: "Checked-in", Estimated_Wait_Time: "25 mins", Priority_Number: 3 },
];

export const schedulesSeed = [
  { Schedule_ID: 1, Doctor_Name: "Dr. Alyssa Santos", Day_Of_Week: "Monday", Start_Time: "08:00", End_Time: "16:00", Slot_Limit: 24, Schedule_Status: "Active" },
  { Schedule_ID: 2, Doctor_Name: "Dr. Miguel Reyes", Day_Of_Week: "Tuesday", Start_Time: "09:00", End_Time: "17:00", Slot_Limit: 18, Schedule_Status: "Active" },
  { Schedule_ID: 3, Doctor_Name: "Dr. Katrina Lim", Day_Of_Week: "Wednesday", Start_Time: "10:00", End_Time: "15:00", Slot_Limit: 14, Schedule_Status: "Day Off" },
  { Schedule_ID: 4, Doctor_Name: "Dr. Ramon Dela Cruz", Day_Of_Week: "Friday", Start_Time: "08:00", End_Time: "14:00", Slot_Limit: 20, Schedule_Status: "Active" },
];

export const notificationsSeed = [
  { Template_ID: 1, Template_Name: "Appointment Reminder", Event_Trigger: "1 day before appointment", Message_Subject: "Appointment Reminder", Message_Body: "Please arrive 15 minutes before your schedule.", Channel: "Email/SMS", Status: "Active" },
  { Template_ID: 2, Template_Name: "Queue Alert", Event_Trigger: "Queue number near serving", Message_Subject: "Queue Update", Message_Body: "Your queue number is almost ready. Please proceed to the waiting area.", Channel: "SMS", Status: "Active" },
  { Template_ID: 3, Template_Name: "Warning Notice", Event_Trigger: "Admin warning", Message_Subject: "Account Warning", Message_Body: "Please follow clinic appointment and queue policies.", Channel: "Email", Status: "Active" },
];
