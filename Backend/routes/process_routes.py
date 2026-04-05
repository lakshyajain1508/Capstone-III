"""Process monitoring routes"""

from flask import Blueprint, jsonify, request
from services.process_service import ProcessService

process_bp = Blueprint('process', __name__, url_prefix='/api/processes')


@process_bp.route('', methods=['GET'])
def get_processes():
    """Get list of running processes"""
    try:
        limit = request.args.get('limit', 20, type=int)
        sort_by = request.args.get('sort_by', 'cpu', type=str)
        
        processes, total = ProcessService.get_processes(limit=limit, sort_by=sort_by)
        return jsonify({
            'processes': processes,
            'total': total,
            'limit': limit,
            'sort_by': sort_by
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@process_bp.route('/history', methods=['GET'])
def get_process_history():
    """Get process history"""
    try:
        history = ProcessService.get_processes_history()
        return jsonify({'history': history}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@process_bp.route('/<int:pid>', methods=['GET'])
def get_process_details(pid):
    """Get detailed information about a process"""
    try:
        details = ProcessService.get_process_details(pid)
        return jsonify(details), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@process_bp.route('/high-memory', methods=['GET'])
def get_high_memory_processes():
    """Get high memory consuming processes"""
    try:
        threshold = request.args.get('threshold', 100, type=float)
        high_memory = ProcessService.get_high_memory_processes(threshold=threshold)
        return jsonify({'high_memory_processes': high_memory}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@process_bp.route('/analysis', methods=['GET'])
def analyze_processes():
    """Analyze all processes and get insights"""
    try:
        analysis = ProcessService.analyze_processes()
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
