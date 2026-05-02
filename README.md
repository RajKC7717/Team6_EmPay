# EmPay HRMS

Smart HR & Payroll Management System

## Project Structure

```
Team6_EmPay/
├── backend/          # Node.js + Express + PostgreSQL API
├── frontend/         # React + TypeScript + Bootstrap UI
├── index.html        # Landing page
├── styles.css        # Landing page styles
└── script.js         # Landing page scripts
```

## Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure database credentials in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Features
- Auto-generated employee login IDs
- One-click attendance check-in/out
- Resume parsing for employee onboarding
- Income tax computation
- Performance management
- Policy documents
- Role-based access control
