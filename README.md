# Spotter — Full-Stack HOS Route Planner & ELD Log Generator

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A full-stack logistics SaaS platform that plans truck routes across North America, strictly enforces FMCSA Hours of Service (HOS) rules (49 CFR § 395, 70-hour / 8-day property-carrying CMV rules), automatically optimizes mandatory fuel and rest stops, renders dark-mode route maps, and generates pixel-accurate FMCSA Driver's Daily Log (ELD) sheets with vector SVG rendering and PDF export.

---

## 🚛 Core Features

### 1. Deterministic FMCSA Hours of Service (HOS) Engine
- **11-Hour Driving Limit (§ 395.3(a)(3)(i))**: Restricts continuous driving to $\le 11$ cumulative hours following 10 consecutive hours off duty.
- **14-Hour Duty Window (§ 395.3(a)(2))**: Enforces that no CMV driving occurs after the 14th consecutive hour from duty start.
- **30-Minute Rest Break (§ 395.3(a)(3)(ii))**: Mandatory $\ge 30$ consecutive minutes of non-driving time after 8 cumulative hours of driving.
- **70-Hour / 8-Day Rolling Cycle (§ 395.3(b)(2))**: Tracks rolling 8-day on-duty hours against the 70.0-hour statutory cap.
- **34-Hour Restart (§ 395.3(c))**: Automatically triggers a 34 consecutive hour off-duty restart whenever initial cycle usage would cause an in-transit violation.
- **24.00-Hour Day Segmentation**: Reconciles duty segments into strict calendar days from 00:00 to 24:00 with zero cumulative time drift.

### 2. Smart Stop Optimization Engine
- **Fuel Threshold Enforcement**: Automatically schedules commercial fuel stops at intervals $\le 1,000$ miles.
- **Dual-Purpose Stop Consolidation**: Consolidates required 30-minute rest breaks with scheduled fuel stops, eliminating redundant driver downtime.
- **Mandatory Shipper / Receiver Time**: Accurately allocates exactly 1.0 hour (60 mins) On-Duty Not Driving for cargo loading (Pickup) and 1.0 hour for delivery (Dropoff).
- **Comprehensive Stop Justifications**: Every waypoint is annotated with human-readable regulatory rationale explaining *why* the stop was scheduled.

### 3. Vector ELD Log Renderer & Multi-Page Viewer
- **Vector SVG Grid**: Pixel-perfect digital reproduction of the official FMCSA Paper Log (`blank-paper-log.png`).
- **4 Standard Duty Status Rows**:
  1. Off Duty (Green)
  2. Sleeper Berth (Blue)
  3. Driving (Orange)
  4. On Duty Not Driving (Yellow)
- **15-Minute Grid Ticks & Status Connectors**: Quarter-hour tick marks with vertical dotted status transition lines.
- **Recap Section**: Daily 70h/8-day and 60h/7-day calculations (Lines A, B, C) with signature and carrier metadata blocks.
- **Multi-Day Navigation**: Day-by-day tab strip with smooth Framer Motion transitions.

### 4. Audit-Ready PDF Export
- **Single-Day Export**: Instant high-resolution vector PDF export of any single calendar day's log.
- **Full Trip Report**: Multi-page PDF packet including a branded cover sheet, all daily ELD logs, and a complete HOS compliance audit summary.

### 5. Interactive Dark-Themed Dashboard & 3D Visuals
- **Interactive Leaflet Map**: Dark-themed OpenStreetMap tiles, OSRM routing geometry, custom SVG pin markers for every stop category, and auto-fit bounding box.
- **Three.js 3D Hero Element**: Interactive rotating wireframe globe with animated route arcs and pulsating city nodes.
- **Geocoded Location Autocomplete**: Fast location search powered by Photon API with local US hub fallback.

---

## 🛠️ Architecture & Tech Stack

```
Spotter/
├── backend/                  # Django 5.1 + DRF Backend
│   ├── api/                  # REST API endpoints (locations, preview, plan)
│   ├── hos_engine/           # Core HOS simulation & stop optimizer
│   │   ├── calculator.py     # FMCSA rule constants & arithmetic
│   │   ├── domain.py         # Type dataclasses & Enums
│   │   ├── scheduler.py      # Timeline simulation & 24h day segmentation
│   │   ├── stop_optimizer.py # Break merging & stop justifications
│   │   ├── validator.py      # Independent compliance auditor
│   │   └── services/         # OSRM routing & Photon geocoding
│   ├── trips/                # PostgreSQL/SQLite Trip, Stop, DailyLog models
│   └── spotter_backend/      # Project settings, CORS, Whitenoise, WSGI
│
├── frontend/                 # React 19 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/    # Results dashboard, timeline, summary card
│   │   │   ├── eld/          # ELDLogSheet SVG renderer & ELDViewer
│   │   │   ├── map/          # Leaflet dark-mode route map
│   │   │   ├── three/        # Three.js 3D hero globe
│   │   │   ├── trip-form/    # Location inputs & cycle slider
│   │   │   └── ui/           # Radix UI / shadcn design system
│   │   ├── lib/              # jsPDF vector export utilities
│   │   ├── services/         # Typed API clients
│   │   └── types/            # TypeScript interfaces
│   └── public/
│
├── docker-compose.yml        # Multi-container local/prod environment
├── render.yaml               # Render PaaS deployment blueprint
└── netlify.toml              # Netlify static frontend deployment
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.11 or 3.12
- **Node.js**: 18+ or 20+
- **Docker** (optional)

---

### Option A: Local Development Setup

#### 1. Backend Setup
```bash
# Navigate to backend and create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django API server on http://localhost:8000
python manage.py runserver 8000
```

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

Visit **`http://localhost:5173`** (or port specified in terminal) in your browser.

---

### Option B: Docker Setup

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 🧪 Testing

### Backend Unit & Integration Tests (17 tests)
```bash
cd backend
./venv/bin/python manage.py test
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 📡 API Reference

### `POST /api/trips/plan/`
Generates a complete, HOS-compliant trip plan with stops, daily logs, and ELD data.

**Request Body:**
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Indianapolis, IN",
  "dropoff_location": "Atlanta, GA",
  "current_cycle_used": 24.5,
  "driver_name": "Sarah Miller",
  "carrier_name": "Spotter Logistics",
  "truck_number": "TRK-101",
  "trailer_number": "TRL-502"
}
```

**Response:**
Returns full `TripPlanResponse` containing `route_geometry`, `stops`, `daily_logs` (with 24h duty segments), and `hos_summary`.

### `GET /api/locations/autocomplete/?q=Chicago`
Debounced geocoding search returning suggestions with coordinates.

### `POST /api/routes/preview/`
Pre-calculates route geometry and distance without running the full HOS engine.

---

## 📜 Compliance Notice
Spotter calculates and audits schedules in accordance with the **Federal Motor Carrier Safety Administration (FMCSA) 49 CFR Part 395 — Hours of Service of Drivers (April 2022 Guidelines)**.

---

## 📄 License
MIT License. Open source for educational and commercial logistics development.