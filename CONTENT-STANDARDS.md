# Content Creation Standards & Quality Assurance

This document contains the content creation workflows and quality assurance standards for the Cloud-Native Book project.

> **📚 Related Documentation:**
> - [CLAUDE.md](CLAUDE.md) - Core project rules and agent implementation guidelines  
> - [TECHNICAL-SPECS.md](TECHNICAL-SPECS.md) - Technical architecture and user experience standards
> - [VALIDATION-GUIDE.md](VALIDATION-GUIDE.md) - Comprehensive validation guide for all project assets (HTML, CSS, JS, Mermaid, Bash)

---

## CONTENT CREATION WORKFLOW

### Mandatory Workflow

The book is structured into `Units` and `Topics` with a hierarchical navigation system. Follow this process strictly:

**Book Structure:**
1. **Book Overview** (index -1): Main book introduction and unit overview
2. **Unit Overview** (index X00): Each unit starts with dedicated overview page
3. **Topic Content** (index X01, X02, etc.): Main didactic material
4. **Study Aids** (index X01+1): Interactive flashcards
5. **Quiz** (index X01+2): Assessment with multiple choice questions

**After completing each Topic:**
1. **Topic Content:** Generate the main didactic material
2. **Study Aids:** Create at least 5 flashcards as `x-x_study_aids.html`
3. **Quiz:** Create a quiz with at least 5 questions as `x-x_quiz.html`

**After completing all Topics in a Unit:**
1. **Unit Test:** Create comprehensive test with at least 20 questions as `x-x_unit_test.html`

### Content Generation Standards
- Always use the TodoWrite tool to track tasks when working on content generation
- When creating diagrams, verify Mermaid syntax follows the double-quote rule
- When editing existing files, preserve the established structure and styling
- Use the Read tool to understand existing content before making changes
- Follow the hierarchical workflow: Unit Overview → Topic → Study Aids → Quiz
- Ensure all generated content is pedagogically sound and builds upon previous concepts
- Use modern CSS classes and semantic HTML5 structure

### Study Aids Structure

```html
<div class="study-aids-content">
    <header class="study-aids-header">
        <h2>Study Aids: [Topic Name]</h2>
        <p class="study-aids-intro">Review key concepts with these interactive flashcards. Click each card to reveal the answer.</p>
    </header>
    
    <div class="flashcards-container">
        <div class="flashcard">
            <div class="flashcard-inner" onclick="this.parentElement.classList.toggle('flipped')">
                <div class="flashcard-front">
                    <h4>Question</h4>
                    <p>Question text goes here</p>
                </div>
                <div class="flashcard-back">
                    <h4>Answer</h4>
                    <p>Answer content goes here</p>
                </div>
            </div>
            <button class="flashcard-expand-btn" onclick="event.stopPropagation(); openFlashcardModal(this)" title="Expand flashcard">
                <i class="bi bi-arrows-angle-expand"></i>
            </button>
        </div>
    </div>

    <!-- Flashcard Modal -->
    <dialog id="flashcard-modal" class="flashcard-modal">
        <div class="modal-content">
            <header class="modal-header">
                <h3 id="modal-question">Question</h3>
                <button class="modal-close-btn" onclick="closeFlashcardModal()">
                    <i class="bi bi-x-lg"></i>
                </button>
            </header>
            <div class="modal-body">
                <div class="modal-answer">
                    <h4>Answer</h4>
                    <div id="modal-answer-content">Answer content will appear here</div>
                </div>
            </div>
        </div>
    </dialog>
</div>

<script>
function openFlashcardModal(button) {
    const flashcard = button.parentElement;
    const question = flashcard.querySelector('.flashcard-front p').textContent;
    const answer = flashcard.querySelector('.flashcard-back p').innerHTML;
    
    document.getElementById('modal-question').textContent = question;
    document.getElementById('modal-answer-content').innerHTML = answer;
    document.getElementById('flashcard-modal').showModal();
}

function closeFlashcardModal() {
    document.getElementById('flashcard-modal').close();
}

// Close modal when clicking outside
document.getElementById('flashcard-modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeFlashcardModal();
    }
});
</script>
```

**Flashcard Requirements:**
- **Standardization:** Each topic must have exactly 5 flashcards
- **Modern Structure:** Use `study-aids-content` wrapper with descriptive header
- **No Bootstrap:** Remove all Bootstrap dependencies (btn-, modal, card classes)
- **Interactive Features:** Flashcards flip on click and have expand buttons for modal view
- **3D Flip Animation:** Use CSS transforms for smooth card flipping experience
- **Modal Integration:** Each flashcard has expand button using HTML5 `<dialog>` element
- **Touch-Friendly:** Proper sizing and hover states for all device types
- **No External Libraries:** Use native HTML5 dialog and CSS animations (no external modal library needed)
- Place Mermaid diagrams directly in main content (`.html` files), not in study aids

### Mermaid Diagram Standards

**Interactive Diagram Requirements:**

All Mermaid diagrams are automatically interactive and expandable:

- **Click to Expand:** Every diagram can be clicked/touched to open in full-screen modal
- **Mobile Optimized:** Diagrams automatically scale down on mobile devices (≤768px)
- **Hover Effects:** Subtle hover animations indicate interactivity
- **Universal Experience:** Same behavior across all devices (desktop/tablet/mobile)
- **Simple Implementation:** Just use standard `<pre class="mermaid">` - no additional wrappers needed
- **Responsive Design:** Prefer vertical (TD) layouts over horizontal (LR) for mobile compatibility

**Standard Format with Nested Script Tags:**
```html
<div class="text-center my-4">
    <pre class="mermaid">
     <script type="text/plain">
        graph TD
            A["Node Text"] --> B["Another Node"];
     </script>
    </pre>
    <small class="text-muted">Diagram: Description of the diagram</small>
</div>
```

**CRITICAL: HTML Entity Encoding for Mermaid Scripts**
- **Nested Script Structure:** All Mermaid diagrams MUST use nested `<script type="text/plain">` tags within `<pre class="mermaid">` blocks
- **Character Encoding Rules:**
  - **WITH script tags:** Characters like `>`, `&`, `"` are valid inside `<script type="text/plain">` → entities cause Mermaid parsing errors
  - **WITHOUT script tags:** Characters like `>`, `&`, `"` are invalid HTML → HTML validator requires entities (`&quot;`, `&gt;`, `&lt;`, `&#x27;`, `&amp;`)
- **Preferred Approach:** Use `<script type="text/plain">` tags with raw characters (no entities) for:
  - **Better readability:** Raw syntax is easier to read and maintain
  - **Mermaid compatibility:** Avoids parsing errors caused by HTML entities
  - **HTML validation:** Script content is treated as plain text, so special characters are valid
- **Migration Workflow:**
  - **Legacy diagrams:** Some existing diagrams may have HTML entities within script tags
  - **Restoration tool:** Use `make restore-mermaid-entities [path]` to convert entities back to raw characters
  - **Validation:** Always run `make validate-mermaid [file.html]` to verify diagrams render correctly after changes

### Interactive Quiz & Assessment System

**Interactive Assessment Requirements:**

Both quizzes and exams must provide an individual question display with navigation controls, automatic scoring, and restart functionality.

#### Quiz Structure (5 questions, 80% pass threshold)

```html
<div class="quiz-content">
    <header class="quiz-header">
        <h2>Quiz: [Topic Name]</h2>
        <p class="quiz-intro">[Descriptive introduction explaining what will be tested]</p>
    </header>
    <div class="quiz-container">
        <div class="quiz-card active-card" data-question="1">
            <div class="question">
                <p>1. [Question text]</p>
                <ul class="options">
                    <li><label><input type="radio" name="q1" value="a"> a) Option A</label></li>
                    <li><label><input type="radio" name="q1" value="b"> b) Option B</label></li>
                    <li><label><input type="radio" name="q1" value="c"> c) Option C</label></li>
                    <li><label><input type="radio" name="q1" value="d"> d) Option D</label></li>
                </ul>
                <div class="answer" data-correct="a"></div>
            </div>
        </div>
        <!-- Repeat for 5 questions total -->
        
        <div class="quiz-navigation">
            <button class="btn btn-outline-secondary" id="prev-question">Previous</button>
            <div class="quiz-progress">Question 1 of 5</div>
            <button class="btn btn-outline-primary" id="next-question">Next</button>
            <button class="btn btn-success" id="submit-quiz" style="display: none;">Submit Answers</button>
        </div>
        <div class="quiz-results-container"></div>
    </div>
</div>
```

#### Unit Final Exam Structure (10-20 questions, 70% pass threshold)

```html
<div class="exam-content">
    <header class="exam-header">
        <h1>Unit [X] Final Exam: [Unit Title]</h1>
        <p class="exam-intro">[Comprehensive description of exam coverage]</p>
        <div class="exam-instructions">
            <p><strong>Instructions:</strong> Answer all questions to the best of your ability. You need 70% or higher to pass.</p>
        </div>
    </header>
    <div class="quiz-container">
        <!-- Same structure as quiz but with 10-20 questions -->
        <div class="quiz-card active-card" data-question="1">
            <div class="question">
                <p>1. [Question text]</p>
                <ul class="options">
                    <li><label><input type="radio" name="q1" value="a"> A) Option A</label></li>
                    <li><label><input type="radio" name="q1" value="b"> B) Option B</label></li>
                    <li><label><input type="checkbox" name="q1" value="c"> C) Multiple choice option</label></li>
                    <li><label><input type="checkbox" name="q1" value="d"> D) Multiple choice option</label></li>
                </ul>
                <div class="answer" data-correct="b"></div> <!-- Single: "b", Multiple: "c,d" -->
            </div>
        </div>
        
        <div class="quiz-navigation">
            <button class="btn btn-outline-secondary" id="prev-question">Previous</button>
            <div class="quiz-progress">Question 1 of 20</div>
            <button class="btn btn-outline-primary" id="next-question">Next</button>
            <button class="btn btn-success" id="submit-quiz" style="display: none;">Submit Answers</button>
        </div>
        <div class="quiz-results-container"></div>
    </div>
</div>
```

**Assessment Standards:**
- **Quizzes:** 5 questions, 80% required to pass
- **Unit Final Exams:** 10-20 questions (varies by unit), 70% required to pass
- **Question Types:** Single-choice (radio) or multiple-choice (checkbox)
- **Multiple-choice answers:** Use comma-separated values in data-correct (e.g., "a,c,d")
- **Navigation:** Individual question display with Previous/Next buttons
- **Results:** Automatic scoring with pass/fail feedback and "Try Again" functionality
- **Visual Feedback:** Selected options highlighted, progress indicator, animated transitions
- **Navigation Priority:** Quiz navigation uses `z-index: var(--z-modals)` with `position: sticky` and `bottom: var(--space-lg)` for optimal visibility above floating navigation
- **JavaScript Integration:** The quiz system is automatically initialized via `initializeQuizzes()` in `initializeContentFeatures()`. No additional JavaScript is needed in individual quiz files.

**Interactive Features:**
- **Single Question Display:** Only one question visible at a time with smooth transitions
- **Navigation Controls:** Previous/Next buttons with smart visibility (Previous hidden on Q1, Submit shown on last question)
- **Progress Tracking:** Real-time progress indicator showing current question number
- **Visual Selection:** Selected options highlighted with border and background changes
- **Results System:** Comprehensive scoring with percentage, pass/fail status, and detailed feedback
- **Try Again:** Full restart functionality that clears all answers and returns to question 1

### Unit Overview Page Requirements

**Interactive Navigation:**
- **Clickable Topic Cards:** Entire topic cards must be clickable to navigate to main content
- **Topic Type Badges:** Make `topic-type` elements clickable to navigate to content  
- **Component Navigation:** Individual components (📖 Main Content, 🎯 Study Aids, ❓ Quiz) must be clickable
- **Visual Feedback:** Proper hover states and cursor pointers for all interactive elements

**Content Accuracy:**
- **Title Consistency:** Topic titles in overviews must match actual file names and content
- **Index Alignment:** Ensure topic indices match hierarchical navigation system
- **Component Mapping:** Verify components map to correct files (study aids, quiz, etc.)

**CSS Requirements for Interactive Elements:**
```css
.topic-type {
    cursor: pointer;
    transition: all 0.2s ease;
}
.topic-type:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-sm);
}
.component {
    cursor: pointer;
    transition: all 0.2s ease;
}
.component:hover {
    background-color: var(--gray-200);
    color: var(--gray-700);
    transform: scale(1.02);
}
```

---

## QUALITY ASSURANCE & VALIDATION

### HTML Quality Standards
- **No Trailing Spaces:** Clean, properly formatted HTML
- **Proper Self-Closing:** Use HTML5 standards for void elements (`<meta />`, `<input />`, `<hr />`, `<br />`)
- **Semantic Structure:** Use appropriate HTML5 semantic elements
- **Modern CSS Classes:** Use custom CSS classes, avoid framework-specific classes
- **Touch Targets:** Ensure all interactive elements meet accessibility guidelines (44px minimum)
- **Tag Structure:** The Agent must always ensure that all HTML tags are properly opened and closed in every file it edits
- **Validation:** After any HTML change, run `make validate-html [file]` to check for tag errors and structural issues
- **No Broken Tags:** Never submit or commit HTML with unclosed, mismatched, or malformed tags. Fix all tag issues before marking a task as complete

### Automated Validation Standards
- **HTML Validation:** All HTML files must pass validation via `make validate-html` command
- **Character Encoding:** Properly encode HTML entities (`&amp;`, `&lt;`, `&gt;`)
- **Button Types:** Add explicit `type="button"` to all buttons without specific types
- **Label Relationships:** Remove redundant `for` attributes when labels wrap inputs
- **Clean Formatting:** No trailing whitespace, proper indentation
- **Inline Styles:** Avoid inline styles, use CSS classes instead

### Validation Tools & Commands

This project uses industry-standard tools for HTML validation and formatting. See [html_validation_guide.md](html_validation_guide.md) for comprehensive tool documentation.

**🎨 Prettier (Code Formatting):**
- Automatically formats HTML, CSS, and JavaScript
- Consistent code style across the entire project
- Configuration in `.prettierrc` with project-specific rules

**🔍 File-Specific Validation Commands:**
Prefer file-specific validation for speed. Use `make validate-[type] [path/file]` for targeted validation.

- `make validate-html [path]` - Validate HTML structure with html-validate
- `make validate-css [path]` - Validate CSS files with stylelint  
- `make validate-js [path]` - Validate JavaScript files with eslint
- `make validate-mermaid [path]` - Validate Mermaid diagram syntax
- `make validate-links [path]` - Validate internal and external links
- `make format-html [path]` - Auto-format HTML files with Prettier
- `make fix-html [path]` - Combined formatting and validation
- `make restore-mermaid-entities [path]` - Restore HTML entities in Mermaid diagrams

**💡 Key Benefits:**
- **Industry Standard:** Uses widely-adopted tools (Prettier, html-validate)
- **Fast Validation:** Quick feedback on HTML structure issues
- **Automatic Formatting:** Consistent code style without manual effort
- **Smart Detection:** Chooses appropriate validation based on file type

### Quality Assurance Workflow
1. **Development:** Write code following HTML5 standards with mobile-first approach
2. **Mobile Testing:** Test all features on mobile devices (≤390px) before desktop
3. **Validation:** Run `make validate-html [file]` after any HTML changes
4. **Edge Testing:** Verify text visibility at screen edges, especially progress bars
5. **Pre-commit:** Automated validation fixes and checks before commit
6. **CI/CD:** Automated validation in deployment pipeline

### Testing Standards & Framework

**Testing Directory Structure:**
All test files must be organized in `src/test/` with the following structure:

```
src/test/
├── unit/                    # Unit tests for individual components
├── integration/             # Integration tests for component interactions
├── e2e/                     # End-to-end tests for complete user flows
├── accessibility/           # Accessibility compliance tests
├── performance/             # Performance and load testing
└── fixtures/                # Test data and mock content
```

**Testing Requirements:**
- **Framework Standards:** Use modern testing frameworks (Jest, Playwright, Cypress) for comprehensive coverage
- **Test Categories:**
  - **Navigation Tests:** Verify hierarchical navigation, progress tracking, and menu functionality
  - **Interactive Component Tests:** Validate quiz systems, flashcards, search functionality, and modal behaviors
  - **Responsive Design Tests:** Ensure proper functionality across mobile (≤390px), tablet (768px), and desktop (1024px+) breakpoints
  - **Content Validation Tests:** Verify Mermaid diagram rendering, code highlighting, and dynamic content loading
  - **Accessibility Tests:** Validate ARIA labels, keyboard navigation, screen reader compatibility, and touch target sizes
  - **Performance Tests:** Measure loading times, search response times, and overall application performance

**Testing Naming Conventions:**
- **Unit Tests:** `[component].test.js` (e.g., `navigation.test.js`, `search.test.js`)
- **Integration Tests:** `[feature].integration.test.js` (e.g., `quiz-navigation.integration.test.js`)
- **E2E Tests:** `[user-flow].e2e.test.js` (e.g., `complete-unit.e2e.test.js`)
- **Test Files:** Use descriptive names that clearly indicate what functionality is being tested

**Automated Testing Pipeline:**
- **Pre-commit:** Run unit tests and basic integration tests before commits
- **CI/CD Integration:** Execute full test suite including E2E tests in deployment pipeline
- **Mobile Testing:** Automated testing on various device sizes and orientations
- **Cross-browser Testing:** Validate functionality across major browsers (Chrome, Firefox, Safari, Edge)

**Test Coverage Requirements:**
- **Minimum Coverage:** 80% code coverage for JavaScript modules
- **Critical Path Coverage:** 100% coverage for navigation, quiz systems, and search functionality
- **Error Handling:** Comprehensive testing of error states and edge cases
- **User Experience:** Validate smooth transitions, loading states, and interactive feedback

### Standard Tools Configuration

**Prettier Configuration (`.prettierrc`):**
```json
{
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 120,
  "htmlWhitespaceSensitivity": "css",
  "endOfLine": "lf",
  "singleAttributePerLine": false
}
```

**Common Validation Examples:**
```bash
# Validate specific files by type
make validate-html src/book/unit1/1-1.html
make validate-css src/book/style.css
make validate-mermaid src/book/unit1/1-1.html

# Fix and restore operations
make fix-html src/book/unit1/1-1.html
make restore-mermaid-entities src/book/unit1/

# Utility commands
make clean-tmp                # Clean temporary files and backups
make help                     # Show all available commands
```

### Mobile-First Testing Standards

**Device Testing Requirements:**
- **Primary Testing:** Always test on mobile devices (≤390px) BEFORE desktop
- **Progress Elements:** Verify progress bar text visibility at all screen edges
- **Typography:** Ensure `clamp()` scaling works properly across breakpoints
- **Touch Targets:** Validate 44px minimum touch target size for all interactive elements
- **Navigation:** Test hamburger menu functionality and sidebar behavior
- **Floating Elements:** Check z-index hierarchy and text visibility in overlays

**File-Type Specific Validation:**

**HTML Files (.html):**
- Use `make validate-html [path]` for structure validation with html-validate
- Use `make fix-html [path]` for combined formatting and validation
- Automatically validates semantic structure, void elements, and ARIA labels
- Validates Mermaid diagrams embedded in HTML if present

**Mermaid Diagrams:**
- Use `make validate-mermaid [path]` for diagram syntax validation
- Use `make restore-mermaid-entities [path]` when HTML entities break validation
- **Critical:** HTML entities (`&quot;`, `&gt;`, etc.) in script tags are valid HTML but break Mermaid parsing

**CSS Files (.css):**
- Use `make validate-css [path]` for style validation with stylelint
- Focus on mobile-first responsive design patterns
- Validate CSS Grid implementations and media queries

**JavaScript Files (.js):**
- Use `make validate-js [path]` for code validation with eslint
- Validates ES6+ module architecture and class-based patterns

### Content Header Standards

All topic content pages must follow a standardized header structure for consistency and optimal user experience:

**Mandatory HTML Structure:**
```html
<div class="topic-content">
    <header class="topic-header" aria-label="Header">
        <h1 class="topic-title">Unit X.Y: Topic Title</h1>
        <p class="topic-intro">Comprehensive introduction explaining the topic scope and learning objectives.</p>
    </header>
    <section class="content-section">
        <!-- Topic content here -->
    </section>
</div>
```

**Critical Layout Requirements:**
- **Flexbox Column Layout:** The `.topic-header` element MUST use `display: flex` with `flex-direction: column` to ensure proper vertical stacking
- **Required Elements:** Every topic page MUST include both `h1.topic-title` and `p.topic-intro` elements within the header
- **Proper Order:** The introduction paragraph must always be positioned directly below the title (never side-by-side)
- **CSS Structure:** Use `order: 1` for title and `order: 2` for intro to guarantee proper positioning
- **Mobile Responsiveness:** Headers must scale properly on mobile devices with appropriate touch targets

**Sticky Mini Header Functionality:**
- The application automatically creates a persistent mini header when users scroll past the main topic header
- This provides continuous context by showing only the topic title in a compact, sticky format
- The mini header uses `z-index: var(--z-page-navigation)` to appear above other content while scrolling
- Responsive design ensures proper positioning on both desktop and mobile devices

**CSS Requirements:**
- Use `.topic-title` for main page titles with responsive font sizing using `clamp()`
- Use `.topic-intro` (not `.lead`) for introductory paragraphs below the title
- Ensure flexbox column layout so introduction always appears directly below the title
- Apply proper semantic heading hierarchy (`h1`, `h2`, `h3`) throughout content
- Main sections should use `h2` headings, subsections use `h3`, and so on

### Mandatory Quality Checks
Before considering any implementation complete, verify:
1. **Mobile Functionality:** All features work properly on mobile devices
2. **Navigation Flow:** Sequential navigation respects hierarchical structure
3. **Progress Accuracy:** Progress bars reflect actual completion state
4. **Search Integration:** Search works across all content types
5. **Performance:** Fast loading and smooth interactions
6. **HTML Validation:** Clean, standards-compliant HTML structure - **ALWAYS run `make validate-html`**
7. **Pre-commit Hooks:** Validation hooks installed and functioning correctly