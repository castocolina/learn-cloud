#!/bin/bash

MODEL="gemini-2.5-pro"

function wait_time(){
	secs=$1
	while [ $secs -gt 0 ]; do
	   echo -ne "    WAIT $secs\033[0K\r"
	   sleep 1
	   : $((secs--))
	done
}

wait_time 2

# --- Prompt Templates ---
# Using HEREDOCs for clean multiline strings
read -r -d '' UNIT_PROCESSING_PROMPT << EOM
You are tasked with processing all relevant HTML content files within the **Unit {unit}** directory.
Your goal is to ensure that all topic content files (e.g., 'X-Y_topic_name.html') are complete, accurate, and adhere to the guidelines in 'GEMINI.md'.
For each topic file, ensure:
-  It acts as an expert educator for an experienced programmer new to cloud-native.
-  It starts with foundational principles.
-  It provides production-ready code examples, \`docker run\` commands for external software, and recommends relevant tooling.
-  It cites official documentation.
-  It includes Mermaid.js diagrams where applicable, following the crucial rules for nodes and links (all text in double quotes).
-  All code blocks are properly formatted.
-  All links are valid.
-  Content is accurate, comprehensive, concise, up-to-date, engaging, and formatted in valid HTML.

Additionally, ensure that for this unit, the study aids ('X-Y_study_aids.html'), quizzes ('X-Y_quiz.html'), and the final unit exam ('X-X_unit_X_final_exam.html') are also generated or updated as per the guidelines in 'GEMINI.md'.
EOM
# --- End of Prompt Templates ---

find content/unit[6-9]* -maxdepth 0 -type d -printf "%p\n" \
    | sort -V | while IFS= read -r unit_dir; do
        echo "---"
        echo "Processing unit directory: $unit_dir"

        # Extract unit number (e.g., 1 from content/unit1)
        unit=$(basename "$unit_dir" | sed 's/unit//')

        PROMPT_TEMPLATE="$UNIT_PROCESSING_PROMPT"

        # Substitute the placeholders in the selected prompt template
        PROMPT="${PROMPT_TEMPLATE//\{unit\}/$unit}"
        
        # To simulate "deep thinking" or "deep search", we provide more context
        # and are more explicit in our instructions.
        GUIDELINES=$(cat GEMINI.md)
        DEEP_THINKING_INSTRUCTION="Think step-by-step. Before answering, review the provided guidelines and the file content carefully to generate the best possible response."

        FIRST_PART_INSTRUCTION="This call is to process and update multiple files within a directory. The target directory is specified at the end of this prompt. Do not create or update any files outside this directory."
        # Add the final instruction about which directory to process
        FINAL_INSTRUCTION="For this execution, the only directory that should be processed and updated is: 
$unit_dir"

        # Combine all parts into the final prompt
        FINAL_PROMPT="${FIRST_PART_INSTRUCTION}"$'\n\n'"$PROMPT"$'\n\n'"$DEEP_THINKING_INSTRUCTION"$'\n\n'"$FINAL_INSTRUCTION"

        echo "Using model: $MODEL"
        echo "Final prompt:"
        echo "----------------------------------------"
        echo -e "$FINAL_PROMPT"
        echo "----------------------------------------"
        echo "Calling gemini command..."

        wait_time 5
        # Send the file CONTENT to the gemini command's standard input with the enriched prompt
        gemini -a -p "$FINAL_PROMPT" -y


        echo "----------------------------------------"
        echo 
        
        wait_time 3
    done