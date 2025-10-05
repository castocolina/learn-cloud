#!/bin/bash
# Claude Code StatusLine Script
# Receives JSON metadata via stdin and displays dynamic status information

# Read JSON input from stdin
input=$(cat)

# Extract dynamic information from JSON
MODEL_ID=$(echo "$input" | jq -r '.model.id // "unknown"')
WORK_DIR=$(echo "$input" | jq -r '.workspace.current_dir // "."')
PROJECT=$(basename "$WORK_DIR")
BRANCH=$(git -C "$WORK_DIR" branch --show-current 2>/dev/null || echo 'no-git')
TIME=$(date +'%H:%M')

# Extract cost information
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
LINES_ADDED=$(echo "$input" | jq -r '.cost.total_lines_added // 0')
LINES_REMOVED=$(echo "$input" | jq -r '.cost.total_lines_removed // 0')

# Format numbers with thousands separators using simple sed approach
format_number() {
    local num=$1
    echo "$num" | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta'
}

LINES_ADDED_FMT=$(format_number "$LINES_ADDED")
LINES_REMOVED_FMT=$(format_number "$LINES_REMOVED")
TOTAL_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
API_MS=$(echo "$input" | jq -r '.cost.total_api_duration_ms // 0')

# Function to format milliseconds intelligently
format_time() {
    local ms=$1
    if [ "$ms" -lt 1000 ]; then
        echo "${ms}ms"
    elif [ "$ms" -lt 60000 ]; then
        local sec=$((ms / 1000))
        echo "${sec}s"
    elif [ "$ms" -lt 3600000 ]; then
        local min=$((ms / 60000))
        local sec=$(((ms % 60000) / 1000))
        echo "${min}m ${sec}s"
    else
        local hour=$((ms / 3600000))
        local min=$(((ms % 3600000) / 60000))
        echo "${hour}h ${min}m"
    fi
}

# Format times intelligently
TOTAL_TIME=$(format_time "$TOTAL_MS")
API_TIME=$(format_time "$API_MS")

# Format cost with proper decimals
COST_FORMATTED=$(printf "%.3f" "$COST")

ADDED_COLOR="\e[1;32m"      # Bold green
REMOVED_COLOR="\e[1;31m"    # Bold red
BG_LIGHTGRAY="\e[47m"       # Light gray background
RESET="\e[0m"

# Compose colored segments
ADDED_SEG="${BG_LIGHTGRAY}${ADDED_COLOR}+$LINES_ADDED_FMT${RESET}"
REMOVED_SEG="${BG_LIGHTGRAY}${REMOVED_COLOR}-$LINES_REMOVED_FMT${RESET}"

# Output format: model-id | project | branch | time 
echo "🤖 $MODEL_ID | 📁 $PROJECT | 🌿 $BRANCH | ⏰ $TIME"
# Second line format: lines | cost | chat duration | api duration
echo -e "📃 ${ADDED_SEG}/${REMOVED_SEG} |🪙 \$$COST_FORMATTED | 💬 ${TOTAL_TIME} | 📡 ${API_TIME}"
