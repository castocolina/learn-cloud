"""
Comprehensive Audit and Logging System for AI Prompt Execution
===============================================================

This module provides detailed logging, error detection, and audit capabilities
for the prompt execution framework with comprehensive error analysis and 
stateful error handling.
"""

import logging
import json
import traceback
import re
import subprocess
import sys
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum

# Import existing utilities
from .utils import sanitize_filename, format_duration


class ExecutionStatus(Enum):
    """Comprehensive execution status enumeration."""
    ENABLED = "enabled"
    NEEDS_REFINEMENT = "needs_refinement" 
    COMPLETED = "completed"
    FAILED = "failed"
    FAILED_RATE_LIMIT = "failed_rate_limit"
    FAILED_NETWORK = "failed_network"
    FAILED_PARSING = "failed_parsing"
    FAILED_PERMISSIONS = "failed_permissions"
    FAILED_TIMEOUT = "failed_timeout"
    FAILED_UNKNOWN = "failed_unknown"


class ErrorPattern:
    """Error pattern detection for CLI output analysis."""
    
    # Claude-specific error patterns
    CLAUDE_PATTERNS = [
        (r"5-hour limit reached|5 hour limit", ExecutionStatus.FAILED_RATE_LIMIT),
        (r"rate limit|quota exceeded|too many requests", ExecutionStatus.FAILED_RATE_LIMIT),
        (r"authentication failed|invalid api key", ExecutionStatus.FAILED_PERMISSIONS),
    ]
    
    # Gemini-specific error patterns
    GEMINI_PATTERNS = [
        (r"daily limit|quota exceeded", ExecutionStatus.FAILED_RATE_LIMIT),
        (r"rate limit exceeded", ExecutionStatus.FAILED_RATE_LIMIT),
        (r"authentication error|invalid key", ExecutionStatus.FAILED_PERMISSIONS),
        (r"network timeout", ExecutionStatus.FAILED_NETWORK),
        (r"forbidden", ExecutionStatus.FAILED_PERMISSIONS),
    ]
    
    # General error patterns (order matters - more specific patterns first)
    GENERAL_PATTERNS = [
        (r"timeout|timed out", ExecutionStatus.FAILED_TIMEOUT),
        (r"connection refused|network error|connection error", ExecutionStatus.FAILED_NETWORK),
        (r"permission denied|access denied", ExecutionStatus.FAILED_PERMISSIONS),
        (r"json\.decoder\.JSONDecodeError|invalid json", ExecutionStatus.FAILED_PARSING),
        (r"parse error|parsing failed", ExecutionStatus.FAILED_PARSING),
        (r"error:|ERROR:", ExecutionStatus.FAILED_UNKNOWN),
        (r"exception:|Exception:", ExecutionStatus.FAILED_UNKNOWN),
        (r"failed to|failure:", ExecutionStatus.FAILED_UNKNOWN),
        (r"unable to|cannot", ExecutionStatus.FAILED_UNKNOWN),
    ]

    @classmethod
    def analyze_output(cls, output: str, stderr: str, agent_name: str) -> Tuple[ExecutionStatus, Optional[str]]:
        """
        Analyze CLI output for hidden errors.
        
        Returns:
            Tuple of (ExecutionStatus, error_description)
        """
        combined_output = f"{output}\n{stderr}".lower()
        
        # Select appropriate patterns based on agent (agent-specific first)
        patterns = []
        if "claude" in agent_name.lower():
            patterns.extend(cls.CLAUDE_PATTERNS)
        elif "gemini" in agent_name.lower():
            patterns.extend(cls.GEMINI_PATTERNS)
        patterns.extend(cls.GENERAL_PATTERNS)
        
        # Check patterns
        for pattern, status in patterns:
            if re.search(pattern, combined_output, re.IGNORECASE):
                # Extract error context (surrounding text)
                match = re.search(f"(.{{0,50}}){pattern}(.{{0,50}})", combined_output, re.IGNORECASE)
                context = match.group(0) if match else pattern
                return status, f"Detected error pattern: {context}"
        
        return ExecutionStatus.COMPLETED, None


@dataclass
class ExecutionLogEntry:
    """Comprehensive execution log entry structure."""
    
    # Basic identification
    timestamp: str
    execution_id: str
    prompt_id: str
    agent_name: str
    unit: Optional[str] = None
    
    # Execution details
    command_executed: str = ""
    full_prompt: str = ""
    
    # Results
    stdout: str = ""
    stderr: str = ""
    combined_output: str = ""
    exit_code: int = 0
    
    # Analysis
    execution_status: ExecutionStatus = ExecutionStatus.ENABLED
    error_analysis: Optional[str] = None
    detected_patterns: List[str] = None
    
    # Performance metrics
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_seconds: float = 0.0
    
    # Token usage (if available)
    tokens_used: Optional[int] = None
    estimated_cost: Optional[float] = None
    
    # Exception handling
    exception_occurred: bool = False
    exception_type: Optional[str] = None
    exception_message: Optional[str] = None
    stack_trace: Optional[str] = None
    
    def __post_init__(self):
        """Initialize computed fields."""
        if self.detected_patterns is None:
            self.detected_patterns = []
        if not self.combined_output:
            self.combined_output = f"STDOUT:\n{self.stdout}\n\nSTDERR:\n{self.stderr}"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        # Convert enum to string
        data['execution_status'] = self.execution_status.value
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExecutionLogEntry':
        """Create from dictionary."""
        # Convert status string back to enum
        if 'execution_status' in data and isinstance(data['execution_status'], str):
            data['execution_status'] = ExecutionStatus(data['execution_status'])
        return cls(**data)


class AuditLogger:
    """
    Comprehensive audit logging system with detailed execution tracking,
    error analysis, and stateful logging capabilities.
    """
    
    def __init__(self, logs_base_dir: str = "tmp/logs"):
        """Initialize the audit logger."""
        self.logs_base_dir = Path(logs_base_dir)
        self.logs_base_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        self.execution_logs_dir = self.logs_base_dir / "executions"
        self.error_logs_dir = self.logs_base_dir / "errors"
        self.audit_logs_dir = self.logs_base_dir / "audit"
        
        for dir_path in [self.execution_logs_dir, self.error_logs_dir, self.audit_logs_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Setup main logger
        self.logger = self._setup_main_logger()
        
        # Thread-safe logging
        self._log_lock = threading.Lock()
        
        # Current session info
        self.current_session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Log the logger initialization
        self.logger.info(f"🔍 Audit Logger initialized - Session: {self.current_session_id}")
        self.logger.info(f"📁 Logs directory: {self.logs_base_dir.absolute()}")
        
    def _setup_main_logger(self) -> logging.Logger:
        """Setup the main audit logger with file and console handlers."""
        logger_name = f"audit_logger_{id(self)}"
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.DEBUG)
        
        # Prevent duplicate handlers
        if logger.handlers:
            return logger
        
        # File handler for detailed audit logs
        audit_file = self.audit_logs_dir / f"audit_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(audit_file)
        file_handler.setLevel(logging.DEBUG)
        
        # Detailed formatter
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        
        logger.addHandler(file_handler)
        
        return logger
    
    def get_current_log_locations(self) -> Dict[str, str]:
        """Get current log file locations for user information."""
        return {
            "main_audit_log": str(self.audit_logs_dir / f"audit_{datetime.now().strftime('%Y%m%d')}.log"),
            "execution_logs_dir": str(self.execution_logs_dir),
            "error_logs_dir": str(self.error_logs_dir),
            "logs_base_dir": str(self.logs_base_dir.absolute())
        }
    
    def display_log_locations(self):
        """Display current log locations to user."""
        locations = self.get_current_log_locations()
        print(f"📋 Detailed execution logs: {locations['execution_logs_dir']}")
        print(f"🚨 Error logs: {locations['error_logs_dir']}")
        print(f"🔍 Main audit log: {locations['main_audit_log']}")
        print(f"📁 All logs directory: {locations['logs_base_dir']}")
    
    def create_execution_entry(self, prompt_id: str, agent_name: str, unit: Optional[str] = None,
                             command: str = "", full_prompt: str = "") -> ExecutionLogEntry:
        """Create a new execution log entry."""
        execution_id = f"{prompt_id}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        entry = ExecutionLogEntry(
            timestamp=datetime.now().isoformat(),
            execution_id=execution_id,
            prompt_id=prompt_id,
            agent_name=agent_name,
            unit=unit,
            command_executed=command,
            full_prompt=full_prompt,
            start_time=datetime.now().isoformat()
        )
        
        self.logger.info(f"🚀 Starting execution: {execution_id} - Prompt: {prompt_id} - Agent: {agent_name}")
        if unit:
            self.logger.info(f"   📍 Unit: {unit}")
        
        return entry
    
    def complete_execution_entry(self, entry: ExecutionLogEntry, stdout: str = "", 
                               stderr: str = "", exit_code: int = 0, 
                               exception: Optional[Exception] = None,
                               duration_seconds: float = 0.0) -> ExecutionLogEntry:
        """Complete an execution log entry with results and analysis."""
        
        with self._log_lock:
            # Update entry with results
            entry.end_time = datetime.now().isoformat()
            entry.stdout = stdout
            entry.stderr = stderr
            entry.exit_code = exit_code
            entry.duration_seconds = duration_seconds
            entry.combined_output = f"STDOUT:\n{stdout}\n\nSTDERR:\n{stderr}"
            
            # Handle exceptions
            if exception:
                entry.exception_occurred = True
                entry.exception_type = type(exception).__name__
                entry.exception_message = str(exception)
                entry.stack_trace = traceback.format_exc()
                self.logger.error(f"💥 Exception in execution {entry.execution_id}: {exception}")
                self.logger.debug(f"Stack trace:\n{entry.stack_trace}")
            
            # Analyze output for hidden errors (even if exit_code is 0)
            status, error_description = ErrorPattern.analyze_output(stdout, stderr, entry.agent_name)
            entry.execution_status = status
            entry.error_analysis = error_description
            
            # Override status if we have an exception or non-zero exit code
            if exception or exit_code != 0:
                if entry.execution_status == ExecutionStatus.COMPLETED:
                    entry.execution_status = ExecutionStatus.FAILED_UNKNOWN
            
            # Log completion
            status_emoji = "✅" if entry.execution_status == ExecutionStatus.COMPLETED else "❌"
            self.logger.info(f"{status_emoji} Completed execution: {entry.execution_id}")
            self.logger.info(f"   ⏱️ Duration: {format_duration(int(duration_seconds))}")
            self.logger.info(f"   📊 Status: {entry.execution_status.value}")
            
            if entry.error_analysis:
                self.logger.warning(f"   🔍 Error detected: {entry.error_analysis}")
            
            # Save detailed execution log
            self._save_execution_log(entry)
            
            # Save error log if failed
            if entry.execution_status != ExecutionStatus.COMPLETED:
                self._save_error_log(entry)
        
        return entry
    
    def _save_execution_log(self, entry: ExecutionLogEntry):
        """Save detailed execution log to file."""
        try:
            # Create filename with timestamp and prompt ID
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_prompt_id = sanitize_filename(entry.prompt_id)
            filename = f"{timestamp}_{safe_prompt_id}_{entry.execution_id}.json"
            
            log_file = self.execution_logs_dir / filename
            
            # Save as JSON for structured analysis
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(entry.to_dict(), f, indent=2, ensure_ascii=False)
            
            self.logger.debug(f"💾 Execution log saved: {log_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to save execution log: {e}")
            self.logger.debug(f"Stack trace:\n{traceback.format_exc()}")
    
    def _save_error_log(self, entry: ExecutionLogEntry):
        """Save error-specific log with enhanced details."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_prompt_id = sanitize_filename(entry.prompt_id)
            filename = f"ERROR_{timestamp}_{safe_prompt_id}_{entry.execution_id}.json"
            
            error_file = self.error_logs_dir / filename
            
            # Create enhanced error log entry
            error_log = {
                "error_summary": {
                    "execution_id": entry.execution_id,
                    "prompt_id": entry.prompt_id,
                    "agent_name": entry.agent_name,
                    "unit": entry.unit,
                    "status": entry.execution_status.value,
                    "error_analysis": entry.error_analysis,
                    "timestamp": entry.timestamp,
                    "duration_seconds": entry.duration_seconds
                },
                "full_execution_details": entry.to_dict(),
                "debugging_info": {
                    "command_executed": entry.command_executed,
                    "exit_code": entry.exit_code,
                    "stdout_length": len(entry.stdout),
                    "stderr_length": len(entry.stderr),
                    "exception_occurred": entry.exception_occurred,
                    "stack_trace_available": bool(entry.stack_trace)
                }
            }
            
            with open(error_file, 'w', encoding='utf-8') as f:
                json.dump(error_log, f, indent=2, ensure_ascii=False)
            
            self.logger.error(f"🚨 Error log saved: {error_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to save error log: {e}")
    
    def log_execution_start(self, prompt_id: str, agent_name: str, command: str, 
                          unit: Optional[str] = None, full_prompt: str = ""):
        """Log the start of a prompt execution."""
        self.logger.info(f"🎯 Starting prompt execution")
        self.logger.info(f"   🆔 Prompt ID: {prompt_id}")
        self.logger.info(f"   🤖 Agent: {agent_name}")
        if unit:
            self.logger.info(f"   📍 Unit: {unit}")
        self.logger.info(f"   💻 Command: {command}")
        self.logger.debug(f"   📄 Full prompt length: {len(full_prompt)} characters")
    
    def log_execution_complete(self, prompt_id: str, agent_name: str, status: ExecutionStatus,
                             duration_seconds: float, unit: Optional[str] = None):
        """Log the completion of a prompt execution."""
        status_emoji = "✅" if status == ExecutionStatus.COMPLETED else "❌"
        self.logger.info(f"{status_emoji} Execution completed")
        self.logger.info(f"   🆔 Prompt ID: {prompt_id}")
        self.logger.info(f"   🤖 Agent: {agent_name}")
        if unit:
            self.logger.info(f"   📍 Unit: {unit}")
        self.logger.info(f"   📊 Status: {status.value}")
        self.logger.info(f"   ⏱️ Duration: {format_duration(int(duration_seconds))}")
    
    def capture_subprocess_output(self, command: List[str], timeout: Optional[float] = None,
                                cwd: Optional[str] = None) -> Tuple[str, str, int]:
        """
        Enhanced subprocess execution with comprehensive output capture.
        
        Returns:
            Tuple of (stdout, stderr, exit_code)
        """
        self.logger.debug(f"🔧 Executing subprocess: {' '.join(command)}")
        if cwd:
            self.logger.debug(f"📁 Working directory: {cwd}")
        if timeout:
            self.logger.debug(f"⏰ Timeout: {timeout}s")
        
        try:
            # Use subprocess.run for better control
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=cwd,
                encoding='utf-8',
                errors='replace'  # Handle encoding errors gracefully
            )
            
            stdout = result.stdout or ""
            stderr = result.stderr or ""
            exit_code = result.returncode
            
            self.logger.debug(f"📤 Subprocess completed - Exit code: {exit_code}")
            self.logger.debug(f"📤 STDOUT length: {len(stdout)}")
            self.logger.debug(f"📤 STDERR length: {len(stderr)}")
            
            return stdout, stderr, exit_code
            
        except subprocess.TimeoutExpired as e:
            self.logger.error(f"⏰ Subprocess timeout after {timeout}s")
            return "", f"Command timed out after {timeout} seconds", 124
            
        except Exception as e:
            self.logger.error(f"💥 Subprocess execution failed: {e}")
            self.logger.debug(f"Stack trace:\n{traceback.format_exc()}")
            return "", f"Subprocess execution error: {str(e)}", 1
    
    def analyze_agent_limits(self, output: str, agent_name: str) -> Dict[str, Any]:
        """
        Analyze agent output for rate limiting and usage information.
        
        Returns:
            Dictionary with limit analysis results
        """
        analysis = {
            "agent_name": agent_name,
            "rate_limited": False,
            "limit_type": None,
            "reset_time": None,
            "usage_info": {},
            "recommendations": []
        }
        
        output_lower = output.lower()
        
        # Claude-specific analysis
        if "claude" in agent_name.lower():
            if "5-hour limit" in output_lower or "5 hour limit" in output_lower:
                analysis["rate_limited"] = True
                analysis["limit_type"] = "5_hour_limit"
                analysis["recommendations"].append("Wait for rate limit reset or use fallback model")
            
            # Look for token usage patterns
            token_match = re.search(r'(\d+)\s*tokens?\s*used', output_lower)
            if token_match:
                analysis["usage_info"]["tokens_used"] = int(token_match.group(1))
        
        # Gemini-specific analysis
        elif "gemini" in agent_name.lower():
            if "daily limit" in output_lower or "quota exceeded" in output_lower:
                analysis["rate_limited"] = True
                analysis["limit_type"] = "daily_quota"
                analysis["recommendations"].append("Wait until next day or use alternative model")
        
        # General rate limiting patterns
        if "rate limit" in output_lower or "too many requests" in output_lower:
            analysis["rate_limited"] = True
            if not analysis["limit_type"]:
                analysis["limit_type"] = "general_rate_limit"
        
        if analysis["rate_limited"]:
            self.logger.warning(f"🚫 Rate limiting detected for {agent_name}")
            self.logger.warning(f"   📊 Limit type: {analysis['limit_type']}")
            for rec in analysis["recommendations"]:
                self.logger.info(f"   💡 Recommendation: {rec}")
        
        return analysis
    
    def create_session_summary(self, session_stats: Dict[str, Any]) -> str:
        """Create a comprehensive session summary."""
        summary_file = self.audit_logs_dir / f"session_summary_{self.current_session_id}.json"
        
        session_data = {
            "session_id": self.current_session_id,
            "start_time": session_stats.get("start_time"),
            "end_time": datetime.now().isoformat(),
            "total_executions": session_stats.get("total_executions", 0),
            "successful_executions": session_stats.get("successful_executions", 0),
            "failed_executions": session_stats.get("failed_executions", 0),
            "error_breakdown": session_stats.get("error_breakdown", {}),
            "total_duration": session_stats.get("total_duration", 0),
            "agents_used": session_stats.get("agents_used", []),
            "log_locations": self.get_current_log_locations()
        }
        
        try:
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"📋 Session summary saved: {summary_file}")
            return str(summary_file)
            
        except Exception as e:
            self.logger.error(f"Failed to save session summary: {e}")
            return ""
    
    def log_raw_json_stream(self, prompt_id: str, json_data: Dict[str, Any]):
        """Log raw JSON stream data for comprehensive audit trail."""
        try:
            # Create a dedicated file for streaming JSON logs
            stream_log_file = self.execution_logs_dir / f"stream_{sanitize_filename(prompt_id)}_{self.current_session_id}.jsonl"
            
            # Append JSON line to the file (JSONL format for streaming logs)
            with open(stream_log_file, 'a', encoding='utf-8') as f:
                json_line = {
                    "timestamp": datetime.now().isoformat(),
                    "prompt_id": prompt_id,
                    "session_id": self.current_session_id,
                    "event_data": json_data
                }
                f.write(json.dumps(json_line, ensure_ascii=False) + '\n')
            
        except Exception as e:
            self.logger.error(f"Failed to log JSON stream data for {prompt_id}: {e}")


# Global audit logger instance
_global_audit_logger: Optional[AuditLogger] = None


def get_audit_logger() -> AuditLogger:
    """Get or create the global audit logger instance."""
    global _global_audit_logger
    if _global_audit_logger is None:
        _global_audit_logger = AuditLogger()
    return _global_audit_logger


def log_execution_with_audit(func):
    """
    Decorator for automatic execution logging and audit.
    
    Usage:
        @log_execution_with_audit
        def execute_prompt(prompt_id, agent_name, ...):
            # function implementation
            return result
    """
    def wrapper(*args, **kwargs):
        audit_logger = get_audit_logger()
        
        # Extract prompt info from arguments (customize based on function signature)
        prompt_id = kwargs.get('prompt_id', args[0] if args else 'unknown')
        agent_name = kwargs.get('agent_name', 'unknown')
        
        # Create execution entry
        entry = audit_logger.create_execution_entry(prompt_id, agent_name)
        
        try:
            start_time = datetime.now()
            result = func(*args, **kwargs)
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            # Complete entry with success
            audit_logger.complete_execution_entry(
                entry, 
                stdout=str(result) if result else "",
                duration_seconds=duration
            )
            
            return result
            
        except Exception as e:
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            # Complete entry with exception
            audit_logger.complete_execution_entry(
                entry,
                exception=e,
                duration_seconds=duration
            )
            
            raise  # Re-raise the exception
    
    return wrapper