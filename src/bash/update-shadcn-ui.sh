#!/bin/bash

set -e

UI_DIR="src/lib/components/ui"


# Color and format variables for easy editing
BG_LIGHT_GRAY="\033[1;47m"
FG_ORANGE="\033[38;5;208m"
FG_BLUE="\033[1;34m"
FG_YELLOW="\033[1;33m"
FG_GREEN="\033[1;32m"
FG_RED="\033[1;31m"
RESET="\033[0m"

# Print step/info/complete messages with label and color
print_step() {
  local label="$1"
  local color="$2"
  local msg="$3"
  echo -e "${color}[${label}]${RESET} $msg"
}

print_step "STEP" "$FG_BLUE" "Scanning for shadcn-svelte components in $UI_DIR..."

if [ ! -d "$UI_DIR" ]; then
  print_step "ERROR" "$FG_RED" "Directory $UI_DIR does not exist."
  exit 1
fi

# List immediate subdirectories (component names)
components=()
while IFS= read -r -d '' dir; do
  comp=$(basename "$dir")
  components+=("$comp")
done < <(find "$UI_DIR" -mindepth 1 -maxdepth 1 -type d -print0)

if [ ${#components[@]} -eq 0 ]; then
  print_step "INFO" "$FG_YELLOW" "No components found in $UI_DIR."
  exit 0
fi


# Sort and print the component list with highlight
IFS=$'\n' sorted_components=($(printf "%s\n" "${components[@]}" | sort))
unset IFS
print_step "COMPONENTS" "$FG_BLUE" ": ${FG_ORANGE}${BG_LIGHT_GRAY}${sorted_components[*]}${RESET}"

print_step "STEP" "$FG_BLUE" "Updating all shadcn-svelte components..."

rm -rf ${UI_DIR}
pnpm dlx shadcn-svelte@latest add "${sorted_components[@]}"
git add ${UI_DIR}

print_step "COMPLETE" "$FG_GREEN" "All shadcn-svelte components updated."