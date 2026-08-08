# Cafe Management System

A full-stack café and restaurant management application with a modern React frontend and an Express + MongoDB backend. It includes dashboard-based operations for orders, inventory, employee management, reports, and customer-facing menu ordering.

## Overview

This project is organized as a monorepo:

- Frontend: React + Vite + Tailwind-inspired styling
- Backend: Node.js + Express + MongoDB/Mongoose
- Features: POS workflow, dashboard analytics, customer ordering, inventory tracking, and role-based access

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Recharts
- jsPDF
- XLSX
- QR Code support

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- CORS
- Dotenv

## Features

- Restaurant dashboard with role-based views
- Staff and employee management
- Inventory and stock tracking
- Menu and category management
- Order processing and billing flow
- Customer ordering experience and OTP-based access flow
- Reporting and analytics
- PDF and Excel export utilities
- Settings and configuration controls

## Project Structure

```bash
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seed.js
│   ├── seed-menu.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

Before running the app, ensure you have:

- Node.js 18 or newer
- npm or yarn
- MongoDB running locally or a valid MongoDB connection string

## Environment Variables

Create a `.env` file in the backend folder with the following values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cafe-management
```

You can also add other environment-specific values if required by your deployment setup.

## Installation

### 1) Install frontend dependencies

```bash
cd frontend
npm install
```

### 2) Install backend dependencies

```bash
cd ../backend
npm install
```

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Available Scripts

### Frontend

```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # run lint checks
```

### Backend

```bash
npm run dev      # start express server
npm run start    # run server in production mode
npm run seed     # seed database data
npm run seed:menu # seed menu data
```

## Seed Data

The backend includes database seed scripts for initial data population.

```bash
cd backend
npm run seed
npm run seed:menu
```

## Notes

- The app is designed for local development and can be extended for production deployment.
- A MongoDB connection must be available before starting the backend.
- The frontend expects the backend API to be accessible at the configured server URL.

## License

This project is currently configured with the default ISC license in the backend package.
