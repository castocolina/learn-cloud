#!/usr/bin/env python3
"""
This script finds all `<code>...</code>` blocks in HTML files and
HTML-encodes special characters (`&`, `<`, `>`) within them,
avoiding double-encoding.
"""
import sys
import re
import html
from pathlib import Path

# Global variable for verbosity, set in main()
VERBOSE = True

def fix_entities_in_content(content: str) -> tuple[str, bool]:
    """
    Finds all `<code>...</code>` blocks and HTML-encodes special characters
    within them. Handles multi-line code blocks and avoids double-encoding.

    Args:
        content: The HTML content as a string.

    Returns:
        A tuple containing the modified HTML content and a boolean indicating
        if any changes were made.
    """
    # This regex captures the opening tag (with any attributes), the content,
    # and the closing tag separately. It handles multi-line content.
    # <code[^>]*>  - Matches '<code' followed by any character except '>' (for attributes)
    # (.*?)        - Non-greedily captures the content inside the code block
    # </code>       - Matches the closing tag
    regex = re.compile(r"(<code[^>]*>)(.*?)(</code>)", re.DOTALL)

    last_end = 0
    new_parts = []
    changes_made = False

    for i, match in enumerate(regex.finditer(content)):
        opening_tag, code_content, closing_tag = match.groups()
        print(f"Processing code block {i + 1}")

        # Add the part of the string before the current match
        new_parts.append(content[last_end:match.start()])

        # To prevent double-encoding, we first unescape any existing entities
        # and then escape the entire content. This normalizes the code block.
        # Note: html.escape handles &, <, >. quote=True also handles " and '.
        unescaped_content = html.unescape(code_content)
        escaped_content = html.escape(unescaped_content, quote=True)

        if escaped_content != code_content:
            changes_made = True
            if VERBOSE:
                # Show only the actual differences
                original_lines = code_content.splitlines()
                escaped_lines = escaped_content.splitlines()
                
                print(f"📝 Code block {i + 1} changes:")
                for j, (orig, escaped) in enumerate(zip(original_lines, escaped_lines)):
                    if orig != escaped:
                        print(f"  Line {j + 1}:")
                        print(f"    - {orig}")
                        print(f"    + {escaped}")
                
                # Handle case where line count differs
                if len(original_lines) != len(escaped_lines):
                    if len(original_lines) > len(escaped_lines):
                        for j in range(len(escaped_lines), len(original_lines)):
                            print(f"  Line {j + 1}:")
                            print(f"    - {original_lines[j]}")
                    else:
                        for j in range(len(original_lines), len(escaped_lines)):
                            print(f"  Line {j + 1}:")
                            print(f"    + {escaped_lines[j]}")
                print()
                
            new_parts.append(opening_tag)
            new_parts.append(escaped_content)
            new_parts.append(closing_tag)
        else:
            # No changes, append the original full match
            new_parts.append(match.group(0))

        last_end = match.end()

    # Add the rest of the string after the last match
    new_parts.append(content[last_end:])

    if not changes_made:
        return content, False

    return "".join(new_parts), True


def main():
    """Main function to process files passed as command-line arguments."""
    global VERBOSE

    # Manual argument parsing for simplicity
    args = sys.argv[1:]
    if "-v" in args or "--verbose" in args:
        VERBOSE = True
        files_to_process = [arg for arg in args if arg not in ("-v", "--verbose")]
    else:
        files_to_process = args

    if not files_to_process:
        print(
            "Usage: python3 fix_code_entities.py [-v|--verbose] <file1.html> [file2.html] ...",
            file=sys.stderr,
        )
        sys.exit(1)

    for file_arg in files_to_process:
        file_path = Path(file_arg)
        if file_path.is_file():
            try:
                original_content = file_path.read_text(encoding="utf-8")
                new_content, has_changed = fix_entities_in_content(original_content)
                if has_changed:
                    print(f"🔧 Fixing entities in <code> blocks for: {file_path}")
                    file_path.write_text(new_content, encoding="utf-8")
            except Exception as e:
                print(f"❌ Error processing file {file_path}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
