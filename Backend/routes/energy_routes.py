"""Energy monitoring and analysis routes"""

from flask import Blueprint, jsonify, request
from services.energy_service import EnergyService
from services.process_service import ProcessService

energy_bp = Blueprint('energy', __name__, url_prefix='/api/energy')


@energy_bp.route('', methods=['GET'])
def get_energy():
    """Get system energy consumption"""
    try:
        energy = EnergyService.estimate_system_energy()
        return jsonify(energy), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@energy_bp.route('/per-process', methods=['GET'])
def get_energy_per_process():
    """Get energy consumption per process"""
    try:
        processes, _ = ProcessService.get_processes(limit=50)
        energy_data = EnergyService.estimate_process_energy(processes)
        return jsonify(energy_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@energy_bp.route('/trends', methods=['GET'])
def get_energy_trends():
    """Get energy consumption trends"""
    try:
        trends = EnergyService.get_energy_trends()
        return jsonify(trends), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@energy_bp.route('/optimize', methods=['GET'])
def get_optimization_suggestions():
    """Get energy optimization suggestions"""
    try:
        suggestions = EnergyService.get_energy_optimization_suggestions()
        return jsonify(suggestions), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@energy_bp.route('/efficiency', methods=['GET'])
def get_energy_efficiency():
    """Get overall energy efficiency"""
    try:
        energy = EnergyService.estimate_system_energy()
        return jsonify({
            'current_energy': energy['total_energy'],
            'efficiency': energy['efficiency'],
            'status': 'good' if energy['efficiency'] > 70 else 'fair' if energy['efficiency'] > 50 else 'poor',
            'timestamp': energy['timestamp']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
