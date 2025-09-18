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
   pnpm run format   # Code formatting (mandatory first step)
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

**Styling**: Tailwind CSS v4 with **Modular Architecture**

- **CRITICAL**: Follow modular CSS architecture detailed in [CSS Architecture Standards](#css-architecture-standards)
- **NEVER**: Use `<style>` blocks with `@apply` in Svelte components
- **Reason**: [Official Tailwind recommendation](https://tailwindcss.com/docs/compatibility#vue-svelte-and-astro) to avoid performance issues

> **📋 Complete CSS Guidelines:** See [CSS Architecture Standards](#css-architecture-standards) for comprehensive modular CSS implementation

**UI Components**: `shadcn-svelte`

- **Installation**: `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Priority**: Always check component library before building custom components
- **Mandatory Usage**: Progress bars and modal dialogs MUST use shadcn components
  - Progress: Use `shadcn-svelte` Progress component instead of custom progress bars
  - Modals: Use `shadcn-svelte` Dialog component instead of custom modal implementations

**Icons**: `lucide-svelte`

- **Usage**: Import specific icons as Svelte components
- **Note**: Some icons were renamed (e.g., `AlertTriangle` → `TriangleAlert`)

**Theme Management**: Robust dark mode system with localStorage persistence

- **Components**: `ThemeToggle.svelte` component using shadcn-svelte DropdownMenu and Button
- **Store**: `src/lib/stores/theme.ts` with Svelte writable stores for reactive theme state
- **Themes**: Support for 'light', 'dark', and 'system' preference modes
- **Persistence**: localStorage integration with automatic system preference detection
- **Integration**: Positioned in demo layout header to the right of breadcrumbs

### Theme System Architecture

**Implementation Details:**

**Theme Store (`src/lib/stores/theme.ts`)**:

- **Type Definition**: `Theme = 'light' | 'dark' | 'system'`
- **Reactive State**: Uses Svelte `writable` stores for real-time theme updates
- **System Detection**: Automatically detects OS dark/light preference via `prefers-color-scheme`
- **DOM Integration**: Applies theme by adding/removing `light`/`dark` classes on `<html>` element
- **Persistence**: Saves user preference to localStorage and restores on page load

**ThemeToggle Component (`src/lib/components/ThemeToggle.svelte`)**:

- **UI Framework**: Built with shadcn-svelte DropdownMenu and Button components
- **Icons**: Uses lucide-svelte Sun, Moon, and Monitor icons
- **Visual Feedback**: Shows active theme with small primary-colored indicator dot
- **Accessibility**: Proper ARIA labels and keyboard navigation support

**CSS Variables Integration**:

- **Root Variables**: Comprehensive light/dark theme variables defined in `src/app.css`
- **Automatic Application**: Theme class on `<html>` element triggers CSS variable switching
- **shadcn-svelte Compatibility**: Full integration with shadcn design system colors

**Usage Pattern**:

```typescript
import { themeStore, setTheme, resolvedTheme } from "$lib/stores/theme";

// In Svelte components, use auto-subscription
$: currentTheme = $themeStore; // 'light' | 'dark' | 'system'

// Set theme using utility function
setTheme("dark");

// Get resolved theme (system resolves to actual preference)
$: actualTheme = $resolvedTheme; // 'light' | 'dark'
```

### CSS Architecture Standards

**MANDATORY: Modular CSS Architecture for SvelteKit Components**

**Core Principle**: All custom component styles MUST be organized in modular CSS files and imported into `src/app.css`

**Required File Structure**:

```
src/styles/
├── components.css      # Custom Svelte component styles
├── utilities.css       # Custom utility classes
├── layout.css         # SvelteKit layout-specific styles
├── variables.css      # Custom CSS variables and theme tokens
└── overrides.css      # shadcn-svelte customizations (minimal use)
```

**CSS Import Order in `src/app.css`**:

```css
@import "tailwindcss";
@import "./styles/variables.css";    # Theme variables first
@import "./styles/components.css";   # Component styles
@import "./styles/utilities.css";    # Utility classes
@import "./styles/layout.css";      # Layout styles
@import "./styles/overrides.css";   # shadcn overrides (if needed)
/* shadcn-svelte theme variables follow */
```

**SvelteKit Component Integration Rules**:

- ✅ **ALWAYS** define custom styles in separate CSS files with `@layer components`
- ✅ **ALWAYS** use semantic class names with project prefixes (`app-`, `lesson-`, `quiz-`)
- ✅ **ALWAYS** import styles via `src/app.css` for global availability
- ✅ **ALWAYS** use CSS custom properties for theming consistency
- ❌ **NEVER** put custom component styles directly in `src/app.css`
- ❌ **NEVER** use `<style>` blocks in Svelte components with `@apply` (Tailwind v4 incompatible)
- ❌ **NEVER** use inline styles in Svelte component templates

**SvelteKit-Specific Benefits**:

- ✅ Single CSS bundle with optimal build performance
- ✅ Global class availability across all routes and components
- ✅ Eliminates Tailwind v4 + Svelte compatibility issues
- ✅ Better maintainability with modular organization
- ✅ Consistent theming across component library integrations

**Implementation Pattern for Svelte Components**:

```css
/* src/styles/components.css */
@layer components {
	.lesson-container {
		@apply mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm;
		@apply border border-gray-200 dark:border-gray-700;
	}

	.quiz-question {
		@apply mb-4 rounded-md bg-purple-50 p-4;
		color: var(--quiz-primary-color);
	}
}
```

```svelte
<!-- SvelteKit Component Usage -->
<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();
</script>

<!-- Use modular CSS classes directly -->
<div class="lesson-container">
	<h1 class="lesson-title">{title}</h1>
</div>
```

**Theming Standards for SvelteKit**:

**MANDATORY: Harmonic Theme Systems Over Fixed Colors**

- ✅ **ALWAYS** use cohesive color palettes via CSS custom properties
- ✅ **ALWAYS** prefer theme tokens from shadcn-svelte or Tailwind CSS color scales
- ✅ **ALWAYS** use semantic color names (`--primary`, `--secondary`) over hex values
- ✅ **ALWAYS** ensure dark mode variants for all custom properties
- ❌ **NEVER** use fixed hex colors directly in component styles
- ❌ **NEVER** create inconsistent color combinations that break theme harmony

**Examples of Proper Theming**:

```css
/* ✅ CORRECT: Harmonic theme system */
:root {
	--color-primary: theme(colors.slate.900);
	--color-secondary: theme(colors.slate.600);
	--color-accent: theme(colors.blue.600);
}

.dark {
	--color-primary: theme(colors.slate.100);
	--color-secondary: theme(colors.slate.400);
	--color-accent: theme(colors.blue.400);
}

/* Component usage */
.my-component {
	color: var(--color-primary);
	background-color: var(--color-accent);
}
```

```css
/* ❌ INCORRECT: Fixed colors breaking theme harmony */
.my-component {
	color: #1a1a1a; /* Fixed dark color */
	background-color: #ff6b6b; /* Random red not in theme palette */
}
```

**Theme Harmony Benefits**:

- ✅ Consistent visual language across the application
- ✅ Easy theme switching (light/dark/custom themes)
- ✅ Better accessibility with tested color contrast ratios
- ✅ Maintainable codebase with centralized color management

### Content Management System

**Data Structure**: TypeScript-based content with interface inheritance

- **Content Files**: TypeScript files in `src/data/` exporting typed objects
- **Component Integration**: Direct import with SvelteKit content renderers
- **Type Safety**: Compile-time validation of content structure

**Content Renderer Components**:

- **LessonRenderer.svelte**: Displays lessons with metadata and structured sections
- **QuizRenderer.svelte**: Interactive quiz system with timer and progress tracking
- **StudyGuideRenderer.svelte**: Flashcard system with animations and modal support

### SvelteKit Architecture Guidelines

**CRITICAL: Layout vs Page Separation**

SvelteKit follows a clear architectural pattern that MUST be enforced to maintain code quality and scalability.

#### **Layout Responsibilities** (`+layout.svelte`)

**What layouts should contain:**

- ✅ Site-wide navigation structure (headers, sidebars, footers)
- ✅ Global state management and context providers
- ✅ Authentication and authorization wrappers
- ✅ Theme management and branding elements
- ✅ Z-index hierarchy management for overlays
- ✅ Responsive container structure
- ✅ Global error boundaries and loading states

**Layout anti-patterns:**

- ❌ Route-specific content or business logic
- ❌ Page-specific data fetching
- ❌ Content that changes based on individual pages

#### **Page Responsibilities** (`+page.svelte`)

**What pages should contain:**

- ✅ Route-specific content ONLY
- ✅ Page-specific data loading and state
- ✅ Page-specific interactions and forms
- ✅ Content presentation and user actions
- ✅ SEO metadata specific to the page

**Page anti-patterns:**

- ❌ Navigation components (should be in layout)
- ❌ Headers, sidebars, or footers
- ❌ Global styling or theme definitions
- ❌ Site-wide state management
- ❌ Files exceeding 300-400 lines (extract components)

#### **Component Size Guidelines**

**Size Limits for Maintainability:**

- **Pages**: Maximum 300-400 lines (extract to components if larger)
- **Layouts**: Maximum 200-300 lines (extract specialized components)
- **Components**: Maximum 150-200 lines (split into smaller components)
- **Complex Components**: Use composition pattern with multiple smaller components

#### **Z-index Hierarchy Standards**

**Global Z-index Scale** (must be consistent across all components):

```css
/* Z-index hierarchy - MUST be followed */
:root {
	--z-base: 1; /* Normal content flow */
	--z-dropdown: 10; /* Dropdown menus */
	--z-sticky: 50; /* Sticky elements */
	--z-header: 100; /* Main navigation header */
	--z-sidebar: 90; /* Sidebar navigation (below header) */
	--z-overlay: 200; /* Modal overlays and backdrops */
	--z-modal: 210; /* Modal content */
	--z-popover: 300; /* Popovers and tooltips */
	--z-toast: 400; /* Toast notifications */
	--z-debug: 9999; /* Development/debug tools */
}
```

**Z-index Usage Rules:**

- ✅ **ALWAYS** use CSS custom properties for z-index values
- ✅ **ALWAYS** follow the hierarchy scale above
- ✅ **NEVER** use arbitrary z-index values (z-index: 999999)
- ✅ **DOCUMENT** any new z-index requirements in this file

#### **State Management Patterns**

**Layout State** (managed in layouts):

- Navigation state (sidebar open/closed)
- Theme preferences (dark/light mode)
- User authentication status
- Global UI state (loading, errors)

**Page State** (managed in pages):

- Form data and validation
- Page-specific API data
- Local UI interactions
- Page-specific filters or search

**Communication Pattern**:

```typescript
// Layout provides context
// Page consumes context and manages local state
// Components receive props and emit events
```

#### **Responsive Design Standards**

**Mobile-First Breakpoints** (consistent across layouts and pages):

```css
/* Standard breakpoints - use these consistently */
@media (min-width: 390px) {
	/* Small mobile */
}
@media (min-width: 768px) {
	/* Tablet */
}
@media (min-width: 1024px) {
	/* Desktop */
}
@media (min-width: 1280px) {
	/* Large desktop */
}
```

**Layout Behavior Guidelines:**

- **Mobile (≤768px)**: Collapsible navigation, stack layouts vertically
- **Tablet (768px-1024px)**: Hybrid navigation, partial sidebar
- **Desktop (≥1024px)**: Full navigation, sidebar visible, multi-column layouts

### File Structure

```
src/
├── data/                     # Content data (TypeScript format)
│   ├── demo/                # Demo-specific data structures
│   │   ├── navigation/      # Navigation and routing data
│   │   └── content/         # Demo content data
│   └── types.ts             # TypeScript interfaces with inheritance
├── lib/
│   └── components/
│       ├── content/         # Content renderer components
│       ├── demo/           # Demo-specific components
│       └── ui/              # shadcn-svelte UI components
├── routes/                  # SvelteKit routes (file-based routing)
│   ├── +layout.svelte      # Global application layout
│   └── demo/               # Demo section with isolated layout
│       ├── +layout.svelte  # Demo-specific layout structure
│       └── +page.svelte    # Demo content page (central content only)
├── styles/                  # Modular CSS architecture
│   ├── components.css      # Component-specific styles
│   ├── layout.css         # Layout-specific styles
│   └── utilities.css      # Custom utility classes
├── app.css                  # CSS imports and theme variables
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
5. **Testing**: Validate all changes with `pnpm run format`, `pnpm run check`, and `pnpm run lint`

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

## CODE BLOCK ESCAPING STRATEGY FOR DATA GENERATION

### Problem Context

When generating TypeScript data files containing code snippets as string literals, special characters within the code must be properly handled to ensure syntactic validity of the generated TypeScript file. This is a critical requirement for maintaining code quality and preventing compilation errors.

### Chosen Strategy: ts-morph AST Manipulation

**Rationale**: Using `ts-morph` (available as `"ts-morph": "^27.0.0"` in project dependencies) provides the most robust solution for programmatically generating TypeScript code with embedded string literals.

**Key Benefits**:

1. **AST-Based Approach**: Manipulates TypeScript Abstract Syntax Tree directly, eliminating manual escaping errors
2. **Built-in Validation**: Ensures generated TypeScript is syntactically correct at the AST level
3. **Type Safety**: Leverages TypeScript compiler's validation during code generation
4. **Maintainability**: More robust and maintainable than manual string manipulation
5. **Future-Proof**: Reusable infrastructure for ongoing content generation tasks

**Implementation Pattern**:

```typescript
import { Project, VariableDeclarationKind } from "ts-morph";

// Create ts-morph project instance
const project = new Project();
const sourceFile = project.createSourceFile("code-examples.ts");

// Add interfaces and types
sourceFile.addInterface({
	name: "CodeExample",
	properties: [
		{ name: "title", type: "string" },
		{ name: "language", type: "Language" }
		// ... other properties
	]
});

// Add code examples using AST manipulation
sourceFile.addVariableStatement({
	declarationKind: VariableDeclarationKind.Const,
	declarations: [
		{
			name: "codeExamples",
			type: "CodeExample[]",
			initializer: (writer) => {
				writer.write("[");
				// Add array elements programmatically
				writer.write("]");
			}
		}
	]
});
```

**String Literal Handling**:

- **Template Literals**: Use `writer.write()` with template literals for multi-line code
- **Automatic Escaping**: ts-morph handles all necessary character escaping automatically
- **Validation**: Built-in TypeScript compilation validation ensures correctness

**Alternative Approaches Considered**:

1. **Manual Template Literals**: Requires manual escaping of backticks, `${}`, and backslashes - error-prone
2. **JSON.stringify()**: Handles escaping automatically but reduces readability significantly
3. **External File References**: Would complicate deployment and maintenance

**Usage Context**: Applied in `src/data/demo/content/code/code-examples.ts` and should be the standard approach for all future code snippet data generation in the project.

**Validation Workflow**:

1. Generate TypeScript file using ts-morph
2. Run `pnpm run check` to validate TypeScript compilation
3. Run `pnpm run format` for consistent formatting
4. Run `pnpm run lint` for code quality validation

---

## CODE EXAMPLES SHOWCASE ARCHITECTURE

### Component Overview

The Interactive Code Examples Showcase is implemented as a comprehensive system providing syntax-highlighted code examples with advanced filtering, search, and copy functionality.

**Core Components**:

1. **CodeBlock.svelte** (`src/lib/components/demo/ui/CodeBlock.svelte`)
2. **CodeExamplesShowcase.svelte** (`src/lib/components/demo/CodeExamplesShowcase.svelte`)
3. **Code Examples Utilities** (`src/data/demo/content/code/code-examples-utils.ts`)

### CodeBlock Component

**Purpose**: Renders individual code examples with Shiki syntax highlighting, copy functionality, and metadata display.

**Key Features**:

- **Shiki Integration**: Uses `createHighlighter()` with light/dark theme support
- **Language Mapping**: Supports 18+ programming languages and technologies
- **Line Numbers**: Optional line number display with mobile optimization
- **Copy-to-Clipboard**: One-click copying with visual feedback
- **Collapsible Content**: Show/hide toggle for better UX
- **Loading States**: Skeleton loading while Shiki initializes

**CSS Architecture**: Follows centralized architecture with `demo-code-` prefixed classes:

```css
.demo-code-block              /* Main container */
.demo-code-header             /* Metadata and actions */
.demo-code-content            /* Code display area */
.demo-code-complexity-*       /* Complexity level styling */
.demo-code-lang-*            /* Language-specific styling */
```

**Props Interface**:

```typescript
interface Props {
	example: CodeExample;
	showLineNumbers?: boolean;
	showCopyButton?: boolean;
	showMetadata?: boolean;
	className?: string;
}
```

### CodeExamplesShowcase Component

**Purpose**: Provides a complete interactive showcase for browsing and filtering code examples.

**Key Features**:

- **Advanced Filtering**: By language, complexity, and search terms
- **Real-time Search**: Instant filtering as user types
- **Statistics Display**: Example counts by category
- **Responsive Design**: Mobile-first with collapsible filters
- **State Management**: Svelte 5 runes (`$state`, `$derived`, `$effect`)

**Filter Architecture**:

- **Language Filters**: Multi-select with counts per language
- **Complexity Filters**: Beginner, Intermediate, Advanced levels
- **Search Integration**: Title, description, and language matching
- **Clear Filters**: One-click reset functionality

**CSS Classes**: Uses `demo-code-showcase-*` prefix for all styling.

### Integration Patterns

**LessonView Integration**:

- **Showcase Detection**: Automatically detects Code Examples Showcase lesson by ID
- **Random Code Examples**: Displays random example for regular lessons
- **Conditional Rendering**: Shows appropriate content based on lesson type

**Navigation Integration**:

- **Sidebar Entry**: Added to "Interactive Showcase & Examples" unit
- **Route Mapping**: `/demo/code-examples` route configuration

### Data Architecture

**Code Examples Structure** (`src/data/demo/content/code/code-examples.ts`):

```typescript
interface CodeExample {
	title: string;
	language: Language;
	complexity: Complexity;
	description: string;
	code: string; // Properly escaped template literals
}
```

**Utility Functions** (`code-examples-utils.ts`):

- `getRandomCodeExample()`: Random selection
- `getRandomCodeExampleByLanguage()`: Language-specific selection
- `getMultipleRandomCodeExamples()`: Multiple random examples
- `getCodeExamplesStats()`: Statistics calculation

### Performance Considerations

**Shiki Optimization**:

- **Lazy Loading**: Highlighter initialized on component mount
- **Theme Caching**: Light/dark themes loaded once
- **Language Bundle**: Only required languages loaded
- **Fallback Handling**: Plain text fallback for loading errors

**Filtering Performance**:

- **Reactive Updates**: `$effect` for efficient re-filtering
- **Derived State**: Computed statistics using `$derived`
- **Debounced Search**: Immediate filtering without debounce for responsiveness

### Mobile-First Design

**Responsive Breakpoints**:

- **≤480px**: Single column, compact badges, smaller fonts
- **≤768px**: Stacked controls, vertical stats, simplified filters
- **>768px**: Multi-column grid, horizontal layouts

**Touch Optimization**:

- **44px minimum** touch targets for buttons
- **Scroll optimization** for code blocks
- **Collapsed filters** by default on mobile

### Security Implementation

**XSS Prevention**:

- **Shiki HTML**: Trusted HTML output from Shiki highlighter
- **User Input Sanitization**: Search terms filtered and escaped
- **No eval()**: No dynamic code execution

**Copy Functionality**:

- **Clipboard API**: Modern async clipboard with fallback
- **User Permission**: Handles clipboard permission gracefully
- **Error Handling**: Fallback to document.execCommand for older browsers

---

## RECURRING ISSUES REFERENCE

**⚠️ Note:** For bugs and issues that appear multiple times across development sessions, refer to [RECURRING-ISSUES.md](RECURRING-ISSUES.md).

One-time bugs and resolved issues are not documented here to maintain focus on current architectural requirements.
