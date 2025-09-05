#!/bin/bash

# ==============================================================================
# Script to run an AI agent on the units of a project,
# counting down from unit 6 to 1.
# ==============================================================================

# --- Color Definitions ---
BLUE_BOLD='\033[1;34m'
GREEN_BOLD='\033[1;32m'
RED_BOLD='\033[1;31m'
YELLOW_BOLD='\033[1;33m'
NC='\033[0m' # No Color

# --- Global variable for Claude session ID ---
CLAUDE_SESSION_ID=""

# --- Prompt template file path ---
PROMPT_TEMPLATE_FILE="src/bash/claude-prompt-template.txt"

function wait_time(){
	secs=$1
	while [ $secs -gt 0 ]; do
	   echo -ne "    WAITING $secs\033[0K\r"
	   sleep 1
	   : $((secs--))
	done
}

# --- Function to convert 12-hour am/pm format to 24-hour HH:MM:SS ---
function convert_to_24h_format() {
    local time_str=$1 # e.g., "1am", "5pm"
    
    # Extract hour and meridiem (am/pm)
    local hour=$(echo "$time_str" | grep -o '^[0-9]*')
    local meridiem=$(echo "$time_str" | grep -o '[ap]m$')

    if [[ "$meridiem" == "am" ]]; then
        if [[ "$hour" -eq 12 ]]; then # Midnight case (12am -> 00:00)
            hour=0
        fi
    elif [[ "$meridiem" == "pm" ]]; then
        if [[ "$hour" -ne 12 ]]; then # Afternoon case (1pm -> 13:00)
            hour=$((hour + 12))
        fi
    fi
    
    # Return formatted string
    printf "%02d:00:00" "$hour"
}

function wait_until(){
    local target_time="$1"
    local allow_next_day="${2:-false}"  # Default to false if not provided
    
    # Calculate target seconds for today
    local target_seconds=$(date -d "$target_time" +%s)
    
    # If allow_next_day is true and target time has already passed today,
    # assume it's for tomorrow
    if [ "$allow_next_day" = "true" ]; then
        local current_seconds=$(date +%s)
        if [ "$target_seconds" -le "$current_seconds" ]; then
            # Target time has passed today, assume it's tomorrow
            target_seconds=$(date -d "tomorrow $target_time" +%s)
            local target_date=$(date -d "tomorrow" +%Y-%m-%d)
            echo -e "  ${YELLOW_BOLD}Target time $target_time has passed today. Assuming tomorrow ($target_date).${NC}"
        fi
    fi
    
    while true; do
        local current_seconds=$(date +%s)
        if [ "$current_seconds" -ge "$target_seconds" ]; then
            break
        fi
        local current_time_display=$(date +%H:%M:%S)
        if [ "$allow_next_day" = "true" ]; then
            local target_display=$(date -d "@$target_seconds" +"%Y-%m-%d %H:%M:%S")
            echo -ne " 🕛 Current time: ${RED_BOLD}$current_time_display${NC}. Waiting until ${BLUE_BOLD}$target_display${NC} ...\033[0K\r"
        else
            echo -ne " 🕛 Current time: ${RED_BOLD}$current_time_display${NC}. Waiting until ${BLUE_BOLD}$target_time${NC} ...\033[0K\r"
        fi
        sleep 1
    done
    
    if [ "$allow_next_day" = "true" ]; then
        echo -e "\n    Reached target time: $(date -d "@$target_seconds" +"%Y-%m-%d %H:%M:%S"). Continuing...\n"
    else
        echo -e "\n    Reached target time: $target_time. Continuing...\n"
    fi
}

# --- Function to manage Claude session ID ---
function manage_session_id() {
    local SESSION_FILE="tmp/.agent-session.txt"
    local EXISTING_ID=""
    local choice=""

    # Helper function to prompt for manual ID input
    function prompt_for_manual_id() {
        while true; do
            echo -n "Please enter the session ID (UUID format): "
            read -r manual_id
            if [[ "$manual_id" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
                CLAUDE_SESSION_ID=$manual_id
                break
            else
                echo -e "${RED_BOLD}Invalid UUID format. Please try again.${NC}"
            fi
        done
    }

    mkdir -p tmp
    if [ -f "$SESSION_FILE" ]; then
        EXISTING_ID=$(cat "$SESSION_FILE")
    fi

    echo -e "${BLUE_BOLD}Claude Session ID Management${NC}"
    echo "--------------------------------"
    [ -n "$EXISTING_ID" ] && echo -e "  1. Use existing ID: ${GREEN_BOLD}$EXISTING_ID${NC}"
    echo "  2. Enter a session ID manually"
    echo "--------------------------------"

    for (( i=20; i>0; i-- )); do
        echo -ne "Select an option (default is 1 after $i seconds): \033[0K\r"
        read -t 1 -n 1 choice
        [ -n "$choice" ] && break
    done
    echo

    choice=${choice:-1}

    case $choice in
        1)
            if [ -n "$EXISTING_ID" ]; then
                echo "Using existing session ID."
                CLAUDE_SESSION_ID=$EXISTING_ID
            else
                echo "No existing ID found. Please enter a session ID manually."
                prompt_for_manual_id
            fi
            ;;
        2)
            prompt_for_manual_id
            ;;
        *)
            if [ -n "$EXISTING_ID" ]; then
                echo -e "${YELLOW_BOLD}Invalid option. Using existing session ID.${NC}"
                CLAUDE_SESSION_ID=$EXISTING_ID
            else
                echo -e "${YELLOW_BOLD}Invalid option and no existing ID. Please enter manually.${NC}"
                prompt_for_manual_id
            fi
            ;;
    esac

    echo "$CLAUDE_SESSION_ID" > "$SESSION_FILE"
}

echo;
wait_time 2; echo; echo;

manage_session_id
echo -e "${GREEN_BOLD}Session ID set to: $CLAUDE_SESSION_ID${NC}"
echo;

wait_until "$(convert_to_24h_format "9am")"; echo; echo;

# --- Define unit range variables ---
from=1
to=9

echo -e "${BLUE_BOLD}Starting script to process Units $from to $to with Claude agent...${NC}"
# --- Count loop from $from to $to ---
for ((i=from; i<=to; i++))
do
  echo -e "${BLUE_BOLD}=================================================${NC}"
  echo -e "${BLUE_BOLD}  Running agent for Unit $i...                 ${NC}"
  echo -e "${BLUE_BOLD}=================================================${NC}"

  # Check if prompt template file exists
  if [ ! -f "$PROMPT_TEMPLATE_FILE" ]; then
    echo -e "${RED_BOLD}ERROR: Prompt template file not found: $PROMPT_TEMPLATE_FILE${NC}"
    exit 1
  fi

  # Read the prompt template from file and replace the 'X' placeholder with the current unit number
  PROMPT_FOR_UNIT=$(cat "$PROMPT_TEMPLATE_FILE" | sed "s/Unit X/Unit $i/g" | sed "s/unitX/unit$i/g" | sed "s/X-/$i-/g")

  # --- Command to run the agent ---
  # **IMPORTANT**: Replace 'claude-agent-cli' with the actual command you use.
  # The '--prompt' flag is an assumption. Adapt the flags according to your tool.
  # The '--no-confirm' flag or similar is to avoid manual confirmation.
  #
  # For demonstration purposes, this script will only print the prompt.
  # Uncomment the actual command line and comment out the 'echo' line to use it.

  echo "--- Prompt for Unit $i ---"
  echo "$PROMPT_FOR_UNIT"
  echo "-----------------------------"
  wait_time 5
  # --- Actual command line: Capture output to variable ---
  # We are no longer streaming the output progressively. Instead, we capture it all
  # to a temporary file and then load it into a variable. This is more robust and
  # allows us to restore the simpler '-p' flag for the prompt.

  echo ""
  START_TIME=$(date +%s)
  START_TIME_READABLE=$(date +%H:%M:%S)
  echo -e "${BLUE_BOLD}  Starting Claude agent execution for Unit $i at ${START_TIME_READABLE}...${NC}"
  echo "With session ID: $CLAUDE_SESSION_ID"

  # 1. A temporary file is created to reliably capture all output.
  TMP_OUTPUT_FILE=$(mktemp)

  # 2. Execute the command with the -p flag, redirecting all output (stdout & stderr)
  #    to the temporary file. This avoids shell parsing issues.
  claude --dangerously-skip-permissions -r "${CLAUDE_SESSION_ID}" -p "$PROMPT_FOR_UNIT" > "$TMP_OUTPUT_FILE" 2>&1

  END_TIME=$(date +%s)
  DURATION_S=$((END_TIME - START_TIME))
  MINUTES=$((DURATION_S / 60))
  SECONDS_REMAINING=$((DURATION_S % 60))

  echo -e "${BLUE_BOLD}  Execution finished. Duration: ${MINUTES}m,${SECONDS_REMAINING}s${NC}"

  # 3. Read the captured output from the file into the OUTPUT variable and then print it.
  OUTPUT=$(cat "$TMP_OUTPUT_FILE")
  rm "$TMP_OUTPUT_FILE"
  echo "--- Agent Output for Unit $i ---"
  echo "$OUTPUT"
  echo "--------------------------------"

  # Check for the specific 5-hour limit error message
  if echo "$OUTPUT" | grep -q "5-hour limit reached ∙ resets"; then
    echo -e "\n\n\n"
    echo -e "${RED_BOLD} 🕒 5-hour limit reached while processing Unit $i.${NC}"
    wait_time 5
    
    # Extract the reset time (e.g., "1am", "5pm") from the agent's output.
    # This regex assumes the time is formatted like '1am', '12pm', etc.
    reset_time_ampm=$(echo "$OUTPUT" | grep -o '[0-9]\{1,2\}[ap]m')

    if [ -n "$reset_time_ampm" ]; then
      # Convert the extracted time to 24-hour format for wait_until
      target_time=$(convert_to_24h_format "$reset_time_ampm")
      echo -e "${YELLOW_BOLD} ⚠️  Agent limit hit. Waiting until next reset at $target_time...${NC}"
      wait_until "$target_time" true  # Pass true to allow next day calculation
      
      # Store the current unit to retry
      retry_unit=$i
      echo -e "${GREEN_BOLD} ✅ Resuming script execution for Unit $retry_unit...${NC}"
      
      # Manually decrement the loop counter to compensate for automatic increment
      i=$((i - 1))
      continue
    else
      echo -e "${RED_BOLD} ❌ ERROR: Could not parse reset time from agent output. Exiting.${NC}"
      exit 1
    fi
  fi

  echo -e "${GREEN_BOLD}=================================================${NC}"
  echo -e "${GREEN_BOLD} ✅ Unit $i processed.                             ${NC}"
  echo -e "${GREEN_BOLD}=================================================${NC}"
  echo ""; echo ""
done

echo "Script finished."
echo "";
