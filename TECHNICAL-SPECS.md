# Technical Specifications: Cloud-Native Learning Platform

This document contains the technical architecture and user experience standards for the Cloud-Native Book project.

> **📚 Related Documentation:**
>
> - [AGENTS.md](AGENTS.md) - Core project rules and agent implementation guidelines
> - [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) - Content creation workflows and quality assurance standards

---

## TECHNICAL ARCHITECTURE

### Core Technology Stack

**Framework**: SvelteKit with Svelte 5

- Modern, performant web framework with SSR/SSG capabilities
- Component-based architecture with Svelte 5 runes for state management
- TypeScript support for type safety and better developer experience
- Optimized for production deployment on GitHub Pages

**Svelte 5 Syntax Requirements** (Critical - Common Errors):

- **State Management**:
  - ✅ `let count = $state(0);`
  - ❌ `let count = 0;` (for reactive state)
- **Derived Values**:
  - ✅ `const doubled = $derived(count * 2);`
  - ❌ `$: doubled = count * 2;`
- **Effects**:
  - ✅ `$effect(() => { console.log(count); });`
  - ❌ `$: { console.log(count); }`
- **Props Declaration**:
  - ✅ `let { title, items = [] }: Props = $props();`
  - ❌ `export let title; export let items = [];`
- **Event Handlers**:
  - ✅ `<button onclick={handleClick}>Click</button>`
  - ❌ `<button on:click={handleClick}>Click</button>`
- **Component References**:
  - ✅ `<ComponentName prop={value} />`
  - ❌ `<svelte:component this={Component} />`
- **Reactive State Updates**:
  - ✅ `count++;` or `count = newValue;` (direct mutation)
  - ❌ `count = count + 1;` (unnecessary when using direct mutation)
- **Class/Style Binding**:
  - ✅ `class:active={condition}` (maintained compatibility)
  - ✅ `style:color={textColor}` (maintained compatibility)

**TypeScript Integration**:

```typescript
interface Props {
	title: string;
	items?: string[];
	onItemClick?: (item: string) => void;
}

let { title, items = [], onItemClick }: Props = $props();
```

**Styling**: Tailwind CSS v4

- Utility-first CSS framework for rapid development
- `tailwindcss-typography` plugin for rich content formatting
- Mobile-first responsive design approach
- Custom design system with consistent spacing and colors

**Tailwind CSS v4 Configuration Requirements**:

- **Main CSS file** (`src/app.css`): Centralized approach with all component styles

  ```css
  @import "tailwindcss";

  @layer components {
  	/* All component-specific styles defined here */
  	.quiz-container {
  		@apply mx-auto max-w-4xl p-4;
  	}

  	.quiz-header {
  		@apply mb-6 text-center;
  	}

  	/* Additional component styles... */
  }
  ```

- **Component Development**: SvelteKit components use global CSS classes exclusively

  ```svelte
  <!-- ✅ RECOMMENDED: Use global CSS classes -->
  <div class="quiz-container">
  	<div class="quiz-header">
  		<h1>Quiz Title</h1>
  	</div>
  </div>

  <!-- ❌ NOT RECOMMENDED: Per-component @apply blocks -->
  <style lang="postcss">
  	@import "tailwindcss/utilities" reference;
  	.local-class {
  		@apply flex items-center;
  	}
  </style>
  ```

- **Architecture Benefits**:
  - ✅ Single source of truth for all component styles
  - ✅ Eliminates @import reference syntax compatibility issues
  - ✅ Better maintainability and consistency
  - ✅ Follows official Tailwind CSS recommendations for component frameworks

**UI Components**: `shadcn-svelte`

- High-quality, accessible component library built for SvelteKit
- **Installation**: `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Priority**: Always prefer shadcn-svelte components over custom implementations
- **Documentation**: [shadcn-svelte.com](https://www.shadcn-svelte.com/)
- **Component Library**: [shadcn-svelte.com/docs/components](https://www.shadcn-svelte.com/docs/components)
- **Agent Guidelines**: If adding a component is complex, provide the user with the command to run manually

**Icons**: `lucide-svelte`

- Consistent, high-quality icon library optimized for Svelte
- **Documentation**: [lucide.dev](https://lucide.dev/)
- **Usage**: Import specific icons as Svelte components

### CSS Architecture & Styling Standards

**Centralized CSS Approach**: All component-specific styles are defined in `src/app.css` using Tailwind's `@layer components` directive.

**Architecture Overview**:

```css
/* src/app.css */
@import "tailwindcss";

@layer components {
	/* Quiz Components */
	.quiz-container {
		@apply mx-auto max-w-4xl p-4;
	}

	.quiz-header {
		@apply mb-6 text-center;
	}

	/* Mermaid Components */
	.mermaid-container {
		@apply my-6 rounded-lg border border-gray-200 bg-white p-4;
	}

	/* Content Components */
	.content-section {
		@apply mb-8;
	}

	/* Additional component styles... */
}
```

**Component Development Standards**:

- **Global CSS Classes**: Components use predefined CSS classes from `app.css`
- **No Per-Component Styles**: Avoid `<style>` blocks with `@apply` directives
- **Consistent Naming**: Use semantic, component-based class names (e.g., `quiz-header`, `content-section`)
- **Tailwind Utilities**: Combine global classes with Tailwind utilities as needed

**Benefits of Centralized Approach**:

- ✅ **Single Source of Truth**: All component styles in one location
- ✅ **Build Compatibility**: Eliminates @import reference syntax issues
- ✅ **Better Maintainability**: Easy to find and modify component styles
- ✅ **Consistency**: Shared styles ensure visual consistency across components
- ✅ **Official Best Practice**: Follows Tailwind CSS recommendations for component frameworks

**Implementation Guidelines**:

1. **Define Styles**: Add new component styles to `app.css` in the `@layer components` section
2. **Use Semantic Names**: Create meaningful class names that describe the component purpose
3. **Leverage @apply**: Use `@apply` directive to combine Tailwind utilities into reusable classes
4. **Component Usage**: Reference global CSS classes directly in component templates

```svelte
<!-- ✅ RECOMMENDED PATTERN -->
<div class="quiz-container">
	<div class="quiz-header">
		<h2 class="text-2xl font-bold">Quiz Title</h2>
	</div>
</div>

<!-- ❌ DEPRECATED PATTERN -->
<div class="container">
	<style lang="postcss">
		@import "tailwindcss/utilities" reference;
		.container {
			@apply mx-auto max-w-4xl;
		}
	</style>
</div>
```

### Content Management System

**Data Structure**: TypeScript-based content with interface inheritance

- **Content Files**: TypeScript files in `src/data/` exporting typed objects
- **Type System**: BaseContent interface extended by specific content types
- **Component Integration**: Direct import and use with SvelteKit content renderers
- **Type Safety**: Compile-time validation of content structure

**TypeScript Interface Architecture**:

```typescript
// Base interface with common properties
export interface BaseContent {
	title: string;
	summary: string;
}

// Specific content types extending BaseContent
export interface LessonContent extends BaseContent {
	type: "lesson";
	sections: ContentSection[];
	prerequisites?: string[];
	estimatedTime?: number;
	learningObjectives?: string[];
}

export interface QuizContent extends BaseContent {
	type: "quiz";
	quiz: Quiz;
}

export interface StudyGuideContent extends BaseContent {
	type: "study_guide";
	studyGuide: StudyGuide;
}
```

**Content Renderer Components**:

- **LessonRenderer.svelte**: Displays lessons with metadata and structured sections
- **QuizRenderer.svelte**: Interactive quiz system with timer and progress tracking
- **StudyGuideRenderer.svelte**: Flashcard system with animations and modal support
- **Shared Components**: CodeBlock.svelte (Shiki), Mermaid.svelte, ContentSection.svelte

**Quiz/Exam Configuration**:

- **Quizzes**: Display 5 questions (configurable), store minimum 8 questions (1.5x ratio)
- **Exams**: Display 20 questions (configurable), store minimum 30 questions (1.5x ratio)
- Questions selected randomly from available pool for each attempt

### Legacy Content

**`src/book/` Directory**: Legacy HTML content

- Contains 183+ HTML files with vanilla CSS/JS architecture
- Marked for future removal after content migration
- Available for content reference during migration process
- `index.html` moved from root to `src/book/index.html` as legacy

**Migration Status**:

- **Current**: SvelteKit framework with TypeScript configured
- **Legacy**: HTML-based content system in `src/book/`
- **Target**: Full JSON-based content system in `src/data/`

### Development Environment

**Development Environment**: Node.js 22+ (LTS via `nvm install --lts`)

**Package Manager**: pnpm

- Fast, efficient package management with workspace support
- Lockfile-based dependency management
- Reduced disk space usage compared to npm

**Build System**: Vite (via SvelteKit)

- Fast development server with Hot Module Replacement (HMR)
- Optimized production builds with tree shaking
- Static site generation for GitHub Pages deployment
- TypeScript integration with fast type checking

**Code Quality Tools**:

- **ESLint**: JavaScript/TypeScript linting with SvelteKit rules
- **Prettier**: Code formatting with Svelte support (excludes src/book/ legacy directory)
- **TypeScript**: Type safety and enhanced developer experience
- **Svelte Check**: Component validation and accessibility checks

**Content Rendering Libraries**:

- **Shiki**: Server-side syntax highlighting supporting 200+ languages
- **Mermaid.js**: Client-side diagram rendering with fullscreen modal support
- **Progressive Enhancement**: SSR-compatible with client-side interactivity

### File Structure

```
src/
├── data/                     # Content data (TypeScript format)
│   ├── demo.ts              # Demo content showcasing components
│   ├── types.ts             # TypeScript interfaces with inheritance
│   ├── unit1/               # Unit-specific content files (future)
│   └── unit2/               # Unit-specific content files (future)
├── lib/                     # Reusable components and utilities
│   └── components/
│       └── content/         # Content renderer components
│           ├── shared/      # Shared components
│           │   ├── CodeBlock.svelte      # Shiki syntax highlighting
│           │   ├── Mermaid.svelte        # Diagram rendering
│           │   └── ContentSection.svelte # Reusable section renderer
│           ├── LessonRenderer.svelte     # Lesson display component
│           ├── QuizRenderer.svelte       # Interactive quiz system
│           └── StudyGuideRenderer.svelte # Flashcard system
│       ├── ui/              # shadcn-svelte UI components
│       └── utils.ts         # Utility functions
├── routes/                  # SvelteKit routes (file-based routing)
│   ├── demo/                # Demo route showcasing components
│   │   └── +page.svelte    # Demo page with all content renderers
│   ├── +layout.svelte      # Global layout
│   └── +page.svelte        # Home page
├── app.html                 # HTML template
├── app.d.ts                 # TypeScript declarations
└── book/ (legacy)           # Legacy HTML content for reference
```

### Deployment Architecture

**Target Platform**: GitHub Pages

- Static site generation (SSG) with SvelteKit adapter-static
- Automated deployment via GitHub Actions workflow
- Custom domain support with HTTPS
- CDN-optimized content delivery

**CI/CD Pipeline**:

1. **Validation**: SvelteKit check, lint, bash/python script validation
2. **Build**: Static site generation with optimized assets
3. **Deploy**: Automated GitHub Pages deployment
4. **Dependencies**: Validation workflow dependency for deployment

---

## USER EXPERIENCE STANDARDS

### Mobile-First Design

**Responsive Design Principles**:

- **Breakpoints**: 390px (mobile), 768px (tablet), 1024px+ (desktop)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Typography**: Fluid scaling using CSS `clamp()` and viewport units
- **Layout**: CSS Grid with mobile-first responsive patterns

**Performance Standards**:

- Fast loading times with optimized bundle sizes
- Progressive enhancement for better user experience
- Efficient content loading and caching strategies
- Minimal layout shift during page loads

**Modal Design Standards**:

- **Mobile First**: Full viewport coverage (100vh x 100vw) on mobile devices
- **Desktop**: Large modals (90-95% viewport) with minimal padding for maximum content visibility
- **Touch Targets**: Close buttons and controls easily accessible
- **Content Scrolling**: Vertical scroll for content that exceeds modal height
- **Responsive Behavior**: Adapts seamlessly across all screen sizes
- **Z-Index Management**: Proper layering to ensure modal visibility above all content

### Navigation System

**Hierarchical Structure**:

- **Book Overview** → **Unit Overview** → **Lessons** → **Study Aids** → **Quizzes**
- Breadcrumb navigation showing current position
- Sequential Previous/Next navigation with smart unit boundaries

### User Experience Requirements

**Essential Interactive Elements**:

- **Progress Tracking**: Dual progress bars (unit progress + overall progress) with mobile-optimized display
- **Search Functionality**: Full-text search with instant results and content previews
- **Navigation Controls**: Previous/Next buttons with smart unit boundary detection
- **Quiz/Exam Navigation**: Separate navigation system from page navigation:
  - Question-specific Previous/Next buttons (distinct from page navigation)
  - Progress indicator showing current question number
  - Final results display with Pass/Fail (80% threshold)
  - Restart button (return to question 1) or Continue button

**Interactive Elements**:

- **Mobile**: Collapsible hamburger menu with smooth animations
- **Desktop**: Persistent sidebar with unit toggles and topic lists
- **Search Integration**: Content discovery across all units and lessons

### Content Presentation

**Learning Flow**:

1. **Unit Overview**: Introduction, learning objectives, prerequisites
2. **Lesson Content**: Structured sections with rich HTML content
3. **Study Guides**: Interactive flashcard system (minimum 6 per lesson)
4. **Quizzes**: Randomized questions with explanations
5. **Exams**: Comprehensive unit assessments

**Interactive Features**:

- **Flashcards**: Modal-based review system with expandable fullscreen view for long definitions
- **Quiz Engine**: Single-question display with dedicated navigation controls
- **Exam System**: Comprehensive assessments with progress tracking and scoring
- **Mermaid Diagrams**: GitHub-style expandable diagrams with fullscreen modal
  - Expand icon for fullscreen view that maximizes screen real estate
  - Preferably LR (Left-Right) direction for vertical display
  - Touch/click to expand functionality with full viewport coverage
- **Modal System**: All modals should maximize screen usage
  - Fullscreen on mobile devices (100vh x 100vw)
  - Large modals on desktop with minimal padding
  - Responsive design that adapts to available screen space
  - Close button accessible but non-intrusive
- **Code Highlighting**: Prism.js integration for syntax highlighting
- **Progress Indicators**: Visual feedback on completion status
- **Search Integration**: Content discovery across all units and lessons

---

## DEVELOPMENT GUIDELINES

### Component Development

**shadcn-svelte Priority**:

```bash
# Always check component library first
pnpm dlx shadcn-svelte@latest add [component-name]
```

**Component Architecture**:

- Single-responsibility components with clear interfaces
- Props-based configuration for flexibility
- TypeScript interfaces for all component props
- Consistent naming conventions following SvelteKit patterns

**Development Standards**:

- **TypeScript First:** All components must use TypeScript with proper type definitions
- **Tailwind CSS:** Use utility-first approach with Tailwind classes for styling
- **Component Scoped Styles:** Use `<style lang="postcss">` for component-specific styling when needed
- **Accessibility:** Ensure proper ARIA labels, semantic markup, and keyboard navigation
- **Mobile-First:** Design components for mobile devices first, then enhance for desktop
- **Performance:** Use dynamic imports and lazy loading for optimal bundle sizes

**CRITICAL CSS/Style Rules** (Based on Tailwind CSS v4 Best Practices):

- **Centralized CSS Architecture**: ALL component styles defined in `src/app.css` using `@layer components`

  ```css
  /* app.css */
  @import "tailwindcss";

  @layer components {
  	.component-class {
  		@apply flex items-center gap-2;
  	}
  }
  ```

- **Component Development**: Components use global CSS classes exclusively, no `<style>` blocks

  ```svelte
  <!-- ✅ RECOMMENDED: Use global CSS classes -->
  <div class="component-class">
  	<span class="text-lg font-medium">Content</span>
  </div>

  <!-- ❌ DEPRECATED: Per-component @apply blocks -->
  <style lang="postcss">
  	@import "tailwindcss/utilities" reference;
  	.local-class {
  		@apply mb-6 text-lg;
  	}
  </style>
  ```

- **Official Tailwind Recommendation**: Avoid `<style>` blocks in component frameworks (Vue/Svelte/Astro)
  - **Reason**: Import reference syntax compatibility issues between dev/build environments
  - **Solution**: Use centralized CSS with `@layer components` for maintainable, consistent styling

**Svelte 5 Migration Rules** (Common Deprecation Issues):

- **Component References**: Replace deprecated `<svelte:component>` with direct component usage

  ```svelte
  <!-- ❌ DEPRECATED in Svelte 5 runes mode -->
  <svelte:component this={config.icon} size={16} />

  <!-- ✅ PREFERRED in Svelte 5 -->
  {#if config.icon === InfoIcon}<InfoIcon size={16} />{/if}
  <!-- Or use dynamic component pattern with stores -->
  ```

### Content Integration

**JSON Content Loading**:

```typescript
// SvelteKit page load function pattern
import type { LessonContent } from "$lib/types";

export async function load({ params }) {
	const lesson: LessonContent = await import(
		`../../../data/unit${params.unit}/${params.lesson}.json`
	);
	return {
		lesson: lesson.default
	};
}

// Utility function for direct content loading
export async function loadLesson(unitId: string, lessonId: string): Promise<LessonContent> {
	const content = await import(`../data/${unitId}/${lessonId}.json`);
	return content.default;
}
```

**Type Safety**:

- Defined interfaces for all content types
- Runtime validation for content structure
- Error boundaries for missing or malformed content

### Performance Optimization

**Bundle Optimization**:

- Code splitting at route level
- Dynamic imports for content files
- Tree shaking for unused dependencies
- Optimized asset delivery with proper caching headers

**Content Loading**:

- Lazy loading for non-critical components
- Preloading for improved perceived performance
- Progressive enhancement for better user experience

---

## SECURITY CONSIDERATIONS

### Content Security

**Input Sanitization**:

- HTML content sanitization for user-generated content
- XSS prevention measures in dynamic content rendering
- Secure handling of JSON content parsing

**Build Security**:

- Dependency vulnerability scanning in CI/CD pipeline
- Secure build environment with locked dependencies
- Environment variable protection and validation

---

## MIGRATION STRATEGY

### Current Status ✅

- **Framework**: SvelteKit with TypeScript configured
- **Components**: shadcn-svelte setup complete
- **Build System**: Vite with proper configuration
- **CI/CD**: GitHub Actions workflows updated for SvelteKit

### Next Steps

1. **Content Migration**: Convert HTML content to structured JSON format
2. **Component Implementation**: Build content display components
3. **Legacy Cleanup**: Remove `src/book/` after migration completion
4. **Feature Enhancement**: Advanced interactive features and optimizations

---

## VALIDATION AND TESTING

### Automated Validation

- **SvelteKit Check**: Type safety and component validation
- **ESLint**: Code quality and consistency checks
- **Script Validation**: Bash and Python script testing
- **Content Validation**: JSON structure and integrity checks

### Testing Standards

- Unit tests for utility functions and components
- Integration tests for content loading and display
- End-to-end tests for user workflows
- Performance testing for loading times and responsiveness

**Testing Commands**:

```bash
pnpm run check    # SvelteKit validation
pnpm run lint     # Code linting
pnpm run test     # Run test suite
make validate     # Full validation pipeline
```

---

## DEVELOPMENT TROUBLESHOOTING

### Common Issues & Solutions

#### 1. **Vite Watch Performance Issues**

**Problem**: Vite scanning unnecessary files (`.md`, legacy content)

**Solution**: Configure `vite.config.ts`:

```typescript
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		watch: {
			ignored: [
				"**/*.md",
				"src/book/**", // legacy directory
				"node_modules/**",
				".git/**"
			]
		}
	}
});
```

#### 2. **TypeScript Legacy File Validation Errors**

**Problem**: `svelte-check` validates legacy JS files with 300+ errors

**Solution**: Exclude legacy directory in `tsconfig.json`:

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"exclude": [
		"src/book/" // exclude legacy content
	]
}
```

#### 3. **Tailwind CSS v4 Architecture Migration**

**Previous Issue**: "Cannot apply unknown utility class 'mb-6'" and "@import reference syntax errors"

**Root Cause**: Per-component @import reference syntax incompatible between development (svelte-check) and production (vite build) environments

**Solution**: **Centralized CSS Architecture**

- **Main CSS file** (`src/app.css`):

  ```css
  @import "tailwindcss";

  @layer components {
  	.component-class {
  		@apply flex items-center gap-2;
  	}
  }
  ```

- **SvelteKit Components**: Use global CSS classes exclusively, no `<style>` blocks with @apply

  ```svelte
  <!-- ✅ CURRENT ARCHITECTURE -->
  <div class="component-class">Content</div>

  <!-- ❌ DEPRECATED APPROACH -->
  <style lang="postcss">
  	@import "tailwindcss/utilities" reference;
  	.local-class {
  		@apply flex;
  	}
  </style>
  ```

#### 4. **CSS Architecture Benefits**

**Migration Completed**: All components now use centralized CSS approach

**Benefits Achieved**:

- ✅ **Zero Compilation Errors**: Eliminated all @import reference syntax issues
- ✅ **Single Source of Truth**: All component styles defined in `app.css` `@layer components`
- ✅ **Official Best Practice**: Follows Tailwind CSS v4 recommendations for component frameworks
- ✅ **Build/Dev Compatibility**: Consistent behavior across all environments
- ✅ **Maintainability**: Centralized styling easier to maintain and debug

#### 5. **Svelte 5 Component Deprecation Warnings**

**Problem**: "`<svelte:component>` is deprecated in runes mode"

**Solution**: Replace with conditional rendering or component stores

````svelte
<!-- ❌ DEPRECATED -->
<svelte:component this={config.icon} size={16} />

<!-- ✅ PREFERRED PATTERNS -->
{#if config.icon === InfoIcon}<InfoIcon size={16} />{/if}
<!-- Or use dynamic imports with component mapping -->

#### 4. **SvelteKit Path Alias Issues**

**Problem**: "Cannot find module '$data/types'"

**Solution**: Configure alias in `svelte.config.js`:
```javascript
export default {
  kit: {
    adapter: adapter(),
    alias: {
      $data: 'src/data'
    }
  }
};
````

#### 5. **Cache-Related Build Issues**

**Problem**: Stale cache causing persistent errors

**Solution**: Clear all caches:

```bash
rm -rf node_modules/.vite .svelte-kit
pnpm run prepare  # regenerate SvelteKit config
```

#### 6. **Unused CSS Selector Warnings for Component Libraries**

**Problem**: "Unused CSS selector .metadata-item svg" when styling external component icons

**Root Cause**: Svelte can't detect SVG elements generated by external components (Lucide, etc.) during compilation

**Solution**: Use `:global()` modifier for external component styles

```svelte
<!-- ❌ CAUSES UNUSED SELECTOR WARNING -->
.metadata-item svg apply text-gray-500; }

<!-- ✅ CORRECT FOR EXTERNAL COMPONENTS -->
.metadata-item :global(svg) apply text-gray-500; }
```

#### 7. **Deprecated CSS Import Approach**

**Historical Context**: Previously used per-component @import approach caused compatibility issues

**Migration Completed**: All components now use centralized CSS architecture

**Current Approach**: All component styles defined in `src/app.css` using `@layer components`

```css
/* src/app.css */
@import "tailwindcss";

@layer components {
	.component-class {
		@apply text-gray-500;
	}
}
```

**Component Usage**: Reference global CSS classes directly

```svelte
<!-- ✅ CURRENT APPROACH -->
<div class="component-class">Content</div>

<!-- ❌ DEPRECATED APPROACH -->
<style lang="postcss">
	@import "tailwindcss/utilities" reference;
	.class {
		@apply mb-4;
	}
</style>
```

#### 8. **Lucide Icon Deprecation Warnings**

**Problem**: VS Code showing deprecation warnings for `AlertTriangle` and other renamed icons

**Root Cause**: Lucide library renamed several icons in recent versions for consistency

**Solution**: Update to new icon names

```svelte
<!-- ❌ DEPRECATED ICONS -->
import {AlertTriangle} from "lucide-svelte";

<!-- ✅ CURRENT ICON NAMES -->
import {TriangleAlert} from "lucide-svelte";
```

**Common Icon Renames**:

- `AlertTriangle` → `TriangleAlert`
- `AlertCircle` → `CircleAlert`
- `CheckCircle` → `CircleCheck`
- `XCircle` → `CircleX`
- Check [Lucide documentation](https://lucide.dev) for latest icon names

**Migration Pattern**:

```svelte
<!-- ❌ DEPRECATED ICONS -->
import {(AlertCircle, CheckCircle, AlertTriangle, XCircle)} from "lucide-svelte";

<!-- ✅ CURRENT ICON NAMES -->
import {(CircleAlert, CircleCheck, TriangleAlert, CircleX)} from "lucide-svelte";
```

#### 9. **Tailwind CSS v4 Component Style Architecture Issues**

**Problem**: Component-specific `@apply` styles in `<style>` blocks cause build failures

**Error Examples**:
- `Cannot apply unknown utility class 'max-w-4xl'` from individual Svelte components
- `Cannot apply unknown utility class 'bg-opacity-50'` (deprecated v4 syntax)
- `Cannot apply unknown utility class 'perspective-1000'` (missing custom utility)

**Root Cause**: Tailwind CSS v4 with SvelteKit requires centralized CSS architecture

**Critical Component Development Requirements**:

**1. Centralized CSS Architecture**:
```css
/* src/app.css - ALL component styles defined here */
@import "tailwindcss";
@theme {
	--perspective-1000: 1000px;
}

@layer components {
	.lesson-content {
		@apply mx-auto max-w-4xl px-4 py-6;
	}

	.study-guide-container {
		@apply mx-auto max-w-4xl px-4 py-6;
	}
}
```

**2. Component Implementation**:
```svelte
<!-- ✅ CORRECT: Use centralized CSS classes -->
<article class="lesson-content {className}">
	<header class="lesson-header">
		<h1 class="lesson-title">{title}</h1>
	</header>
</article>

<!-- ❌ CAUSES BUILD ERRORS: Per-component @apply blocks -->
<article class="custom-component">
	<style lang="postcss">
		.custom-component {
			@apply mx-auto max-w-4xl; /* FAILS IN TAILWIND V4 */
		}
	</style>
</article>
```

**3. Tailwind v4 Syntax Updates**:
- `bg-opacity-50` → `bg-black/50`
- `bg-blue-900 bg-opacity-20` → `bg-blue-900/20`
- Define custom utilities in `@theme` block, not config file

**Essential Files Configuration**:
```javascript
// tailwind.config.js (required for content scanning)
export default {
	content: ["./src/**/*.{html,js,svelte,ts}", "./src/**/*.svelte", "./src/app.html"]
};
```

**Component Construction Rule**: Remove ALL `<style>` blocks with `@apply` from Svelte components and use centralized classes from `app.css`.

#### 10. **Tailwind CSS v4 Import Syntax Errors**

**Problem**: "Expected token ;" syntax errors in component style blocks

**Root Cause**: Tailwind CSS v4 has stricter import syntax requirements than v3

**Solution**: Remove `reference` keyword from import statements

```css
<!-- ❌ INCORRECT SYNTAX (causes compilation errors) -->
<style lang="postcss">
	@import "tailwindcss/utilities" reference;
	.class { @apply bg-blue-500; }
</style>

<!-- ✅ CORRECT SYNTAX -->
<style lang="postcss">
	@import "tailwindcss/utilities";
	.class { @apply bg-blue-500; }
</style>
```

**Critical Rule**: In Tailwind CSS v4, always use `@import "tailwindcss/utilities";` without the `reference` keyword to avoid syntax errors.

### Performance Optimization Checklist

**PostCSS Integration**:

- **PostCSS** is automatically installed as a transitive dependency of Tailwind CSS v4
- **Not required to install manually** - comes with `tailwindcss@^4.0.0` package
- **Purpose**: Processes CSS transformations, enables `@apply` directive functionality
- **Configuration**: No additional config needed when using `@tailwindcss/vite` plugin

**shadcn-svelte Component Installation Process**:

1. **Install Component**: `pnpm dlx shadcn-svelte@latest add [component-name]`
2. **Update Setup Script**: Add installation command to `src/bash/setup.sh`
3. **Import in Components**: `import * as ComponentName from "$lib/components/ui/component-name";`
4. **Usage Pattern**: Use component API as documented in bits-ui library

**Example shadcn-svelte Dialog Integration**:

```svelte
import * as Dialog from "$lib/components/ui/dialog";

<Dialog.Root>
	<Dialog.Trigger class="my-button">Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Title</Dialog.Title>
		</Dialog.Header>
		<!-- Content -->
	</Dialog.Content>
</Dialog.Root>
```

### Performance Optimization Checklist

- [ ] Legacy directories excluded from TypeScript validation
- [ ] Vite watch ignoring unnecessary file patterns
- [ ] Centralized CSS architecture implemented in `app.css` with `@layer components`
- [ ] All component-specific styles moved to `app.css` (no per-component `@apply` blocks)
- [ ] SvelteKit path aliases properly configured
- [ ] Development server starts without errors
- [ ] Hot module replacement working correctly
