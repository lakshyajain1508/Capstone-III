# Backend API Server

Real-time CPU monitoring and energy-aware scheduling service built with Flask and Python.

---

## 🚀 Quick Start

### Installation

1. **Install Python 3.8+**
   - Download from [python.org](https://www.python.org/)
   - Ensure pip is installed

2. **Install Dependencies:**
```bash
cd Backend
pip install -r requirements.txt
```

### Running the Server

```bash
python app.py
```

Server starts at: `http://localhost:5000`

**Expected Output:**
```
🚀 Starting Energy Aware CPU Scheduling Backend...
📊 API Server: http://localhost:5000
📚 API Docs: http://localhost:5000/api/health
```

---

## 📊 API Endpoints

### System Information

#### `GET /api/system/info`
Get system hardware information
```json
{
  "hostname": "DESKTOP-ABC123",
  "platform": "win32",
  "cpu_count": 8,
  "cpu_count_logical": 16,
  "total_memory": 15.94,
  "boot_time": "2024-01-15T10:30:00"
}
```

#### `GET /api/system/cpu`
Get real-time CPU statistics
```json
{
  "usage_percent": 25.5,
  "per_cpu": [15.2, 22.1, 18.5, 28.3, ...],
  "frequency_current": 2400.5,
  "frequency_min": 800.0,
  "frequency_max": 3600.0,
  "load_average": [0.5, 0.6, 0.4],
  "timestamp": "2024-01-15T10:35:00"
}
```

#### `GET /api/system/processes`
Get list of running processes with resource usage
```json
{
  "processes": [
    {
      "pid": 1024,
      "name": "chrome.exe",
      "cpu": 12.5,
      "memory": 512.3,
      "energy": 5.2
    },
    ...
  ],
  "count": 47,
  "timestamp": "2024-01-15T10:35:00"
}
```

#### `GET /api/system/energy`
Get system energy consumption estimates
```json
{
  "current_consumption": 145.3,
  "total_system": 650,
  "cpu_contribution": 37.5,
  "memory_contribution": 12.5,
  "efficiency": 92.3,
  "timestamp": "2024-01-15T10:35:00"
}
```

---

### Scheduling Algorithms

#### `POST /api/scheduling/simulate`
Run CPU scheduling simulation

**Request:**
```json
{
  "algorithm": "energy-aware",
  "processes": [
    {"id": "P1", "arrival": 0, "burst": 8, "priority": 1},
    {"id": "P2", "arrival": 1, "burst": 4, "priority": 2}
  ]
}
```

**Response:**
```json
{
  "algorithm": "energy-aware",
  "result": {
    "gantt_chart": [
      {
        "process": "P1",
        "start": 0,
        "end": 8,
        "color": "#FF6B6B"
      }
    ],
    "avg_waiting_time": 3.5,
    "avg_turnaround_time": 11.5,
    "cpu_utilization": 100,
    "total_energy": 15.2,
    "energy_efficiency": 84.8
  },
  "timestamp": "2024-01-15T10:35:00"
}
```

#### `GET /api/scheduling/gantt/<algorithm>`
Get Gantt chart data for specific algorithm
```
GET /api/scheduling/gantt/energy-aware
GET /api/scheduling/gantt/fcfs
GET /api/scheduling/gantt/sjf
GET /api/scheduling/gantt/round-robin
```

#### `GET /api/scheduling/compare`
Compare all scheduling algorithms
```json
{
  "fcfs": { ... },
  "sjf": { ... },
  "round_robin": { ... },
  "energy_aware": { ... }
}
```

---

### Performance Monitoring

#### `GET /api/performance/metrics`
Get current performance metrics
```json
{
  "cpu_usage": 25.5,
  "memory_usage": 45.2,
  "memory_available": 8.5,
  "swap_usage": 2.1,
  "disk_usage": 65.3,
  "timestamp": "2024-01-15T10:35:00"
}
```

#### `GET /api/performance/history/<timerange>`
Get historical performance data

**Time Ranges:**
- `1h` - Last hour
- `24h` - Last 24 hours
- `7d` - Last 7 days

```json
{
  "data": [
    {
      "timestamp": "2024-01-15T10:35:00",
      "cpu": 25.5,
      "frequency": 2400.5
    },
    ...
  ],
  "timerange": "1h"
}
```

---

### Energy Management

#### `GET /api/energy/consumption`
Get current energy consumption (same as `/api/system/energy`)

#### `GET /api/energy/per-process`
Get energy consumption per process
```json
{
  "processes": [
    {"name": "chrome.exe", "energy": 5.2},
    {"name": "vscode.exe", "energy": 1.8},
    ...
  ],
  "timestamp": "2024-01-15T10:35:00"
}
```

#### `POST /api/energy/optimize`
Get energy optimization suggestions
```json
{
  "suggestions": [
    "Reduce background processes",
    "Lower screen brightness",
    "Close unused applications",
    "Enable power saving mode"
  ],
  "potential_savings": 15.5
}
```

---

### Health Check

#### `GET /api/health`
Server health status
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:00"
}
```

---

## 🧮 Scheduling Algorithms

### FCFS (First Come First Served)
- **Characteristics:** Non-preemptive, simple
- **Best For:** Batch processing
- **Disadvantage:** Long waiting times possible

### SJF (Shortest Job First)
- **Characteristics:** Non-preemptive, minimizes waiting time
- **Best For:** Jobs with known burst times
- **Disadvantage:** Requires knowing job length

### Round Robin
- **Characteristics:** Preemptive, fair CPU distribution
- **Best For:** Interactive systems, time-sharing
- **Configuration:** Time quantum (default: 4ms)

### Energy-Aware
- **Characteristics:** Optimizes energy consumption
- **Best For:** Power-efficient systems
- **Metrics:** Considers CPU time and power consumption

---

## 🔧 Architecture

```
Backend/
├── app.py              # Flask application & API endpoints
├── scheduling.py       # Scheduling algorithms
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

### Key Components

1. **Flask App (app.py)**
   - HTTP API server
   - CORS enabled for cross-origin requests
   - Background monitoring thread
   - Error handling

2. **Scheduling Module (scheduling.py)**
   - FCFS implementation
   - SJF implementation
   - Round Robin implementation
   - Energy-Aware implementation

---

## 📊 System Monitoring

### Background Monitoring Thread
- Updates every 2 seconds
- Tracks CPU usage
- Monitors processes
- Stores last 100 records

### Data Collection
- Real-time CPU metrics
- Process list with resource usage
- Energy consumption estimates
- System load averages

---

## 🔌 Integration

### With React Frontend
```javascript
// Fetch CPU stats
const response = await fetch('http://localhost:5000/api/system/cpu')
const data = await response.json()
```

### With Electron Desktop App
```javascript
// Via IPC
const stats = await ipcRenderer.invoke('get-cpu-stats')
```

### With External Applications
- Standard REST API
- JSON responses
- CORS enabled
- No authentication required (add if needed)

---

## 🛡️ Security Considerations

### Currently (Development)
- ✅ CORS enabled (all origins)
- ✅ JSON validation
- ✅ Error handling
- ❌ No authentication
- ❌ No rate limiting

### For Production
Add to `app.py`:

1. **Authentication:**
```python
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@app.route('/api/...')
@auth.login_required
def endpoint():
    ...
```

2. **Rate Limiting:**
```python
from flask_limiter import Limiter
limiter = Limiter(app)

@app.route('/api/...')
@limiter.limit("60 per minute")
def endpoint():
    ...
```

3. **CORS Configuration:**
```python
CORS(app, resources={
    r"/api/*": {"origins": ["http://localhost:3000"]}
})
```

---

## 🐛 Troubleshooting

### Issue: Port 5000 already in use
**Solution:**
Change port in `app.py`:
```python
app.run(host='127.0.0.1', port=5001)
```

### Issue: Permission denied (psutil)
**Solution:**
- Run with admin privileges
- Or ignore process access errors (already handled)

### Issue: Module not found
**Solution:**
```bash
pip install -r requirements.txt
pip install Flask Flask-CORS psutil
```

### Issue: CORS errors from frontend
**Solution:**
Ensure CORS is enabled in `app.py`:
```python
from flask_cors import CORS
CORS(app)  # Enable all origins
```

---

## 📈 Performance

### Response Times
- System info: ~10ms
- CPU stats: ~500ms (with interval)
- Process list: ~1-2s (depends on process count)
- Scheduling simulation: ~100ms

### Resource Usage
- Memory: ~50-100MB
- CPU: <5% idle
- Disk: Minimal (no storage)

### Scalability
- Handles 100+ processes
- Supports concurrent requests
- Background monitoring thread
- Efficient data structures

---

## 📚 API Documentation

### Content Types
- Request: `application/json`
- Response: `application/json`

### Status Codes
- `200` - Success
- `400` - Bad request
- `404` - Not found
- `500` - Server error

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t energy-cpu-backend .
docker run -p 5000:5000 energy-cpu-backend
```

### Windows Service
Install as Windows service:
```bash
pip install pyinstaller
pyinstaller --onefile app.py
```

### Linux Service
Create `/etc/systemd/system/energy-cpu.service`:
```ini
[Unit]
Description=Energy Aware CPU Scheduling Backend

[Service]
Type=simple
User=nobody
WorkingDirectory=/home/user/Backend
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 📝 Development

### Adding New Endpoints
```python
@app.route('/api/new-endpoint', methods=['GET', 'POST'])
def new_endpoint():
    try:
        # Implementation
        return jsonify({'data': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Adding New Algorithms
Add class to `scheduling.py`:
```python
class NewAlgorithm:
    @staticmethod
    def schedule(processes):
        # Implementation
        return {
            'gantt_chart': [...],
            'avg_waiting_time': ...,
            'avg_turnaround_time': ...,
        }
```

### Testing
```bash
# Test an endpoint
curl http://localhost:5000/api/health

# Test with data
curl -X POST http://localhost:5000/api/scheduling/simulate \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "fcfs"}'
```

---

## 🎓 Educational Value

Perfect for learning:
- Flask web framework
- RESTful API design
- CPU scheduling algorithms
- System programming (psutil)
- Real-time data monitoring
- Multi-threading

---

## 📞 Support

### Logs
Check console output for:
- Request logs
- Error messages
- Monitoring updates

### Common Errors
See "Troubleshooting" section above

### Documentation
- Flask: https://flask.palletsprojects.com/
- psutil: https://psutil.readthedocs.io/
- Flask-CORS: https://flask-cors.readthedocs.io/

---

**Backend API Server Ready! 🚀**
