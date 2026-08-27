# Spotter — Full-Stack HOS Route Planner & ELD Log Generator

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A production-grade logistics platform that plans truck routes, strictly enforces FMCSA Hours of Service (HOS) rules (70hr/8day property carrier), dynamically optimizes fuel and rest stops, visualizes interactive dark-mode maps, and renders pixel-accurate FMCSA Driver's Daily Log (ELD) sheets with PDF export.

---

## 🚛 Features

- **HOS Compliance Engine**: Implements the 11-Hour Driving Limit, 14-Hour Duty Window, 30-Minute Rest Break, 70-Hour / 8-Day Rolling Cycle, and 34-Hour Restarts.
- **Smart Stop Optimization**: Auto-detects fueling needs (every $\le$ 1,000 miles) and merges breaks with fuel stops to reduce downtime.
- **Interactive Routing & Dark Map**: Fast OSRM route calculations with Leaflet visualization and custom waypoint markers.
- **Vector ELD Log Renderer**: Generates authentic 24-hour graph grids with duty status transitions (Off Duty, Sleeper Berth, Driving, On Duty Not Driving) matching official FMCSA paper logs (`blank-paper-log.png`).
- **Audit-Ready PDF Export**: Export individual daily logs, full multi-day logs, or complete trip inspection reports.

---

## 🛠️ Tech Stack

- **Backend**: Django 5.1, Django REST Framework, ReportLab, WhiteNoise
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, Three.js
- **Mapping**: Leaflet, OpenStreetMap, OSRM Routing Engine
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ / 3.12+
- Node.js 18+ / 20+

### Backend Setup
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to launch the application.