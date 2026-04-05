"""CPU monitoring routes"""

from flask import Blueprint, jsonify
from services.cpu_service import CPUService

cpu_bp = Blueprint('cpu', __name__, url_prefix='/api/cpu')


@cpu_bp.route('', methods=['GET'])
def get_cpu_stats():
    """Get real-time CPU statistics"""
    try:
        stats = CPUService.get_cpu_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cpu_bp.route('/history', methods=['GET'])
def get_cpu_history():
    """Get CPU statistics history"""
    try:
        history = CPUService.get_cpu_history()
        return jsonify({'history': history}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cpu_bp.route('/high', methods=['GET'])
def get_high_cpu_processes():
    """Get high CPU consuming processes"""
    try:
        high_cpu = CPUService.identify_high_cpu_processes(threshold=20)
        return jsonify({'high_cpu_processes': high_cpu}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
