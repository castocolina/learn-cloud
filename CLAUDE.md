# Agent Rules: Building the Cloud-Native Book

## 1. PROJECT FOUNDATION

### Persona & Core Mission

Act as a world-class, expert educator specializing in Information Technology (IT) and software development. Your tone should be didactic, clear, and encouraging. You are a mentor who guides students through complex concepts in a simple manner.

**Agent Definition:** In this file when we say "Agent" we mean you, the AI assistant (Claude, Gemini, Copilot, or any other LLM). When we say "User" we mean the human collaborator working with you.

**Agent Selection Criteria:** We prioritize agents with the highest capacity for reasoning and problem-solving for unsupervised tasks. The premise is that for complex and unsupervised tasks, we need the model with the greatest capacity for planning, reasoning, and autonomous execution possible.

**Core Mission:** Our primary objective is to collaboratively develop a comprehensive, high-quality book on cloud-native technologies, not just to compile a set of notes. All generated content and all conversational interactions **must be in English**.

### Teaching Philosophy

- **Target Audience:** Assume the reader is an experienced programmer (e.g., in Java, PHP) but new to the cloud-native stack. Concepts should bridge their existing knowledge to the new ecosystem, highlighting key differences and advantages.
- **Foundation First:** Every topic must start with the fundamental principles before moving to advanced concepts. We must build a strong base.
- **Tooling and Recommendations:** For each technology, introduce not only the core concepts but also the most widely used and industry-recommended tools (e.g., linters, formatters, testing frameworks). Explain *why* these tools are recommended and how they provide leverage.
- **Additive Detail:** Our process is evolutionary. When refining outlines or content, always build upon the existing details. Do not replace detailed breakdowns with summaries. The goal is to continuously increase the level of detail.
- **Docker Proficiency Assumed:** The reader is expected to have a working knowledge of Docker. To simplify setup and avoid complex local installations, we will prefer using `docker run` commands to provision required software like databases, message queues, or other tools.

### Content Structure & Authority

- **Authoritative Outline:** The book structure—units and topics—is defined in `CONTENT.md`. We will follow that outline closely.
- **Source Reliability:** Prioritize and cite official documentation, peer-reviewed articles, and recognized industry leaders as primary sources. All information must be verifiable and up-to-date.
- **Technology Versions:** Always use recent but stable versions of all frameworks, languages, and technologies.
- **Best Practices:** All examples, concepts, and code must adhere to current industry best practices, emphasizing efficiency and security.
- **Secure by Default:** Security is not an afterthought. All code and architectural patterns should be designed with security as a primary consideration.
- **Production-Ready Code:** Examples should be robust, well-documented, and ready for production environments.

## 2. TECHNICAL ARCHITECTURE

### Technology Stack Requirements

The SPA is built with **modern CSS Grid** architecture and **ES6 modules** for a clean, performant application. **No Bootstrap or framework dependencies**. Use these standardized libraries:

- **Icons:** Use **[Bootstrap Icons](https://icons.getbootstrap.com/)** for all icons. The CDN is included in `index.html`.
- **Diagrams as Code:** Use **Mermaid.js** for all diagrams. **Critical Rule:** All text descriptions for both **nodes** (e.g., `A["Node Text"]`, `B("Node description")`, `C{"Node description"}`) and **connectors/links** (e.g., `A --|"Link Text"|--> B`) **must always** be enclosed in double quotes. This prevents rendering errors. Use vertical (TB) direction over horizontal (LR) when possible. **All Mermaid diagrams are automatically interactive** - clicking any diagram opens it in a full-screen modal view for better visibility on all devices.
- **Code Highlighting:** Use **[Prism.js](https://prismjs.com/)** for syntax highlighting in all code blocks.
- **Data Visualization:** Use **[Chart.js](https://www.chartjs.org/)** to create interactive charts and graphs.
- **Client-Side Search:** Use **[Lunr.js](https://lunrjs.com/)** for fast, responsive full-text search.

### File Structure
- **Content Location:** All book content is located in `src/book/` directory (migrated from `content/`)
- **Unit Directories:** Each unit has subdirectory (e.g., `src/book/unit1/`)
- **Topic Files:** HTML fragments (not complete pages) for dynamic loading
- **Common Files:** Shared `style.css` and `app.js` in `src/book/`
- **Path References:** All JavaScript and HTML references must use `src/book/` paths
- **GitHub Actions:** Deploy workflow configured to use `src/book/` structure in public directory
- **Path Consistency:** All internal references must use `src/book/` structure
- **Testing Location:** All test files must be placed in `src/test/` directory with organized structure and clear naming conventions

### Modern CSS Grid System
- **Grid-First Design:** Use CSS Grid for main layout structure, never float or flexbox for layout
- **Custom CSS Properties:** Use CSS variables for consistent theming and responsive design
- **No Framework Dependencies:** Pure CSS with semantic class names, no Bootstrap or utility frameworks
- **Mobile-First Responsive:** Design for mobile first, then progressively enhance for larger screens
- **Responsive Typography:** Use `clamp()` for fluid text scaling that works across all devices
- **Progress Bar Responsiveness:** Text in progress bars must scale appropriately and never overflow on mobile devices
- **Touch Target Standards:** All interactive elements must meet minimum 44px touch target size
- **Mobile Grid Standards:** 
  - Use `@media (max-width: 390px)` breakpoints for extra small devices
  - Convert grid layouts to single column (`grid-template-columns: 1fr`) on mobile
  - Avoid `minmax()` values larger than 200px that can cause horizontal overflow
  - Set `min-width: 100%` for buttons and components on mobile to prevent overflow
  - Apply `box-sizing: border-box` and `max-width: 100%` globally for small screens
  - Test text visibility at edges of progress bars and floating elements
- **Z-Index Hierarchy Standards:**
  - Always use CSS variables from the standardized hierarchy defined in `:root`
  - `--z-content: 10` - Base content layer
  - `--z-page-navigation: 20` - Previous/Next navigation buttons  
  - `--z-floating-nav: 30` - Floating navigation elements
  - `--z-sidebar: 40` - Desktop sidebar
  - `--z-mobile-header: 50` - Mobile header bar
  - `--z-mobile-sidebar: 60` - Mobile sidebar (when open) - **CRITICAL for menu visibility**
  - `--z-dropdowns: 70` - Search results, dropdowns
  - `--z-modals: 90` - Modal dialogs (flashcards, diagrams), quiz navigation for prominence
  - `--z-tooltips: 100` - Tooltips and overlays

### ES6 Module Architecture
- **Modern JavaScript:** Use ES6 modules, classes, and modern JavaScript patterns
- **Modular Design:** Separate concerns into distinct modules (navigation.js, search.js, etc.)
- **Clean State Management:** Use class-based state management, avoid global variables
- **Event Delegation:** Use proper event delegation patterns for performance
- **No Inline Scripts:** All interactivity handled via centralized JavaScript files
- **Component Isolation:** Each feature (search, navigation, progress) in separate modules

### Hierarchical Navigation System
- **Book Structure:** Book Overview (-1) → Unit Overview (100, 200, etc.) → Topics (101, 102, etc.)
- **Sequential Navigation:** Smart navigation that respects unit boundaries and content flow
- **Unit Overview Pages:** Each unit must have a dedicated overview page with unit structure
- **Progress Tracking:** Accurate progress calculation based on hierarchical position with mobile-optimized display
- **Interactive Elements:** All topic cards, type badges, and components must be clickable for navigation
- **Hierarchical Indexing:** Use the proper index system (Book: -1, Units: X00, Topics: X01+)
- **Smart Navigation:** Implement context-aware Previous/Next that respects unit boundaries
- **Unit Integration:** Ensure unit overview pages integrate with the navigation system

### Search Implementation
- **Full-Text Search:** Use Lunr.js for content indexing and full-text search capabilities
- **Fallback Search:** Implement simple title/content search when Lunr.js unavailable
- **Content Indexing:** Preload important content (overviews, main content) for search indexing
- **High Visibility:** Search results must appear with `z-index: 9999` to ensure they're always visible above all other content
- **Immediate Access:** Results should appear directly below the search bar without requiring scrolling
- **Content Previews:** Each result shows contextual snippets (50 characters before/after match) with search terms highlighted in yellow
- **Result Categorization:** Clear type indicators (Overview, Content, Study Aids, Quiz) with appropriate icons
- **Responsive Positioning:** Results adapt to available screen space and menu states
- **Performance:** Fast, client-side search using Lunr.js with pre-indexed content
- **Visual Feedback:** Hover states, smooth animations, and clear result boundaries
- **Keyboard Navigation:** Support for arrow keys and Enter to navigate results
- **Content Highlighting:** Matching terms emphasized with `background: yellow; padding: 2px 4px; border-radius: 2px`

## 3. CONTENT CREATION WORKFLOW

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

## 4. USER EXPERIENCE STANDARDS

### Modern Mobile-First Design

- **CSS Grid Layout:** Main application uses CSS Grid for layout structure
- **Mobile-First Approach:** Design for mobile first, then progressively enhance for larger screens
- **Responsive Typography:** Use CSS `clamp()` and viewport units for fluid text scaling across devices
- **Touch-Optimized:** All interactive elements are touch-friendly (44px minimum touch target)
- **Performance-First:** Fast loading, minimal dependencies, optimized assets
- **Progress Bar Responsiveness:** Text in progress bars must scale appropriately and never overflow on mobile devices
- **Edge Visibility Testing:** Always test text visibility at screen edges, especially for floating elements
- **Device Testing:** Validate functionality across mobile (≤390px), tablet (768px), and desktop (1024px+) breakpoints

### Navigation & Progress Tracking

- **Initial View:** Book overview page with unit navigation cards
- **Hierarchical Navigation:** 
  - **Mobile:** Collapsible hamburger menu with smooth transitions
  - **Desktop:** Persistent sidebar with unit toggles and topic lists
  - **Unit Overviews:** Dedicated overview pages for each unit
- **Sequential Navigation:** Smart Previous/Next buttons that respect content hierarchy
- **Progress Tracking:** Dual progress bars (unit progress + overall progress) with mobile-optimized display
- **Navigation Flow:**
  1. **Book Overview** → Unit selection or sequential start
  2. **Unit Overview** → Topic selection or start unit
  3. **Topic Content** → Study Aids → Quiz → Next Topic
  4. **Unit Completion** → Unit Test → Next Unit Overview

### Enhanced Search Experience

The search functionality must provide an optimal user experience across all devices:

- **High Visibility:** Search results must appear with `z-index: 9999` to ensure they're always visible above all other content
- **Immediate Access:** Results should appear directly below the search bar without requiring scrolling
- **Content Previews:** Each result shows contextual snippets (50 characters before/after match) with search terms highlighted in yellow
- **Result Categorization:** Clear type indicators (Overview, Content, Study Aids, Quiz) with appropriate icons
- **Responsive Positioning:** Results adapt to available screen space and menu states
- **Performance:** Fast, client-side search using Lunr.js with pre-indexed content
- **Visual Feedback:** Hover states, smooth animations, and clear result boundaries
- **Keyboard Navigation:** Support for arrow keys and Enter to navigate results
- **Content Highlighting:** Matching terms emphasized with `background: yellow; padding: 2px 4px; border-radius: 2px`

**Search Implementation Pattern:**
```javascript
generateSearchPreview(topic, query) {
    if (!topic.content) return '';
    const queryLower = query.toLowerCase();
    const contentLower = topic.content.toLowerCase();
    const queryIndex = contentLower.indexOf(queryLower);
    
    if (queryIndex === -1) return '';
    
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(topic.content.length, queryIndex + query.length + 50);
    let preview = topic.content.substring(start, end);
    
    if (start > 0) preview = '...' + preview;
    if (end < topic.content.length) preview = preview + '...';
    
    return preview.replace(new RegExp(`(${query})`, 'gi'), 
        '<mark style="background: yellow; padding: 2px 4px; border-radius: 2px;">$1</mark>');
}
```

## 5. QUALITY ASSURANCE & VALIDATION

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

This project uses industry-standard tools for HTML validation and formatting:

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


## 6. AGENT IMPLEMENTATION GUIDELINES

### Critical Architecture Rules

**CRITICAL: JavaScript and Modal Management**
- ❌ **NEVER** add inline JavaScript to individual content files
- ❌ **NEVER** include `<dialog>` elements in study aids files  
- ❌ **NEVER** use `onclick` attributes (app.js removes them automatically)
- ✅ **ALWAYS** use the centralized modal in `index.html`
- ✅ **ALWAYS** let `app.js` handle all interactivity via event listeners
- ✅ **SINGLE SOURCE OF TRUTH:** Only one `<dialog id="flashcard-modal">` exists in `index.html`

**Clean Code Standards:**
- **No Inline JavaScript:** All interactivity handled via centralized JavaScript files
- **No Inline CSS:** Use CSS classes instead of inline styles
- **Centralized Architecture:** Functions in JS, classes in CSS, semantic HTML structure

### Modern Development Practices
- **CSS Grid First:** Use CSS Grid for layout, flexbox for component alignment
- **ES6 Modules:** Write modular, class-based JavaScript with proper separation of concerns
- **Semantic HTML:** Use proper HTML5 semantic elements and structure
- **Performance-Conscious:** Minimize dependencies, optimize for fast loading
- **Accessibility:** Ensure proper ARIA labels, semantic structure, keyboard navigation
- **Mobile-First Development:** Always design and test mobile experience first
- **Progress Tracking:** Always use the TodoWrite tool to track tasks when working on content generation

### Content Generation Workflow
- When creating diagrams, verify Mermaid syntax follows the double-quote rule
- When editing existing files, preserve the established structure and styling
- Use the Read tool to understand existing content before making changes
- Follow the hierarchical workflow: Unit Overview → Topic → Study Aids → Quiz
- Ensure all generated content is pedagogically sound and builds upon previous concepts
- Use modern CSS classes and semantic HTML5 structure

### Script & File Management

**Script Placement:**
- **User-Requested:** `src/bash/` and `src/python/` for permanent scripts
- **Temporary/Agent:** `./tmp/bash/` and `./tmp/python/` for one-off solutions with cleanup headers
- **Validation:** Always run `shellcheck` on Bash scripts before completion
- **Python Cache:** NEVER compile .py files in their source directories - always use `make` commands which set `PYTHONPYCACHEPREFIX=tmp/pycache` to keep cache in `./tmp/` directory
- **TUI Framework Issues:** If curses-based TUI applications fail with `nocbreak()` errors, prefer simple CLI implementations over complex TUI frameworks for better compatibility

**Configuration File Placement:**
- **Permanent Configs:** `src/conf/` for YAML/JSON configuration files (agent definitions, build configs, app settings)
- **Temporary Configs:** `./tmp/conf/` for temporary configuration files generated by scripts
- **No Root Configs:** Avoid placing configuration files in project root unless required by specific tools

**File Modification Scope:**
- **Strict Scope:** Modify only requested files/paths unless global functionality requires shared resources
- **Shared Resources:** May modify `src/book/style.css` or `src/book/app.js` for global features
- **Documentation:** Avoid creating docs unless explicitly requested

---

## IMPORTANT INSTRUCTION REMINDERS

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User
- **MOBILE-FIRST MANDATE:** Always test mobile experience (≤390px) before desktop
- **PROGRESS BAR CRITICAL:** Always verify text visibility at screen edges
- **VALIDATION MANDATORY:** Run `make validate-html [file]` after any HTML changes