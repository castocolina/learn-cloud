# Comprehensive Logging and Audit System

## Overview

The AI Prompt Execution framework now includes a comprehensive logging and audit system that provides detailed tracking, error detection, and debugging capabilities for all prompt executions.

## 🔍 Key Features

### Detailed File Logging
- **Per-execution logs**: Each prompt execution creates a detailed JSON log with complete execution data
- **Structured data**: All logs are JSON-formatted for easy parsing and analysis
- **Complete context**: Includes prompt content, agent responses, timing, and metadata

### Robust Hidden Error Detection
- **Pattern recognition**: Automatically detects errors disguised as successful executions
- **Agent-specific patterns**: Custom error detection for Claude and Gemini agents
- **Rate limit detection**: Identifies 5-hour limits, daily quotas, and rate limiting
- **Network/permission errors**: Detects connectivity and authentication issues

### Complete Stack Trace Logging
- **Exception capture**: Full Python stack traces for all exceptions
- **Context preservation**: Maintains execution context when errors occur
- **Debug information**: Detailed debugging data for troubleshooting

### Stateful Error Handling
- **Error classification**: Categorizes failures into specific types:
  - `failed_rate_limit`: Rate limiting or quota exceeded
  - `failed_network`: Network connectivity issues
  - `failed_parsing`: JSON/response parsing errors
  - `failed_permissions`: Authentication/authorization errors
  - `failed_timeout`: Execution timeouts
  - `failed_unknown`: Other unclassified errors
- **YAML metadata updates**: Error states are saved to prompt metadata
- **Recovery recommendations**: Provides suggestions for error resolution

### Comprehensive Output Capture
- **stdout/stderr separation**: Captures both standard output and error streams
- **Combined analysis**: Analyzes both streams for hidden errors
- **Process exit codes**: Tracks subprocess exit codes accurately
- **Encoding handling**: Graceful handling of text encoding issues

## 📁 Log File Structure

```
tmp/logs/
├── audit/
│   ├── audit_20250910.log          # Main audit log (daily rotation)
│   └── session_summary_*.json      # Session summaries
├── executions/
│   ├── 20250910_143022_prompt-id_exec-*.json  # Individual execution logs
│   └── ...
└── errors/
    ├── ERROR_20250910_143022_prompt-id_*.json  # Error-specific logs
    └── ...
```

### Execution Log Format

```json
{
  "timestamp": "2025-01-10T14:30:22.123456",
  "execution_id": "prompt-id_20250110_143022_123456",
  "prompt_id": "generate-unit-content",
  "agent_name": "claude-sonnet-3.5",
  "unit": "unit1",
  "command_executed": "execute_agent_prompt via claude-sonnet-3.5",
  "full_prompt": "Complete prompt text...",
  "stdout": "Agent response output...",
  "stderr": "",
  "combined_output": "STDOUT:\n...\n\nSTDERR:\n...",
  "exit_code": 0,
  "execution_status": "completed",
  "error_analysis": null,
  "detected_patterns": [],
  "start_time": "2025-01-10T14:30:22.123456",
  "end_time": "2025-01-10T14:32:15.654321",
  "duration_seconds": 113.53,
  "tokens_used": null,
  "estimated_cost": null,
  "exception_occurred": false,
  "exception_type": null,
  "exception_message": null,
  "stack_trace": null
}
```

### Error Log Format

```json
{
  "error_summary": {
    "execution_id": "...",
    "prompt_id": "...",
    "agent_name": "...",
    "unit": "...",
    "status": "failed_rate_limit",
    "error_analysis": "Detected error pattern: 5-hour limit reached",
    "timestamp": "...",
    "duration_seconds": 5.2
  },
  "full_execution_details": { /* Complete ExecutionLogEntry */ },
  "debugging_info": {
    "command_executed": "...",
    "exit_code": 1,
    "stdout_length": 245,
    "stderr_length": 89,
    "exception_occurred": false,
    "stack_trace_available": false
  }
}
```

## 🚀 Usage

### Viewing Current Log Locations

```bash
# Display current log locations
python3 src/python/show_logs.py
```

### Integration with Prompt Executor

The logging system is automatically integrated with the prompt executor:

```bash
# Start prompt executor (logs displayed on startup)
make prompt-executor
```

### Integration with Prompt Manager

The logging system is also integrated with the prompt manager:

```bash
# Start prompt manager (logs displayed on startup)
make prompt-manager
```

### Programmatic Access

```python
from prompt_utils.audit_logger import AuditLogger, ExecutionLogEntry

# Get audit logger instance
audit_logger = AuditLogger()

# Display log locations
audit_logger.display_log_locations()

# Get log locations programmatically
locations = audit_logger.get_current_log_locations()
print(f"Execution logs: {locations['execution_logs_dir']}")
print(f"Error logs: {locations['error_logs_dir']}")
print(f"Main audit log: {locations['main_audit_log']}")
```

## 🔧 Error Detection Patterns

### Claude Agent Patterns
- **Rate Limiting**: `5-hour limit reached`, `5 hour limit`, `rate limit`, `quota exceeded`
- **Authentication**: `authentication failed`, `invalid api key`

### Gemini Agent Patterns
- **Daily Limits**: `daily limit`, `quota exceeded`
- **Rate Limiting**: `rate limit exceeded`
- **Authentication**: `authentication error`, `invalid key`

### General Patterns
- **Timeouts**: `timeout`, `timed out`
- **Network Issues**: `connection refused`, `network error`, `connection error`
- **Permissions**: `permission denied`, `access denied`
- **Parsing Errors**: `json.decoder.JSONDecodeError`, `invalid json`, `parse error`
- **Generic Errors**: `error:`, `ERROR:`, `exception:`, `Exception:`

## 📊 Session Summaries

At the end of each execution session, a comprehensive summary is created:

```json
{
  "session_id": "20250110_143022",
  "start_time": "2025-01-10T14:30:22.123456",
  "end_time": "2025-01-10T15:45:18.987654",
  "total_executions": 15,
  "successful_executions": 12,
  "failed_executions": 3,
  "error_breakdown": {
    "rate_limit": 2,
    "network": 1
  },
  "total_duration": 4496,
  "agents_used": ["claude-sonnet-3.5", "gemini-pro"],
  "log_locations": { /* All log file paths */ }
}
```

## 🛠️ Development and Testing

### Running Tests

```bash
# Run comprehensive audit logging tests
python3 src/test/python/test_audit_logging_system.py
```

### Adding New Error Patterns

1. Edit `src/python/prompt_utils/audit_logger.py`
2. Add patterns to the appropriate pattern list:
   - `CLAUDE_PATTERNS` for Claude-specific patterns
   - `GEMINI_PATTERNS` for Gemini-specific patterns
   - `GENERAL_PATTERNS` for general patterns
3. Run tests to verify pattern detection works correctly

### Custom Error Analysis

The system supports custom error analysis by extending the `ErrorPattern` class:

```python
class CustomErrorPattern(ErrorPattern):
    CUSTOM_PATTERNS = [
        (r"custom error pattern", ExecutionStatus.FAILED_UNKNOWN),
    ]
    
    @classmethod
    def analyze_custom_output(cls, output: str, agent_name: str):
        # Custom analysis logic
        pass
```

## 🔍 Debugging Failed Executions

When executions fail:

1. **Check Error Logs**: Look in `tmp/logs/errors/` for detailed error information
2. **Review Execution Logs**: Check `tmp/logs/executions/` for complete execution context
3. **Examine Audit Logs**: Check `tmp/logs/audit/audit_YYYYMMDD.log` for session-level tracking
4. **View Session Summary**: Check session summary JSON files for overall statistics

## 📈 Performance Impact

- **Minimal overhead**: Logging operations are designed to have minimal impact on execution performance
- **Asynchronous logging**: Log writing is performed asynchronously where possible
- **Efficient storage**: JSON format provides efficient storage and fast parsing
- **Automatic cleanup**: Old log files can be cleaned up using the existing `make clean-tmp` command

## 🔐 Security Considerations

- **Sensitive data**: The system automatically truncates very long outputs to prevent logging sensitive data
- **File permissions**: Log files are created with appropriate permissions
- **No secrets**: API keys and sensitive configuration are never logged
- **Safe encoding**: All text is handled with safe encoding to prevent corruption

## 🚨 Troubleshooting

### Common Issues

1. **Log directory not created**: Run `make setup` to ensure all directories exist
2. **Permission errors**: Check file permissions on `tmp/logs/` directory
3. **Disk space**: Monitor disk usage if generating many large logs
4. **JSON parsing errors**: Use a JSON validator if manually editing log files

### Log File Locations Not Displayed

If log locations are not displayed on startup:

```bash
# Manually check log locations
python3 src/python/show_logs.py

# Verify directories exist
ls -la tmp/logs/
```

## 📝 Future Enhancements

Potential future improvements to the logging system:

- **Log rotation**: Automatic rotation of large log files
- **Log aggregation**: Centralized log aggregation for multiple sessions
- **Real-time monitoring**: Live monitoring of execution logs
- **Performance metrics**: Enhanced performance and timing metrics
- **Cost tracking**: Integration with API cost tracking
- **Log analysis tools**: Built-in tools for log analysis and reporting