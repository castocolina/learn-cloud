"""
Utility functions for the AI Prompt Executor
"""

import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any
import re
import json

# Color constants for terminal output
class Colors:
    BLUE_BOLD = '\033[1;34m'
    GREEN_BOLD = '\033[1;32m'
    RED_BOLD = '\033[1;31m'
    YELLOW_BOLD = '\033[1;33m'
    NC = '\033[0m'  # No Color

def setup_logging(console_level=logging.WARNING) -> logging.Logger:
    """Setup logging configuration with file-based detailed logs and reduced console output."""
    # Ensure tmp directories exist
    tmp_dir = Path("tmp")
    logs_dir = tmp_dir / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure logging
    log_file = logs_dir / "prompt_executor.log"
    
    # Create formatters
    file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_formatter = logging.Formatter('%(levelname)s: %(message)s')
    
    # Create handlers
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    
    console_handler = logging.StreamHandler()
    console_handler.setLevel(console_level)
    console_handler.setFormatter(console_formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    
    # Clear any existing handlers
    root_logger.handlers.clear()
    
    # Add our handlers
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Log the setup
    logger = logging.getLogger(__name__)
    logger.info(f"Detailed logging configured - see {log_file} for full logs")
    
    return logger

def ensure_directories():
    """Ensure all required directories exist."""
    directories = [
        Path("tmp"),
        Path("tmp/states"),
        Path("tmp/sessions"),
        Path("tmp/logs")
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

def detect_units() -> List[str]:
    """Detect available unit directories in src/book/."""
    book_path = Path("src/book")
    if not book_path.exists():
        return []
        
    units = []
    for item in book_path.iterdir():
        if item.is_dir() and item.name.startswith("unit"):
            # Extract unit number
            match = re.match(r'unit(\d+)', item.name)
            if match:
                units.append(item.name)
                
    # Sort units numerically
    units.sort(key=lambda x: int(re.match(r'unit(\d+)', x).group(1)))
    return units

def parse_reset_time(output: str) -> Optional[str]:
    """Parse reset time from agent output (e.g., '1am', '5pm')."""
    # Look for time patterns like '1am', '12pm', etc.
    time_pattern = r'\b([0-9]{1,2}[ap]m)\b'
    match = re.search(time_pattern, output, re.IGNORECASE)
    if match:
        return match.group(1).lower()
    return None

def convert_to_24h_format(time_str: str) -> str:
    """Convert 12-hour am/pm format to 24-hour HH:MM:SS format."""
    # Extract hour and meridiem
    hour = int(re.match(r'^(\d+)', time_str).group(1))
    meridiem = re.search(r'([ap]m)$', time_str.lower()).group(1)
    
    if meridiem == 'am':
        if hour == 12:  # Midnight case (12am -> 00:00)
            hour = 0
    elif meridiem == 'pm':
        if hour != 12:  # Afternoon case (1pm -> 13:00)
            hour += 12
            
    return f"{hour:02d}:00:00"

def calculate_wait_time(target_time: str, allow_next_day: bool = False) -> int:
    """Calculate seconds to wait until target time."""
    from datetime import datetime, timedelta
    import time
    
    now = datetime.now()
    target_today = datetime.strptime(
        f"{now.strftime('%Y-%m-%d')} {target_time}", 
        '%Y-%m-%d %H:%M:%S'
    )
    
    # If target time has passed today and we allow next day
    if allow_next_day and target_today <= now:
        target_today += timedelta(days=1)
        
    return int((target_today - now).total_seconds())

def format_duration(seconds: int) -> str:
    """Format duration in seconds to human readable format."""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        return f"{hours}h {remaining_minutes}m"

def save_session_id(agent: str, session_id: str):
    """Save session ID for an agent."""
    session_file = Path(f"tmp/sessions/{agent}_session.txt")
    session_file.write_text(session_id)

def load_session_id(agent: str) -> Optional[str]:
    """Load session ID for an agent."""
    session_file = Path(f"tmp/sessions/{agent}_session.txt")
    if session_file.exists():
        return session_file.read_text().strip()
    return None

def is_valid_uuid(uuid_str: str) -> bool:
    """Validate UUID format."""
    uuid_pattern = r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    return bool(re.match(uuid_pattern, uuid_str))

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe file operations."""
    # Remove invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    return filename[:100]

def load_json_safe(file_path: Path) -> Dict[str, Any]:
    """Safely load JSON file, return empty dict if not found or invalid."""
    try:
        if file_path.exists():
            return json.loads(file_path.read_text())
        return {}
    except (json.JSONDecodeError, IOError):
        return {}

def save_json_safe(file_path: Path, data: Dict[str, Any]) -> bool:
    """Safely save JSON file."""
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        return True
    except (IOError, TypeError) as e:
        logging.getLogger(__name__).error(f"Failed to save JSON to {file_path}: {e}")
        return False


class RealTimeMetrics:
    """Real-time execution metrics tracker for displaying progress and estimated completion time."""
    
    def __init__(self, total_tasks: int):
        self.total_tasks = total_tasks
        self.completed_tasks = 0
        self.failed_tasks = 0
        self.start_time = datetime.now()
        self.task_durations = []  # Track individual task durations for better estimates
        self.last_update_time = self.start_time
        
    def add_task_completion(self, duration_seconds: float, success: bool = True):
        """Record completion of a task with its duration."""
        self.task_durations.append(duration_seconds)
        if success:
            self.completed_tasks += 1
        else:
            self.failed_tasks += 1
        self.last_update_time = datetime.now()
    
    def get_elapsed_time(self) -> str:
        """Get total elapsed time in human-readable format."""
        elapsed = datetime.now() - self.start_time
        return format_duration(int(elapsed.total_seconds()))
    
    def get_estimated_remaining_time(self) -> str:
        """Calculate estimated time remaining based on completed tasks."""
        if not self.task_durations:
            return "Calculating..."
        
        # Calculate average duration from recent tasks (last 5 or all if less than 5)
        recent_durations = self.task_durations[-5:] if len(self.task_durations) >= 5 else self.task_durations
        avg_duration = sum(recent_durations) / len(recent_durations)
        
        remaining_tasks = self.total_tasks - (self.completed_tasks + self.failed_tasks)
        estimated_seconds = remaining_tasks * avg_duration
        
        if estimated_seconds <= 0:
            return "Finishing..."
        
        return format_duration(int(estimated_seconds))
    
    def get_progress_percentage(self) -> float:
        """Get completion percentage."""
        if self.total_tasks == 0:
            return 100.0
        return ((self.completed_tasks + self.failed_tasks) / self.total_tasks) * 100
    
    def get_progress_summary(self) -> Dict[str, Any]:
        """Get comprehensive progress summary."""
        return {
            'total_tasks': self.total_tasks,
            'completed_tasks': self.completed_tasks,
            'failed_tasks': self.failed_tasks,
            'remaining_tasks': self.total_tasks - (self.completed_tasks + self.failed_tasks),
            'elapsed_time': self.get_elapsed_time(),
            'estimated_remaining': self.get_estimated_remaining_time(),
            'progress_percentage': self.get_progress_percentage(),
            'success_rate': (self.completed_tasks / max(1, self.completed_tasks + self.failed_tasks)) * 100
        }


def format_progress_bar(percentage: float, width: int = 40) -> str:
    """Create a visual progress bar."""
    filled = int(width * percentage / 100)
    bar = "█" * filled + "░" * (width - filled)
    return f"[{bar}] {percentage:.1f}%"


def display_real_time_progress(metrics: RealTimeMetrics, prompt_name: str = "", unit: str = "", 
                              agent_output: str = ""):
    """Display real-time progress update in a consistent format with agent streaming."""
    import sys
    
    summary = metrics.get_progress_summary()
    progress_bar = format_progress_bar(summary['progress_percentage'])
    
    # Build status line
    status_parts = []
    if prompt_name:
        status_parts.append(f"📋 {prompt_name}")
    if unit:
        status_parts.append(f"🎯 {unit}")
    
    status_line = " | ".join(status_parts) if status_parts else "Processing..."
    
    # Clear the current line completely
    sys.stdout.write('\033[2K')  # Clear entire line
    sys.stdout.write('\r')      # Return to start of line
    
    # Display progress on one line
    progress_line = f"🚀 {progress_bar} | ⏱️  {summary['elapsed_time']} elapsed | ⏳ {summary['estimated_remaining']} remaining | ✅ {summary['completed_tasks']}/{summary['total_tasks']}"
    
    if status_parts:
        progress_line += f" | {status_line}"
    
    # If there's agent output, show it below the progress bar
    if agent_output.strip():
        # Move to next line for agent output, but preserve progress line
        sys.stdout.write(progress_line + '\n')
        # Show latest agent output with prefix
        clean_output = agent_output.strip()[:100] + ("..." if len(agent_output.strip()) > 100 else "")
        sys.stdout.write(f"💬 {clean_output}\n")
        # Return cursor to progress line
        sys.stdout.write('\033[1A')  # Move up one line
        sys.stdout.write('\r')       # Return to start
    
    sys.stdout.write(progress_line)
    sys.stdout.flush()