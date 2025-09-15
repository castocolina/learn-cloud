# Technical Specifications: Cloud-Native Learning Platform

This document contains the technical architecture and user experience standards for the Cloud-Native Book project.

> **📚 Related Documentation:**
>
> - [CLAUDE.md](CLAUDE.md) - Core project rules and agent implementation guidelines
> - [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) - Content creation workflows and quality assurance standards

---

## CRITICAL TESTING REQUIREMENT

**🚨 MANDATORY**: All agents modifying web assets (HTML, CSS, JS, Svelte components) **MUST**:

1. **Execute complete validation cycle** after any changes:

   ```bash
   pnpm run check    # SvelteKit validation
   pnpm run lint     # Code quality
   pnpm run dev      # Development server test
   ```

2. **Continue testing until ZERO errors** are achieved
3. **Document any persistent issues** in this file for future reference
4. **Update this document** when discovering new architectural requirements

**Rationale**: Tailwind CSS v4 + Svelte 5 combination has specific compatibility requirements that cause runtime failures if not properly validated.

---

## TECHNICAL ARCHITECTURE

### Core Technology Stack

**Framework**: SvelteKit with Svelte 5

- Component-based architecture with Svelte 5 runes for state management
- TypeScript support for type safety and developer experience
- Static site generation for GitHub Pages deployment

**Svelte 5 Critical Syntax** (Common Migration Errors):

```typescript
// ✅ CORRECT Svelte 5 Runes
let count = $state(0);
const doubled = $derived(count * 2);
let { title, items = [] }: Props = $props();

// ❌ DEPRECATED Svelte 4 Syntax
export let title;
$: doubled = count * 2;
```

**Styling**: Tailwind CSS v4 with **Centralized Architecture**

- **CRITICAL**: All component styles MUST be in `src/app.css` using `@layer components`
- **NEVER**: Use `<style>` blocks with `@apply` in Svelte components
- **Reason**: [Official Tailwind recommendation](https://tailwindcss.com/docs/compatibility#vue-svelte-and-astro) to avoid performance issues

```css
/* ✅ CORRECT: Centralized in app.css */
@layer components {
	.component-class {
		@apply flex items-center gap-2;
	}
}
```

```svelte
<!-- ✅ CORRECT: Use global classes -->
<div class="component-class">Content</div>

<!-- ❌ CAUSES BUILD FAILURES -->
<style lang="postcss">
	.local-class {
		@apply flex; /* Incompatible with Tailwind v4 + Svelte */
	}
</style>
```

**UI Components**: `shadcn-svelte`

- **Installation**: `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Priority**: Always check component library before building custom components
- **Mandatory Usage**: Progress bars and modal dialogs MUST use shadcn components
  - Progress: Use `shadcn-svelte` Progress component instead of custom progress bars
  - Modals: Use `shadcn-svelte` Dialog component instead of custom modal implementations

**Icons**: `lucide-svelte`

- **Usage**: Import specific icons as Svelte components
- **Note**: Some icons were renamed (e.g., `AlertTriangle` → `TriangleAlert`)

### CSS Architecture Standards

**Centralized CSS Approach**: All component styles in `src/app.css` using `@layer components`

**Benefits**:

- ✅ Single source of truth for all component styles
- ✅ Eliminates Tailwind v4 compatibility issues
- ✅ Better maintainability and consistency
- ✅ Optimal build performance

**Implementation Pattern**:

1. Define styles in `app.css` with semantic class names
2. Use global classes directly in component templates
3. Combine with Tailwind utilities as needed

### Content Management System

**Data Structure**: TypeScript-based content with interface inheritance

- **Content Files**: TypeScript files in `src/data/` exporting typed objects
- **Component Integration**: Direct import with SvelteKit content renderers
- **Type Safety**: Compile-time validation of content structure

**Content Renderer Components**:

- **LessonRenderer.svelte**: Displays lessons with metadata and structured sections
- **QuizRenderer.svelte**: Interactive quiz system with timer and progress tracking
- **StudyGuideRenderer.svelte**: Flashcard system with animations and modal support

### File Structure

```
src/
├── data/                     # Content data (TypeScript format)
│   ├── demo.ts              # Demo content showcasing components
│   └── types.ts             # TypeScript interfaces with inheritance
├── lib/
│   └── components/
│       ├── content/         # Content renderer components
│       └── ui/              # shadcn-svelte UI components
├── routes/                  # SvelteKit routes (file-based routing)
├── app.css                  # Centralized CSS architecture
└── app.html                 # HTML template
```

### Development Environment

**Development Tools**:

- **Package Manager**: pnpm
- **Build System**: Vite (via SvelteKit)
- **Code Quality**: ESLint, Prettier, TypeScript
- **Content Rendering**: Shiki (syntax highlighting), Mermaid.js (diagrams)

**Validation Commands**:

```bash
pnpm run check    # SvelteKit type checking
pnpm run lint     # Code linting and formatting
pnpm run dev      # Development server
pnpm run build    # Production build
```

---

## USER EXPERIENCE STANDARDS

### Mobile-First Design

**Responsive Breakpoints**:

- **Mobile**: ≤390px (primary target)
- **Tablet**: ≤768px
- **Desktop**: ≥1024px

**Design Principles**:

- Touch targets minimum 44px
- Progressive enhancement
- Fast loading with optimized bundles

### Interactive Components

**Learning Flow**:

1. Unit Overview → Lesson Content → Study Guides → Quizzes
2. Progress tracking with visual indicators
3. Accessible navigation with keyboard support

**Modal System**:

- Fullscreen on mobile (100vh x 100vw)
- Large modals on desktop (90-95% viewport)
- Escape key support and focus management
- **MANDATORY**: Use `shadcn-svelte` Dialog component for all modal implementations

**Navigation Standards**:

- **Sidebar Accordion**: Only one unit can be open at a time (accordion behavior)
- **Breadcrumb Navigation**: Dynamic breadcrumbs based on current content state:
  - Home view: Site title only
  - Unit view: Unit name with home link
  - Chapter view: Unit name and chapter name
- **Cursor Indicators**: All interactive elements must have `cursor-pointer` styling

**Quiz System**:

- **Explanation Timing**: Explanations are withheld until quiz completion
- **Results Display**: Comprehensive review with all answers and explanations shown after completion
- **Progress Tracking**: Use standardized Progress component for quiz completion tracking

**Theming Standards**:

- **Color Palette**: Primary theme uses Tailwind CSS slate palette for consistency
- **Code Blocks**: Enhanced with visible container borders (`border-slate-300`) and theme-aligned backgrounds (`bg-slate-50`)
- **Icon Consistency**: All metadata icons (Prerequisites, Learning Objectives) use consistent `text-slate-500` coloring
- **Component Styling**: Standardized styling across all interactive components with consistent hover states and transitions

---

## COMMON TROUBLESHOOTING

### Tailwind CSS v4 Issues

**Problem**: Build failures with `Cannot apply unknown utility class`

**Solution**: Use centralized CSS architecture in `app.css`

**Example Error**: `max-w-4xl` not recognized → Use `max-w-5xl` or define custom utility

### Svelte 5 Migration Issues

**Problem**: Deprecated syntax warnings

**Solutions**:

- Replace `export let prop` with `let { prop } = $props()`
- Replace `$: derived = value` with `const derived = $derived(value)`
- Replace `<svelte:component>` with conditional rendering

### Accessibility Standards

**WCAG Compliance Requirements**:

**Problem**: Interactive elements missing keyboard handlers or event listeners on non-interactive elements

**Solutions**:

- Convert `<div onclick={}>` to `<button type="button" onclick={}>`
- Add proper ARIA roles and labels
- Provide keyboard event handlers for complex interactions

**Modal Event Handling Best Practices**:

**Problem**: Non-interactive `<div>` elements with event listeners trigger accessibility warnings

**Correct Pattern for Modal Interactions**:

```javascript
// ✅ CORRECT: Event handling at the modal overlay level
<div
  class="modal-overlay"
  onclick={(e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }}
  onkeydown={(e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  }}
  role="dialog"
  aria-modal="true"
  aria-label="Modal dialog"
  tabindex="-1"
>
  <div class="modal-content" role="document">
    <button
      class="modal-close"
      onclick={closeModal}
      aria-label="Close modal"
      type="button"
    >
      ×
    </button>
    <!-- Modal content -->
  </div>
</div>

// ❌ INCORRECT: Event listeners on non-interactive content containers
<div class="modal-content" onclick={(e) => e.stopPropagation()}>
  <!-- This triggers accessibility warnings -->
</div>
```

**Key Principles**:

1. **Semantic Elements Only**: Event listeners should only be attached to semantic interactive elements (`<button>`, `<a>`, etc.) or elements with proper interactive roles
2. **Modal Structure**: Use `role="dialog"` on the overlay and `role="document"` on the content container
3. **Event Delegation**: Handle backdrop clicks by checking `e.target === e.currentTarget` instead of using `stopPropagation()` on content containers
4. **Keyboard Navigation**: Ensure all interactive functionality is accessible via keyboard (Escape key, Tab navigation)
5. **Focus Management**: Proper focus trapping and restoration in modal dialogs

### Performance Issues

**Problem**: Slow build times or large bundles

**Solutions**:

- Use dynamic imports for large components
- Leverage SvelteKit's automatic code splitting
- Optimize assets and use proper caching headers

---

## DEVELOPMENT STANDARDS

### Component Development Rules

1. **TypeScript First**: All components must use TypeScript with proper interfaces
2. **Centralized CSS**: No `<style>` blocks with `@apply` directives
3. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
4. **Mobile-First**: Design for mobile devices first, then enhance for desktop
5. **Testing**: Validate all changes with `pnpm run check` and `pnpm run lint`

### Code Quality Standards

- Use `shadcn-svelte` components before building custom ones
- Follow semantic HTML and proper component composition
- Implement proper error boundaries and loading states
- Write clear, descriptive variable and function names
- Add JSDoc comments for complex functions and interfaces

### Security Considerations

- Sanitize HTML content for user-generated content
- Use secure build environment with locked dependencies
- Implement proper CSP headers for production
- Validate all external data and API responses

---

## DEPLOYMENT

**Target Platform**: GitHub Pages with Static Site Generation

**CI/CD Pipeline**:

1. Validation (SvelteKit check, lint, script validation)
2. Build (static site generation with optimized assets)
3. Deploy (automated GitHub Pages deployment)

**Performance Requirements**:

- Fast loading times with optimized bundle sizes
- Progressive enhancement for better user experience
- Efficient content loading and caching strategies

---

## CONTENT GENERATION SYSTEM

### Overview

The content generation system automatically parses `CONTENT.md` and produces `src/data/content-menu.ts`, which serves as the single source of truth for the book's navigation structure.

**Generation Command**:

```bash
make generate-content-menu
# or directly:
python3 src/python/generate_content_menu.py
```

### Recent Fixes (September 2025)

**Problem 1: Chapter Parsing Validation Failure**

- **Issue**: Script was finding units but zero chapters, causing "Parsed structure validation failed" error
- **Root Cause**: Regex patterns expected `*` bullet points but CONTENT.md uses `-` bullet points
- **Fix**: Updated all regex patterns from `^\*\s+` to `^-\s+` to match actual markdown format

**Problem 2: Hardcoded Metadata**

- **Issue**: Site title and description were hardcoded in the Python script
- **Root Cause**: Metadata generation was not dynamic, making it difficult to maintain consistency
- **Fix**: Added `extract_metadata_from_markdown()` function that:
  - Extracts title from the first `# heading` in CONTENT.md
  - Generates description dynamically based on detected topics (Python, Go, DevOps, etc.)
  - Passes extracted metadata to JSON generation

### Architecture Details

**Script Location**: `src/python/generate_content_menu.py`

**Input**: `CONTENT.md` (Book content structure in Markdown)

**Output**: `src/data/content-menu.ts` (Structured TypeScript module for navigation)

**Generated Structure**:

```json
{
  "metadata": {
    "generated_by": "generate_content_menu.py",
    "source": "CONTENT.md",
    "version": "1.0.0",
    "title": "[Dynamically extracted from CONTENT.md]",
    "description": "[Generated based on content analysis]",
    "total_units": 9,
    "total_chapters": 119
  },
  "units": [...]
}
```

**Parsing Logic**:

- **Units**: Matched by `## Unit X: Title [icon: IconName]` pattern
- **Chapters**: Matched by `- **X.Y: Title** [icon: IconName]` pattern
- **Special Content**: Study guides, quizzes, exams, and projects are handled separately
- **Icons**: Extracted from `[icon: IconName]` metadata or use intelligent fallbacks

### Validation Requirements

The script includes comprehensive validation that ensures:

- All units have required fields (title, icon, description, exam_link)
- All chapters have required fields (title, icon, chapter_link, type)
- No units are empty (must contain at least one chapter)
- Generated file paths follow consistent URL patterns

**Success Metrics**: Script must generate 9 units with 119+ chapters and pass validation

### Data Generation Patterns

**TypeScript-First Approach**: As of September 2025, generated data should be created as typed TypeScript modules rather than JSON files to ensure end-to-end type safety.

**Migration from JSON to TypeScript Modules**:

- **Old Approach**: Generated `src/data/content-menu.json` and required manual type casting in application code
- **New Approach**: Generate `src/data/content-menu.ts` with proper TypeScript imports and exports
- **Benefits**: Full type safety, better IDE support, compile-time error detection

**Implementation Pattern**:

```typescript
// Generated TypeScript module structure:
import type { ContentMenu } from './types.js';

export const contentMenu: ContentMenu = {
  metadata: { ... },
  units: [ ... ]
};
```

**Python Generator Updates**:

- Output path changed from `.json` to `.ts`
- File content includes TypeScript import statement
- Data exported as typed constant instead of raw JSON
- Core parsing logic remains unchanged

**Application Integration**:

```typescript
// Before: JSON import with type casting
import contentMenuData from "$lib/../data/content-menu.json";
const contentMenu: ContentMenu = contentMenuData as ContentMenu;

// After: Direct typed import
import { contentMenu } from "$lib/../data/content-menu.js";
// contentMenu is already properly typed
```

This pattern should be applied to all future data generation systems to maintain consistent type safety throughout the application.

---

## BUG FIXES AND SOLUTIONS (September 2025)

### UI/UX Bug Resolution Summary

**Date**: September 15, 2025
**Scope**: Critical UI/UX bug fixes across Mermaid diagrams, Study Guide layout, and breadcrumb navigation

#### 1. Mermaid Diagram Rendering Failure

**Problem**: Mermaid diagrams failed to render silently on the observability lesson page due to content migration issues from HTML to TypeScript data format.

**Root Cause**: The observability lesson was loading from a scaffolded TypeScript file instead of the real content, and Mermaid diagrams were wrapped in `<script type="text/plain">` tags from the old HTML format.

**Solution**:

- Migrated the complete observability lesson content from HTML to proper TypeScript `DiagramBlock` format
- Converted 3 Mermaid diagrams to use the correct `DiagramBlock` structure with `definition`, `title`, and `caption` properties
- Fixed TypeScript error handling for unknown error types in Mermaid component

**Files Modified**:

- `src/data/book/unit1/1_9_lesson_observability.ts`: Complete content migration with proper diagram structure
- `src/lib/components/content/shared/Mermaid.svelte`: Fixed error handling for TypeScript compliance

#### 2. Study Guide Layout and Grid View Implementation

**Problem**: Study Guide displayed only single card view instead of the expected responsive grid layout option.

**Root Cause**: The StudyGuideRenderer component lacked a grid view mode, only supporting single-card flashcard navigation.

**Solution**:

- Implemented dual view modes: `single` (original flashcard behavior) and `grid` (new responsive grid)
- Added view mode toggle button with appropriate icons (Grid3X3/Eye)
- Created responsive grid layout with mobile-first design (1 column on mobile, up to 4 columns on desktop)
- Added card preview functionality where grid cards show truncated question text and tags
- Proper navigation between views with state preservation

**Files Modified**:

- `src/lib/components/content/StudyGuideRenderer.svelte`: Added grid view mode and toggle functionality
- `src/app.css`: Added responsive grid styles with mobile-first approach

#### 3. Button Positioning in Study Guide Modal

**Problem**: Expand button appeared outside of modal/dialog due to positioning and z-index issues.

**Root Cause**: Missing z-index hierarchy and potential stacking context issues.

**Solution**:

- Added explicit z-index values to ensure proper layering
- Enhanced `.flashcard-wrapper` with z-index context
- Set `.expand-button` z-index to 10 to ensure visibility above flashcard content

**Files Modified**:

- `src/app.css`: Enhanced positioning and z-index for modal button interactions

#### 4. Breadcrumb Navigation Logic Errors

**Problem**: Breadcrumb navigation showed incorrect behavior with premature chapter-level links and improper unit navigation.

**Root Cause**: Incorrect breadcrumb logic that always pointed unit links to the welcome page instead of unit overview.

**Solution**:

- Implemented proper breadcrumb state management with `canNavigateToUnit` flag
- Added `navigateToUnit()` function that properly navigates to unit overview using `loadUnitContent()`
- Fixed breadcrumb rendering logic:
  - Welcome view: Shows site title only
  - Unit view: Shows unit name as current page (not clickable)
  - Chapter view: Shows unit name as clickable link to unit overview, plus chapter name

**Files Modified**:

- `src/routes/+page.svelte`: Enhanced breadcrumb logic and navigation functions

#### 5. Breadcrumb Navigation Component Fixes (September 2025)

**Problem**: Breadcrumb navigation component was not functioning correctly across different route scenarios, with mobile visibility issues and inconsistent behavior.

**Root Cause**:

- Breadcrumbs were hidden on mobile (`hidden md:block`)
- Logic didn't properly distinguish between homepage, unit overview, and content page scenarios
- URL parsing logic was incorrect for the actual routing structure (`book/unit/1/filename.html`)

**Solution**:

- **Mobile-First Visibility**: Removed `hidden md:block` classes to ensure breadcrumbs are visible on all devices
- **Three-Scenario Implementation**:
  1. **Homepage (`/`)**: First segment shows site title as disabled page indicator, second segment hidden
  2. **Unit Overview (`book/unit/1/0_unit_*.html`)**: First segment shows unit title as current page (not clickable), second segment hidden
  3. **Content Page (`book/unit/1/content_file.html`)**: First segment shows unit title as clickable link to unit overview, second segment shows content title

**Technical Implementation**:

- Enhanced `getBreadcrumbData()` function with proper URL parsing for `book/unit/{number}/filename.html` pattern
- Added filename detection logic to distinguish unit overview pages (`0_unit_*.html`) from content pages
- Added `isHomepage` flag for clear state distinction
- Updated breadcrumb rendering with conditional logic for all three scenarios
- Integrated with existing `navigateToUnit()` function for proper unit overview navigation

**Key Fix**: Unit overview pages are now correctly detected by checking if filename starts with `"0_unit_"`, ensuring the breadcrumb behaves like the homepage (unit title disabled, no chapter breadcrumb)

**Files Modified**:

- `src/routes/+page.svelte:49-107`: Enhanced breadcrumb data logic with three distinct scenarios
- `src/routes/+page.svelte:139-168`: Updated breadcrumb rendering for mobile-first visibility and proper conditional display

**Testing Results**:

- ✅ TypeScript validation passed with 0 errors
- ✅ Mobile-first responsive behavior verified
- ✅ All three navigation scenarios implemented correctly

### Architecture Improvements

#### Mobile-First Grid Implementation

**Pattern**: Responsive grid with mobile-first breakpoints

```css
.flashcards-grid {
	@apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}

/* Mobile-first responsive grid */
@media (max-width: 390px) {
	.flashcards-grid {
		@apply grid-cols-1 gap-3;
	}
}
```

**Benefits**: Ensures optimal experience on mobile devices while scaling up for larger screens.

#### Content Migration Best Practices

**Pattern**: HTML to TypeScript data migration

- Always migrate complete content structures, not partial updates
- Ensure all Mermaid diagrams use proper `DiagramBlock` format with `type: "diagram"`, `diagramType`, `definition`, `title`, and `caption`
- Update content status from `ContentStatus.SCAFFOLD` to `ContentStatus.FINAL` when real content is added

**Example DiagramBlock Structure**:

```typescript
{
  type: "diagram",
  diagramType: DiagramType.MERMAID,
  definition: `graph TD
    A["Observability"] --> B("Logs");
    A --> C("Metrics");
    A --> D("Traces");`,
  title: "The Three Pillars of Observability",
  caption: "The foundational components of system observability"
}
```

#### Modal Z-Index Management

**Pattern**: Hierarchical z-index for complex UI interactions

```css
.flashcard-wrapper {
	@apply relative;
	z-index: 1; /* Base stacking context */
}

.expand-button {
	@apply absolute top-4 right-4;
	z-index: 10; /* Above flashcard content */
}
```

**Best Practice**: Always establish clear z-index hierarchy for modal interactions to prevent positioning conflicts.

### Testing and Validation

**Validation Process Completed**:

- ✅ `pnpm run check`: TypeScript validation passed with 0 errors
- ✅ Code formatting: Auto-fixed with Prettier
- ⚠️ ESLint: Pre-existing issues in scaffolded files (not related to bug fixes)

**Mobile Testing**: All fixes verified for mobile-first responsive behavior at ≤390px breakpoint.

### Performance Impact

**Positive Impacts**:

- Grid view provides better overview of available flashcards
- Proper content migration improves page load efficiency
- Enhanced z-index management prevents visual glitches

**No Performance Regressions**: All changes maintain existing performance characteristics while adding new functionality.

---

_This document should be updated whenever new architectural patterns, common issues, or critical requirements are discovered during development._
