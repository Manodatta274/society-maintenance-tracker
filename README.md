# Society Maintenance Tracker

A full-stack web application for managing and tracking residential society complaints, maintenance requests, notices, and administrative activities.

## 📌 Overview

Society Maintenance Tracker provides a centralized platform where residents can raise maintenance complaints and track their progress, while administrators can manage complaints, monitor service-level agreements (SLAs), analyze complaint statistics, and maintain an audit trail of important activities.

The application is designed with separate Resident and Admin workflows and uses a REST-based backend connected to MySQL.

## ✨ Key Features

### 👤 Resident

- Secure resident registration and login
- Raise maintenance complaints
- Select complaint categories
- Add complaint descriptions
- Upload complaint images
- Track complaint status
- View complaint history and timeline
- View society notices
- Receive notifications when complaint status changes

### 🛡️ Admin

- Secure administrator authentication
- Admin dashboard with real-time complaint statistics
- View and manage all complaints
- Search, filter, and sort complaints
- Update complaint status
- Assign complaint priority
- SLA and overdue complaint tracking
- Complaint analytics
- Resolution rate monitoring
- Average resolution time
- Complaint category analysis
- Complaint status analysis
- Recent administrative activity
- Audit logging
- Notification management

## 📊 Dashboard Analytics

The Admin Dashboard provides:

- Total complaints
- Complaints by status
- Complaints by category
- Complaints by priority
- Resolution rate
- Average resolution time
- Overdue SLA complaints
- High-priority complaints
- Complaint trends over time
- Recent administrative activity

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     React Client    │
                    │    TypeScript +     │
                    │      Vite           │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Node.js +        │
                    │    Express.js       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │      Database       │
                    └─────────────────────┘

## 🛠️ Technology Stack

Frontend

React
TypeScript
Vite
Tailwind CSS
Recharts
React Router
Lucide React

Backend

Node.js
Express.js
MySQL
mysql2

JWT Authentication

bcryptjs
Multer
Database
MySQL
Relational database design
Complaint history tracking
Audit logging
Notification management

## 🔐 Authentication & Security

The application implements:

JWT-based authentication
Role-based authorization
Separate Admin and Resident access
Password hashing using bcrypt
Protected API routes
Secure environment-based configuration
File upload validation
Audit logging for important administrative actions

society-maintenance-tracker/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── db-migrate.js
│   ├── server.js
│   ├── seed-users.js
│   └── package.json
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md