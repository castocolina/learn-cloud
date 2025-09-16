#!/bin/bash
#
# git-copy-from-branch.sh
#
# An interactive script to find and copy files with a specific extension
# from another Git branch to the current working branch.
#
# Usage:
#   ./src/bash/git-copy-from-branch.sh
#
# The script will prompt you for:
#   1. The source branch (default: feature/spa).
#   2. The search directory (default: .).
#   3. The file extension (required).
#
# It will then list the found files, allow you to select which ones to copy,
# and bring them into your current working directory, creating necessary
# directories along the way.

# --- Colors for better readability ---
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_CYAN='\033[0;36m'
C_BOLD='\033[1m'

# --- Helper functions for printing messages ---
function print_info() {
    echo -e "${C_CYAN}INFO: $1${C_RESET}"
}

function print_success() {
    echo -e "${C_GREEN}SUCCESS: $1${C_RESET}"
}

function print_warning() {
    echo -e "${C_YELLOW}WARNING: $1${C_RESET}"
}

function print_error() {
    echo -e "${C_RED}ERROR: $1${C_RESET}" >&2
}

# --- Main Script ---

# Check if inside a Git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "This script must be run from within a Git repository."
    exit 1
fi

print_info "Fetching recent changes from origin..."
git fetch origin
echo # Blank line for spacing

# 1. Get user input
read -p "$(echo -e ${C_YELLOW}"Enter the source branch [feature/spa]: "${C_RESET})" branch_name
branch_name=${branch_name:-feature/spa}

read -p "$(echo -e ${C_YELLOW}"Enter the search directory [.]: "${C_RESET})" search_dir
search_dir=${search_dir:-.}

extension=""
while [ -z "$extension" ]; do
    read -p "$(echo -e ${C_YELLOW}${C_BOLD}"Enter the file extension (e.g., js, css): "${C_RESET})" extension
    if [ -z "$extension" ]; then
        print_warning "The file extension is required."
    fi
done

# Clean up the extension if the user added a dot
extension=${extension#.}

echo # Blank line
print_info "Searching for *.$extension files in branch '$branch_name' within directory '$search_dir'..."

# Check if the branch exists
if ! git rev-parse --verify "$branch_name" > /dev/null 2>&1; then
    print_error "Branch '$branch_name' does not exist. Please check the name and ensure you have fetched it from the remote."
    exit 1
fi

# 2. Find files
# Use `git ls-tree` to find files, then `grep` to filter by extension.
# Save the results into an array.
mapfile -t found_files < <(git ls-tree -r --name-only "$branch_name" -- "$search_dir" | grep -i "\.$extension$")

if [ ${#found_files[@]} -eq 0 ]; then
    print_warning "No '*.$extension' files found in branch '$branch_name' within '$search_dir'."
    exit 0
fi

echo # Blank line
print_info "Found ${#found_files[@]} files. Please select which ones to copy."

# 3. Display files and allow user selection
for i in "${!found_files[@]}"; do
    file_path="${found_files[$i]}"
    exists_msg=""
    if [ -f "$file_path" ]; then
        exists_msg="${C_RED} (already exists)${C_RESET}"
    fi
    echo -e "  [${C_GREEN}$((i+1))${C_RESET}] $file_path$exists_msg"
done

echo # Blank line
read -p "$(echo -e ${C_YELLOW}"Enter the numbers of the files to copy (space-separated), or 'all' for all: "${C_RESET})" selection

selected_files_to_copy=()
if [[ "$selection" == "all" ]]; then
    selected_files_to_copy=("${found_files[@]}")
else
    # Validate that the input consists of numbers within the range
    for num in $selection; do
        if ! [[ "$num" =~ ^[0-9]+$ ]] || [ "$num" -lt 1 ] || [ "$num" -gt "${#found_files[@]}" ]; then
            print_error "Invalid selection: '$num'. Please enter numbers between 1 and ${#found_files[@]}."
            exit 1
        fi
        selected_files_to_copy+=("${found_files[$((num-1))]}")
    done
fi

if [ ${#selected_files_to_copy[@]} -eq 0 ]; then
    print_warning "No files selected. Exiting."
    exit 0
fi

# 4. Final confirmation
echo # Blank line
print_info "You are about to copy the following files from branch '$branch_name':"
for file in "${selected_files_to_copy[@]}"; do
    echo -e "  - ${C_BLUE}$file${C_RESET}"
done

read -p "$(echo -e ${C_YELLOW}"Are you sure you want to continue? (y/n): "${C_RESET})" confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    print_warning "Operation cancelled by the user."
    exit 0
fi

# 5. Copy the selected files
echo # Blank line
print_info "Starting file copy..."
copied_count=0
for file in "${selected_files_to_copy[@]}"; do
    # Get the directory path
    dir_path=$(dirname "$file")

    # Create the directory if it doesn't exist
    if [ ! -d "$dir_path" ]; then
        print_info "Creating directory: $dir_path"
        mkdir -p "$dir_path"
    fi

    # Use `git show` to get the file content from the other branch and write it locally
    git show "$branch_name:$file" > "$file"
    print_success "Copied: $file"
    ((copied_count++))
done

echo # Blank line
print_success "Operation complete. Copied $copied_count files."

