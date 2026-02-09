# Hostel Management System (HCI Project)

## Project Overview

This project is a **Hostel Management System website** developed as part of a **Human Computer Interaction (HCI)** academic project.

The aim of the system is to digitize hostel-related processes such as complaint registration, housekeeping tracking, room inventory management, and safety access. The website replaces the traditional manual register-based system with a **clear, form-based, and transparent web interface**.

The design is intentionally **institutional, minimal, and practical**, resembling a real college hostel management portal rather than a startup-style application.

---

## Problem Statement

In the existing hostel system, students are required to physically go to the first floor and write complaints in a register. This process is:

- Time-consuming  
- Non-transparent  
- Difficult to track  
- Prone to delays and lost complaints  

Students have no way to know:
- Whether a complaint has been noticed
- Whether work has started
- When the issue will be resolved

This project addresses these issues by providing a **digital, role-based hostel management website**.

---

## User Roles

The system supports three user roles:

### Student
- Raise complaints
- View complaint status
- View common housekeeping complaints
- Check room cleaning schedule
- Manage room inventory checklist
- View available rooms and apply for room change
- Access lost & found board
- Use emergency contact feature

### Warden (Admin)
- View all complaints (including anonymous)
- Update complaint status
- Approve or reject visitor requests
- Mark cleaning completion
- Manage room availability
- Approve or reject room change requests

### Worker / Repair Person
- View assigned complaints
- Update complaint status (Seen, In Progress, Resolved)
- View housekeeping complaints (read-only)
- Mark cleaning tasks as completed

---

## Key Features

### Complaint Management System
- Digital complaint registration
- Complaint categories (AC, Plumbing, Electrical, Housekeeping, etc.)
- Unique complaint ID and timestamp
- Complaint status tracking:
  - Submitted
  - Seen
  - In Progress
  - Resolved
  - Reopened
  - Closed
- Reopen complaint option if issue is not resolved
- Anonymous complaint option for sensitive issues

### Shared Housekeeping Complaint Visibility
- Common housekeeping complaints are visible to:
  - Students
  - Warden
  - Workers
- Prevents duplicate complaints
- Improves transparency

### Room Cleaning Schedule
- Floor-wise cleaning schedule
- Cleaning completion marked by staff
- Completion timestamp visible to students

### Room Inventory Checklist
- Inventory check at semester start:
  - Bed
  - Table
  - Fan
  - Light
  - Cupboard
- Damaged or missing items automatically generate complaints

### Room Availability & Room Change Requests
- Students can view available rooms
- Submit room change requests with reason
- Warden approval workflow
- Automatic update of room occupancy status

### Emergency Button
- Fixed-position emergency button
- One-tap access to:
  - Warden
  - Security
  - Medical Room

### Visitor Log System
- Visitor request submission by students
- Approval or rejection by warden
- Time-bound visitor access

### Lost & Found Board
- Digital lost and found notice board
- Table-based layout
- Data stored using localStorage

---

## Design & HCI Principles Applied

- Form-based interaction for clarity
- Role-based navigation
- Visibility of system status
- Reduced physical and cognitive effort
- Error prevention through structured inputs
- Transparency and user trust
- Minimal and distraction-free UI

