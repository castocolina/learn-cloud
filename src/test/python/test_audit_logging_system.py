"""
Test suite for the comprehensive audit logging system.

Verifies that all logging components work correctly including:
- Detailed file logging
- Error pattern detection
- Stack trace logging  
- Stateful error handling
- Subprocess output capture
"""

import tempfile
import json
import sys
import os
import traceback
from pathlib import Path
from unittest.mock import Mock, patch
from datetime import datetime

# Add the src/python directory to the path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'python'))

# Import modules under test
from prompt_utils.audit_logger import (
    AuditLogger, ExecutionLogEntry, ExecutionStatus, ErrorPattern,
    get_audit_logger
)
from prompt_utils.config_manager import PromptConfig
from prompt_utils.agent_handler import AgentExecutionResult


def test_audit_logger_initialization():
    """Test that audit logger initializes correctly."""
    print("🧪 Testing audit logger initialization...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audit_logger = AuditLogger(logs_base_dir=temp_dir)
        
        # Check that directories are created
        assert (Path(temp_dir) / "executions").exists()
        assert (Path(temp_dir) / "errors").exists()
        assert (Path(temp_dir) / "audit").exists()
        
        # Check that log locations are properly set
        locations = audit_logger.get_current_log_locations()
        assert "main_audit_log" in locations
        assert "execution_logs_dir" in locations
        assert "error_logs_dir" in locations
        assert "logs_base_dir" in locations
        
        print("✅ Audit logger initialization test passed")


def test_error_pattern_detection():
    """Test error pattern detection for hidden errors."""
    print("🧪 Testing error pattern detection...")
    
    # Test Claude-specific patterns
    test_cases = [
        ("5-hour limit reached for this model", "claude-sonnet", ExecutionStatus.FAILED_RATE_LIMIT),
        ("Rate limit exceeded. Please try again", "claude-haiku", ExecutionStatus.FAILED_RATE_LIMIT),
        ("Connection refused: network error", "any-agent", ExecutionStatus.FAILED_NETWORK),
        ("Permission denied: invalid API key", "gemini-pro", ExecutionStatus.FAILED_PERMISSIONS),
        ("JSON.parse error: unexpected token", "any-agent", ExecutionStatus.FAILED_PARSING),
        ("Daily limit exceeded for Gemini", "gemini-flash", ExecutionStatus.FAILED_RATE_LIMIT),
        ("Successfully completed the task", "claude-sonnet", ExecutionStatus.COMPLETED),
    ]
    
    for output, agent, expected_status in test_cases:
        status, error_desc = ErrorPattern.analyze_output(output, "", agent)
        assert status == expected_status, f"Expected {expected_status} for '{output}', got {status}"
        
        if expected_status != ExecutionStatus.COMPLETED:
            assert error_desc is not None, f"Expected error description for '{output}'"
    
    print("✅ Error pattern detection test passed")


def test_execution_log_entry_creation():
    """Test creation and serialization of execution log entries."""
    print("🧪 Testing execution log entry creation...")
    
    # Create test execution log entry
    entry = ExecutionLogEntry(
        timestamp=datetime.now().isoformat(),
        execution_id="test-exec-001",
        prompt_id="test-prompt-1",
        agent_name="claude-sonnet-3.5",
        unit="unit1",
        command_executed="test command",
        full_prompt="This is a test prompt",
        stdout="Test successful output",
        stderr="",
        exit_code=0,
        execution_status=ExecutionStatus.COMPLETED,
        duration_seconds=5.5
    )
    
    # Test serialization
    entry_dict = entry.to_dict()
    assert entry_dict['execution_status'] == 'completed'
    assert entry_dict['duration_seconds'] == 5.5
    assert entry_dict['combined_output'] == "STDOUT:\nTest successful output\n\nSTDERR:\n"
    
    # Test deserialization
    reconstructed = ExecutionLogEntry.from_dict(entry_dict)
    assert reconstructed.execution_status == ExecutionStatus.COMPLETED
    assert reconstructed.duration_seconds == 5.5
    
    print("✅ Execution log entry creation test passed")


def test_comprehensive_execution_logging():
    """Test comprehensive execution logging with audit logger."""
    print("🧪 Testing comprehensive execution logging...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audit_logger = AuditLogger(logs_base_dir=temp_dir)
        
        # Create a test execution
        entry = audit_logger.create_execution_entry(
            prompt_id="test-prompt-logging",
            agent_name="claude-sonnet-3.5",
            unit="unit1",
            command="test command",
            full_prompt="This is a comprehensive test"
        )
        
        # Simulate successful execution
        stdout_output = "Task completed successfully"
        stderr_output = ""
        
        completed_entry = audit_logger.complete_execution_entry(
            entry,
            stdout=stdout_output,
            stderr=stderr_output,
            exit_code=0,
            duration_seconds=3.2
        )
        
        # Verify entry was updated
        assert completed_entry.stdout == stdout_output
        assert completed_entry.execution_status == ExecutionStatus.COMPLETED
        assert completed_entry.duration_seconds == 3.2
        
        # Verify log files were created
        execution_logs_dir = Path(temp_dir) / "executions"
        log_files = list(execution_logs_dir.glob("*.json"))
        assert len(log_files) >= 1, "Expected at least one execution log file"
        
        # Verify log file content
        with open(log_files[0], 'r') as f:
            log_data = json.load(f)
            assert log_data['prompt_id'] == "test-prompt-logging"
            assert log_data['agent_name'] == "claude-sonnet-3.5"
            assert log_data['execution_status'] == "completed"
        
        print("✅ Comprehensive execution logging test passed")


def test_error_logging_with_exceptions():
    """Test error logging when exceptions occur."""
    print("🧪 Testing error logging with exceptions...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audit_logger = AuditLogger(logs_base_dir=temp_dir)
        
        # Create a test execution that will have an exception
        entry = audit_logger.create_execution_entry(
            prompt_id="test-error-prompt",
            agent_name="claude-sonnet-3.5",
            command="failing command"
        )
        
        # Simulate exception during execution
        test_exception = ValueError("Test exception for logging")
        
        completed_entry = audit_logger.complete_execution_entry(
            entry,
            stderr="Exception occurred during execution",
            exception=test_exception,
            duration_seconds=1.0
        )
        
        # Verify exception was logged
        assert completed_entry.exception_occurred == True
        assert completed_entry.exception_type == "ValueError"
        assert completed_entry.exception_message == "Test exception for logging"
        assert completed_entry.stack_trace is not None
        assert completed_entry.execution_status != ExecutionStatus.COMPLETED
        
        # Verify error log files were created
        error_logs_dir = Path(temp_dir) / "errors"
        error_files = list(error_logs_dir.glob("ERROR_*.json"))
        assert len(error_files) >= 1, "Expected at least one error log file"
        
        # Verify error log content
        with open(error_files[0], 'r') as f:
            error_data = json.load(f)
            assert error_data['error_summary']['prompt_id'] == "test-error-prompt"
            assert error_data['full_execution_details']['exception_occurred'] == True
            assert error_data['debugging_info']['exception_occurred'] == True
        
        print("✅ Error logging with exceptions test passed")


def test_subprocess_output_capture():
    """Test subprocess output capture functionality."""
    print("🧪 Testing subprocess output capture...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audit_logger = AuditLogger(logs_base_dir=temp_dir)
        
        # Test successful command
        stdout, stderr, exit_code = audit_logger.capture_subprocess_output(
            ['echo', 'Hello, World!']
        )
        
        assert stdout.strip() == "Hello, World!"
        assert stderr.strip() == ""
        assert exit_code == 0
        
        # Test command with stderr output
        stdout, stderr, exit_code = audit_logger.capture_subprocess_output(
            ['python3', '-c', 'import sys; sys.stderr.write("Error message\\n")']
        )
        
        assert "Error message" in stderr
        assert exit_code == 0  # Python script ran successfully despite stderr output
        
        # Test failing command
        stdout, stderr, exit_code = audit_logger.capture_subprocess_output(
            ['false']  # Command that always fails
        )
        
        assert exit_code == 1
        
        print("✅ Subprocess output capture test passed")


def test_agent_limit_analysis():
    """Test agent limit analysis functionality."""
    print("🧪 Testing agent limit analysis...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audit_logger = AuditLogger(logs_base_dir=temp_dir)
        
        # Test Claude rate limit detection
        claude_output = "Request successful. However, you've reached the 5-hour limit for this model."
        analysis = audit_logger.analyze_agent_limits(claude_output, "claude-sonnet-3.5")
        
        assert analysis['rate_limited'] == True
        assert analysis['limit_type'] == "5_hour_limit"
        assert len(analysis['recommendations']) > 0
        
        # Test Gemini daily limit detection
        gemini_output = "Daily quota exceeded for this API key. Please try again tomorrow."
        analysis = audit_logger.analyze_agent_limits(gemini_output, "gemini-pro")
        
        assert analysis['rate_limited'] == True
        assert analysis['limit_type'] == "daily_quota"
        
        # Test normal output (no limits)
        normal_output = "Task completed successfully with no issues."
        analysis = audit_logger.analyze_agent_limits(normal_output, "claude-haiku")
        
        assert analysis['rate_limited'] == False
        assert analysis['limit_type'] is None
        
        print("✅ Agent limit analysis test passed")


def test_session_summary_creation():
    """Test session summary creation."""
    print("🧪 Testing session summary creation...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audit_logger = AuditLogger(logs_base_dir=temp_dir)
        
        # Create test session stats
        session_stats = {
            "start_time": "2025-01-01T10:00:00",
            "total_executions": 5,
            "successful_executions": 3,
            "failed_executions": 2,
            "error_breakdown": {"rate_limit": 1, "network": 1},
            "total_duration": 120,
            "agents_used": ["claude-sonnet-3.5", "gemini-pro"],
        }
        
        summary_file = audit_logger.create_session_summary(session_stats)
        
        assert summary_file != ""
        summary_path = Path(summary_file)
        assert summary_path.exists()
        
        # Verify summary content
        with open(summary_path, 'r') as f:
            summary_data = json.load(f)
            assert summary_data['total_executions'] == 5
            assert summary_data['successful_executions'] == 3
            assert summary_data['failed_executions'] == 2
            assert 'log_locations' in summary_data
        
        print("✅ Session summary creation test passed")


def run_all_tests():
    """Run all audit logging tests."""
    print("🚀 Running Audit Logging System Tests")
    print("=" * 50)
    
    try:
        test_audit_logger_initialization()
        test_error_pattern_detection()
        test_execution_log_entry_creation()
        test_comprehensive_execution_logging()
        test_error_logging_with_exceptions()
        test_subprocess_output_capture()
        test_agent_limit_analysis()
        test_session_summary_creation()
        
        print("\n🎉 All audit logging tests passed!")
        print("✅ Comprehensive logging and audit system is working correctly")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print(f"Stack trace: {traceback.format_exc()}")
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)