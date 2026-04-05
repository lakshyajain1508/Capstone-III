"""CPU scheduling routes"""

from flask import Blueprint, jsonify, request
from services.scheduler_service import SchedulerService

scheduler_bp = Blueprint('scheduler', __name__, url_prefix='/api/scheduler')


@scheduler_bp.route('/schedule', methods=['POST'])
def run_schedule():
    """Run a scheduling algorithm"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        algorithm = data.get('algorithm', 'fcfs').lower()
        processes = data.get('processes', [])
        
        # Generate default processes if none provided
        if not processes:
            processes = [
                {'id': 'P1', 'arrival': 0, 'burst': 8, 'cpu': 30},
                {'id': 'P2', 'arrival': 1, 'burst': 4, 'cpu': 25},
                {'id': 'P3', 'arrival': 2, 'burst': 2, 'cpu': 15},
                {'id': 'P4', 'arrival': 3, 'burst': 1, 'cpu': 10},
                {'id': 'P5', 'arrival': 4, 'burst': 3, 'cpu': 20}
            ]
        
        result = SchedulerService.schedule(algorithm, processes)
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@scheduler_bp.route('/compare', methods=['POST'])
def compare_algorithms():
    """Compare all scheduling algorithms"""
    try:
        data = request.get_json()
        processes = data.get('processes', []) if data else []
        
        # Generate default processes if none provided
        if not processes:
            processes = [
                {'id': 'P1', 'arrival': 0, 'burst': 8, 'cpu': 30},
                {'id': 'P2', 'arrival': 1, 'burst': 4, 'cpu': 25},
                {'id': 'P3', 'arrival': 2, 'burst': 2, 'cpu': 15},
                {'id': 'P4', 'arrival': 3, 'burst': 1, 'cpu': 10},
                {'id': 'P5', 'arrival': 4, 'burst': 3, 'cpu': 20}
            ]
        
        result = SchedulerService.compare_algorithms(processes)
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@scheduler_bp.route('/gantt/<algorithm>', methods=['GET'])
def get_gantt_chart(algorithm):
    """Get Gantt chart for specific algorithm"""
    try:
        processes = [
            {'id': 'P1', 'arrival': 0, 'burst': 8, 'cpu': 30},
            {'id': 'P2', 'arrival': 1, 'burst': 4, 'cpu': 25},
            {'id': 'P3', 'arrival': 2, 'burst': 2, 'cpu': 15},
            {'id': 'P4', 'arrival': 3, 'burst': 1, 'cpu': 10},
            {'id': 'P5', 'arrival': 4, 'burst': 3, 'cpu': 20}
        ]
        
        result = SchedulerService.schedule(algorithm.lower(), processes)
        return jsonify({
            'algorithm': result['algorithm'],
            'gantt_chart': result['gantt_chart'],
            'metrics': result['metrics']
        }), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@scheduler_bp.route('/fcfs', methods=['POST'])
def fcfs():
    """Run FCFS scheduling"""
    try:
        data = request.get_json() or {}
        processes = data.get('processes', [])
        
        if not processes:
            processes = [
                {'id': 'P1', 'arrival': 0, 'burst': 8},
                {'id': 'P2', 'arrival': 1, 'burst': 4},
                {'id': 'P3', 'arrival': 2, 'burst': 2}
            ]
        
        result = SchedulerService.fcfs_schedule(processes)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@scheduler_bp.route('/sjf', methods=['POST'])
def sjf():
    """Run SJF scheduling"""
    try:
        data = request.get_json() or {}
        processes = data.get('processes', [])
        
        if not processes:
            processes = [
                {'id': 'P1', 'arrival': 0, 'burst': 8},
                {'id': 'P2', 'arrival': 1, 'burst': 4},
                {'id': 'P3', 'arrival': 2, 'burst': 2}
            ]
        
        result = SchedulerService.sjf_schedule(processes)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@scheduler_bp.route('/round-robin', methods=['POST'])
def round_robin():
    """Run Round Robin scheduling"""
    try:
        data = request.get_json() or {}
        processes = data.get('processes', [])
        quantum = data.get('quantum', 4)
        
        if not processes:
            processes = [
                {'id': 'P1', 'arrival': 0, 'burst': 8},
                {'id': 'P2', 'arrival': 1, 'burst': 4},
                {'id': 'P3', 'arrival': 2, 'burst': 2}
            ]
        
        result = SchedulerService.round_robin_schedule(processes, quantum)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@scheduler_bp.route('/energy-aware', methods=['POST'])
def energy_aware():
    """Run Energy-Aware scheduling"""
    try:
        data = request.get_json() or {}
        processes = data.get('processes', [])
        
        if not processes:
            processes = [
                {'id': 'P1', 'arrival': 0, 'burst': 8, 'cpu': 30},
                {'id': 'P2', 'arrival': 1, 'burst': 4, 'cpu': 25},
                {'id': 'P3', 'arrival': 2, 'burst': 2, 'cpu': 15}
            ]
        
        result = SchedulerService.energy_aware_schedule(processes)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
