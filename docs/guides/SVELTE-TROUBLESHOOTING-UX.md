# SvelteKit Troubleshooting & UX Standards Guide

**Common issues, user experience standards, mobile-first design, and demo implementation for the Cloud-Native Learning Platform.**

> **📚 Navigation:**
>
> - [← Back to Index](./SVELTEKIT-INDEX.md)
> - [← Previous: Development](./SVELTE-DEVELOPMENT.md)

---

## COMMON TROUBLESHOOTING

### Tailwind CSS v4 Issues

**Problem**: Build failures with `Cannot apply unknown utility class`

**Solution**:

1. Move custom styles to modular CSS files in `src/styles/`
2. Use `@layer components` for custom classes
3. Never use `@apply` in Svelte component `<style>` blocks

**See Also**: [SVELTE-STYLING.md](./SVELTE-STYLING.md#css-architecture-standards) for complete CSS architecture guidelines

### Svelte 5 Migration Issues

**Problem**: Deprecated syntax errors and code quality issues

**Solution**:

- Replace `export let` with `let { prop }: Props = $props()`
- Replace `$:` reactivity with `$derived()` or `$effect()`
- Use `$state()` for reactive variables
- Remove all unused variables and imports
- Update deprecated Lucide icons (e.g., `AlertTriangle` → `TriangleAlert`)
- Address all TypeScript warnings and errors before completion

**See Also**: [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md#svelte-5-critical-syntax) for Svelte 5 runes syntax

### Performance Issues

**Common Problems**:

- Large bundle sizes from unused component imports
- Inefficient reactivity patterns
- Missing optimization for production builds

**Solutions**:

- Use selective imports from component libraries
- Implement proper error boundaries
- Optimize images and assets for web delivery
- Use SvelteMap/SvelteSet for reactive collections (see [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md#svelte-5-reactive-collections))

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

**See Also**: [SVELTE-STYLING.md](./SVELTE-STYLING.md#responsive-breakpoints) for complete responsive design patterns

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

**See Also**: [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md#ui-components) for shadcn-svelte usage

**Navigation Standards**:

- **Sidebar Accordion**: Only one unit can be open at a time (accordion behavior)
- **Breadcrumb Navigation**: Dynamic breadcrumbs based on current content state:
  - Home view: Site title only
  - Unit view: Unit name with home link
  - Chapter view: Unit name and chapter name

**See Also**: [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md#global-navigation-architecture) for complete navigation patterns

### Interactive Element Requirements (🚨 MANDATORY)

All interactive elements (buttons, links, clickable areas) **MUST** provide clear visual feedback to users:

**1. Cursor Indication**:

- ✅ `cursor-pointer` class on all clickable elements
- ✅ Apply to: buttons, links, cards, list items, icons
- ❌ Never leave interactive elements with default cursor

**2. Hover State Feedback** (choose at least one):

- ✅ Background color change: `hover:bg-accent`, `hover:bg-gray-100`
- ✅ Scale transformation: `hover:scale-105`, `hover:scale-110`
- ✅ Border changes: `hover:border-primary`, `hover:ring-2`
- ✅ Color changes: `hover:text-primary`, `hover:text-foreground`
- ✅ Shadow effects: `hover:shadow-md`, `hover:shadow-lg`

**3. Transition Smoothness**:

- ✅ Add `transition-all`, `transition-colors`, or `transition-transform`
- ✅ Recommended duration: default (150ms) or `duration-200`

**4. Examples**:

```svelte
<!-- Button with scale and background -->
<Button class="cursor-pointer transition-all hover:scale-110 hover:bg-accent">

<!-- Link with color change -->
<a href="#" class="cursor-pointer transition-colors hover:text-primary">

<!-- Card with shadow effect -->
<div class="cursor-pointer transition-shadow hover:shadow-md">
```

**5. Why This Matters**:

- **User Experience**: Clear feedback confirms interactivity
- **Accessibility**: Helps users with motor impairments identify clickable areas
- **Consistency**: Unified interaction patterns across the application
- **Professionalism**: Polished, production-ready feel

### Quiz System

- **Explanation Timing**: Explanations are withheld until quiz completion
- **Results Display**: Comprehensive review with all answers and explanations shown after completion
- **Progress Tracking**: Use standardized Progress component for quiz completion tracking

### Theming Standards

- **Color Palette**: Primary theme uses Tailwind CSS slate palette for consistency
- **Code Blocks**: Enhanced with visible container borders (`border-slate-300`) and theme-aligned backgrounds (`bg-slate-50`)
- **Icon Consistency**: All metadata icons (Prerequisites, Learning Objectives) use consistent `text-slate-500` coloring
- **Component Styling**: Standardized styling across all interactive components with consistent hover states and transitions

**See Also**: [SVELTE-STYLING.md](./SVELTE-STYLING.md#theming--styling) for theme customization

---

## DEMO IMPLEMENTATION PLAN

### Demo Data Architecture

**Data-Driven Approach**: All demo content stored in TypeScript files within `src/data/demo/` for easy identification and cleanup. Use `$data` alias for cleaner imports (`$data` → `src/data/`).

**Key Structure**:

- `$data/demo/types.ts` - TypeScript interfaces for demo components
- `$data/demo/navigation/` - Sidebar and breadcrumb configuration
- `$data/demo/content/` - Demo units and component examples
- `$data/demo/config/` - Route definitions and feature flags

**Import Examples:**

```typescript
// ✅ PREFERRED: Using $data alias
import { demoSidebarMenu } from "$data/demo/navigation/demo-sidebar-menu";
import { searchIndex } from "$data/demo/search/search-index";

// ✅ ALTERNATIVE: Direct path (less preferred)
import { demoSidebarMenu } from "src/data/demo/navigation/demo-sidebar-menu";
```

**Core Interfaces**: `DemoUnit`, `DemoLesson`, `ComponentDemo` with full TypeScript support.

**Organization Strategy**:

- Prefix-based naming (`demo-*`) for easy identification
- Isolated dependencies in separate namespace
- Hash-based SPA navigation without page redirects
- Cleanup commands available for future removal

**See Also**: [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md#unified-typescript-architecture) for type system integration

### Target Component Set

**Navigation & Layout**:

- Sticky header with breadcrumbs
- Collapsible sidebar (sidecard)
- Mobile-responsive navigation

**Interactive Elements**:

- Dark mode toggle with system preference detection
- Search box with live filtering
- Progress indicators and navigation buttons

**Content Display**:

- Mermaid diagrams with various chart types
- Syntax-highlighted code blocks
- Interactive flip cards for concepts
- Modal dialogs for detailed information

**Educational Components**:

- Quiz interface with timer and scoring
- Study guide flashcards
- Progress tracking visualizations

---

## Related Guides

- **Previous**: [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) - Development patterns and testing
- **Also See**: [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md) - Core technology stack
- **Also See**: [SVELTE-STYLING.md](./SVELTE-STYLING.md) - CSS architecture and responsive design
- **Also See**: [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) - Component development and navigation

---

**[← Back to Index](./SVELTEKIT-INDEX.md)**
