# Energy Aware CPU Scheduling

Desktop system monitor and scheduling simulator built with:
- Python Flask backend for CPU/process/energy APIs
- Electron frontend for a live dashboard and algorithm simulation

## Features
- Real-time CPU usage and frequency monitoring
- Running process list with CPU and estimated energy metrics
- Energy overview and optimization suggestions
- Scheduling simulation for:
  - FCFS
  - SJF
  - Round Robin
  - Energy-Aware
- Gantt chart and algorithm comparison metrics

## Project Structure

```text
Energy aware CPU scheduling/
├── Backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── routes/
│   ├── services/
│   └── models/
├── Frontend/
│   ├── main.js
│   ├── renderer.js
│   ├── index.html
│   ├── style.css
│   └── package.json
├── start-frontend-backend.bat
└── techstack.md
```

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm
- Windows (recommended for current startup scripts)

## Setup

### 1. Backend setup

```bash
cd Backend
python -m venv ..\.venv
..\.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend setup

```bash
cd Frontend
npm install
```

## Run the Project

### Option A: Run manually (recommended)

Terminal 1:

```bash
cd Backend
..\.venv\Scripts\python app.py
```

Terminal 2:

```bash
cd Frontend
npm start
```

### Option B: Use batch launcher

```bat
start-frontend-backend.bat
```

Note: The batch file currently expects an `electron` folder. If your frontend is in `Frontend`, use Option A or update the batch path.

## Backend API Base URL

`http://127.0.0.1:5000`

## Main API Endpoints

### Health
- `GET /api/health`

### CPU
- `GET /api/cpu`
- `GET /api/cpu/history`
- `GET /api/cpu/high`

### Processes
- `GET /api/processes?limit=15&sort_by=cpu`
- `GET /api/processes/history`
- `GET /api/processes/<pid>`
- `GET /api/processes/high-memory?threshold=100`
- `GET /api/processes/analysis`

### Energy
- `GET /api/energy`
- `GET /api/energy/per-process`
- `GET /api/energy/trends`
- `GET /api/energy/optimize`
- `GET /api/energy/efficiency`

### Scheduler
- `POST /api/scheduler/schedule`
- `POST /api/scheduler/compare`
- `GET /api/scheduler/gantt/<algorithm>`
- `POST /api/scheduler/fcfs`
- `POST /api/scheduler/sjf`
- `POST /api/scheduler/round-robin`
- `POST /api/scheduler/energy-aware`

## Example Scheduler Request

```json
{
  "algorithm": "energy-aware",
  "processes": [
    { "id": "P1", "arrival": 0, "burst": 8, "cpu": 30 },
    { "id": "P2", "arrival": 1, "burst": 4, "cpu": 25 },
    { "id": "P3", "arrival": 2, "burst": 2, "cpu": 15 }
  ]
}
```

## Troubleshooting
- If frontend shows backend unavailable, verify backend is running at `http://127.0.0.1:5000/api/health`.
- If `python` is not found, use `py -3` on Windows.
- If Electron fails to start, run `npm install` again in `Frontend` and retry.

## Tech Stack
- Backend: Flask, Flask-CORS, psutil, python-dotenv
- Frontend: Electron, HTML, CSS, Vanilla JavaScript
