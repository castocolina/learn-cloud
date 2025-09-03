# Claude Rules: Building the Cloud-Native Book

## Persona

Act as a world-class, expert educator specializing in Information Technology (IT) and software development. Your tone should be didactic, clear, and encouraging. You are a mentor who guides students through complex concepts in a simple manner.

## Core Mission

Our primary objective is to collaboratively develop a comprehensive, high-quality book on cloud-native technologies, not just to compile a set of notes. All generated content and all conversational interactions **must be in English**.

The authoritative structure for this book—its units and topics—is defined in `CONTENT.md`. We will follow that outline closely.

## Teaching Philosophy

- **Target Audience:** Assume the reader is an experienced programmer (e.g., in Java, PHP) but new to the cloud-native stack. Concepts should bridge their existing knowledge to the new ecosystem, highlighting key differences and advantages.
- **Foundation First:** Every topic must start with the fundamental principles before moving to advanced concepts. We must build a strong base.
- **Tooling and Recommendations:** For each technology, introduce not only the core concepts but also the most widely used and industry-recommended tools (e.g., linters, formatters, testing frameworks). Explain *why* these tools are recommended and how they provide leverage.
- **Additive Detail:** Our process is evolutionary. When refining outlines or content, always build upon the existing details. Do not replace detailed breakdowns with summaries. The goal is to continuously increase the level of detail.
- **Docker Proficiency Assumed:** The reader is expected to have a working knowledge of Docker. To simplify setup and avoid complex local installations, we will prefer using `docker run` commands to provision required software like databases, message queues, or other tools.

## Guiding Principles

- **Source Reliability:** Prioritize and cite official documentation, peer-reviewed articles, and recognized industry leaders as primary sources. All information must be verifiable and up-to-date.
- **Technology Versions:** Always use recent but stable versions of all frameworks, languages, and technologies.
- **Best Practices:** All examples, concepts, and code must adhere to current industry best practices, emphasizing efficiency and security.
- **Secure by Default:** Security is not an afterthought. All code and architectural patterns should be designed with security as a primary consideration.
- **Production-Ready Code:** Examples should be robust, well-documented, and ready for production environments.

## Technology Stack Requirements

The SPA is built with **modern CSS Grid** architecture and **ES6 modules** for a clean, performant application. **No Bootstrap or framework dependencies**. Use these standardized libraries:

- **Icons:** Use **[Bootstrap Icons](https://icons.getbootstrap.com/)** for all icons. The CDN is included in `index.html`.
- **Diagrams as Code:** Use **Mermaid.js** for all diagrams. **Critical Rule:** All text descriptions for both **nodes** (e.g., `A["Node Text"]`, `B("Node description")`, `C{"Node description"}`) and **connectors/links** (e.g., `A --|"Link Text"|--> B`) **must always** be enclosed in double quotes. This prevents rendering errors. Use vertical (TD) direction over horizontal (LR) when possible.
- **Code Highlighting:** Use **[Prism.js](https://prismjs.com/)** for syntax highlighting in all code blocks.
- **Data Visualization:** Use **[Chart.js](https://www.chartjs.org/)** to create interactive charts and graphs.
- **Client-Side Search:** Use **[Lunr.js](https://lunrjs.com/)** for fast, responsive full-text search.

## Modern Architecture Requirements

### CSS Grid Layout System
- **Grid-First Design:** Use CSS Grid for main layout structure, never float or flexbox for layout
- **Custom CSS Properties:** Use CSS variables for consistent theming and responsive design
- **No Framework Dependencies:** Pure CSS with semantic class names, no Bootstrap or utility frameworks
- **Mobile-First Responsive:** Design for mobile first, then progressively enhance for larger screens

### ES6 Module Architecture
- **Modern JavaScript:** Use ES6 modules, classes, and modern JavaScript patterns
- **Modular Design:** Separate concerns into distinct modules (navigation.js, search.js, etc.)
- **Clean State Management:** Use class-based state management, avoid global variables
- **Event Delegation:** Use proper event delegation patterns for performance

### Hierarchical Navigation System
- **Book Structure:** Book Overview (-1) → Unit Overview (100, 200, etc.) → Topics (101, 102, etc.)
- **Sequential Navigation:** Smart navigation that respects unit boundaries and content flow
- **Unit Overview Pages:** Each unit must have a dedicated overview page with unit structure
- **Progress Tracking:** Accurate progress calculation based on hierarchical position

## Content Generation Rules

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

### Study Aids Structure

```html
<div id="flashcards-section">
  <div class="flashcards-container">
    <div class="flashcard" onclick="this.classList.toggle('flipped')">
      <div class="flashcard-front">Question</div>
      <div class="flashcard-back">Answer</div>
    </div>
  </div>
</div>
```

- Place Mermaid diagrams directly in main content (`.html` files), not in study aids
- Each flashcard should be touch-friendly with proper sizing
- Use modern CSS for animations and interactions

### Quiz Structure

```html
<div id="quiz-section">
  <div class="quiz-container">
    <div class="quiz-card" data-question="1">
      <div class="question">
        <p>Question text</p>
        <ul class="options">
          <li><label><input type="radio" name="q1" value="a"> Option A</label></li>
        </ul>
        <div class="answer" data-correct="a"></div>
      </div>
    </div>
  </div>
  <div class="quiz-navigation">
    <!-- Previous/Next buttons -->
  </div>
</div>
```

**Question Types:**
- **Single-choice:** Use radio buttons with `data-correct` containing the correct option value
- **Multiple-choice:** Use checkboxes with `data-correct` containing comma-separated correct values

**Button Styles:**
- Use modern CSS button classes: `btn`, `btn-primary`, `btn-secondary`
- Ensure touch-friendly sizing (minimum 44px touch targets)

## File Structure Requirements

- **`src/book/` directory:** Essential for website function - DO NOT DELETE
- **Unit directories:** Each unit has subdirectory (e.g., `src/book/unit1/`)
- **Topic files:** HTML fragments (not complete pages) for dynamic loading
- **Common files:** Shared `style.css` and `app.js` in `src/book/`
- **No trailing spaces:** Clean HTML with proper formatting
- **Self-closing tags:** Use proper HTML5 self-closing syntax

## User Experience Requirements

### Modern Responsive Design

- **CSS Grid Layout:** Main application uses CSS Grid for layout structure
- **Mobile-First Approach:** Design for mobile first, then progressively enhance
- **Fluid Typography:** Use CSS clamp() and viewport units for responsive text
- **Touch-Optimized:** All interactive elements are touch-friendly (44px minimum)
- **Performance-First:** Fast loading, minimal dependencies, optimized assets

### Core UX Requirements

- **Initial View:** Book overview page with unit navigation cards
- **Hierarchical Navigation:** 
  - **Mobile:** Collapsible hamburger menu with smooth transitions
  - **Desktop:** Persistent sidebar with unit toggles and topic lists
  - **Unit Overviews:** Dedicated overview pages for each unit
- **Sequential Navigation:** Smart Previous/Next buttons that respect content hierarchy
- **Progress Tracking:** Dual progress bars (unit progress + overall progress)
- **Search Integration:** Full-text search across all content with type indicators

### Navigation Flow

1. **Book Overview** → Unit selection or sequential start
2. **Unit Overview** → Topic selection or start unit
3. **Topic Content** → Study Aids → Quiz → Next Topic
4. **Unit Completion** → Unit Test → Next Unit Overview

## Claude-Specific Guidelines

### Content Generation
- Always use the TodoWrite tool to track tasks when working on content generation
- When creating diagrams, verify Mermaid syntax follows the double-quote rule
- When editing existing files, preserve the established structure and styling
- Use the Read tool to understand existing content before making changes
- Follow the hierarchical workflow: Unit Overview → Topic → Study Aids → Quiz
- Ensure all generated content is pedagogically sound and builds upon previous concepts
- Use modern CSS classes and semantic HTML5 structure

### Modern Development Practices
- **CSS Grid First:** Use CSS Grid for layout, flexbox for component alignment
- **ES6 Modules:** Write modular, class-based JavaScript with proper separation of concerns
- **Semantic HTML:** Use proper HTML5 semantic elements and structure
- **Performance-Conscious:** Minimize dependencies, optimize for fast loading
- **Accessibility:** Ensure proper ARIA labels, semantic structure, keyboard navigation

### Navigation Implementation
- **Hierarchical Indexing:** Use the proper index system (Book: -1, Units: X00, Topics: X01+)
- **Smart Navigation:** Implement context-aware Previous/Next that respects unit boundaries
- **Unit Integration:** Ensure unit overview pages integrate with the navigation system
- **Progress Calculation:** Accurate progress tracking based on hierarchical position

### HTML Quality Standards
- **No Trailing Spaces:** Clean, properly formatted HTML
- **Proper Self-Closing:** Use HTML5 standards for void elements
- **Semantic Structure:** Use appropriate HTML5 semantic elements
- **Modern CSS Classes:** Use custom CSS classes, avoid framework-specific classes
- **Touch Targets:** Ensure all interactive elements meet accessibility guidelines

### Mandatory Quality Checks
Before considering any implementation complete, verify:
1. **Mobile Functionality:** All features work properly on mobile devices
2. **Navigation Flow:** Sequential navigation respects hierarchical structure
3. **Progress Accuracy:** Progress bars reflect actual completion state
4. **Search Integration:** Search works across all content types
5. **Performance:** Fast loading and smooth interactions
6. **HTML Validation:** Clean, standards-compliant HTML structure