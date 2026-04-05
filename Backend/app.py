"""
Energy Aware CPU Scheduling Backend
Real-time system monitoring and energy-aware scheduling engine
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psutil
import os
import threading
import time
from datetime import datetime

# Import route blueprints
from routes.cpu_routes import cpu_bp
from routes.process_routes import process_bp
from routes.energy_routes import energy_bp
from routes.scheduler_routes import scheduler_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(cpu_bp)
app.register_blueprint(process_bp)
app.register_blueprint(energy_bp)
app.register_blueprint(scheduler_bp)

# Application state
monitoring_active = True
monitoring_data = {
    'cpu_history': [],
    'process_history': [],
    'energy_history': []
}

# Warm up psutil counters so first API samples are meaningful.
psutil.cpu_percent(interval=None)
psutil.cpu_percent(interval=None, percpu=True)


def background_monitoring():
    """Background thread for continuous system monitoring"""
    while monitoring_active:
        try:
            # Collect CPU data
            cpu_percent = psutil.cpu_percent(interval=None)
            cpu_freq = psutil.cpu_freq()
            
            # Collect process data
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
                try:
                    pinfo = proc.as_dict(attrs=['pid', 'name', 'cpu_percent', 'memory_info'])
                    if pinfo['cpu_percent'] > 0:
                        processes.append({
                            'pid': pinfo['pid'],
                            'name': pinfo['name'],
                            'cpu': pinfo['cpu_percent'],
                            'memory': pinfo['memory_info'].rss / (1024 * 1024),  # MB
                            'energy': (pinfo['cpu_percent'] * 0.5) + (pinfo['memory_info'].rss / (1024*1024*1024) * 0.1)
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # Store in history (keep last 100 records)
            monitoring_data['cpu_history'].append({
                'timestamp': datetime.now().isoformat(),
                'cpu': cpu_percent,
                'frequency': cpu_freq.current if cpu_freq else 0
            })
            
            monitoring_data['process_history'] = processes
            
            if len(monitoring_data['cpu_history']) > 100:
                monitoring_data['cpu_history'].pop(0)
            
            time.sleep(2)  # Update every 2 seconds
        except Exception as e:
            time.sleep(2)


# ===== ROOT ROUTES =====

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'name': 'Energy Aware CPU Scheduling Backend',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'cpu': '/api/cpu',
            'processes': '/api/processes',
            'energy': '/api/energy',
            'scheduler': '/api/scheduler',
            'health': '/api/health'
        }
    }), 200


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        cpu = psutil.cpu_percent(interval=None)
        return jsonify({
            'status': 'ok',
            'timestamp': datetime.now().isoformat(),
            'cpu_usage': cpu
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


# ===== ADDITIONAL UTILITY ENDPOINTS =====

@app.route('/api/system', methods=['GET'])
def get_system_info():
    """Get combined system information"""
    try:
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        return jsonify({
            'cpu_usage': round(cpu_percent, 2),
            'memory_usage': round(memory.percent, 2),
            'memory_available': round(memory.available / (1024**3), 2),
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get complete dashboard data"""
    try:
        cpu_percent = psutil.cpu_percent()
        memory_usage = psutil.virtual_memory()
        
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            try:
                pinfo = proc.as_dict(attrs=['pid', 'name', 'cpu_percent', 'memory_info'])
                if pinfo['cpu_percent'] > 0:
                    processes.append({
                        'pid': pinfo['pid'],
                        'name': pinfo['name'][:30],
                        'cpu': round(pinfo['cpu_percent'], 2),
                        'memory': round(pinfo['memory_info'].rss / (1024**2), 2)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        processes.sort(key=lambda x: x['cpu'], reverse=True)
        
        return jsonify({
            'cpu': round(cpu_percent, 2),
            'memory': round(memory_usage.percent, 2),
            'top_processes': processes[:10],
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ===== MAIN =====

if __name__ == '__main__':
    # Start background monitoring thread
    monitor_thread = threading.Thread(target=background_monitoring, daemon=True)
    monitor_thread.start()
    
    # Start Flask app
    print("[START] Starting Energy Aware CPU Scheduling Backend...")
    print("[INFO] API Server: http://localhost:5000")
    print("[DOCS] API Health: http://localhost:5000/api/health")
    
    app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False)
