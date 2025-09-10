"""
Comprehensive Execution Logging System

Provides detailed logging functionality for prompt execution with audit trail,
error tracking, and user-friendly log file location reporting.
"""

import logging
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import traceback
import re
from dataclasses import dataclass, asdict

@dataclass
class ExecutionLogEntry:
    """Structured log entry for prompt execution."""
    timestamp: str
    prompt_id: str
    prompt_name: str
    processing_agent: str
    unit: Optional[str]
    command_sent: str
    agent_response: str
    response_stderr: Optional[str]
    final_status: str
    duration_seconds: Optional[float]
    error_message: Optional[str]
    stack_trace: Optional[str]
    log_level: str = "INFO"

class ExecutionLogger:
    """Comprehensive logging system for prompt execution tracking."""
    
    def __init__(self, logs_dir: str = "tmp/logs"):
        self.logs_dir = Path(logs_dir)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup main execution logger
        self.logger = logging.getLogger(f"{__name__}.ExecutionLogger")
        self._setup_console_logger()
        
        # Pattern matching for error detection
        self.error_patterns = [
            r"5-hour limit reached",
            r"daily limit",
            r"rate limit",
            r"quota exceeded",
            r"too many requests",
            r"service unavailable",
            r"connection timeout",
            r"authentication failed",
            r"access denied",
            r"permission denied",
            r"invalid api key",
            r"unauthorized",
            r"forbidden"
        ]
    
    def _setup_console_logger(self):
        """Setup console logging with appropriate formatting."""
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def get_log_file_path(self, prompt_id: str, timestamp: Optional[str] = None) -> Path:
        """Get the log file path for a specific prompt execution."""
        if timestamp is None:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        
        filename = f"execution_{prompt_id}_{timestamp}.log"
        return self.logs_dir / filename
    
    def get_aggregate_log_path(self) -> Path:
        """Get path for aggregate execution log."""
        return self.logs_dir / "execution_history.jsonl"
    
    def log_execution_start(self, prompt_id: str, prompt_name: str, agent: str, 
                          command: str, unit: Optional[str] = None) -> str:
        """Log the start of prompt execution and return log ID."""
        timestamp = datetime.now(timezone.utc).isoformat()
        log_id = f"{prompt_id}_{timestamp.replace(':', '_').replace('.', '_')}"
        
        log_entry = ExecutionLogEntry(
            timestamp=timestamp,
            prompt_id=prompt_id,
            prompt_name=prompt_name,
            processing_agent=agent,
            unit=unit,
            command_sent=command,
            agent_response="",  # Will be filled later
            response_stderr=None,
            final_status="RUNNING",
            duration_seconds=None,
            error_message=None,
            stack_trace=None,
            log_level="INFO"
        )
        
        # Create dedicated log file for this execution
        log_file = self.get_log_file_path(prompt_id, timestamp.replace(':', '_').replace('.', '_'))
        self._write_execution_log(log_file, log_entry, is_start=True)
        
        # Log to console with location info
        self.logger.info(f"🚀 Started execution: [{prompt_id}] {prompt_name}")
        if unit:
            self.logger.info(f"   Unit: {unit}")
        self.logger.info(f"   Agent: {agent}")
        self.logger.info(f"   Log file: {log_file}")
        
        return log_id
    
    def log_execution_complete(self, log_id: str, response: str, stderr: Optional[str], 
                             duration: float, status: str, error: Optional[str] = None):
        """Log the completion of prompt execution."""
        try:
            # Parse log_id to get prompt_id and timestamp
            parts = log_id.split('_')
            prompt_id = parts[0]
            timestamp_parts = parts[1:]
            timestamp_str = '_'.join(timestamp_parts)
            
            # Reconstruct log file path
            log_file = self.logs_dir / f"execution_{log_id}.log"
            
            # Read existing entry to update it
            if log_file.exists():
                with open(log_file, 'r', encoding='utf-8') as f:
                    existing_content = f.read()
                
                # Extract existing log entry (simplified parsing)
                if "EXECUTION LOG ENTRY:" in existing_content:
                    # Update the existing entry
                    updated_content = existing_content.replace(
                        '"final_status": "RUNNING"',
                        f'"final_status": "{status}"'
                    )
                    updated_content = updated_content.replace(
                        '"agent_response": ""',
                        f'"agent_response": {json.dumps(response[:2000])}'  # Limit response size
                    )
                    
                    if stderr:
                        updated_content = updated_content.replace(
                            '"response_stderr": null',
                            f'"response_stderr": {json.dumps(stderr[:1000])}'
                        )
                    
                    updated_content = updated_content.replace(
                        '"duration_seconds": null',
                        f'"duration_seconds": {duration}'
                    )
                    
                    if error:
                        updated_content = updated_content.replace(
                            '"error_message": null',
                            f'"error_message": {json.dumps(error)}'
                        )
                    
                    # Add completion timestamp
                    completion_time = datetime.now(timezone.utc).isoformat()
                    updated_content += f"\n\n=== EXECUTION COMPLETED ===\nCompletion Time: {completion_time}\n"
                    updated_content += f"Final Status: {status}\n"
                    updated_content += f"Duration: {duration:.2f} seconds\n"
                    
                    if error:
                        updated_content += f"Error: {error}\n"
                    
                    # Check for hidden errors in response
                    hidden_errors = self._detect_hidden_errors(response, stderr)
                    if hidden_errors:
                        updated_content += f"Hidden Errors Detected: {', '.join(hidden_errors)}\n"
                        status = "FAILED_HIDDEN_ERROR"  # Update status
                    
                    with open(log_file, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
            
            # Log to aggregate history
            self._append_to_aggregate_log(prompt_id, status, duration, error, hidden_errors if 'hidden_errors' in locals() else [])
            
            # Console logging
            if status in ["COMPLETED", "SUCCESS"]:
                self.logger.info(f"✅ Completed: [{prompt_id}] in {duration:.2f}s")
            else:
                self.logger.error(f"❌ Failed: [{prompt_id}] - {error or status}")
            
            if 'hidden_errors' in locals() and hidden_errors:
                self.logger.warning(f"🔍 Hidden errors detected: {', '.join(hidden_errors)}")
            
            self.logger.info(f"   📋 Detailed log: {log_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to log execution completion: {e}")
            self._log_exception("log_execution_complete", e)
    
    def log_exception(self, context: str, exception: Exception, prompt_id: Optional[str] = None):
        """Log exceptions with full stack trace."""
        self._log_exception(context, exception, prompt_id)
    
    def _log_exception(self, context: str, exception: Exception, prompt_id: Optional[str] = None):
        """Internal method to log exceptions with full stack trace."""
        timestamp = datetime.now(timezone.utc).isoformat()
        stack_trace = traceback.format_exc()
        
        # Create error log entry
        error_entry = {
            "timestamp": timestamp,
            "context": context,
            "prompt_id": prompt_id,
            "exception_type": type(exception).__name__,
            "exception_message": str(exception),
            "stack_trace": stack_trace,
            "log_level": "ERROR"
        }
        
        # Write to error log file
        error_log_file = self.logs_dir / f"errors_{datetime.now().strftime('%Y%m%d')}.log"
        with open(error_log_file, 'a', encoding='utf-8') as f:
            f.write(f"\n=== ERROR LOG ENTRY ===\n")
            f.write(f"Timestamp: {timestamp}\n")
            f.write(f"Context: {context}\n")
            f.write(f"Prompt ID: {prompt_id or 'N/A'}\n")
            f.write(f"Exception: {type(exception).__name__}: {exception}\n")
            f.write(f"Stack Trace:\n{stack_trace}\n")
            f.write("=" * 50 + "\n")
        
        # Console logging
        self.logger.error(f"💥 Exception in {context}: {exception}")
        if prompt_id:
            self.logger.error(f"   Prompt ID: {prompt_id}")
        self.logger.error(f"   Error log: {error_log_file}")
    
    def _detect_hidden_errors(self, response: str, stderr: Optional[str] = None) -> List[str]:
        """Detect hidden errors in agent responses using pattern matching."""
        hidden_errors = []
        
        # Combine response and stderr for analysis
        full_output = response
        if stderr:
            full_output += "\n" + stderr
        
        full_output_lower = full_output.lower()
        
        # Check for error patterns
        for pattern in self.error_patterns:
            if re.search(pattern, full_output_lower, re.IGNORECASE):
                hidden_errors.append(pattern.replace(r'\b', '').replace(r'\\', ''))
        
        return hidden_errors
    
    def _write_execution_log(self, log_file: Path, entry: ExecutionLogEntry, is_start: bool = False):
        """Write execution log entry to file."""
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write(f"=== EXECUTION LOG ENTRY ===\n")
            f.write(f"Start Time: {entry.timestamp}\n")
            f.write(f"Prompt ID: {entry.prompt_id}\n")
            f.write(f"Prompt Name: {entry.prompt_name}\n")
            f.write(f"Processing Agent: {entry.processing_agent}\n")
            if entry.unit:
                f.write(f"Unit: {entry.unit}\n")
            f.write(f"Command Sent: {entry.command_sent}\n")
            f.write(f"Status: {entry.final_status}\n")
            f.write("\n" + "=" * 50 + "\n\n")
            
            # Add structured JSON for parsing
            f.write("EXECUTION LOG ENTRY:\n")
            f.write(json.dumps(asdict(entry), indent=2, ensure_ascii=False))
            f.write("\n\n")
            
            if is_start:
                f.write("=== EXECUTION STARTED ===\n")
                f.write("Waiting for completion...\n\n")
    
    def _append_to_aggregate_log(self, prompt_id: str, status: str, duration: float, 
                               error: Optional[str], hidden_errors: List[str]):
        """Append execution summary to aggregate log."""
        aggregate_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "prompt_id": prompt_id,
            "status": status,
            "duration_seconds": duration,
            "error": error,
            "hidden_errors": hidden_errors,
            "success": status in ["COMPLETED", "SUCCESS"] and not hidden_errors
        }
        
        aggregate_file = self.get_aggregate_log_path()
        with open(aggregate_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(aggregate_entry) + '\n')
    
    def get_log_statistics(self) -> Dict[str, Any]:
        """Get execution log statistics."""
        aggregate_file = self.get_aggregate_log_path()
        if not aggregate_file.exists():
            return {"total_executions": 0, "success_rate": 0.0, "recent_errors": []}
        
        stats = {
            "total_executions": 0,
            "successful_executions": 0,
            "failed_executions": 0,
            "hidden_error_count": 0,
            "recent_errors": []
        }
        
        try:
            with open(aggregate_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        entry = json.loads(line)
                        stats["total_executions"] += 1
                        
                        if entry.get("success", False):
                            stats["successful_executions"] += 1
                        else:
                            stats["failed_executions"] += 1
                            if entry.get("error"):
                                stats["recent_errors"].append({
                                    "prompt_id": entry["prompt_id"],
                                    "timestamp": entry["timestamp"],
                                    "error": entry["error"]
                                })
                        
                        if entry.get("hidden_errors"):
                            stats["hidden_error_count"] += len(entry["hidden_errors"])
        
        except Exception as e:
            self.logger.error(f"Failed to read log statistics: {e}")
        
        # Calculate success rate
        if stats["total_executions"] > 0:
            stats["success_rate"] = stats["successful_executions"] / stats["total_executions"] * 100
        else:
            stats["success_rate"] = 0.0
        
        # Keep only recent errors (last 10)
        stats["recent_errors"] = stats["recent_errors"][-10:]
        
        return stats
    
    def display_log_locations(self):
        """Display user-friendly information about log file locations."""
        print("\n" + "=" * 60)
        print("📋 EXECUTION LOGS LOCATION")
        print("=" * 60)
        print(f"📁 Log Directory: {self.logs_dir.absolute()}")
        print(f"📄 Aggregate History: {self.get_aggregate_log_path()}")
        
        # Show recent log files
        log_files = list(self.logs_dir.glob("execution_*.log"))
        if log_files:
            print(f"📝 Recent Execution Logs ({len(log_files)} files):")
            for log_file in sorted(log_files, key=lambda x: x.stat().st_mtime, reverse=True)[:5]:
                size_kb = log_file.stat().st_size / 1024
                mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                print(f"   • {log_file.name} ({size_kb:.1f}KB, {mtime.strftime('%Y-%m-%d %H:%M')})")
        
        # Show error logs
        error_files = list(self.logs_dir.glob("errors_*.log"))
        if error_files:
            print(f"⚠️  Error Logs ({len(error_files)} files):")
            for error_file in sorted(error_files, key=lambda x: x.stat().st_mtime, reverse=True)[:3]:
                size_kb = error_file.stat().st_size / 1024
                mtime = datetime.fromtimestamp(error_file.stat().st_mtime)
                print(f"   • {error_file.name} ({size_kb:.1f}KB, {mtime.strftime('%Y-%m-%d %H:%M')})")
        
        print("=" * 60 + "\n")
    
    def cleanup_old_logs(self, days_to_keep: int = 30) -> int:
        """Clean up log files older than specified days."""
        cutoff_time = datetime.now().timestamp() - (days_to_keep * 24 * 60 * 60)
        cleaned_count = 0
        
        for log_file in self.logs_dir.glob("*.log"):
            if log_file.stat().st_mtime < cutoff_time:
                try:
                    log_file.unlink()
                    cleaned_count += 1
                except Exception as e:
                    self.logger.warning(f"Failed to clean up {log_file}: {e}")
        
        if cleaned_count > 0:
            self.logger.info(f"Cleaned up {cleaned_count} old log files")
        
        return cleaned_count

# Global logger instance
_execution_logger = None

def get_execution_logger() -> ExecutionLogger:
    """Get the global execution logger instance."""
    global _execution_logger
    if _execution_logger is None:
        _execution_logger = ExecutionLogger()
    return _execution_logger