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

### Accessibility Warnings

**Problem**: Interactive elements missing keyboard handlers

**Solutions**:

- Convert `<div onclick={}>` to `<button type="button" onclick={}>`
- Add proper ARIA roles and labels
- Provide keyboard event handlers for complex interactions

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

_This document should be updated whenever new architectural patterns, common issues, or critical requirements are discovered during development._
