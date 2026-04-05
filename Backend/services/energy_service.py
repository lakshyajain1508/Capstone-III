"""Energy estimation and analysis service"""

import psutil
from datetime import datetime


class EnergyService:
    """Service for energy consumption estimation and analysis"""
    
    # Energy model parameters (watts)
    BASE_POWER = 20  # Base system power
    CPU_POWER_FACTOR = 1.5  # Watts per 1% CPU usage
    MEMORY_POWER_FACTOR = 0.01  # Watts per 1% memory usage
    FREQ_POWER_FACTOR = 0.001  # Frequency contribution factor
    
    @staticmethod
    def estimate_system_energy():
        """
        Estimate total system energy consumption
        
        Returns:
            dict: Energy consumption estimates
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=None)
            memory_percent = psutil.virtual_memory().percent
            cpu_freq = psutil.cpu_freq()
            
            # Energy calculation
            cpu_energy = cpu_percent * EnergyService.CPU_POWER_FACTOR
            memory_energy = memory_percent * EnergyService.MEMORY_POWER_FACTOR
            freq_energy = (cpu_freq.current / 1000) * EnergyService.FREQ_POWER_FACTOR if cpu_freq else 0
            
            total_energy = EnergyService.BASE_POWER + cpu_energy + memory_energy + freq_energy
            
            # Efficiency calculation (lower is better)
            efficiency = 100 - ((total_energy / 300) * 100)  # Assuming 300W max
            efficiency = max(0, min(100, efficiency))  # Clamp between 0-100
            
            return {
                'energy': round(total_energy, 2),
                'total_energy': round(total_energy, 2),
                'base_power': EnergyService.BASE_POWER,
                'cpu_contribution': round(cpu_energy, 2),
                'memory_contribution': round(memory_energy, 2),
                'frequency_contribution': round(freq_energy, 2),
                'cpu_usage': round(cpu_percent, 2),
                'memory_usage': round(memory_percent, 2),
                'efficiency': round(efficiency, 2),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Error estimating system energy: {str(e)}")
    
    @staticmethod
    def estimate_process_energy(processes_data):
        """
        Estimate energy consumption per process
        
        Args:
            processes_data: List of process information
        
        Returns:
            dict: Energy estimates per process
        """
        try:
            process_energy = []
            total_energy = 0
            
            for proc in processes_data:
                # Energy based on CPU and memory usage
                energy = (proc.get('cpu', 0) * EnergyService.CPU_POWER_FACTOR * 0.5 + 
                         proc.get('memory', 0) * EnergyService.MEMORY_POWER_FACTOR)
                
                total_energy += energy
                
                process_energy.append({
                    'name': proc.get('name', 'Unknown'),
                    'pid': proc.get('pid'),
                    'energy': round(energy, 2),
                    'cpu': proc.get('cpu', 0),
                    'memory': proc.get('memory', 0)
                })
            
            # Sort by energy consumption
            process_energy.sort(key=lambda x: x['energy'], reverse=True)
            
            return {
                'total_process_energy': round(total_energy, 2),
                'processes': process_energy[:10],  # Top 10 energy consumers
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Error estimating process energy: {str(e)}")
    
    @staticmethod
    def get_energy_optimization_suggestions():
        """
        Generate energy optimization suggestions based on current state
        
        Returns:
            dict: Suggestions and potential energy savings
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=None)
            memory_percent = psutil.virtual_memory().percent
            
            suggestions = []
            potential_savings = 0
            
            # Check for high CPU usage
            if cpu_percent > 80:
                suggestions.append({
                    'issue': 'High CPU usage detected',
                    'suggestion': 'Terminate or lower priority of high-CPU processes',
                    'potential_saving': 15
                })
                potential_savings += 15
            
            # Check for high memory usage
            if memory_percent > 80:
                suggestions.append({
                    'issue': 'High memory usage detected',
                    'suggestion': 'Close unused applications to reduce memory footprint',
                    'potential_saving': 8
                })
                potential_savings += 8
            
            # General suggestions
            suggestions.append({
                'issue': 'General optimization',
                'suggestion': 'Enable CPU power saving mode',
                'potential_saving': 10
            })
            potential_savings += 10
            
            suggestions.append({
                'issue': 'General optimization',
                'suggestion': 'Reduce screen brightness or enable adaptive brightness',
                'potential_saving': 12
            })
            potential_savings += 12
            
            if cpu_percent > 50:
                suggestions.append({
                    'issue': 'CPU frequency',
                    'suggestion': 'Use dynamic frequency scaling or reduce CPU frequency',
                    'potential_saving': 5
                })
                potential_savings += 5
            
            return {
                'current_cpu_usage': round(cpu_percent, 2),
                'current_memory_usage': round(memory_percent, 2),
                'suggestions': suggestions,
                'total_potential_savings': min(potential_savings, 50),  # Max 50% savings
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Error generating optimization suggestions: {str(e)}")
    
    @staticmethod
    def get_energy_trends(history_data=None):
        """
        Get energy consumption trends
        
        Args:
            history_data: Historical energy data (optional)
        
        Returns:
            dict: Energy trends and statistics
        """
        try:
            trends = {
                'current_energy': EnergyService.estimate_system_energy(),
                'suggestions': EnergyService.get_energy_optimization_suggestions(),
                'timestamp': datetime.now().isoformat()
            }
            return trends
        except Exception as e:
            raise Exception(f"Error getting energy trends: {str(e)}")
