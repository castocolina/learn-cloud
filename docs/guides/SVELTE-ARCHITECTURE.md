# SvelteKit Architecture & Setup Guide

**Project foundation, core technology stack, and file structure for the Cloud-Native Learning Platform.**

> **📚 Navigation:**
>
> - [← Back to Index](./SVELTEKIT-INDEX.md)
> - [Next: Styling Guide →](./SVELTE-STYLING.md)

---

## CRITICAL TESTING REQUIREMENT

**🚨 MANDATORY**: All agents modifying web assets (HTML, CSS, JS, Svelte components) **MUST**:

1. **Execute complete validation cycle** after any changes:

   ```bash
   make check-wip    # Fast validation of modified files (mandatory first step)
   pnpm run test     # Execute tests
   pnpm run format   # Code formatting
   pnpm run lint     # Code quality
   pnpm run check    # SvelteKit validation
   pnpm run dev      # Development server test
   ```

2. **Continue testing until ZERO errors** are achieved
3. **Document any persistent issues** as inline comments in affected components
4. **Update this document** when discovering new architectural requirements

**Rationale**: Tailwind CSS v4 + Svelte 5 combination has specific compatibility requirements that cause runtime failures if not properly validated.

---

## PROJECT ARCHITECTURE

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

**Code Quality Requirements**:

```typescript
// ✅ CORRECT: Clean imports, no unused variables
import { Button } from "$lib/components/ui/button";
import { ChevronRight } from "lucide-svelte";

// ❌ INCORRECT: Unused imports, deprecated components
import { Button } from "$lib/components/ui/button";
import { AlertTriangle } from "lucide-svelte"; // Deprecated! Use TriangleAlert
import { Card } from "$lib/components/ui/card"; // Unused import
```

**Styling**: Tailwind CSS v4 with **Modular Architecture**

- **CRITICAL**: Follow modular CSS architecture detailed in [SVELTE-STYLING.md](./SVELTE-STYLING.md#css-architecture-standards)
- **NEVER**: Use `<style>` blocks with `@apply` in Svelte components
- **Reason**: [Official Tailwind recommendation](https://tailwindcss.com/docs/compatibility#vue-svelte-and-astro) to avoid performance issues
- Single CSS import: `@import "tailwindcss";`
- CSS-based configuration using `@theme` directive
- Centralized component styles in `src/app.css`

**UI Components**: `shadcn-svelte`

- **Installation**: `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Priority**: Always check component library before building custom components
- **Mandatory Usage**: Progress bars and modal dialogs MUST use shadcn components
  - Progress: Use `shadcn-svelte` Progress component instead of custom progress bars
  - Modals: Use `shadcn-svelte` Dialog component instead of custom modal implementations
- Copy-paste component system with full customization
- Built on Bits UI primitives for accessibility
- Tailwind CSS integration for theming

**shadcn-svelte Component Handling Strategy**:

- **❌ Do NOT document**: shadcn-svelte components directly (they are third-party code)
- **❌ Do NOT format**: Components in `src/lib/components/ui/` are excluded from Prettier formatting
- **✅ Do validate**: TypeScript validation still applies to ensure code quality
- **✅ General documentation**: CSS patterns, z-index hierarchies, and architectural decisions belong in this guide
- **✅ Component-specific issues**: Document in custom wrapper components or this architecture guide
- **⚠️ Updates**: When updating shadcn-svelte components, any custom documentation would be lost

**Tailwind Important Modifier (`!`) for shadcn-svelte Customization**:

When customizing shadcn-svelte components, use the `!` prefix to override default styles. The browser uses **CSS specificity** to decide which styles to apply - when two classes have the same specificity (like `.gap-2` vs `.gap-1`), the browser applies the **last one in the compiled CSS**. shadcn-svelte may inject its styles after ours, causing its classes to "win". The `!` prefix adds `!important` to the CSS, giving it **maximum specificity** - it always wins regardless of order.

**Usage Example**:

```svelte
<!-- Wrapper component: MainSidebar.svelte -->
<Sidebar.Menu class="!gap-2">  <!-- Overrides shadcn default gap-1 -->
<Sidebar.MenuButton class="!p-4 !min-h-14 !h-auto">  <!-- Overrides p-2, h-8 -->
```

**Where to apply**: ✅ Wrapper components only | ❌ Never in `src/lib/components/ui/` (third-party files)

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

### File Structure Deep Dive

```
src/
├── app.html                 # HTML template (root document)
├── app.css                  # Centralized CSS architecture
├── data/                    # Content data (TypeScript format)
│   ├── types.ts            # TypeScript interfaces with inheritance
│   └── content-menu.ts     # Generated navigation structure
├── lib/
│   └── components/
│       ├── content/        # Content renderer components
│       │   ├── LessonRenderer.svelte
│       │   ├── QuizRenderer.svelte
│       │   └── StudyGuideRenderer.svelte
│       ├── ui/             # shadcn-svelte UI components
│       │   ├── button/
│       │   ├── card/
│       │   ├── dialog/
│       │   └── sidebar/
│       └── shared/         # Shared utility components
├── routes/                 # SvelteKit routes (file-based routing)
│   ├── +page.svelte       # Homepage
│   ├── +layout.svelte     # Root layout
│   └── demo/              # Demo route (to be created)
└── bash/                  # Development scripts
    └── setup.sh           # Environment setup script
```

#### Key Files Explained

**`app.html`** - HTML Document Template

- Root HTML structure for the entire application
- Contains `%sveltekit.head%` and `%sveltekit.body%` placeholders
- Defines meta tags, favicons, and global HTML attributes

**`app.css`** - Centralized CSS Architecture

```css
@import "tailwindcss";

@layer components {
	.component-class {
		@apply flex items-center gap-2;
	}
}
```

- Single Tailwind CSS v4 import
- All component styles using `@layer components`
- Theme configuration via `@theme` directive

**`+page.svelte`** - Page Components

- Represents individual routes in file-based routing
- Contains page-specific logic and UI
- Can export `load` functions for data fetching

**`+layout.svelte`** - Layout Components

- Wraps pages with common UI elements
- Defines shared state and navigation
- Inherited by child routes

#### The `src/lib` Directory Strategy

The `lib` directory serves as the component library and utility hub:

**`src/lib/components/`** - Component Organization

- **`content/`**: Educational content renderers (LessonRenderer, QuizRenderer, StudyGuideRenderer)
- **`ui/`**: shadcn-svelte UI components (buttons, cards, modals, forms)
- **`shared/`**: Reusable utility components (icons, loading states, error boundaries)

**Best Practices for `src/lib`**:

- Use TypeScript interfaces for all component props
- Follow single responsibility principle
- Create composable, reusable components
- Maintain clear naming conventions (PascalCase for components)

---

## Common Theme Adjustments

- **Dark Mode Support**: Add CSS variables for dark theme variants
- **Custom Colors**: Extend theme with brand-specific color palette
- **Typography Scale**: Configure font sizes and line heights
- **Spacing System**: Customize spacing scale for component consistency

**Troubleshooting Theme Issues:**

```bash
# If build fails after theme changes
pnpm run check  # Check TypeScript errors
pnpm run build  # Verify production build
```

**Important Notes:**

- Never use `@apply` in Svelte component `<style>` blocks with Tailwind v4
- All custom styles must be in `src/app.css` using `@layer components`
- Theme variables must be defined in the `@theme` directive for Tailwind v4 compatibility

---

## Related Guides

- **Next**: [SVELTE-STYLING.md](./SVELTE-STYLING.md) - CSS architecture, layout, and theming
- **Also See**: [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) - Component development patterns
- **Also See**: [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) - Development standards and testing

---

**[← Back to Index](./SVELTEKIT-INDEX.md)**
