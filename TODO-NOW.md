# TODO-NOW: Priority-Organized Tasks

This file contains all tasks organized by priority and scope, ready for one-by-one implementation.

---

## 🔴 HIGH PRIORITY - CRITICAL ERROR FIXES

```markdown
## Critical Error: YAML State Loss
**Scope:** Critical bug fix in state management
**Affected files:** `src/python/prompt_utils/execution_engine.py`, `src/python/prompt_utils/config_manager.py`

**Identified problem:**
- When saving a prompt's execution state, the `metadata.execution` of other already-executed prompts is lost
- The bug is in the `_update_yaml_metadata()` function in `execution_engine.py` lines 418-446
- The function reads the YAML file, modifies data for a specific prompt, but fails to preserve existing `metadata.execution` for all other prompts before writing the complete data structure

**Specific tasks:**
1. Analyze `src/python/prompt_utils/state_manager.py` and `src/python/prompt_utils/config_manager.py` to identify root cause
2. Identify the function where `agent_prompts.yaml` is written that's causing data loss
3. Modify saving logic to correctly read the complete YAML file, update only specific prompt data, and preserve existing `metadata.execution` for all other prompts
4. Implement verification to confirm that executing a prompt and saving its state doesn't affect `metadata.execution` of any other prompt in the file
5. Create test or clear validation steps to confirm the fix works correctly

**Main files to review:**
- `src/python/prompt_utils/execution_engine.py` (`_update_yaml_metadata` method)
- `src/python/prompt_utils/config_manager.py` (`save_prompts` method)
- `src/conf/agent_prompts.yaml` (affected data structure)
```

---

## 🟠 HIGH PRIORITY - LOGGING AND ERROR HANDLING SYSTEM

```markdown
## Complete Logging and Audit System
**Scope:** Robust logging system implementation
**Affected files:** `src/python/prompt_executor.py`, `src/python/prompt_manager.py`, `src/python/prompt_utils/execution_engine.py`

**Detailed requirements:**

### Detailed File Logging
- Create a detailed log file for each prompt execution that includes:
  - Complete timestamp
  - Executed prompt ID
  - Agent that processed the prompt
  - Unit (if applicable for per-unit scope)
  - Exact command sent to agent
  - Complete agent response (both stdout and stderr)
  - Final execution status (enabled, needs_refinement, failed, completed)
  - Execution duration
  - Token usage and cost information (if available)

### On-Screen Log Location Indication
- System must inform user where to find detailed logs
- Show complete log file path after each execution
- Implement command to show current log location

### Robust Hidden Error Detection
- Analyze CLI output from agents (Claude, Gemini) to detect errors disguised as success
- Detect specific error patterns:
  - Claude's 5-hour threshold ("5-hour limit reached")
  - Gemini's daily limit ("daily limit")
  - Permission denied errors
  - Network connection errors
  - Response parsing errors
- Treat these patterns as execution failures even if CLI command returns success code

### Complete Stack Trace Logging
- Ensure any Python exception includes complete stack trace in log file
- Implement error handling in each critical function
- Save stack traces in both log files and prompt metadata when appropriate

### Stateful Error Handling
- `prompt_executor` must save execution errors in both log file and prompt's `metadata.execution` block
- Implement specific error states: `failed_rate_limit`, `failed_network`, `failed_parsing`, `failed_permissions`
- Update prompt state in YAML when errors occur

### stdin/stderr Considerations
- Capture both stdin and stderr from CLI processes
- Some programs may output errors to stderr but return success code
- Implement analysis of both streams to detect complete errors
- Save all output (stdout + stderr) in logs for later analysis
```

---

## 🟡 MEDIUM PRIORITY - CLAUDE SESSION CONTINUITY FIX

```markdown
## Fix Claude param_continue Logic for Per-Unit Executions
**Scope:** Bug fix for Claude session continuity in cyclic executions
**Affected files:** `src/python/prompt_utils/agent_handler.py`

**Identified problem:**
- Currently `param_continue` is applied whenever the agent has the parameter available
- Should only be used for cyclic executions starting from the 2nd unit (unit >= 2)
- Missing logic to determine if current execution is part of a per-unit sequence
- Session continuity benefit is lost because continue parameter is used inappropriately

**Context and Benefits:**
- **Per-unit executions**: Run sequentially for multiple units (unit1 → unit2 → unit3, etc.)
- **Claude session memory**: When using `--continue`, Claude maintains context between executions
- **Intended benefit**: Scripts, configurations, or knowledge from unit1 can be reused in unit2+
- **Current issue**: `--continue` is used even for single executions or first unit

**Specific tasks:**
1. Modify `_build_claude_command()` method in `agent_handler.py` to implement proper logic
2. Add condition to check if current `unit` parameter indicates it's NOT the first unit in sequence
3. Implement logic to determine the first unit in available units list
4. Apply `param_continue` only when:
   - Agent supports it (`param_continue` exists in config)
   - AND current execution is unit >= 2 in a per-unit sequence
5. Ensure single-scope executions never use `param_continue`
6. Test with actual per-unit execution to verify session continuity works correctly

**Implementation approach:**
- Detect available units using existing `detect_available_units()` functionality
- Compare current `unit` parameter against the first unit in sorted order
- Only apply `param_continue` if current unit is NOT the first unit
- Maintain backward compatibility with single-scope executions

**Files to modify:**
- `src/python/prompt_utils/agent_handler.py` (`_build_claude_command` method, lines ~140-155)

**Validation criteria:**
- First unit execution: No `--continue` parameter used
- Second+ unit execution: `--continue` parameter used when agent supports it
- Single-scope execution: Never uses `--continue`
- Session continuity: Verify that knowledge from unit1 is available in unit2
```

---

## 🟡 MEDIUM PRIORITY - STREAMING AND IMPROVED OUTPUT IMPLEMENTATION

```markdown
## Claude JSON Streaming Implementation
**Scope:** Feature enhancement for better UX - CLAUDE ONLY
**Affected files:** `src/python/prompt_utils/agent_handler.py`, `src/python/prompt_executor.py`

**Based on analysis of:** `src/python/CLAUDE-JSON-OUTPUT.md` and `src/conf/agents.yaml`

**IMPORTANT:** This functionality is ONLY available for Claude agents. Any centralized output handling implementation must always verify agent parameter availability.

### Claude Streaming Implementation (Claude-specific)
- Integrate support for `--output-format stream-json --verbose --include-partial-messages` from Claude
- **Agent Parameter Verification:** Always check if agent has `param_json_stream_output` available before attempting streaming
- Process real-time streaming events:
  - `system init` events
  - `message_start` events  
  - `content_block_start` events
  - `content_block_delta` events (real-time text fragments)
  - `message_stop` events
  - Final `result` with complete metrics

### Centralized Output Handling Strategy
- **Primary:** Check for `param_json_stream_output` availability in agent configuration
- **Fallback:** If streaming not available, check for `param_json_output` for non-streaming JSON format
- **Final fallback:** Use standard text output if neither JSON option is available
- **Implementation must be agent-agnostic:** Handle cases where agents don't support JSON or streaming

### Optimized Screen Output
- **For Claude streaming:** Show progressive output in real-time on screen while saving everything to log
- **Screen summary:** Show at least 150 characters of final result
- **Summarized metrics:** Show number of messages received, tokens used, duration, cost
- **Status indicators:** Show if there were errors, denied permissions, reached limits
- **Don't show all JSON:** Only key elements to avoid screen saturation

### Complete Log Saving
- Save all complete responses in detailed logs for debugging
- Preserve all streaming information for later analysis
- Include performance and cost metrics in logs

### Short vs Long Response Handling
- If responses are short: show complete to user
- If responses are long: show only part on screen but save complete in logs
- Implement configurable threshold to determine what constitutes "short response"

### Agent-Aware Parameter Usage
- **Claude:** Use `param_json_stream_output` when available, fallback to `param_json_output`
- **Gemini:** Use standard output (doesn't support JSON or streaming according to configuration)
- **Future agents:** Check parameter availability dynamically
- **Validation:** Always verify parameter existence before building commands
```

---

## 🟢 MEDIUM PRIORITY - MARKDOWN PROMPT LOADING FEATURE

```markdown
## Markdown Prompt Loading System
**Scope:** New functionality for prompt-manager
**Affected files:** `src/python/prompt_manager.py`, `src/python/prompt_utils/config_manager.py`

### Load from Markdown Functionality
- Implement `load` option in prompt-manager
- Read markdown files tokenized with `-----` separators (minimum 2 dashes, variable maximum)
- Parse content between separators as individual prompts
- Handle edge cases: separators with spaces, empty lines, content without text

### User Interface for Selection
- Show user list of prompts found in markdown
- Allow multiple selection of which prompts to process
- Show preview of each prompt before selection
- Confirm selection before processing

### Automatic YAML Generation
- Automatically generate prompt entries in `agent_prompts.yaml`
- Use strategist agent to determine:
  - Whether prompt is `single` or `per-unit` execution scope
  - Generate appropriate `short_name`
  - Create descriptive `short_description`
  - Improve user problem wording if necessary
- Assign unique IDs automatically
- Preserve generation metadata (source: markdown file, timestamp, etc.)

### Integration with Existing Flow
- Use same strategist agent flow for each prompt analysis
- Apply same validations as manual flow
- Maintain compatibility with existing unified schema
- Allow later editing of automatically generated prompts

### Validation and Error Handling
- Validate markdown structure before processing
- Handle malformed markdown files gracefully
- Verify content between separators is valid
- Report specific parsing errors to user
```

---

## 🔵 LOW PRIORITY - UX AND MONITORING IMPROVEMENTS

```markdown
## User Experience Improvements
**Scope:** Minor enhancements for better usability
**Affected files:** `src/python/prompt_executor.py`, `src/python/prompt_manager.py`

### Response Display on Screen
- Ensure that every time a prompt is executed, the response is shown on screen in addition to being saved
- Implement improved formatting for long responses
- Add visible timestamps for each execution
- Show visual progress during long executions

### Error Logging in Prompt-Manager
- Implement detailed logging in prompt-manager similar to prompt-executor
- Save errors in log when called agent is Claude or Gemini
- Show error details on screen when they occur
- Preserve error context for debugging

### Error Detection and Logging in Prompt-Executor
- Implement automatic error detection in agent responses
- Save detected errors in both logs and YAML prompt state
- Update prompt metadata with error information
- Implement intelligent retry logic based on error type

### Execution State Monitoring
- Improve visualization of current prompt execution state
- Show progress of per-unit executions
- Implement alerts for approaching rate limits
- Add real-time performance metrics during long executions
```

---

## 📋 ADDITIONAL IMPLEMENTATION NOTES

```markdown
## Important Technical Considerations

### Metadata Preservation
- Entire system must preserve `metadata.execution` of unmodified prompts
- Implement automatic backup before critical modifications
- Validate data integrity after each write operation

### Unified Schema Compatibility
- All modifications must maintain compatibility with `UnifiedPrompt` schema
- Preserve backward compatibility with existing prompts
- Migrate legacy data to unified schema when necessary

### Performance and Scalability
- Optimize YAML read/write operations for large files
- Implement intelligent caching for agent configurations
- Minimize I/O operations during batch executions

### Testing and Validation
- Create unit tests for each critical component
- Implement data integrity validation
- Create testing scripts to verify metadata preservation
- Document test cases for manual validation
```

---

## ✅ IMPLEMENTATION STATUS

- [ ] 🔴 Critical Error: YAML State Loss
- [ ] 🟠 Complete Logging and Audit System  
- [ ] 🟡 Fix Claude param_continue Logic for Per-Unit Executions
- [ ] 🟡 Claude JSON Streaming Implementation
- [ ] 🟢 Markdown Prompt Loading System
- [ ] 🔵 User Experience Improvements
- [ ] 📋 Technical Considerations Implemented

---

**Creation date:** September 10, 2025  
**Project:** learn-cloud  
**Branch:** feature/promt
