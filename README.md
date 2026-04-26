# 🏛️ Barangay Document Request System

A modern barangay management web application built with **React**, **Vite**, and **Firebase**.  
It streamlines the entire barangay document request process – from online form submission to real‑time status tracking – and automatically sends email notifications via **EmailJS** whenever an admin updates the request status.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
[![EmailJS](https://img.shields.io/badge/EmailJS-v4-ff8434)](https://www.emailjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

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
