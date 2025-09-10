# Technical Specifications & User Experience Standards

This document contains the technical architecture and user experience standards for the Cloud-Native Book project.

> **📚 Related Documentation:**
> - [CLAUDE.md](CLAUDE.md) - Core project rules and agent implementation guidelines
> - [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) - Content creation workflows and quality assurance standards
> - [VALIDATION-GUIDE.md](VALIDATION-GUIDE.md) - Comprehensive validation guide for all project assets (HTML, CSS, JS, Mermaid, Bash)

---

## TECHNICAL ARCHITECTURE

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

---

## USER EXPERIENCE STANDARDS

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