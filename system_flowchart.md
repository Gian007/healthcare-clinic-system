# 🏥 HealthCare Clinic Queue & Appointment System — Complete Flowchart

---

## 1. System Overview — High Level Architecture

```mermaid
graph TB
    subgraph PUBLIC["🌐 Public Website"]
        HOME["Home Page"]
        DOCS["Doctors Directory"]
        SVCS["Services Catalog"]
        QUEUE_PUB["Live Queue Display"]
        ANNOUNCE["Announcements"]
    end

    subgraph AUTH["🔐 Authentication Gateway"]
        LOGIN["Login"]
        REGISTER["Patient Registration"]
        FORGOT["Forgot Password"]
        RESET["Reset Password"]
    end

    subgraph ROLES["🎯 Role-Based Dashboards"]
        PATIENT["👤 Patient Portal"]
        STAFF["🧑‍💼 Staff Dashboard"]
        DOCTOR["🩺 Doctor Dashboard"]
        ADMIN["⚙️ Admin Panel"]
    end

    subgraph BACKEND["💾 Laravel Backend + SQLite"]
        API["REST API"]
        DB["Database"]
        STORAGE["File Storage"]
        NOTIF["Notification Engine"]
    end

    HOME --> LOGIN
    HOME --> REGISTER
    LOGIN --> |Authenticate| API
    REGISTER --> |Create Account| API
    API --> |Role Check| ROLES
    API --> DB
    API --> STORAGE
    API --> NOTIF
    PATIENT --> API
    STAFF --> API
    DOCTOR --> API
    ADMIN --> API
```

---

## 2. Patient Journey — Registration to Appointment

```mermaid
flowchart TD
    START(("🟢 START")) --> VISIT["Visit Public Website"]
    VISIT --> REG{"Has Account?"}
    
    REG -->|No| SIGNUP["Register Account"]
    SIGNUP --> FILL["Fill Personal Info:<br/>Name, Email, Phone (+63),<br/>Birthdate, Address"]
    FILL --> PASS["Create Password"]
    PASS --> ACC_CREATED["✅ Account Created<br/>(Status: Active, Verification: Pending)"]
    ACC_CREATED --> LOGIN_P["Login to Portal"]
    
    REG -->|Yes| LOGIN_P
    LOGIN_P --> DASH["Patient Dashboard"]
    
    DASH --> PFP{"Upload Profile<br/>Picture?"}
    PFP -->|Yes| SELECT_PHOTO["Select Photo"]
    SELECT_PHOTO --> CROP["✂️ Crop to Square<br/>(Zoom + Pan)"]
    CROP --> UPLOAD_PFP["Upload Cropped Image"]
    UPLOAD_PFP --> DASH
    PFP -->|No| DASH

    DASH --> VERIFY{"Verify Identity?"}
    VERIFY -->|Yes| ID_UPLOAD["Upload 3 Documents"]
    
    subgraph VERIFY_DOCS["📋 Verification Documents"]
        ID_FRONT["📄 Front of ID"]
        ID_BACK["📄 Back of ID"]
        ID_SELFIE["🤳 Selfie Holding ID"]
    end
    
    ID_UPLOAD --> ID_FRONT
    ID_UPLOAD --> ID_BACK
    ID_UPLOAD --> ID_SELFIE
    ID_FRONT & ID_BACK & ID_SELFIE --> SUBMIT_ID["Submit for Review"]
    SUBMIT_ID --> UNDER_REVIEW["⏳ Status: Under Review"]
    UNDER_REVIEW --> NOTIF_STAFF["📢 Notify Staff"]
    
    VERIFY -->|No| BOOK
    
    DASH --> BOOK["📅 Book Appointment"]
    BOOK --> SELECT_DOC["Select Doctor"]
    SELECT_DOC --> SELECT_SVC["Select Service"]
    SELECT_SVC --> SELECT_DATE["Pick Date & Time Slot"]
    SELECT_DATE --> REASON["Enter Visit Reason"]
    REASON --> CONFIRM_BOOK["Confirm Booking"]
    CONFIRM_BOOK --> BOOKED["✅ Appointment Booked<br/>(Status: Pending)"]
    BOOKED --> NOTIF_PAT["📢 Patient Notified"]
    
    DASH --> PROFILE["✏️ Edit Profile"]
    PROFILE --> SAVE_PROF["Save Changes"]
    
    DASH --> CHANGE_PW["🔑 Change Password"]
    DASH --> VIEW_NOTIF["🔔 View Notifications"]
    DASH --> LOGOUT_P(("🔴 Logout"))
```

---

## 3. ID Verification Review — Staff/Admin Flow

```mermaid
flowchart TD
    START_V(("🟢 Patient Submits<br/>Verification")) --> NOTIF_S["📢 Staff Gets Notification"]
    NOTIF_S --> OPEN["Staff Opens Patient → Manage"]
    OPEN --> REVIEW["Click 'Review Documents'"]
    
    REVIEW --> VIEW_IMGS["View 3 Images"]
    
    subgraph IMAGES["🖼️ Document Review Panel"]
        IMG1["Front of ID"]
        IMG2["Back of ID"]  
        IMG3["Selfie + ID"]
    end
    
    VIEW_IMGS --> IMG1 & IMG2 & IMG3
    IMG1 & IMG2 & IMG3 --> ZOOM["🔍 Click to Enlarge"]
    
    ZOOM --> DECIDE{"Decision"}
    
    DECIDE -->|Approve| APPROVE["✅ Approve Verification"]
    APPROVE --> STATUS_APP["Patient Status → Approved"]
    STATUS_APP --> NOTIF_APP["📢 Patient Notified:<br/>'Identity Verified!'"]
    
    DECIDE -->|Reject| REJECT_BOX["Open Rejection Panel"]
    REJECT_BOX --> DROPDOWN["Select Common Reason"]
    
    subgraph REASONS["❌ Rejection Reasons"]
        R1["Image is blurred"]
        R2["Missing Front/Back"]
        R3["Selfie not clear"]
        R4["ID doesn't match name"]
        R5["ID is expired"]
        R6["Incorrect ID type"]
        R7["Others - Custom note"]
    end
    
    DROPDOWN --> R1 & R2 & R3 & R4 & R5 & R6 & R7
    R1 & R2 & R3 & R4 & R5 & R6 & R7 --> ADD_NOTE["Add Additional Notes"]
    ADD_NOTE --> CONFIRM_REJ["Submit Rejection"]
    CONFIRM_REJ --> STATUS_REJ["Patient Status → Rejected"]
    STATUS_REJ --> NOTIF_REJ["📢 Patient Notified:<br/>'Rejected — Reason: ...'"]
    NOTIF_REJ --> REUPLOAD["Patient Sees Reason<br/>on Profile Page"]
    REUPLOAD --> |Re-upload| START_V
```

---

## 4. Staff Operations — Daily Workflow

```mermaid
flowchart TD
    STAFF_LOGIN(("🟢 Staff Login")) --> STAFF_DASH["📊 Staff Dashboard"]
    
    STAFF_DASH --> |"View Stats"| STATS["Today's Stats:<br/>Appointments, Queues,<br/>Pending Verifications"]
    
    STAFF_DASH --> QUEUE_MGT["🔢 Queue Management"]
    QUEUE_MGT --> VIEW_Q["View Today's Queue"]
    VIEW_Q --> UPDATE_Q["Update Status:<br/>Waiting → Serving → Done"]
    UPDATE_Q --> NOTIF_DONE["📢 Notify Patient<br/>'Appointment Complete'"]
    
    STAFF_DASH --> SCAN["📷 Scan Patient QR"]
    SCAN --> CHECK_IN["Patient Check-in"]
    
    STAFF_DASH --> APPT["📅 Manage Appointments"]
    APPT --> VIEW_APPT["View All Appointments"]
    VIEW_APPT --> CHANGE_STATUS["Update Status:<br/>Pending → Confirmed → Cancelled"]
    CHANGE_STATUS --> NOTIF_APPT["📢 Notify Patient"]
    
    STAFF_DASH --> WALKIN["🚶 Walk-in Registration"]
    WALKIN --> NEW_WALKIN["Register Walk-in Patient"]
    NEW_WALKIN --> ADD_QUEUE["Add to Today's Queue"]
    
    STAFF_DASH --> PATIENTS["👥 Patient Management"]
    PATIENTS --> MANAGE["Manage Patient Records"]
    MANAGE --> EDIT_INFO["Edit: Name, Phone,<br/>Status, Address"]
    MANAGE --> VERIFY_ID["🪪 Review Verification"]
    MANAGE --> WARN["⚠️ Warn Patient"]
    
    STAFF_DASH --> SCHEDULE["📋 Hospital Schedule"]
    STAFF_DASH --> NOTIFS["🔔 Notifications"]
    STAFF_DASH --> PROFILE_S["👤 Staff Profile"]
    PROFILE_S --> CROP_S["✂️ Crop Profile Photo"]
    
    STAFF_DASH --> LOGOUT_S(("🔴 Logout"))
```

---

## 5. Doctor Operations — Clinical Workflow

```mermaid
flowchart TD
    DOC_LOGIN(("🟢 Doctor Login")) --> DOC_DASH["📊 Doctor Dashboard"]
    
    DOC_DASH --> DOC_APPT["📅 My Appointments"]
    DOC_APPT --> VIEW_PAT["View Patient Details"]
    DOC_APPT --> MARK_DONE["Mark as Completed"]
    
    DOC_DASH --> DOC_QUEUE["🔢 My Queue"]
    DOC_QUEUE --> CALL_NEXT["Call Next Patient"]
    DOC_QUEUE --> SKIP["Skip / Hold"]
    
    DOC_DASH --> DOC_SCHED["📋 My Schedule"]
    DOC_SCHED --> VIEW_SLOTS["View Weekly Slots"]
    
    DOC_DASH --> DOC_DAYOFF["🌴 Day Off Requests"]
    DOC_DAYOFF --> REQ_OFF["Request Day Off"]
    REQ_OFF --> ADMIN_APPROVE["Admin Reviews Request"]
    
    DOC_DASH --> DOC_ATTEND["✅ Attendance"]
    DOC_ATTEND --> CLOCK_IN["Record Attendance"]
    
    DOC_DASH --> DOC_QR["📱 QR Code"]
    DOC_QR --> SHOW_QR["Display Personal QR"]
    
    DOC_DASH --> DOC_PROF["👤 Doctor Profile"]
    DOC_PROF --> EDIT_DOC["Edit Personal Info"]
    DOC_PROF --> CROP_DOC["✂️ Crop Profile Photo"]
    DOC_PROF --> CHANGE_PW_D["Change Password"]
    
    DOC_DASH --> LOGOUT_D(("🔴 Logout"))
```

---

## 6. Admin Operations — System Management

```mermaid
flowchart TD
    ADMIN_LOGIN(("🟢 Admin Login")) --> ADMIN_DASH["📊 Admin Dashboard"]
    
    ADMIN_DASH --> MGT_DOC["🩺 Manage Doctors"]
    MGT_DOC --> ADD_DOC["Add Doctor"]
    MGT_DOC --> EDIT_DOC_A["Edit Doctor"]
    MGT_DOC --> TOGGLE_DOC["Activate / Deactivate"]
    
    ADMIN_DASH --> MGT_STAFF["🧑‍💼 Manage Staff"]
    MGT_STAFF --> ADD_STAFF["Create Staff Account<br/>(Temp Password)"]
    MGT_STAFF --> EDIT_STAFF["Edit Staff Details"]
    
    ADMIN_DASH --> MGT_PAT_A["👥 Manage Patients"]
    MGT_PAT_A --> EDIT_PAT_A["Edit Patient Records"]
    MGT_PAT_A --> VERIFY_A["🪪 Review Verification"]
    MGT_PAT_A --> WARN_A["⚠️ Warn / Suspend"]
    
    ADMIN_DASH --> MGT_SVC["🏥 Manage Services"]
    MGT_SVC --> ADD_SVC["Add Service"]
    MGT_SVC --> EDIT_SVC["Edit Service"]
    MGT_SVC --> DEL_SVC["Delete Service"]
    
    ADMIN_DASH --> MGT_SCHED["📅 Manage Schedules"]
    MGT_SCHED --> ADD_SCHED["Create Doctor Schedule"]
    MGT_SCHED --> DEL_SCHED["Delete Schedule"]
    
    ADMIN_DASH --> MGT_DAYOFF["🌴 Day Off Requests"]
    MGT_DAYOFF --> APPROVE_OFF["Approve / Reject"]
    
    ADMIN_DASH --> REPORTS["📈 Reports"]
    REPORTS --> STATS_A["View Analytics:<br/>Appointments, Patients,<br/>Revenue Summary"]
    
    ADMIN_DASH --> ADMIN_NOTIFS["🔔 Notifications"]
    ADMIN_DASH --> SETTINGS["⚙️ Account Settings"]
    SETTINGS --> EDIT_ADMIN["Edit Admin Info"]
    SETTINGS --> CROP_ADMIN["✂️ Crop Profile Photo"]
    SETTINGS --> PW_ADMIN["Change Password"]
    
    ADMIN_DASH --> LOGOUT_A(("🔴 Logout"))
```

---

## 7. Notification System Flow

```mermaid
flowchart LR
    subgraph TRIGGERS["⚡ Trigger Events"]
        T1["Appointment Booked"]
        T2["Appointment Confirmed"]
        T3["Appointment Cancelled"]
        T4["ID Verification Submitted"]
        T5["ID Approved"]
        T6["ID Rejected"]
        T7["Queue Completed"]
        T8["Name Change Request"]
    end
    
    subgraph ENGINE["🔔 Notification Engine"]
        CREATE["Create SystemNotification"]
        STORE["Store in DB:<br/>title, body, type,<br/>notifiable_type/id"]
    end
    
    subgraph DELIVERY["📬 Delivery"]
        BELL["🔔 Bell Icon Badge"]
        PANEL["Notification Panel"]
        MARK["Mark as Read"]
        MARK_ALL["Mark All as Read"]
    end
    
    T1 & T2 & T3 --> |Patient| CREATE
    T4 & T8 --> |Staff/Admin| CREATE
    T5 & T6 & T7 --> |Patient| CREATE
    CREATE --> STORE
    STORE --> BELL
    BELL --> PANEL
    PANEL --> MARK
    PANEL --> MARK_ALL
```

---

## 8. Profile Picture Upload Flow — All Roles

```mermaid
flowchart TD
    SELECT["📁 Select Image File"] --> READ["FileReader reads as DataURL"]
    READ --> CROPPER["✂️ Image Cropper Opens"]
    
    subgraph CROP_UI["Crop Interface"]
        PREVIEW["Live Preview<br/>(1:1 Square Ratio)"]
        ZOOM["🔍 Zoom Slider<br/>(1x to 3x)"]
        PAN["✋ Drag to Reposition"]
    end
    
    CROPPER --> PREVIEW & ZOOM & PAN
    
    PREVIEW --> APPLY{"Apply Crop?"}
    APPLY -->|Cancel| CANCEL["❌ Close Cropper"]
    APPLY -->|Apply| CANVAS["Canvas crops pixels"]
    CANVAS --> BLOB["Convert to JPEG Blob"]
    BLOB --> FORMDATA["Append to FormData"]
    FORMDATA --> UPLOAD["POST /profile/photo"]
    UPLOAD --> SERVER["Server stores in<br/>/storage/profile-pictures/"]
    SERVER --> REFRESH["Refresh user data"]
    REFRESH --> UPDATED["✅ Avatar Updated<br/>Everywhere"]
```

---

## 9. Database Entity Relationships

```mermaid
erDiagram
    PATIENTS ||--o{ APPOINTMENTS : books
    PATIENTS ||--o| PATIENT_VERIFICATIONS : has
    PATIENTS ||--o{ QUEUES : "queued in"
    PATIENTS ||--o{ SYSTEM_NOTIFICATIONS : receives
    
    DOCTORS ||--o{ APPOINTMENTS : serves
    DOCTORS ||--o{ DOCTOR_SCHEDULES : has
    DOCTORS ||--o{ DOCTOR_DAY_OFFS : requests
    DOCTORS ||--o{ DOCTOR_ATTENDANCES : logs
    DOCTORS }o--|| SPECIALIZATIONS : "belongs to"
    DOCTORS }o--o{ SERVICES : "offers via doctor_service"
    DOCTORS ||--o{ QUEUES : serves
    
    STAFF ||--o{ PATIENT_VERIFICATIONS : reviews
    STAFF ||--o{ SYSTEM_NOTIFICATIONS : receives
    
    APPOINTMENTS ||--o{ CONSULTATIONS : "results in"
    APPOINTMENTS ||--o{ APPOINTMENT_RESCHEDULES : "may have"
    APPOINTMENTS ||--o{ APPOINTMENT_CANCELLATIONS : "may have"
    APPOINTMENTS }o--|| SERVICES : "for service"
    APPOINTMENTS }o--|| DOCTOR_SCHEDULES : "in slot"
    
    CONSULTATIONS ||--o{ PRESCRIPTIONS : generates
    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : contains
    
    PATIENTS {
        bigint patient_id PK
        string patient_number
        string first_name
        string last_name
        string email
        string contact_number
        string verification_status
        string account_status
        string profile_picture
    }
    
    DOCTORS {
        bigint doctor_id PK
        string first_name
        string last_name
        bigint specialization_id FK
        string license_number
        string status
    }
    
    STAFF {
        bigint staff_id PK
        string first_name
        string last_name
        string email
        string role
    }
    
    PATIENT_VERIFICATIONS {
        bigint verification_id PK
        bigint patient_id FK
        string id_image
        string id_back_image
        string selfie_image
        string status
        string rejection_reason
        bigint reviewed_by FK
    }
    
    APPOINTMENTS {
        bigint appointment_id PK
        bigint patient_id FK
        bigint doctor_id FK
        bigint service_id FK
        date appointment_date
        time start_time
        string booking_status
    }
```

---

## 10. Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 7 | UI Components & Routing |
| **Styling** | Tailwind CSS 3 | Responsive Dark/Light Mode |
| **Icons** | React Icons + Lucide | UI Iconography |
| **Charts** | Recharts | Dashboard Analytics |
| **Image Crop** | react-easy-crop | Profile Picture Formatting |
| **Backend** | Laravel (PHP) | REST API + Auth |
| **Auth** | Sanctum Tokens | Session/Token Management |
| **Database** | SQLite | Local Persistent Storage |
| **File Storage** | Laravel Storage (public) | Profile Pictures & ID Images |
| **Notifications** | SystemNotification Model | In-App Real-Time Alerts |
