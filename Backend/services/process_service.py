"""Process monitoring service"""

import psutil
import time
from datetime import datetime


class ProcessService:
    """Service for process monitoring and analysis"""
    
    # History storage
    _history = []
    _max_history = 100
    
    @staticmethod
    def get_processes(limit=20, sort_by='cpu'):
        """
        Get list of running processes
        
        Args:
            limit: Maximum number of processes to return
            sort_by: Sort by 'cpu' or 'memory'
        
        Returns:
            list: List of process information
        """
        try:
            processes = []
            start_time = time.perf_counter()
            max_scan_time_sec = 1.2

            # Keep this endpoint fast for real-time UI updates.
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    pinfo = proc.info
                    cpu = pinfo.get('cpu_percent') or 0

                    # Avoid expensive per-process memory lookup on every poll.
                    memory_mb = 0
                    energy = (cpu * 0.5)

                    processes.append({
                        'pid': pinfo.get('pid'),
                        'name': str(pinfo.get('name') or 'Unknown')[:40],
                        'cpu': round(float(cpu), 2),
                        'memory': memory_mb,
                        'energy': round(energy, 2)
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass

                if time.perf_counter() - start_time > max_scan_time_sec:
                    break
            
            # Sort by requested column
            if sort_by == 'memory':
                processes.sort(key=lambda x: x['memory'], reverse=True)
            else:  # default cpu
                processes.sort(key=lambda x: x['cpu'], reverse=True)
            
            # Store in history
            ProcessService._store_history(processes[:limit])
            
            return processes[:limit], len(processes)
        except Exception as e:
            raise Exception(f"Error getting processes: {str(e)}")
    
    @staticmethod
    def get_processes_history():
        """
        Get process history
        
        Returns:
            list: List of historical process data
        """
        return ProcessService._history
    
    @staticmethod
    def _store_history(processes):
        """Store process list in history"""
        ProcessService._history.append({
            'timestamp': datetime.now().isoformat(),
            'processes': processes
        })
        if len(ProcessService._history) > ProcessService._max_history:
            ProcessService._history.pop(0)
    
    @staticmethod
    def get_process_details(pid):
        """
        Get detailed information about a specific process
        
        Args:
            pid: Process ID
        
        Returns:
            dict: Detailed process information
        """
        try:
            proc = psutil.Process(pid)
            pinfo = proc.as_dict(attrs=['pid', 'name', 'status', 'create_time', 
                                        'cpu_percent', 'memory_info', 'cpu_num'])
            
            return {
                'pid': pinfo['pid'],
                'name': pinfo['name'],
                'status': pinfo['status'],
                'cpu': round(pinfo['cpu_percent'], 2),
                'memory_mb': round(pinfo['memory_info'].rss / (1024**2), 2),
                'cpu_num': pinfo['cpu_num'],
                'created': datetime.fromtimestamp(pinfo['create_time']).isoformat(),
                'timestamp': datetime.now().isoformat()
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            raise Exception(f"Error getting process details: {str(e)}")
    
    @staticmethod
    def get_high_memory_processes(threshold=100):
        """
        Get processes with high memory usage
        
        Args:
            threshold: Memory threshold in MB
        
        Returns:
            list: List of high memory processes
        """
        try:
            high_mem = []
            for proc in psutil.process_iter(['pid', 'name', 'memory_info']):
                try:
                    pinfo = proc.as_dict(attrs=['memory_info'])
                    memory_mb = pinfo['memory_info'].rss / (1024**2)
                    if memory_mb > threshold:
                        high_mem.append({
                            'name': proc.info['name'],
                            'memory_mb': round(memory_mb, 2)
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            return sorted(high_mem, key=lambda x: x['memory_mb'], reverse=True)
        except Exception as e:
            raise Exception(f"Error identifying high memory processes: {str(e)}")
    
    @staticmethod
    def analyze_processes():
        """
        Analyze all processes and provide insights
        
        Returns:
            dict: Analysis results
        """
        try:
            cpu_sum = 0
            memory_sum = 0
            process_count = 0
            high_cpu_processes = []
            high_memory_processes = []
            
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
                try:
                    pinfo = proc.as_dict(attrs=['cpu_percent', 'memory_info'])
                    cpu = pinfo['cpu_percent'] if pinfo['cpu_percent'] is not None else 0
                    memory_mb = pinfo['memory_info'].rss / (1024**2)
                    
                    cpu_sum += cpu
                    memory_sum += memory_mb
                    process_count += 1
                    
                    if cpu > 10:
                        high_cpu_processes.append(proc.info['name'])
                    if memory_mb > 100:
                        high_memory_processes.append(proc.info['name'])
                
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            return {
                'total_processes': process_count,
                'total_cpu_usage': round(cpu_sum, 2),
                'total_memory_mb': round(memory_sum, 2),
                'high_cpu_processes': list(set(high_cpu_processes))[:5],
                'high_memory_processes': list(set(high_memory_processes))[:5],
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Error analyzing processes: {str(e)}")
