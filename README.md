# 🎫 Helpdesk Management System

A full-stack helpdesk ticketing platform designed to streamline issue reporting, tracking, and resolution. Built with a decoupled architecture featuring a React frontend and an ASP.NET Core Web API backend, complete with real-time updates and role-based access control.

## 🔗 Live Demo
* **Frontend Application:** [https://helpdeskfront-umber.vercel.app](https://helpdeskfront-umber.vercel.app)
* **API Endpoint (Proxy enabled):** Hosted on Somee

## 🔐 Test Credentials
To explore the application without registering, use the following credentials:

**Admin Account** (Full access to manage all complaints and system settings)
* **Email:** `sem@Admin.com`
* **Password:** `12345`

**Standard User Account** (Create and track personal complaints)
* *Feel free to register a new user account via the Sign-Up page to test user flows.*

## ✨ Key Features
* **Role-Based Authorization:** Distinct dashboards and permissions for Admins and standard Users using JWT.
* **Real-Time Notifications:** Integrated **SignalR** to push live updates to the frontend immediately when ticket statuses change.
* **Secure API Proxying:** Configured Vercel rewrites to handle mixed content (HTTPS to HTTP) securely without browser warnings.
* **Responsive UI:** Clean and intuitive interface optimized for both desktop and mobile viewing.

## 🛠️ Tech Stack
**Frontend:**
* React.js (Vite)
* Axios (API calls via Vercel Proxy)
* SignalR Client (WebSockets)
* Tailwind CSS / Bootstrap *(Adjust based on your UI library)*

**Backend:**
* ASP.NET Core Web API
* Entity Framework Core
* JWT Authentication
* MS SQL Server (Hosted on Somee)

## 🚀 Local Setup Instructions

### Prerequisites
* Node.js & npm installed
* .NET SDK installed
* SQL Server Express

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
