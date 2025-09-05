#!/bin/bash

# ==============================================================================
# Script to run an AI agent on the units of a project,
# counting down from unit 6 to 1.
# ==============================================================================

# --- Color Definitions ---
BLUE_BOLD='\033[1;34m'
GREEN_BOLD='\033[1;32m'
RED_BOLD='\033[1;31m'
NC='\033[0m' # No Color

# --- Base Prompt Template ---
# A 'here document' is used to store the multiline prompt cleanly.
# The quotes in 'EOF' prevent shell variable expansion within the block.
read -r -d '' BASE_PROMPT << 'EOF'

Act as an expert front-end developer, specializing in pure HTML, modern CSS (Grid, Flexbox), and JavaScript (ES6), without frameworks. Your mission is to elevate the quality and functionality of an educational book web application.

You will meticulously review and solve several critical UI/UX and functionality problems in this application, focusing on **Unit X (src/book/unitX)**. You have the flexibility to adjust related styles and JavaScript files in the `src/book/` directory as needed. Your work will be crucial for ensuring a seamless and intuitive learning experience for the users.

Below are the detailed problems and the precise requirements to solve them:

### 1. Fixed and Dynamic Content Header

**Problem:** The current content header (`.content-header`) lacks visual consistency and disappears on scroll. Specifically, on content pages, the `h1.topic-title` and `p.topic-intro` elements display side-by-side. This layout is incorrect; the introduction should always be placed directly below the title. Furthermore, when a user scrolls, the header vanishes, causing a loss of context.

**Required Solution:**
-   Modify the CSS for the `.content-header` element in `./src/book/style.css`.
-   Use **Flexbox or Grid** to fix the layout issue, ensuring the `<p class="topic-intro">` is always positioned directly below the `<h1 class="topic-title">`.
-   Implement a "sticky header" using `position: sticky` and `top: 0`.
-   Use JavaScript to detect scroll position. Once the full `.content-header` element is out of view, a smaller, persistent element showing only the topic title should become visible and remain at the top of the viewport. This provides a continuous visual reference for the user.

### 2. Standardization of Flashcard Structure and Layout

**Problem:** The flashcards in the study aids lack consistency. Some display correctly in a responsive grid, while others take up the full horizontal space, leading to a fragmented user experience. Additionally, there are duplicate modal elements that can cause rendering conflicts.

**Required Solution:**
-   Meticulously review all study aid files within the `src/book/unitX/*_study_aids.html` directory.
-   Ensure that the HTML structure of **every single flashcard** is encapsulated within a `<div class="flashcards-container">`, which is itself correctly nested inside a `<div class="study-aids-content">`. This structural hierarchy is essential for consistent styling and the intended CSS Grid layout.
-   Systematically remove any duplicate `<dialog id="flashcard-modal">` elements from these files. The central, single-point-of-truth `dialog` already exists in `index.html`.

### 3. Consistency of Quiz Functionality and Buttons

**Problem:** Quizzes suffer from two key issues: structural inconsistency and visual obstruction. Some quizzes fail to display one question at a time as intended. Their navigation buttons are frequently obscured by the main floating navigation bar, making it difficult for the user to proceed.

**Required Solution:**
-   **Functionality:** Review the JavaScript in `app.js` and the HTML in `src/book/unitX/*_quiz.html`. Implement or correct the logic to ensure that only one question is visible at a time. Upon page load, the quiz should display the first question from a **randomized order** of all questions. The next question should only be revealed after the user interacts with the "Next" button.
-   **Buttons:** Standardize the HTML structure for the navigation container (`.quiz-navigation`) and its buttons (`#prev-question`, `#next-question`, `#submit-quiz`) across all quiz files. The "Previous" button must be on the left, the "Next" button on the right, and the "Submit" button should dynamically replace "Next" on the final question.
-   **Layering:** In `./src/book/style.css`, assign an adequate `z-index` to the `.quiz-navigation` class (e.g., using `--z-page-navigation`) to ensure it always appears on top of the `.floating-nav` bar.

### 4. Consistency of Titles and Content Structure

**Problem:** The lack of a uniform structure for titles and concepts creates visual and semantic inconsistency. The content within a single page is not always segmented into logical blocks, making it difficult for users to quickly scan and understand the content layout.

**Required Solution:**
-   Conduct a thorough review of all content pages within `src/book/unitX/`.
-   **Titles and Headings:** Ensure that all main titles (`h1.topic-title`) and any subsequent headings within a page follow a consistent hierarchical format (e.g., `<h2>`, `<h3>`).
-   **Content Segmentation:** Verify that all concepts or ideas are logically grouped and properly segmented using `<section>` tags. This approach ensures a standardized, modular structure that enhances readability, improves accessibility for screen readers, and simplifies future styling.

---

**Final Instructions:**

While the primary focus is on **Unit X**, you are encouraged to review other units (`src/book/unit*`) to identify patterns and establish best practices for a consistent user experience across the entire application. If you discover a new, improved pattern or rule for the application's functionality or design, you are authorized to update the `CLAUDE.md` file to formalize this change for future development.

Upon completion of each task, you must validate the integrity of the modified HTML, CSS, JavaScript, and Mermaid diagrams to ensure no regressions have been introduced.
EOF

function wait_time(){
	secs=$1
	while [ $secs -gt 0 ]; do
	   echo -ne "    WAITING $secs\033[0K\r"
	   sleep 1
	   : $((secs--))
	done
}

function wait_until(){
    target_time="$1"
    # Convierte la hora objetivo a segundos desde la época
    target_seconds=$(date -d "$target_time" +%s)
    while true; do
        current_seconds=$(date +%s)
        if [ "$current_seconds" -ge "$target_seconds" ]; then
            break
        fi
        current_time=$(date +%H:%M:%S)
        echo -ne "Current time: ${RED_BOLD}$current_time${NC}. Waiting until ${BLUE_BOLD}$target_time${NC} 🕛...\033[0K\r"
        sleep 1
    done
    echo -e "\n    Reached target time: $target_time. Continuing...\n"
}

echo;
wait_time 2; echo; echo;
wait_until "14:00:00"; echo; echo;

CLAUDE_SESSION_ID="0f42e351-d594-4454-9344-7ddf02b60944"
echo -e "${BLUE_BOLD}Starting script to process Units 1 to 9 with Claude agent...${NC}"
# --- Count loop from 1 to 9 ---
for i in {1..9}
do
  echo -e "${BLUE_BOLD}=================================================${NC}"
  echo -e "${BLUE_BOLD}  Running agent for Unit $i...                 ${NC}"
  echo -e "${BLUE_BOLD}=================================================${NC}"

  # Replace the 'X' placeholder with the current unit number.
  # Multiple 'sed' commands are used to replace all variants.
  PROMPT_FOR_UNIT=$(echo "$BASE_PROMPT" | sed "s/Unit X/Unit $i/g" | sed "s/unitX/unit$i/g" | sed "s/X-/$i-/g")

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
  echo -e "${BLUE_BOLD}  Starting Claude agent execution for Unit $i at ${START_TIME}...${NC}"
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
    echo -e "${RED_BOLD} ❌ FATAL ERROR: 5-hour limit reached.${NC}"
    echo -e "${RED_BOLD}    Script stopped while processing Unit $i.${NC}"
    echo -e "\n\n\n"
    exit 1
  fi

  echo -e "${GREEN_BOLD}=================================================${NC}"
  echo -e "${GREEN_BOLD} ✅ Unit $i processed.                             ${NC}"
  echo -e "${GREEN_BOLD}=================================================${NC}"
  echo ""; echo ""
done

echo "Script finished."
echo "";
