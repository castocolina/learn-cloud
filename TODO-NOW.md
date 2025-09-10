# TODO-NOW: Priority-Organized Tasks

This file contains all tasks organized by priority and scope, ready for one-by-one implementation.

---

## 🔴 HIGH PRIORITY - CRITICAL ERROR FIXES

## Multi-Model Agent Configuration System
**Scope:** Enhanced agent configuration with multiple model fallback chains
**Affected files:** `src/conf/agents.yaml`, `src/python/prompt_utils/agent_handler.py`, `src/python/prompt_manager.py`, `src/python/prompt_utils/config_manager.py`

**Problem and Motivation:**
- Current single model + fallback approach insufficient for Gemini reliability issues
- Need multiple model chains per agent type with cross-agent fallback capability
- prompt-manager needs enhanced fallback options (Gemini Pro → Flash → [Claude Sonnet - Claude Haiku])
- prompt-executor should remain simple with single agent usage for now

**Proposed Configuration Structure:**
```yaml
agents:
  - id: "SS01"
    name: "Solution Strategist"
    description: "You are a high-level project manager and solution architect..."
    llm_agents:
      - agent_name: "gemini"
        model: "gemini-2.5-pro"
        timeout: 180
        fallback_model: "gemini-2.5-flash"
        framework: "ReAct (Reason + Act)"
        param_yolo_mode: "--yolo"
        edition_available: false
        param_continue: null
        param_json_output: null
        param_json_stream_output: null
      - agent_name: "claude"
        model: "sonnet"
        fallback_model: "haiku"
        framework: "ReAct (Reason + Act)"
        param_yolo_mode: "--dangerously-skip-permissions"
        edition_available: false
        param_continue: "--continue"
        param_json_output: "--output-format json"
        param_json_stream_output: "--output-format stream-json --verbose --include-partial-messages"
  
  - id: "EE02"
    name: "Expert Educator"
    description: "You are a specialist in creating high-quality educational content..."
    llm_agents:
      - agent_name: "claude"
        model: "sonnet"
        fallback_model: "haiku"
        framework: "CoT (Chain of Thought)"
        param_yolo_mode: "--dangerously-skip-permissions"
        edition_available: true
        param_continue: "--continue"
        param_json_output: "--output-format json"
        param_json_stream_output: "--output-format stream-json --verbose --include-partial-messages"
  
  # ... Continue for all remaining agents (..., TB07)
  # Each maintaining their current LLM configuration as first element in llm_agents list
```

**Configuration Migration Strategy:**
- **Preserve all current values**: Each agent's existing LLM configuration becomes the first element in `llm_agents` list
- **SS01 gets two models**: Gemini (primary) + Claude (cross-agent fallback) as you specified
- **All other agents maintain single model**: Only first LLM agent in their list (current behavior)
- **Backward compatibility**: Config parser should handle both old and new formats during transition
- **Default behavior**: Always use `llm_agents[0]` unless explicitly requesting fallback chain

**Specific Implementation Tasks:**

### Configuration Management Updates
1. **Update `config_manager.py`** to parse new multi-model structure
   - Support both legacy format (direct agent properties) and new format (`llm_agents` list)
   - Default to `llm_agents[0]` for primary model selection
   - Add helper methods to get primary/secondary LLM configurations
2. **Migrate existing `agents.yaml`** to new structure
   - SS01: Add Claude as second LLM agent (Gemini → Claude fallback chain)
   - EE02-TB07: Convert current properties to single-element `llm_agents` list
   - Preserve all existing parameter values exactly
3. **Add validation** for multi-model configurations
   - Ensure each agent has at least one LLM configuration
   - Validate LLM agent properties are complete
   - Check cross-agent fallback configurations are valid

### Agent Handler Enhancements
1. **Modify `agent_handler.py`** to support LLM agent list access
   - Update methods to receive `llm_agent_config` instead of full agent config
   - Add logic to select primary vs secondary LLM agent from list
   - Maintain existing command building logic for each LLM agent type
2. **Implement cross-agent fallback** capability
   - Handle switching from Gemini to Claude when SS01 primary+fallback fail
   - Preserve agent-specific parameter handling (param_continue, param_yolo_mode, etc.)
   - Ensure proper command construction for different agent types in chain
3. **Add `use_fallback_chain` parameter** for prompt-manager enhanced mode
   - Default behavior: Use only `llm_agents[0]` (current functionality)
   - Enhanced mode: Try `llm_agents[1]` if primary LLM and its fallback both fail
4. **Preserve existing single-LLM behavior** for prompt-executor compatibility

### Prompt Manager Integration
1. **Add command-line flag** `--use-fallback-chain` or similar for enhanced fallback
2. **Implement model switching logic** when primary + fallback fail
3. **Show user which model/agent combination is being attempted**
4. **Log complete fallback chain attempts** for debugging

### Execution Flow
- **Primary execution**: Use models[0] with its fallback_model
- **Secondary execution**: Use models[1] (could be different agent) with its fallback
- **Cross-agent handling**: Automatically switch agent type when model list contains different agent_name
- **Backward compatibility**: Single model configs work as before

### Error Handling and Logging
- **Track which model in chain failed** and why
- **Log complete fallback attempts** with timing and error details
- **Provide clear user feedback** about which agent/model combination succeeded
- **Save fallback usage statistics** for analysis

### Prompt Executor Compatibility
- **No changes to prompt-executor behavior** initially
- **Continue using single agent selection** as current implementation
- **Future enhancement**: Could add multi-model support later if needed

**Files to modify:**
- `src/conf/agents.yaml` (new configuration structure)
- `src/python/prompt_utils/config_manager.py` (multi-model parsing)
- `src/python/prompt_utils/agent_handler.py` (model chain execution)
- `src/python/prompt_manager.py` (enhanced fallback options)

**Validation criteria:**
- Gemini primary fails → Gemini fallback tried → [Claude Sonnet tried - Claude Haiku tried]
- Each step logged with clear model identification
- Backward compatibility with existing single-model configurations
- prompt-executor continues working without changes


---

## Prompt State Management and Visibility Refinement

**Scope:** Enhanced state management system with proper enums and visibility controls
**Affected files:** `src/python/prompt_utils/unified_schema.py`, `src/python/prompt_manager.py`, `src/python/prompt_executor.py`, `src/python/prompt_utils/config_manager.py`

**Problem and Current Limitations:**
- Inconsistent state management between edit and execution phases
- Limited visibility controls prevent proper workflow management
- No standardized state enums leading to inconsistent status values
- Filtering and permission logic doesn't properly reflect workflow requirements

**Proposed State System Enhancement:**

### Edit Status Enum (metadata.edit.status)
```python
class EditStatus(Enum):
    DRAFT = "draft"              # Initial creation, work in progress
    INCOMPLETE = "incomplete"    # Missing required elements, needs work
    NEEDS_WORK = "needs_work"   # Ready but requires refinement/review
    COMPLETE = "complete"       # Ready for execution
```

### Execution Status Enum (metadata.execution.status)
```python
class ExecutionStatus(Enum):
    PENDING = "pending"         # Queued for execution
    RUNNING = "running"         # Currently being executed
    DONE = "done"              # Successfully completed
    FAILED = "failed"          # Execution failed
    SKIPPED = "skipped"        # Skipped by user choice
    CANCELLED = "cancelled"    # Cancelled during execution
```

**Workflow and Visibility Rules:**

### Prompt Manager Behavior
- **View all prompts**: Regardless of edit or execution status
- **Edit permissions**: 
  - ✅ Allow editing: `draft`, `incomplete`, `needs_work`, `complete`
  - ❌ Block editing: `pending` (queued for execution), `running` (currently executing)
- **Display status indicators**: Clear visual indication of both edit and execution status
- **Filter options**: By edit status, execution status, or combined conditions

### Prompt Executor Behavior  
- **View all prompts**: Regardless of edit or execution status for transparency
- **Execution filtering**: 
  - ✅ Available for execution: Only prompts with `edit.status = "complete"`
  - ✅ Re-execution options: `failed` and `done` prompts can be executed again
  - ❌ Skip execution: `draft`, `incomplete`, `needs_work` (edit status)
  - ❌ Skip execution: `pending`, `running` (execution status)
- **Status updates**: Proper state transitions during execution lifecycle

**Specific Implementation Tasks:**

### Schema and Model Updates
1. **Update `unified_schema.py`** with enum definitions
   - Add `EditStatus` and `ExecutionStatus` enums
   - Update `PromptConfig` class to use enums with proper validation
   - Add state transition validation methods
   - Ensure backward compatibility with existing string values

### Configuration Management  
2. **Enhance `config_manager.py`** for state handling
   - Add methods for state queries and filtering
   - Implement state transition validation
   - Add bulk state update operations
   - Create state history tracking for audit purposes

### Prompt Manager Integration
3. **Update `prompt_manager.py`** with refined visibility and permissions
   - Implement edit permission checking based on execution status
   - Add state-based filtering and display options
   - Show clear status indicators for both edit and execution states
   - Prevent editing of prompts in `pending` or `running` states

### Prompt Executor Integration  
4. **Update `prompt_executor.py`** with execution eligibility logic
   - Filter execution candidates by `edit.status = "complete"`
   - Allow re-execution of `failed` and `done` prompts
   - Implement proper status transitions during execution
   - Add clear messaging about why prompts are excluded from execution

### State Transition Logic
5. **Implement proper state management**
   - Edit workflow: `draft` → `incomplete` → `needs_work` → `complete`
   - Execution workflow: `complete` → `pending` → `running` → (`done`|`failed`)
   - Re-execution: `done`|`failed` → `pending` → `running` → (`done`|`failed`)
   - Validation: Prevent invalid transitions and provide clear error messages

**Files to modify:**
- `src/python/prompt_utils/unified_schema.py` (enum definitions and validation)
- `src/python/prompt_utils/config_manager.py` (state management methods)
- `src/python/prompt_manager.py` (visibility and edit permissions)
- `src/python/prompt_executor.py` (execution eligibility and state updates)

**Validation criteria:**
- All prompts visible in both manager and executor regardless of status
- Edit permissions properly enforced based on execution state
- Only `complete` prompts available for execution
- `failed` and `done` prompts can be re-executed
- State transitions follow defined workflow rules
- Clear visual indicators for all state combinations
```

---

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

- [ ] 🔴 Multi-Model Agent Configuration System
- [ ] 🔴 Prompt State Management and Visibility Refinement
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
