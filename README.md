# 🏛️ Barangay Document Request System

A modern barangay management web application built with **React**, **Vite**, and **Firebase**.  
It streamlines the entire barangay document request process – from online form submission to real‑time status tracking – and automatically sends email notifications via **EmailJS** whenever an admin updates the request status.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
[![EmailJS](https://img.shields.io/badge/EmailJS-v4-ff8434)](https://www.emailjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---
## 📸 Preview
<img width="1414" height="1000" alt="image" src="https://github.com/user-attachments/assets/30e944da-d1be-44b8-ab07-e3ca242937d5" />
<img width="1417" height="860" alt="image" src="https://github.com/user-attachments/assets/9f0dcb8e-f5d1-4f86-9355-4a5af7cac9c6" />
<img width="1917" height="1028" alt="image" src="https://github.com/user-attachments/assets/a13af467-8177-40d6-8128-a86ab94033b6" />
<img width="1910" height="1031" alt="image" src="https://github.com/user-attachments/assets/da9106c3-2d58-4aa9-9018-3403e04f48fa" />


---

## ✨ Key Features

### 1. Document Request Form
- Public‑facing form where residents select a document type (Barangay Clearance, Certificate of Residency, etc.), fill in their personal information, and submit the request.
- Generates a unique **reference number** for tracking.
- Sends a **confirmation email** to the resident as soon as the request is submitted.

### 2. Status Tracking & Notifications
- Staff/admins can view all requests in a central dashboard and update their status.
- Status workflow: **Draft → Pending → Processing → Approved → Releasing → Completed**.
- **Automatic email notification** is triggered every time the status changes, powered by **EmailJS**.
- Residents receive a link to track their request status online.

### 3. Role‑Based Dashboards
- **Admin Dashboard** – Full control over requests, residents, and audit logs.
- **Encoder Dashboard** – Data entry and document generation.
- **Staff Dashboard** – Request processing and status updates.
- **Public Tracking Page** – Residents can check their request status using their reference number.

### 4. Resident Management
- Automatically creates resident records when a request is approved.
- Centralized resident database for future requests and verifications.

### 5. Document Generation
- Built‑in service to generate printable PDF/document files for approved requests.

### 6. Audit Logging
- Every action (create request, update status, register resident) is logged in Firestore for accountability.

---

## 🧰 Tech Stack

| Technology            | Purpose                                     |
| --------------------- | ------------------------------------------- |
| **React 18**          | Frontend UI library                         |
| **Vite**              | Build tool and development server           |
| **Firebase Auth**     | Staff authentication (email/password)        |
| **Firebase Firestore**| NoSQL database for requests, residents, audit |
| **EmailJS**           | Client‑side email delivery                  |
| **React Router**      | Client‑side routing                         |
| **CSS Modules**       | Component‑scoped styling                    |

---

## 🏗️ Project Structure (simplified)
elective_brgy_system/
├── public/ # Static assets
├── src/
│ ├── app/
│ │ ├── auth/ # Login, Register pages
│ │ ├── dashboard/ # Admin, Encoder, Staff dashboards
│ │ ├── requests/ # Request list, details, tracking
│ │ ├── residents/ # Resident management
│ │ ├── audit/ # Audit log viewer
│ │ └── public/ # Public request form & tracking
│ ├── components/
│ │ ├── common/ # Buttons, inputs, modals, etc.
│ │ └── layout/ # Header, sidebar, protected route
│ ├── constants/ # Request statuses, document types, roles
│ ├── context/ # React context providers
│ ├── firebase/ # Firebase config & initialization
│ ├── hooks/ # Custom React hooks
│ ├── routes/ # Route definitions & protected routes
│ ├── services/
│ │ ├── authService.js # Login, logout, password reset
│ │ ├── requestService.js # CRUD for document requests
│ │ ├── residentService.js # Resident record management
│ │ ├── emailService.js # EmailJS integration
│ │ ├── notificationService.js
│ │ ├── auditService.js # Audit logging
│ │ └── documentGenerationService.js
│ └── utils/ # Helper functions
├── mailer-worker/ # (Optional) background email worker
├── server/ # (Optional) backend server
├── firebase.json # Firebase project configuration
├── .firebaserc # Firebase project alias
├── vite.config.js # Vite configuration
└── package.json

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 16 (recommended 18+)
- **npm** ≥ 9 or **yarn** ≥ 1.22
- A **Firebase project** with **Authentication** and **Firestore** enabled
- An **EmailJS account** with a configured service and email templates

### 1. Clone & Install

```bash
git clone https://github.com/xdronnie/elective_brgy_system.git
cd elective_brgy_system
npm install
