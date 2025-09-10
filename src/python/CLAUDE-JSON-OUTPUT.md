# Claude JSON Output Documentation

This document describes Claude's JSON output formats and how to use different parameters to obtain structured responses.

## JSON Output Parameters

### 1. Standard JSON Output
```bash
claude model sonnet --fallback-model haiku --output-format json -p "Good Morning" | jq .
```

### 2. Streaming JSON Output
```bash
claude model sonnet --fallback-model haiku --output-format stream-json --verbose --include-partial-messages -p "Good morning" | jq .
```

## Standard JSON Output Format

When using `--output-format json`, Claude returns a complete structured response:

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 3959,
  "duration_api_ms": 3836,
  "num_turns": 1,
  "result": "I can see you have a sophisticated cloud-native book project with comprehensive documentation and workflows. I'm ready to help you with any tasks related to your project.\n\nWhat would you like me to work on?",
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "total_cost_usd": 0.0060273,
  "usage": {
    "input_tokens": 4,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 17801,
    "output_tokens": 45,
    "server_tool_use": {
      "web_search_requests": 0
    },
    "service_tier": "standard",
    "cache_creation": {
      "ephemeral_1h_input_tokens": 0,
      "ephemeral_5m_input_tokens": 0
    }
  },
  "permission_denials": [],
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### Main Fields

- **type**: Response type (`result`)
- **subtype**: Result subtype (`success`, `error`)
- **is_error**: Boolean indicating if there was an error
- **duration_ms**: Total duration in milliseconds
- **duration_api_ms**: API call duration in milliseconds
- **num_turns**: Number of turns in the conversation
- **result**: The response content
- **session_id**: Unique session identifier
- **total_cost_usd**: Total cost in USD
- **usage**: Token usage details
- **permission_denials**: List of denied permissions
- **uuid**: Universal unique identifier

## Streaming JSON Output Format

When using `--output-format stream-json --include-partial-messages`, Claude returns multiple JSON objects representing the real-time response flow:

### 1. System Initialization Event
```json
{
  "type": "system",
  "subtype": "init",
  "cwd": "/home/ramon/git/github-cco/learn-cloud",
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tools": [
    "Task", "Bash", "Glob", "Grep", "ExitPlanMode", "Read", "Edit", 
    "MultiEdit", "Write", "NotebookEdit", "WebFetch", "TodoWrite", 
    "WebSearch", "BashOutput", "KillBash"
  ],
  "mcp_servers": [],
  "model": "claude-sonnet-4-20250514",
  "permissionMode": "default",
  "slash_commands": [
    "add-dir", "agents", "clear", "compact", "config", "context",
    "cost", "doctor", "exit", "help", "ide", "init", "install-github-app",
    "mcp", "memory", "migrate-installer", "model", "output-style",
    "output-style:new", "pr-comments", "release-notes", "resume",
    "status", "statusline", "todos", "feedback", "review",
    "security-review", "upgrade", "vim", "permissions",
    "privacy-settings", "hooks", "export", "logout", "login", "bashes"
  ],
  "apiKeySource": "none",
  "output_style": "default",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 2. Message Start
```json
{
  "type": "stream_event",
  "event": {
    "type": "message_start",
    "message": {
      "id": "msg_01HGdonrr9NuFRZdhdQ9nu9T",
      "type": "message",
      "role": "assistant",
      "model": "claude-sonnet-4-20250514",
      "content": [],
      "stop_reason": null,
      "stop_sequence": null,
      "usage": {
        "input_tokens": 4,
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 17801,
        "cache_creation": {
          "ephemeral_5m_input_tokens": 0,
          "ephemeral_1h_input_tokens": 0
        },
        "output_tokens": 2,
        "service_tier": "standard"
      }
    }
  },
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "parent_tool_use_id": null,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 3. Content Block Start
```json
{
  "type": "stream_event",
  "event": {
    "type": "content_block_start",
    "index": 0,
    "content_block": {
      "type": "text",
      "text": ""
    }
  },
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "parent_tool_use_id": null,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 4. Content Delta (Text Fragments)
```json
{
  "type": "stream_event",
  "event": {
    "type": "content_block_delta",
    "index": 0,
    "delta": {
      "type": "text_delta",
      "text": "I see"
    }
  },
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "parent_tool_use_id": null,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 5. Complete Message (At End of Stream)
```json
{
  "type": "assistant",
  "message": {
    "id": "msg_01HGdonrr9NuFRZdhdQ9nu9T",
    "type": "message",
    "role": "assistant",
    "model": "claude-sonnet-4-20250514",
    "content": [
      {
        "type": "text",
        "text": "I see that the current git status shows you're on the `feature/promt` branch with several modified and added files related to prompt execution and agent handling. How can I help you with this project? \n\nAre you looking to:\n- Continue work on the prompt generation system?\n- Test or validate the current changes?\n- Work on the cloud-native book content?\n- Something else specific?"
      }
    ],
    "stop_reason": null,
    "stop_sequence": null,
    "usage": {
      "input_tokens": 4,
      "cache_creation_input_tokens": 0,
      "cache_read_input_tokens": 17801,
      "cache_creation": {
        "ephemeral_5m_input_tokens": 0,
        "ephemeral_1h_input_tokens": 0
      },
      "output_tokens": 2,
      "service_tier": "standard"
    }
  },
  "parent_tool_use_id": null,
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 6. Content Block Stop
```json
{
  "type": "stream_event",
  "event": {
    "type": "content_block_stop",
    "index": 0
  },
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "parent_tool_use_id": null,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 7. Message Delta (Final Information)
```json
{
  "type": "stream_event",
  "event": {
    "type": "message_delta",
    "delta": {
      "stop_reason": "end_turn",
      "stop_sequence": null
    },
    "usage": {
      "input_tokens": 4,
      "cache_creation_input_tokens": 0,
      "cache_read_input_tokens": 17801,
      "output_tokens": 88
    }
  },
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "parent_tool_use_id": null,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 8. Message Stop
```json
{
  "type": "stream_event",
  "event": {
    "type": "message_stop"
  },
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "parent_tool_use_id": null,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 9. Final Result
```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 4781,
  "duration_api_ms": 5752,
  "num_turns": 1,
  "result": "I see that the current git status shows you're on the `feature/promt` branch with several modified and added files related to prompt execution and agent handling. How can I help you with this project? \n\nAre you looking to:\n- Continue work on the prompt generation system?\n- Test or validate the current changes?\n- Work on the cloud-native book content?\n- Something else specific?",
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "total_cost_usd": 0.0068195,
  "usage": {
    "input_tokens": 4,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 17801,
    "output_tokens": 88,
    "server_tool_use": {
      "web_search_requests": 0
    },
    "service_tier": "standard",
    "cache_creation": {
      "ephemeral_1h_input_tokens": 0,
      "ephemeral_5m_input_tokens": 0
    }
  },
  "permission_denials": [],
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

## Important Parameters

### `--output-format json`
- Returns a complete JSON response at the end
- Useful for batch processing
- Lower parsing overhead

### `--output-format stream-json`
- Returns multiple JSON objects in real time
- Allows showing progress in real time
- Useful for interactive interfaces

### `--include-partial-messages`
- Includes partial messages during streaming
- Allows capturing content even if interrupted
- Only works with `stream-json`

### `--verbose`
- Includes additional system information
- Shows available tools and configuration
- Useful for debugging

## Usage in Prompt Management System

This JSON format can be utilized by the prompt management system for:

1. **Cost Monitoring**: Extract `total_cost_usd` and `usage`
2. **Error Detection**: Check `is_error` and `subtype`
3. **Performance Metrics**: Use `duration_ms` and `duration_api_ms`
4. **Session Tracking**: Utilize `session_id` for continuity
5. **Result Processing**: Extract content from `result`
6. **Real-time Streaming**: Process `stream-json` events for interactive UIs

## Use Cases

### For Simple Responses
```bash
claude --output-format json -p "prompt" | jq '.result'
```

### For Cost Monitoring
```bash
claude --output-format json -p "prompt" | jq '.total_cost_usd, .usage'
```

### For Interactive Streaming
```bash
claude --output-format stream-json --include-partial-messages -p "prompt" | \
  jq -r 'select(.type=="stream_event" and .event.type=="content_block_delta") | .event.delta.text'
```
