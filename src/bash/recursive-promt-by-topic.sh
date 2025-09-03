#!/bin/bash

MODEL="gemini-2.5-flash"
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
read -r -d '' CONTENT_PROMPT << EOM
Let's begin with **Unit {unit}, Topic {unit_topic}**.

Following our guidelines in \`GEMINI.md\`, please generate the content for this topic. Remember to:
-  **Act as an expert educator** for an experienced programmer who is new to the cloud-native stack.
-  Start with **foundational principles** before moving to advanced concepts.
-  Extend topic concepts if needed.
-  Provide **production-ready code examples** that are secure, well-documented, and follow current best practices. Use recent but stable technology versions.
-  For any required external software, provide the \`docker run\` command for easy setup.
-  Introduce and recommend relevant **tooling** as specified in \`CONTENT.md\`, explaining *why* they are used.
-  Cite official documentation or authoritative sources where appropriate.
-  Where applicable, download, edit and insert web images. 
-  Where applicable, create diagrams using **Mermaid.js syntax** to visually explain complex ideas (e.g., architecture, sequences, or data flows).
   **Crucial:** For all Mermaid diagrams, all text descriptions for both **nodes** and **connectors/links** must always be enclosed in double quotes. For example: \`A["Node description"]\`, \`B("Node description")\`, \`C{"Node description"}\` and \`A --|"Link description"|--> B\`. 
   This is a mandatory rule to prevent rendering errors. If you need to include special characters (e.g., parentheses) in node descriptions, ensure the entire description is enclosed in double quotes. Fix any existing diagrams that do not follow this rule.
   Vertically direction diagrams (TD) is better than horizontally direction (LR) ones.
-  Ensure all code blocks are properly formatted with the correct language for syntax highlighting.
-  Ensure all links are valid and point to the most relevant and up-to-date resources.
-  Ensure all examples and explanations are **accurate and technically correct**.
-  Ensure all content is **comprehensive yet concise**, avoiding unnecessary verbosity.
-  Ensure all content is **up-to-date** with the latest industry trends and technologies.
-  Ensure the content is **engaging and easy to understand**.
-  Ensure the content is **formatted in valid HTML** for direct inclusion in our SPA.
EOM

read -r -d '' AIDS_PROMPT << EOM
Excellent. Based on a previous topic, please generate the following pedagogical materials as per our workflow for **Topic {unit_topic}**:

-  **A "Key Takeaways" section**: A concise, bulleted list summarizing the 3-5 most important points from the topic.
-  **Five (5) flashcards** covering the most critical concepts.
EOM

read -r -d '' QUIZ_PROMPT << EOM
Perfect. Now, to conclude **Topic {unit_topic}**, please create a **quiz with five (5) multiple-choice questions** to help review the material.
EOM
# --- End of Prompt Templates ---

find src/book/unit* \( -path src/book/unit1 -o -path "src/book/unit2/2-[1-4]*" \) -prune -o -type f -name "*.html" -printf "%p\n" \
    | sort -V | while IFS= read -r filename; do
        echo "---"
        echo "Processing file: $filename"

        # Extract unit and topic from the filename (e.g., src/book/unit1/1-4_... -> 1-4)
        base_name=$(basename "$filename" .html)
        unit_topic=$(echo "$base_name" | cut -d'_' -f1)
        unit=$(echo "$unit_topic" | cut -d'-' -f1)

        # Determine the file type and select the appropriate prompt
        PROMPT_TEMPLATE=""
        if [[ "$filename" == *"_study_aids.html"* ]]; then
            PROMPT_TEMPLATE="$AIDS_PROMPT"
        elif [[ "$filename" == *"_quiz.html"* ]]; then
            PROMPT_TEMPLATE="$QUIZ_PROMPT"
        else
            PROMPT_TEMPLATE="$CONTENT_PROMPT"
        fi

        # Substitute the placeholders in the selected prompt template
        PROMPT="${PROMPT_TEMPLATE//\{unit\}/$unit}"
        PROMPT="${PROMPT//\{unit_topic\}/$unit_topic}"
        
        # To simulate "deep thinking" or "deep search", we provide more context
        # and are more explicit in our instructions.
        GUIDELINES=$(cat GEMINI.md)
        DEEP_THINKING_INSTRUCTION="Think step-by-step. Before answering, review the provided guidelines and the file content carefully to generate the best possible response."

        FIRST_PART_INSTRUCTION="This call is to generate or update only one file at a time. The file to be updated is specified at the end of this prompt. Only update the specified file. Do not create or update any other files."
        # Add the final instruction about which file to update
        FINAL_INSTRUCTION="For this execution, the only file that should be updated is: \`$filename\`"

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
        cat "$filename" | gemini -a -p "$FINAL_PROMPT" -y


        echo "----------------------------------------"
        echo
        
        wait_time 3
    done
