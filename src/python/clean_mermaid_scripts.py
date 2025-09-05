#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def clean_mermaid_scripts_in_content(content: str) -> tuple[str, bool]:
    changes_made = False

    # Regex to find <pre class="mermaid"> blocks
    mermaid_block_regex = re.compile(
        r'(<pre\s+class="mermaid"[^>]*>)\s*'
        r'(<script\s+type="text/plain"[^>]*>)'  # Opening script tag
        r'(.*?)'  # Script content (non-greedy)
        r'(</script>)\s*'
        r'(</pre>)',  # Closing pre tag
        re.DOTALL | re.IGNORECASE
    )

    def clean_replacer(match):
        nonlocal changes_made
        pre_opening, script_opening, script_content, script_closing, pre_closing = match.groups()

        # Look for encoded script tags within the script_content
        # &lt;script type=&quot;text/plain&quot;&gt; and &lt;/script&gt;
        cleaned_script_content = re.sub(
            r'\s*&lt;script\s+type=&quot;text/plain&quot;&gt;\s*|\s*&lt;/script&gt;\s*',
            '',  # Replace with empty string, consuming surrounding whitespace
            script_content
        )

        if cleaned_script_content != script_content:
            changes_made = True
            print("🧹 Cleaned encoded script tags within Mermaid block.")
            return (
                f"{pre_opening}"
                f"{script_opening}"
                f"{cleaned_script_content}"
                f"{script_closing}"
                f"{pre_closing}"
            )
        else:
            return match.group(0)

    content = mermaid_block_regex.sub(clean_replacer, content)

    return content, changes_made

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 clean_mermaid_scripts.py <file1.html> [file2.html] ...")
        sys.exit(1)

    files_to_process = sys.argv[1:]

    for file_arg in files_to_process:
        file_path = Path(file_arg)
        if file_path.is_file():
            try:
                original_content = file_path.read_text(encoding="utf-8")
                new_content, has_changed = clean_mermaid_scripts_in_content(original_content)
                if has_changed:
                    print(f"🔧 Applying cleanups to: {file_path}")
                    file_path.write_text(new_content, encoding="utf-8")
                else:
                    print(f"✅ No cleanups needed for: {file_path}")
            except Exception as e:
                print(f"❌ Error processing file {file_path}: {e}", file=sys.stderr)
        else:
            print(f"Skipping non-file argument: {file_arg}", file=sys.stderr)

if __name__ == "__main__":
    main()
