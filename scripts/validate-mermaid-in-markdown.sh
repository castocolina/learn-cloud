#!/usr/bin/env bash

# validate-mermaid-in-markdown.sh
# Validates Mermaid diagrams in markdown files using mmdc (mermaid-cli)
#
# Usage: ./validate-mermaid-in-markdown.sh <markdown-file>
#
# Dependencies: @mermaid-js/mermaid-cli (npx @mermaid-js/mermaid-cli)

set -euo pipefail

# Color output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Globals
declare -i diagram_count=0
declare -i error_count=0
declare -a errors=()

usage() {
    echo "Usage: $0 <markdown-file>"
    echo ""
    echo "Validates all Mermaid diagrams in a markdown file using mmdc."
    echo ""
    echo "Examples:"
    echo "  $0 docs/README.md"
    echo "  $0 docs/agents/README.md"
    exit 1
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

extract_mermaid_blocks() {
    local md_file="$1"
    local temp_dir="$2"
    local in_mermaid=false
    local block_num=0
    local current_file=""

    while IFS= read -r line; do
        if [[ "$line" =~ ^\`\`\`mermaid ]]; then
            in_mermaid=true
            ((block_num++))
            current_file="${temp_dir}/diagram_${block_num}.mmd"
            : > "$current_file"  # Create empty file
        elif [[ "$line" =~ ^\`\`\`$ ]] && [[ "$in_mermaid" == true ]]; then
            in_mermaid=false
            current_file=""
        elif [[ "$in_mermaid" == true ]]; then
            echo "$line" >> "$current_file"
        fi
    done < "$md_file"

    echo "$block_num"
}

validate_diagram() {
    local diagram_file="$1"
    local diagram_num="$2"
    local error_msg

    # Use mmdc to validate (output to /dev/null, we only care about exit code)
    if error_msg=$(npx -y @mermaid-js/mermaid-cli@latest mmdc -i "$diagram_file" -o /dev/null 2>&1); then
        log_info "Diagram $diagram_num: ✓ Valid"
        return 0
    else
        log_error "Diagram $diagram_num: ✗ Invalid"
        errors+=("Diagram $diagram_num: $error_msg")
        ((error_count++))
        return 1
    fi
}

main() {
    # Validate arguments
    if [[ $# -ne 1 ]]; then
        usage
    fi

    local md_file="$1"

    # Check file exists
    if [[ ! -f "$md_file" ]]; then
        log_error "File not found: $md_file"
        exit 1
    fi

    # Check file is markdown
    if [[ ! "$md_file" =~ \.md$ ]]; then
        log_error "File must be a markdown file (.md): $md_file"
        exit 1
    fi

    log_info "Validating Mermaid diagrams in: $md_file"
    echo ""

    # Create temporary directory for extracted diagrams
    local temp_dir
    temp_dir=$(mktemp -d)
    trap 'rm -rf "$temp_dir"' EXIT

    # Extract Mermaid blocks
    diagram_count=$(extract_mermaid_blocks "$md_file" "$temp_dir")

    if [[ $diagram_count -eq 0 ]]; then
        log_warn "No Mermaid diagrams found in $md_file"
        exit 0
    fi

    log_info "Found $diagram_count Mermaid diagram(s)"
    echo ""

    # Validate each diagram
    for ((i=1; i<=diagram_count; i++)); do
        local diagram_file="${temp_dir}/diagram_${i}.mmd"
        if [[ -f "$diagram_file" ]]; then
            validate_diagram "$diagram_file" "$i"
        fi
    done

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Summary
    if [[ $error_count -eq 0 ]]; then
        echo -e "${GREEN}✓ All $diagram_count diagram(s) are valid${NC}"
        exit 0
    else
        echo -e "${RED}✗ $error_count of $diagram_count diagram(s) failed validation${NC}"
        echo ""
        echo "Errors:"
        for error in "${errors[@]}"; do
            echo "  - $error"
        done
        exit 1
    fi
}

main "$@"
