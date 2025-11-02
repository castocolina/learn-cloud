# SvelteKit Styling & Layout Guide

**CSS architecture, Tailwind v4 integration, layout patterns, and theming for the Cloud-Native Learning Platform.**

> **📚 Navigation:**
>
> - [← Back to Index](./SVELTEKIT-INDEX.md)
> - [← Previous: Architecture](./SVELTE-ARCHITECTURE.md) | [Next: Components →](./SVELTE-COMPONENTS.md)

---

## CSS ARCHITECTURE STANDARDS

**MANDATORY: Modular CSS Architecture for SvelteKit Components**

**Core Principle**: All custom component styles MUST be organized in modular CSS files and imported into `src/app.css`

**Required File Structure**:

```
src/styles/
├── components.css      # Custom Svelte component styles
├── utilities.css       # Custom utility classes
├── layout.css         # SvelteKit layout-specific styles
├── variables.css      # Custom CSS variables and theme tokens
└── shadcn-overrides.css   # shadcn-svelte customizations (minimal use)
```

**CSS Import Order in `src/app.css`**:

```css
@import "tailwindcss";
@import "./styles/variables.css";    # Theme variables first
@import "./styles/components.css";   # Component styles
@import "./styles/utilities.css";    # Utility classes
@import "./styles/layout.css";      # Layout styles
@import "./styles/shadcn-overrides.css";   # shadcn overrides (if needed)
/* shadcn-svelte theme variables follow */
```

**SvelteKit Component Integration Rules**:

- ✅ **ALWAYS** define custom styles in separate CSS files with `@layer components`
- ✅ **ALWAYS** use semantic class names with project prefixes (`app-`, `lesson-`, `quiz-`)
- ✅ **ALWAYS** import styles via `src/app.css` for global availability
- ✅ **ALWAYS** use CSS custom properties for theming consistency
- ❌ **NEVER** put custom component styles directly in `src/app.css`
- ❌ **NEVER** use `<style>` blocks in Svelte components with `@apply` (Tailwind v4 incompatible)
- ⚠️ **AVOID** inline styles for presentational styling in Svelte component templates
- ✅ **ALLOWED**: Inline styles ONLY for CSS custom property values: `style="--var-name: value"`
- ✅ **ALLOWED**: Dynamic SETTINGS values: `style="--width: {SETTINGS.ui.modal.width}vw"`
- ❌ **FORBIDDEN**: Presentational inline styles: `style="color: red; font-size: 16px"`

**Color Centralization Standards (MANDATORY)**:

- ✅ **ALWAYS** define ALL color values in `src/app.css` `:root` block as CSS variables
- ✅ **ALWAYS** reference colors using `hsl(var(--variable-name))` syntax
- ✅ **ALWAYS** use HSL format (not RGB or hex) for color variables: `--color-name: 215 65% 44%`
- ❌ **NEVER** define hex colors directly in components.css (e.g., `#3776ab`, `#ff6b6b`)
- ❌ **NEVER** define rgb/hsl colors directly in components.css (e.g., `rgb(255, 0, 0)`, `hsl(215, 65%, 44%)`)
- ❌ **NEVER** use inline hex/rgb/hsl colors in Svelte templates
- **Rationale**: Centralizing colors in `:root` enables theme changes in one location, automatic dark mode support, and consistent color usage across all components
- **Example**: Technology brand colors (`--tech-python`), semantic colors (`--primary`, `--warning`), content type colors (`--header-lesson-bg`)
- **Location**: See `src/app.css` lines 56-208 for complete color variable definitions

**Rationale for Inline Styles Exception:**

The codebase uses inline styles for CSS custom properties (z-index hierarchy, dialog sizing) as documented in `src/styles/shadcn-overrides.css` and `src/styles/components.css`. This pattern is acceptable because:

- Custom properties are configuration, not presentation
- Enables dynamic values from SETTINGS
- Maintains separation of concerns (values vs styles)
- Aligns with CSS architecture standards

**:global() Scoping Rules (CRITICAL)**:

- ✅ **ONLY USE** `:global()` in Svelte component `<style>` blocks to escape scoping
- ❌ **NEVER USE** `:global()` in external CSS files (`src/styles/*.css`, `src/app.css`)
- **Reason**: External CSS files are already global when imported via `app.css`
- **Problem**: `:global()` in external CSS may not compile correctly, causing selectors to fail silently

**Example:**

```css
/* ✅ CORRECT in external CSS files (src/styles/*.css) */
[data-state="collapsed"] .sidebar-unit-icon {
	font-size: 1.75rem;
}

/* ❌ INCORRECT in external CSS files - selectors won't apply */
:global([data-state="collapsed"]) .sidebar-unit-icon {
	font-size: 1.75rem;
}
```

```svelte
<!-- ✅ CORRECT in Svelte component <style> blocks -->
<style>
	:global([data-state="collapsed"]) .my-component {
		/* Escapes Svelte's CSS scoping */
	}
</style>
```

**SvelteKit-Specific Benefits**:

- ✅ Single CSS bundle with optimal build performance
- ✅ Global class availability across all routes and components
- ✅ Eliminates Tailwind v4 + Svelte compatibility issues
- ✅ Better maintainability with modular organization
- ✅ Consistent theming across component library integrations

**Z-Index Hierarchy Standards (CRITICAL ISSUE PREVENTION)**:

**Global Z-Index Hierarchy**: All components MUST use CSS custom properties for z-index values to prevent stacking context violations.

```css
/* Define in src/app.css */
:root {
	--z-base: 1;
	--z-dropdown: 10;
	--z-sticky: 50;
	--z-sidebar: 90;
	--z-header: 100;
	--z-overlay: 200;
	--z-modal: 210;
	--z-popover: 300;
	--z-toast: 400;
}

/* ✅ CORRECT: Use CSS custom properties */
.demo-header-sticky {
	z-index: var(--z-header);
}

/* ❌ INCORRECT: Hardcoded z-index values */
.demo-header-sticky {
	z-index: 50;
}
```

**Stacking Context Issue Prevention**:

- **Root Cause**: Transform properties on navigation items create new stacking contexts
- **Symptoms**: Modals/dialogs appearing behind active sidebar navigation items
- **Prevention**: Use `margin` instead of `transform` for visual positioning
- **Solution**: Always use shadcn-svelte Dialog components with proper z-index hierarchy
- **Avoid**: `transform`, `opacity < 1`, `filter`, or `position: relative` with z-index on navigation items

---

## CSS PRECEDENCE & OVERRIDE HIERARCHY

**Understanding CSS Cascade Order in This Project**

**File Load Order** (defines cascade hierarchy):

```css
1. Tailwind CSS (base → components → utilities)
2. src/app.css (theme variables, global utilities)
3. src/styles/layout.css
4. src/styles/navigation.css
5. src/styles/components.css
6. src/styles/shadcn-overrides.css  ← Final override power
```

**Why This Matters:**

CSS applies styles based on specificity and source order. Files loaded later can override earlier styles if they have equal or higher specificity. The `shadcn-overrides.css` file loads last to ensure custom modifications to shadcn components take precedence.

### Override Strategies

**Strategy 1: File Position (Recommended)**

Place overrides in the appropriate file based on load order:

```css
/* src/styles/shadcn-overrides.css - Loads last, highest override power */
[data-slot="tooltip-content"],
.tooltip-content {
	/* Uses 'background' shorthand to fully override
	   any previous background declarations from components.css */
	background: hsl(var(--popover)) !important;
}
```

**Use Case:** shadcn component customizations that must override default styles

**Strategy 2: Property Shorthand**

Use shorthand properties to override longhand properties:

```css
/* Shorthand property overrides longhand */
.element {
	background: blue; /* Overrides background-color, background-image, etc. */
}

/* Previous longhand is overridden */
.element {
	background-color: red; /* Overridden by shorthand above */
}
```

**Example from codebase:**

- Tooltip background uses `background` shorthand to override earlier `background-color` declarations
- Documented in `src/styles/shadcn-overrides.css:228-230`

**Strategy 3: !important (Strategic Use Only)**

Use `!important` sparingly for critical overrides:

```css
/* Z-index hierarchy enforcement */
header[style*="--z-header"] {
	background-color: hsl(var(--background)) !important;
	backdrop-filter: none !important;
	opacity: 1 !important;
}
```

**Valid Use Cases:**

- Z-index hierarchy enforcement (overrides inline styles from components)
- Layout constraints in responsive contexts (max-width for mobile)
- Brand color preservation (technology-specific accent borders)
- shadcn component overrides when necessary

**⚠️ Warning:** Avoid `!important` for general styling - it indicates specificity issues that should be resolved through better selectors or file ordering.

**Strategy 4: @layer Components**

Wrap custom component styles in `@layer components`:

```css
/* src/styles/components.css */
@layer components {
	.custom-button {
		@apply hover:bg-primary-dark bg-primary;
	}
}
```

**Benefits:**

- Ensures proper cascade order with Tailwind utilities
- Tailwind utility classes can still override your component styles
- Maintains predictable specificity hierarchy

### Browser vs Tailwind Class Precedence

**Key Principle:** When two classes have the same specificity, the browser applies the **last one in the compiled CSS**.

**Common Scenario:**

```svelte
<!-- Classes applied in component -->
<div class="gap-2 custom-gap">

<!-- If compiled CSS has this order: -->
<style>
  .gap-2 { gap: 0.5rem; }        /* From Tailwind */
  .custom-gap { gap: 1rem; }     /* From your CSS */
</style>

<!-- Result: gap: 1rem (custom-gap wins because it comes after) -->
```

**Problem with shadcn-svelte:**

shadcn components may inject their styles after your custom CSS, causing their classes to "win" even if you applied them first in the HTML.

**Solution: Tailwind Important Modifier (!)**

```svelte
<Sidebar.Menu class="!gap-2">
<!-- Compiles to: gap: 0.5rem !important; -->
<!-- Now it wins regardless of order -->
```

### Specific Precedence Patterns

**Pattern 1: Tooltip Background Override**

```css
/* src/styles/shadcn-overrides.css:228-230 */
/**
 * CRITICAL: Uses 'background' shorthand (not 'background-color') to fully
 * override any previous background declarations from components.css
 */
[data-slot="tooltip-content"],
.tooltip-content {
	background: hsl(var(--popover)) !important;
}
```

**Why:** Earlier file (`components.css`) set `background-color`, which would conflict. Shorthand `background` resets all background properties.

**Pattern 2: Z-Index Hierarchy Enforcement**

All z-index values use CSS custom properties defined in `:root`. Components set z-index via inline styles with custom property values:

```svelte
<!-- Component sets z-index dynamically -->
<header style="z-index: var(--z-header)">

<!-- CSS can override with !important if needed -->
<style>
  header[style*="--z-header"] {
    z-index: var(--z-header) !important;  /* Ensures hierarchy consistency */
  }
</style>
```

**Pattern 3: Technology Brand Colors**

**CRITICAL RULE: ALL colors MUST be centralized in `src/app.css` `:root` block**

Technology brand colors are defined as CSS variables for easy theme management:

```css
/* src/app.css - :root block */
:root {
	/* Technology brand colors - centralized for easy theme changes */
	--tech-python: 215 65% 44%; /* #3776ab - Python blue */
	--tech-go: 191 100% 42%; /* #00add8 - Go cyan */
	--tech-rust: 9 64% 48%; /* #ce422b - Rust orange */
	--tech-cloud: 217 89% 61%; /* #4285f4 - Cloud/GCP blue */
	--tech-graphql: 330 87% 47%; /* #e10098 - GraphQL pink */
	--tech-kubernetes: 220 64% 54%; /* #326ce5 - Kubernetes blue */
	--tech-docker: 203 84% 55%; /* #2496ed - Docker blue */
	--tech-microservices: 171 100% 41%; /* #00d1b2 - Teal */
	--tech-monitoring: 0 79% 70%; /* #ff6b6b - Monitoring red */
}
```

```css
/* src/styles/components.css - references to centralized variables */
.python-accent {
	border-left-color: hsl(var(--tech-python)) !important;
}
.go-accent {
	border-left-color: hsl(var(--tech-go)) !important;
}
.rust-accent {
	border-left-color: hsl(var(--tech-rust)) !important;
}
```

**Why centralized in `:root`:**

- **Easy theme management**: Change color once in `:root`, applies everywhere
- **Maintainability**: All colors in one location for quick reference
- **Consistency**: Same color value used across all components
- **Dark mode support**: Can override in `.dark` block if needed

**Why `!important`:** Prevents unintended overrides from Tailwind or other CSS, preserving official brand identity.

**Pattern 4: Layout Max-Width Constraints**

```css
/* Force responsive constraints */
@media (max-width: 640px) {
	.content-area {
		max-width: 100vw !important; /* Prevents horizontal scroll on mobile */
	}
}
```

**Why `!important`:** Overrides component-level width settings that don't account for mobile.

### !important Usage Guidelines

**✅ Acceptable Use Cases:**

1. **Z-index hierarchy enforcement** - Maintain consistent stacking order
2. **Layout constraints** - Responsive max-width/height overrides
3. **Brand color preservation** - Prevent theme overrides of official colors
4. **shadcn component overrides** - When normal specificity isn't sufficient
5. **Accessibility fixes** - Critical overrides for WCAG compliance

**❌ Avoid `!important` for:**

1. General component styling (use better selectors instead)
2. Working around specificity issues (fix the root cause)
3. Quick fixes during development (technical debt)
4. Competing with other `!important` declarations (specificity war)

**Debugging Precedence Issues:**

```bash
# Check compiled CSS order in browser DevTools:
# 1. Inspect element
# 2. Check "Computed" tab
# 3. Look for strikethrough styles (overridden)
# 4. Trace back to source file

# Common fixes:
# - Move style to file that loads later (shadcn-overrides.css)
# - Use !important sparingly
# - Increase selector specificity
# - Use Tailwind ! modifier
```

### Integration with WRAPPER-PATTERN-GUIDE.md

See [WRAPPER-PATTERN-GUIDE.md](./WRAPPER-PATTERN-GUIDE.md) for:

- Component wrapper styling patterns
- shadcn customization examples
- Proper use of `!` modifier for component overrides

---

## FLEXBOX + GRID HYBRID LAYOUT ARCHITECTURE

**🎯 CRITICAL**: This project uses a hybrid layout approach combining CSS Grid for main structure with Flexbox for component flexibility, fully compatible with shadcn/ui Sidebar patterns.

### Layout Philosophy

**Why Hybrid Approach:**

- **CSS Grid**: Ideal for main layout structure (sidebar + content area)
- **Flexbox**: Perfect for internal component layouts (sidebar navigation, header elements)
- **shadcn/ui Compatible**: Uses CSS variables that work seamlessly with shadcn components

### Configurable Layout Proportions

**Configuration Location:** `src/config/settings.ts` → `SETTINGS.ui.layout`

```typescript
// Example configuration
layout: {
  sidebarWidth: "16rem",        // Desktop: 256px (~20% at 1280px) - RECOMMENDED
  sidebarWidthMobile: "18rem",  // Mobile: 288px
  sidebarWidthIcon: "3rem",     // Collapsed: 48px
  headerHeight: "4rem",         // Sticky header: 64px
  footerHeight: "4rem",         // Navigation footer: 64px
}
```

**Common Proportions** (at 1280px viewport):

| Proportion | Sidebar Width   | Content Area | Use Case                            |
| ---------- | --------------- | ------------ | ----------------------------------- |
| **20/80**  | `16rem` (256px) | ~80%         | ✅ **Recommended** (shadcn default) |
| **25/75**  | `20rem` (320px) | ~75%         | Extensive navigation menus          |
| **15/85**  | `12rem` (192px) | ~85%         | Content-focused layouts             |
| **Icon**   | `3rem` (48px)   | ~97%         | Collapsed sidebar mode              |

**Acceptable Ranges:**

- `sidebarWidth`: `"12rem"` to `"24rem"` (192px to 384px)
- `sidebarWidthMobile`: `"16rem"` to `"20rem"` (256px to 320px)
- `sidebarWidthIcon`: `"3rem"` to `"4rem"` (48px to 64px)
- `headerHeight/footerHeight`: `"3rem"` to `"5rem"` (48px to 80px)

### CSS Variable System

**Global Variables** (defined in `src/app.css`):

```css
:root {
	/* Layout dimensions - Configurable via settings.ts */
	--sidebar-width: 16rem; /* Desktop expanded */
	--sidebar-width-mobile: 18rem; /* Mobile expanded */
	--sidebar-width-icon: 3rem; /* Collapsed state */
	--header-height: 4rem; /* Sticky header */
	--footer-height: 4rem; /* Floating navigation */
}
```

**Dynamic Override** (in `+layout.svelte`):

```typescript
// Import settings
import { SETTINGS } from "$config/settings.js";
const { layout: layoutConfig } = SETTINGS.ui;

// Create CSS variable object
const layoutVars = {
  "--sidebar-width": layoutConfig.sidebarWidth,
  "--sidebar-width-mobile": layoutConfig.sidebarWidthMobile,
  "--sidebar-width-icon": layoutConfig.sidebarWidthIcon,
  // ... etc
};

// Apply to root layout element
<div class="app-layout" style={Object.entries(layoutVars)
  .map(([key, value]) => `${key}: ${value}`)
  .join("; ")}>
```

### Layout Implementation Pattern

**Main Grid Structure:**

```css
.app-layout {
	display: grid;
	grid-template-columns: var(--sidebar-width) 1fr; /* CSS variable, not pixels */
	height: 100vh;
	overflow: hidden;
}
```

**Sidebar Component:**

```css
.sidebar-container {
	width: var(--sidebar-width);
	background: hsl(var(--sidebar));
	border-right: 1px solid hsl(var(--sidebar-border));
	overflow-y: auto;
}
```

**Content Area with Flexbox:**

```css
.main-container {
	display: flex;
	flex-direction: column;
	width: calc(100vw - var(--sidebar-width)); /* Responsive calculation */
}

.content-area {
	flex: 1;
	overflow-y: auto;
	height: calc(100vh - var(--header-height) - var(--footer-height));
}
```

### Responsive Breakpoints

**Aligned with Tailwind CSS** (configurable in `settings.ts`):

```css
/* Mobile: ≤640px (sm) - Hide sidebar or offcanvas */
@media (max-width: 640px) {
	.app-layout {
		grid-template-columns: 1fr;
	}
}

/* Tablet: 641px-1023px (md) - Mobile sidebar width */
@media (min-width: 641px) and (max-width: 1023px) {
	.app-layout {
		grid-template-columns: var(--sidebar-width-mobile) 1fr;
	}
}

/* Desktop: ≥1024px (lg) - Default sidebar width */
/* Default values apply */

/* Wide: ≥1280px (xl) - Increased padding */
@media (min-width: 1280px) {
	.header-placeholder,
	.nav-placeholder {
		padding: 0 3rem;
	}
}
```

### Collapsed Sidebar State

**Data Attribute Pattern** (for TASK 8A shadcn/ui integration):

```css
.app-layout[data-sidebar-collapsed="true"] {
	grid-template-columns: var(--sidebar-width-icon) 1fr;
}

.app-layout[data-sidebar-collapsed="true"] .sidebar-container {
	width: var(--sidebar-width-icon);
}

.app-layout[data-sidebar-collapsed="true"] .main-container {
	width: calc(100vw - var(--sidebar-width-icon));
}
```

### shadcn/ui Sidebar Integration (TASK 8A)

**Component Installation:**

```bash
pnpm dlx shadcn-svelte@latest add sidebar
```

**Integration Pattern:**

```svelte
<script lang="ts">
	import { Sidebar } from "$lib/components/ui/sidebar";
	import { SETTINGS } from "$config/settings.js";

	const { layout, sidebar } = SETTINGS.ui;
</script>

<Sidebar.Provider
	style="--sidebar-width: {layout.sidebarWidth}; --sidebar-width-mobile: {layout.sidebarWidthMobile};"
	collapsible={sidebar.collapsible ? sidebar.collapsibleMode : "none"}
>
	<Sidebar.Root>
		<!-- Navigation content -->
	</Sidebar.Root>
	<Sidebar.Inset>
		<!-- Main content area -->
	</Sidebar.Inset>
</Sidebar.Provider>
```

**⚠️ CRITICAL BUG FIX** (for TASK 8A):

shadcn/ui has a known Tailwind syntax issue. When implementing, replace:

- `w-(--sidebar-width)` → `w-[var(--sidebar-width)]`
- `w-(--sidebar-width-icon)` → `w-[var(--sidebar-width-icon)]`

### Benefits of This Architecture

1. **Configuration-Driven**: Change proportions without touching code
2. **Type-Safe**: TypeScript interfaces ensure valid configuration values
3. **Responsive**: Rem units scale naturally across devices
4. **shadcn/ui Ready**: Full compatibility with shadcn Sidebar patterns
5. **Developer-Friendly**: Clear documentation of acceptable values
6. **Performance**: CSS variables for dynamic updates without re-renders
7. **Future-Proof**: Easy to add new layout modes or proportions

### Testing Layout Changes

**To change sidebar proportion:**

1. Edit `src/config/settings.ts`:

   ```typescript
   layout: {
     sidebarWidth: "20rem", // Change from 16rem to 20rem (25/75 split)
     // ... other settings
   }
   ```

2. Restart dev server (hot reload will apply changes):

   ```bash
   pnpm run dev
   ```

3. Verify responsive behavior at different breakpoints:
   - Mobile: ≤640px (sidebar hidden/offcanvas)
   - Tablet: 768px (mobile width applied)
   - Desktop: 1024px+ (desktop width applied)

---

## THEMING & STYLING

### Tailwind CSS v4 Integration

**Critical Architecture Rule**: All component styles MUST be in `src/app.css` using `@layer components`. Never use `<style>` blocks with `@apply` in Svelte components.

**Centralized CSS Approach**:

```css
/* src/app.css */
@import "tailwindcss";

@theme {
	--color-primary: #0f172a;
	--color-secondary: #475569;
	--color-accent: #3b82f6;
}

@layer components {
	.lesson-container {
		@apply mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm;
	}

	.quiz-question {
		@apply mb-4 rounded-md border border-slate-200 p-4;
	}

	.flashcard-grid {
		@apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
	}

	.modal-overlay {
		@apply fixed inset-0 z-50 flex items-center justify-center bg-black/50;
	}
}
```

**Component Usage**:

```svelte
<!-- ✅ CORRECT: Use global classes -->
<div class="lesson-container">
	<h1 class="text-2xl font-bold text-slate-800">Lesson Title</h1>
</div>

<!-- ❌ CAUSES BUILD FAILURES -->
<style lang="postcss">
	.local-class {
		@apply flex; /* Incompatible with Tailwind v4 + Svelte */
	}
</style>
```

### Theme Customization Strategy

**CSS-Based Theme Configuration**:

```css
@theme {
	/* Color palette */
	--color-primary-50: #f8fafc;
	--color-primary-500: #64748b;
	--color-primary-900: #0f172a;

	/* Typography */
	--font-family-sans: "Inter", system-ui, sans-serif;
	--font-size-xs: 0.75rem;
	--font-size-sm: 0.875rem;

	/* Spacing */
	--spacing-xs: 0.5rem;
	--spacing-sm: 0.75rem;

	/* Breakpoints */
	--breakpoint-sm: 390px;
	--breakpoint-md: 768px;
	--breakpoint-lg: 1024px;
}
```

**Mobile-First Responsive Design**:

```css
@layer components {
	.responsive-grid {
		@apply grid grid-cols-1 gap-3;
	}

	@media (min-width: theme(breakpoint.md)) {
		.responsive-grid {
			@apply grid-cols-2 gap-4;
		}
	}

	@media (min-width: theme(breakpoint.lg)) {
		.responsive-grid {
			@apply grid-cols-3 gap-6;
		}
	}
}
```

### Ensuring Third-Party Component Theme Adoption

**shadcn-svelte Theme Integration**:

1. **Use CSS Variables**:

   ```css
   @theme {
   	--color-background: white;
   	--color-foreground: #0f172a;
   	--color-muted: #f1f5f9;
   	--color-border: #e2e8f0;
   }
   ```

2. **Override Component Styles**:

   ```css
   @layer components {
   	.shadcn-button {
   		@apply bg-primary-500 hover:bg-primary-600 text-white;
   	}

   	.shadcn-card {
   		@apply border-border bg-background;
   	}
   }
   ```

3. **Theme Consistency Pattern**:
   ```typescript
   // Create theme configuration object
   export const theme = {
   	colors: {
   		primary: "hsl(var(--color-primary))",
   		secondary: "hsl(var(--color-secondary))",
   		background: "hsl(var(--color-background))"
   	},
   	fonts: {
   		sans: "var(--font-family-sans)"
   	}
   };
   ```

---

## Related Guides

- **Previous**: [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md) - Project setup and core architecture
- **Next**: [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) - Component development patterns
- **Also See**: [WRAPPER-PATTERN-GUIDE.md](./WRAPPER-PATTERN-GUIDE.md) - Component wrapper patterns
- **Also See**: [SVELTE-DEVELOPMENT.md](./SVELTE-DEVELOPMENT.md) - Development standards

---

**[← Back to Index](./SVELTEKIT-INDEX.md)**
