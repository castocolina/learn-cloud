# Content Standards: SvelteKit Learning Platform

This document contains the content creation workflows and quality assurance standards for the Cloud-Native Learning Platform.

> **📚 Related Documentation:**
> - [AGENTS.md](AGENTS.md) - Core project rules and agent implementation guidelines  
> - [TECHNICAL-SPECS.md](TECHNICAL-SPECS.md) - Technical architecture and user experience standards

---

## CONTENT ARCHITECTURE

### Data Structure in src/data/

All educational content is stored as JSON files in the `src/data/` directory, organized by units:

```
src/data/
├── unit1/
│   ├── overview_python_for_cloud_native_backend_development.json
│   ├── chapter_1_1_development_environment_tooling.json
│   ├── study_guide_1_1.json
│   ├── quiz_1_1.json
│   ├── exam_python_for_cloud_native_backend_development.json
│   └── ...
├── unit2/
├── content-menu.json (navigation structure - source of truth)
└── ...
```

### Content Types and Formats

#### 1. Lessons
**Format**: `chapter_[unit]_[chapter]_[title].json`
```json
{
  "title": "Development Environment & Tooling",
  "summary": "Brief description of the lesson content",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Rich HTML content with proper formatting"
    }
  ]
}
```

#### 2. Study Guides
**Format**: `study_guide_[unit]_[chapter].json`
```json
{
  "title": "Study Guide: Development Environment & Tooling",
  "flashcards": [
    {
      "front": "Question or concept",
      "back": "Answer or explanation"
    }
  ]
}
```
**Requirements**: Minimum 6 flashcards per lesson with expandable modal view for long definitions

### Interactive Components Specifications

#### Mermaid Diagrams
- **GitHub-style Implementation**: Expandable diagrams with expand icon
- **Direction Preference**: LR (Left-Right) for vertical display optimization
- **Fullscreen Modal**: Touch/click to expand to maximize screen real estate
  - **Mobile**: 100vh x 100vw (full viewport coverage)
  - **Desktop**: Large modal with minimal padding (e.g., 95% width/height)
  - **Responsive**: Adapts to available screen space
- **Mobile Optimization**: Responsive scaling for all screen sizes
- **Integration**: Use standard Mermaid.js with custom expand functionality

#### Code Highlighting  
- **Library**: Prism.js for syntax highlighting
- **Language Support**: All major programming languages (Python, Go, JavaScript, etc.)
- **Theme**: Consistent with overall design system
- **Mobile Responsive**: Horizontal scroll for long code lines
- **Modal Support**: Code blocks can expand to fullscreen for better readability

#### Flashcard System
- **Standard View**: Card flip animation on click/touch
- **Expandable Modal**: Fullscreen view for lengthy definitions
  - **Mobile**: Full viewport usage (100vh x 100vw)
  - **Desktop**: Large modal covering most of the screen
  - **Content Scrolling**: Vertical scroll for long content within modal
- **Navigation**: Previous/Next within flashcard set
- **Progress Tracking**: Current card indicator (e.g., "Card 3 of 6")

#### Quiz/Exam Navigation
- **Single Question Display**: Show one question at a time
- **Dedicated Controls**: Separate Previous/Next buttons from page navigation
- **Progress Indicator**: "Question X of Y" display
- **Final Results**: 
  - Score percentage calculation
  - Pass/Fail status (80% threshold)
  - Action buttons: Restart (go to question 1) or Continue (next topic)

#### 3. Quizzes
**Format**: `quiz_[unit]_[chapter].json`
```json
{
  "title": "Quiz: Development Environment & Tooling",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation of the correct answer"
    }
  ]
}
```
**Configuration**: 
- **Display Mode**: Show only one question at a time
- **Navigation**: Dedicated Previous/Next buttons (separate from page navigation)
- **Question Pool**: Display 5 questions, store minimum 8 (1.5x ratio)
- **Scoring**: 80% threshold for Pass/Fail determination
- **Results**: Score percentage, Pass/Fail status, Restart/Continue options

#### 4. Exams
**Format**: `exam_[unit_name].json`
```json
{
  "title": "Unit 1 Final Exam: Python for Cloud-Native Backend Development",
  "questions": [
    {
      "question": "Comprehensive question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation",
      "difficulty": "medium",
      "topic": "Development Environment"
    }
  ]
}
```
**Configuration**:
- **Display Mode**: Show only one question at a time
- **Navigation**: Dedicated Previous/Next buttons (separate from page navigation)  
- **Question Pool**: Display 20 questions, store minimum 30 (1.5x ratio)
- **Progress Display**: "Question X of Y" indicator
- **Scoring**: 80% threshold for Pass/Fail determination
- **Results**: Score percentage, Pass/Fail status, Restart/Continue options

#### 5. Unit Overviews
**Format**: `overview_[unit_name].json`
```json
{
  "title": "Python for Cloud-Native Backend Development",
  "description": "Comprehensive unit description",
  "learning_objectives": [
    "Objective 1",
    "Objective 2"
  ],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "estimated_hours": 40
}
```

### Content Quality Standards

#### Content Guidelines
- **Consistency**: All titles must match exactly with `content-menu.json`
- **Clarity**: Use clear, concise language appropriate for experienced programmers new to cloud-native
- **Structure**: Follow hierarchical information architecture
- **Interactivity**: Include practical examples and hands-on exercises

#### Technical Writing Standards
- **Code Examples**: Use production-ready, secure-by-default code
- **Documentation**: Reference official documentation and authoritative sources
- **Updates**: Use recent but stable versions of all technologies
- **Security**: Emphasize security considerations throughout

### Content Navigation Structure

The `src/data/content-menu.json` file serves as the single source of truth for:
- Unit organization and metadata
- Chapter sequencing and types
- Navigation links (both legacy HTML and new JSON data links)
- Icons and descriptions

**Structure**:
```json
{
  "metadata": {
    "title": "Mastering Cloud-Native Technologies",
    "total_units": 9,
    "total_chapters": 119
  },
  "units": [
    {
      "title": "Unit Title",
      "icon": "IconName",
      "description": "Unit description",
      "overview_data_link": "data/unit1/overview_*.json",
      "exam_data_link": "data/unit1/exam_*.json",
      "chapters": [
        {
          "title": "Chapter Title",
          "icon": "IconName",
          "type": "lesson|study_guide|quiz|exam|project",
          "chapter_data_link": "data/unit1/chapter_*.json"
        }
      ]
    }
  ]
}
```

### Development Workflow

#### Content Creation Process
1. **Plan**: Use `CONTENT.md` as authoritative outline
2. **Structure**: Create JSON files following format specifications
3. **Validate**: Ensure JSON syntax and content structure validity
4. **Test**: Verify content displays correctly in SvelteKit components
5. **Review**: Check for consistency with content standards

#### Content Validation
- **JSON Syntax**: All files must be valid JSON
- **Required Fields**: All mandatory fields must be present
- **Link Integrity**: All referenced links must be functional
- **Content Quality**: Follow technical writing standards

#### Question Pool Management
- **Diversity**: Create varied question types and difficulty levels
- **Randomization**: Ensure sufficient questions for effective randomization
- **Quality**: Questions should test understanding, not memorization
- **Updates**: Regularly review and update question pools

### Legacy Content Migration

#### Current State
- **Legacy Directory**: `src/book/` contains 183+ HTML files
- **Status**: Marked for future removal, available for content reference
- **Migration Strategy**: Extract content to JSON format progressively

#### Migration Guidelines
- **Content Preservation**: Maintain educational value during conversion
- **Format Modernization**: Convert to structured JSON format
- **Enhancement**: Improve interactivity and user experience
- **Validation**: Ensure no content loss during migration

### Technical Implementation

#### Content Loading
- Dynamic imports for JSON content files
- Type-safe interfaces for all content types
- Error handling for missing or malformed content
- Caching strategies for performance

#### Component Integration
- Reusable components for each content type
- Consistent styling using Tailwind CSS
- Responsive design for all screen sizes
- Accessibility compliance

### Quality Assurance

#### Validation Checklist
- [ ] JSON syntax validation
- [ ] Required fields present
- [ ] Content matches `content-menu.json` structure
- [ ] Minimum question/flashcard requirements met
- [ ] Links and references functional
- [ ] Content follows technical writing standards
- [ ] Mobile responsiveness verified
- [ ] Accessibility guidelines followed

#### Testing Requirements
- Unit tests for content loading functions
- Integration tests for content display components
- End-to-end tests for user workflows
- Performance tests for content loading
- Accessibility testing with screen readers
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