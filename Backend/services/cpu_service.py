"""CPU monitoring service using psutil"""

import psutil
from datetime import datetime


class CPUService:
    """Service for CPU monitoring and statistics"""
    
    # History storage (keep last 100 readings)
    _history = []
    _max_history = 100
    
    @staticmethod
    def get_cpu_stats():
        """
        Get real-time CPU statistics
        
        Returns:
            dict: CPU statistics with total usage, per-core usage, frequency, load average
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=None)
            per_cpu = psutil.cpu_percent(interval=None, percpu=True)
            cpu_freq = psutil.cpu_freq()
            load_avg = psutil.getloadavg() if hasattr(psutil, 'getloadavg') else psutil.os.getloadavg() if hasattr(psutil.os, 'getloadavg') else [0, 0, 0]

            per_core = [round(x, 2) for x in per_cpu]
            frequency = round(cpu_freq.current, 2) if cpu_freq else 0
            
            stats = {
                'usage': round(cpu_percent, 2),
                'cores': per_core,
                'freq': round(frequency / 1000, 2) if frequency else 0,
                'total_usage': round(cpu_percent, 2),
                'per_core': per_core,
                'frequency': frequency,
                'frequency_min': round(cpu_freq.min, 2) if cpu_freq else 0,
                'frequency_max': round(cpu_freq.max, 2) if cpu_freq else 0,
                'load_average': [round(x, 2) for x in load_avg],
                'cpu_count': psutil.cpu_count(),
                'cpu_count_logical': psutil.cpu_count(logical=True),
                'timestamp': datetime.now().isoformat()
            }
            
            # Store in history
            CPUService._store_history(stats)
            
            return stats
        except Exception as e:
            raise Exception(f"Error getting CPU stats: {str(e)}")
    
    @staticmethod
    def get_cpu_history():
        """
        Get CPU statistics history
        
        Returns:
            list: List of CPU statistics over time
        """
        return CPUService._history
    
    @staticmethod
    def _store_history(stats):
        """Store CPU stats in history"""
        CPUService._history.append(stats)
        if len(CPUService._history) > CPUService._max_history:
            CPUService._history.pop(0)
    
    @staticmethod
    def get_system_info():
        """
        Get system information
        
        Returns:
            dict: System information including hostname, platform, CPU count, memory
        """
        try:
            return {
                'hostname': psutil.os.uname().nodename,
                'platform': psutil.os.sys.platform,
                'cpu_cores': psutil.cpu_count(),
                'cpu_logical': psutil.cpu_count(logical=True),
                'total_memory_gb': round(psutil.virtual_memory().total / (1024**3), 2),
                'available_memory_gb': round(psutil.virtual_memory().available / (1024**3), 2),
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat(),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Error getting system info: {str(e)}")
    
    @staticmethod
    def get_memory_stats():
        """
        Get memory statistics
        
        Returns:
            dict: Memory usage statistics
        """
        try:
            mem = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            return {
                'total_mb': round(mem.total / (1024**2), 2),
                'available_mb': round(mem.available / (1024**2), 2),
                'used_mb': round(mem.used / (1024**2), 2),
                'percent': round(mem.percent, 2),
                'swap_total_mb': round(swap.total / (1024**2), 2),
                'swap_used_mb': round(swap.used / (1024**2), 2),
                'swap_percent': round(swap.percent, 2),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Error getting memory stats: {str(e)}")
    
    @staticmethod
    def identify_high_cpu_processes(threshold=20):
        """
        Identify processes with high CPU usage
        
        Args:
            threshold: CPU usage threshold percentage
        
        Returns:
            list: List of high CPU processes
        """
        try:
            high_cpu = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    pinfo = proc.as_dict(attrs=['cpu_percent'])
                    if pinfo['cpu_percent'] and pinfo['cpu_percent'] > threshold:
                        high_cpu.append({
                            'name': proc.info['name'],
                            'cpu': pinfo['cpu_percent']
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            return sorted(high_cpu, key=lambda x: x['cpu'], reverse=True)
        except Exception as e:
            raise Exception(f"Error identifying high CPU processes: {str(e)}")
