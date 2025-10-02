# Wrapper Component Pattern Guide

This guide demonstrates how to create wrapper components for shadcn-svelte UI primitives, following the architecture standards defined in SVELTEKIT-GUIDE.md.

**Purpose**: Establish consistent patterns for wrapping third-party components with project-specific enhancements (union types, SETTINGS integration, theme-awareness).

**Target Audience**: Developers implementing Tasks 7-8X who need to create wrapper components.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Pattern Overview](#pattern-overview)
- [Pattern 1: Basic Wrapper](#pattern-1-basic-wrapper-button)
- [Pattern 2: Complex Wrapper](#pattern-2-complex-wrapper-dialog)
- [Pattern 3: Configuration Wrapper](#pattern-3-configuration-wrapper-progress)
- [Architecture Standards](#architecture-standards)
- [Common Patterns](#common-patterns)
- [Testing Wrappers](#testing-wrappers)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Check if shadcn-svelte component exists
pnpm dlx shadcn-svelte@latest add --help

# 2. Install needed component
pnpm dlx shadcn-svelte@latest add component-name

# 3. Create wrapper in src/lib/components/shared/
touch src/lib/components/shared/ComponentName.svelte

# 4. Follow one of the three patterns below
# 5. Export from src/lib/components/shared/index.ts
# 6. Add styles to src/app.css using @layer components
```

---

## Pattern Overview

| Pattern Type      | Use Case                       | Example Component |
| ----------------- | ------------------------------ | ----------------- |
| **Basic**         | Simple type-safe wrappers      | Button            |
| **Complex**       | SETTINGS integration, z-index  | Dialog            |
| **Configuration** | Theme-aware, computed defaults | Progress          |

### When to Use Each Pattern

- **Basic**: Simple components with minimal configuration (badges, separators, buttons)
- **Complex**: Components requiring configuration, z-index hierarchy, or mobile-first behavior (dialogs, popovers, dropdowns)
- **Configuration**: Components needing SETTINGS integration or theme-aware defaults (progress bars, theme switchers)

---

## Pattern 1: Basic Wrapper (Button)

**Purpose**: Simple wrapper that adds union type constraints without changing behavior.

**Use When**:

- Component needs type-safe variants
- No configuration or state management required
- Pass-through pattern is sufficient

### Implementation

```svelte
<!--
	Button Wrapper Component (Basic Pattern Example)
-->
<script lang="ts">
	import { Button as ShadcnButton } from "$lib/components/ui/button";
	import type { ButtonProps } from "$types/ui";

	// Svelte 5 runes syntax: destructure props with defaults
	let {
		variant = "default",
		size = "default",
		class: className,
		disabled = false,
		type = "button",
		href,
		children
	}: ButtonProps = $props();
</script>

<ShadcnButton {variant} {size} class={className} {disabled} {type} {href}>
	{@render children()}
</ShadcnButton>
```

### Key Features

✅ **Svelte 5 Runes**: `$props()` for prop destructuring
✅ **Union Types**: Import from shadcn component for type safety
✅ **Snippet Pattern**: Svelte 5 `Snippet` type for children
✅ **Pass-Through**: All props forwarded to underlying component
✅ **Defaults**: Sensible defaults for optional props

### Usage

```svelte
<script lang="ts">
	import { Button } from "$lib/components/shared";
	// Types are automatically available from ButtonProps in $types/ui
</script>

<Button variant="default" size="lg">Click Me</Button>

<Button variant="destructive" disabled>Disabled Button</Button>
```

---

## Pattern 2: Complex Wrapper (Dialog)

**Purpose**: Full-featured wrapper with SETTINGS integration, z-index hierarchy, and responsive behavior.

**Use When**:

- Component requires configuration from SETTINGS
- Z-index hierarchy must be enforced
- Mobile-first responsive behavior needed
- Multiple size variants required

### Implementation

```svelte
<!--
	Dialog Wrapper Component (Complex Pattern Example)
-->
<script lang="ts">
	import * as DialogPrimitive from "$lib/components/ui/dialog";
	import { SETTINGS } from "$config/settings.js";
	import type { DialogProps, DialogSize } from "$types/ui";

	let {
		open = $bindable(false),
		size = "md",
		title,
		description,
		showCloseButton = true,
		class: className,
		children
	}: DialogProps = $props();

	/**
	 * Size-based CSS classes using derived state
	 */
	const sizeClasses = $derived.by(() => {
		const baseClasses = "w-full";

		switch (size) {
			case "sm":
				return `${baseClasses} max-w-sm`;
			case "md":
				return `${baseClasses} max-w-md`;
			case "lg":
				return `${baseClasses} max-w-lg`;
			case "xl":
				return `${baseClasses} max-w-xl`;
			case "full":
				const modalPercent = SETTINGS.ui.mermaid.modalPagePercent;
				return `${baseClasses} max-w-[${modalPercent}vw] max-h-[${modalPercent}vh]`;
			default:
				return `${baseClasses} max-w-md`;
		}
	});

	const dialogClasses = $derived(`${sizeClasses} ${className || ""}`);
</script>

<DialogPrimitive.Root bind:open>
	<DialogPrimitive.Content class={dialogClasses} {showCloseButton}>
		{#if title || description}
			<DialogPrimitive.Header>
				{#if title}
					<DialogPrimitive.Title>{title}</DialogPrimitive.Title>
				{/if}
				{#if description}
					<DialogPrimitive.Description>{description}</DialogPrimitive.Description>
				{/if}
			</DialogPrimitive.Header>
		{/if}

		<div class="dialog-body">
			{@render children()}
		</div>
	</DialogPrimitive.Content>
</DialogPrimitive.Root>
```

### Key Features

✅ **SETTINGS Integration**: Uses `SETTINGS.ui.mermaid.modalPagePercent`
✅ **Derived State**: `$derived.by()` for computed classes
✅ **Bindable Props**: `$bindable()` for two-way binding
✅ **Size Variants**: Union type with responsive sizes
✅ **Mobile-First**: Full-screen on mobile, responsive on desktop
✅ **Z-Index Compliance**: shadcn Dialog uses `var(--z-modal)` internally

### Usage

```svelte
<script lang="ts">
	import { Dialog } from "$lib/components/shared";

	let isOpen = $state(false);
</script>

<Dialog bind:open={isOpen} size="lg" title="Large Dialog" description="This is a description">
	<p>Dialog content here</p>
</Dialog>

<Dialog bind:open={isOpen} size="full" title="Full Screen">
	<p>Full-screen modal content</p>
</Dialog>
```

---

## Pattern 3: Configuration Wrapper (Progress)

**Purpose**: Wrapper with SETTINGS integration, theme-awareness, and computed state.

**Use When**:

- Component needs theme-aware styling
- Computed/derived values required
- SETTINGS integration for defaults
- Percentage or status display needed

### Implementation

```svelte
<!--
	Progress Wrapper Component (SETTINGS Integration Example)
-->
<script lang="ts">
	import { Progress as ShadcnProgress } from "$lib/components/ui/progress";
	import type { ProgressProps } from "$types/ui";

	let {
		value = 0,
		max = 100,
		showPercentage = false,
		class: className,
		size = "md"
	}: ProgressProps = $props();

	/**
	 * Computed percentage value
	 */
	const percentage = $derived.by(() => {
		if (max <= 0) return 0;
		const percent = Math.round((value / max) * 100);
		return Math.min(Math.max(percent, 0), 100); // Clamp to 0-100
	});

	/**
	 * Size-based height classes
	 */
	const heightClass = $derived.by(() => {
		switch (size) {
			case "sm":
				return "h-1";
			case "md":
				return "h-2";
			case "lg":
				return "h-3";
			default:
				return "h-2";
		}
	});

	const progressClasses = $derived(`${heightClass} ${className || ""}`);
	const ariaLabel = $derived(`Progress: ${percentage}% complete`);
</script>

<div class="progress-wrapper">
	<div class="progress-container">
		<ShadcnProgress
			bind:value
			{max}
			class={progressClasses}
			aria-label={ariaLabel}
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		/>
	</div>

	{#if showPercentage}
		<div class="progress-percentage" role="status" aria-live="polite">
			<span class="percentage-text">{percentage}%</span>
		</div>
	{/if}
</div>
```

### Key Features

✅ **Derived Computations**: `$derived.by()` for percentage and classes
✅ **Bindable Value**: Two-way binding with `$bindable()`
✅ **Size Variants**: Responsive height variants
✅ **Accessibility**: ARIA labels and live regions
✅ **Theme-Aware**: Uses semantic color variables (`--foreground`)
✅ **Edge Case Handling**: Safe division, clamping

### Usage

```svelte
<script lang="ts">
	import { Progress } from "$lib/components/shared";
	import { onMount } from "svelte";

	let value = $state(0);

	onMount(() => {
		const interval = setInterval(() => {
			value = Math.min(value + 10, 100);
			if (value >= 100) clearInterval(interval);
		}, 500);
	});
</script>

<Progress {value} showPercentage size="lg" />
```

---

## Architecture Standards

### ✅ Required Patterns

1. **Svelte 5 Runes Syntax**:

   ```typescript
   let { prop1, prop2 }: Props = $props(); // Props destructuring
   const computed = $derived(expression); // Derived state
   let bindable = $bindable(initialValue); // Two-way binding
   ```

2. **Union Type-First** (CRITICAL - All types from `$types`):

   ```typescript
   // ✅ CORRECT: Import from centralized types
   import type { ButtonProps, ButtonVariant } from "$types/ui";

   let { variant = "default", ...rest }: ButtonProps = $props();
   ```

3. **Centralized Styling** (CRITICAL):

   ```typescript
   // ❌ FORBIDDEN: @apply in <style> blocks
   <style>
     .component { @apply flex; } // WRONG - Tailwind v4 incompatible
   </style>

   // ✅ CORRECT: Tailwind classes in template
   <div class="flex items-center gap-2">

   // ✅ CORRECT: Custom styles in src/app.css @layer components
   ```

4. **SETTINGS Integration**:

   ```typescript
   import { SETTINGS } from "$config/settings.js";

   // Use SETTINGS for configuration
   const size = SETTINGS.ui.mermaid.modalPagePercent;
   ```

5. **Z-Index Hierarchy**:

   ```css
   /* ❌ FORBIDDEN: Hardcoded z-index */
   z-index: 100;

   /* ✅ CORRECT: CSS custom properties */
   z-index: var(--z-modal);
   ```

### ❌ Anti-Patterns to Avoid

```svelte
<!-- ❌ WRONG: Svelte 4 syntax -->
<script lang="ts">
  export let title: string;
  $: doubled = count * 2;
</script>

<!-- ❌ WRONG: Importing types from shadcn components -->
<script lang="ts">
  import type { ButtonVariant } from "$lib/components/ui/button";
  // Should import from $types/ui instead
</script>

<!-- ❌ WRONG: Defining types locally -->
<script lang="ts">
  interface Props {
    variant?: string; // Should use ButtonProps from $types/ui
  }
</script>

<!-- ❌ WRONG: @apply in component <style> block -->
<style>
  .component {
    @apply flex items-center; // Tailwind v4 incompatible
  }
</style>

<!-- ❌ WRONG: Hardcoded z-index -->
<div style="z-index: 100">

<!-- ✅ CORRECT: All patterns fixed -->
<script lang="ts">
  // ✅ Import from centralized types ($types)
  import type { ButtonProps } from "$types/ui";

  // ✅ Svelte 5 runes syntax
  let { variant = "default" }: ButtonProps = $props();
</script>

<!-- ✅ Tailwind classes in template -->
<div class="flex items-center" style="z-index: var(--z-modal)">
```

---

## Common Patterns

### Pattern: Derived Classes

```typescript
// Compute classes based on props
const classes = $derived.by(() => {
	const base = "base-class";
	const sizeClass = size === "lg" ? "large-class" : "small-class";
	return `${base} ${sizeClass} ${className || ""}`;
});
```

### Pattern: SETTINGS Configuration

```typescript
import { SETTINGS } from "$config/settings.js";

// Use SETTINGS for defaults
const modalSize = $derived(SETTINGS.ui.mermaid.modalPagePercent);
const showIcons = $derived(SETTINGS.ui.breadcrumb.showIcon);
```

### Pattern: Two-Way Binding

```typescript
interface Props {
	value?: number;
}

let { value = $bindable(0) }: Props = $props();

// Parent component can bind:
// <Component bind:value={myValue} />
```

### Pattern: Accessibility

```typescript
// Provide ARIA labels
const ariaLabel = $derived(`Progress: ${percentage}% complete`);

// Use semantic HTML
<div role="status" aria-live="polite">
  <span class="sr-only">{ariaLabel}</span>
</div>
```

### Pattern: Mobile-First Responsive

```typescript
// Mobile-first size variants
const sizeClasses = $derived.by(() => {
	switch (size) {
		case "full":
			return "w-full h-full"; // Mobile: full screen
		case "lg":
			return "w-full max-w-lg"; // Desktop: constrained
		default:
			return "w-full max-w-md";
	}
});
```

---

## Testing Wrappers

### Unit Test Pattern

```typescript
import { render, screen } from "@testing-library/svelte";
import { Button } from "$lib/components/shared";

describe("Button Wrapper", () => {
	it("renders with default variant", () => {
		render(Button, { props: { children: () => "Click me" } });
		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("Click me");
	});

	it("applies variant classes", () => {
		render(Button, { props: { variant: "destructive", children: () => "Delete" } });
		const button = screen.getByRole("button");
		expect(button).toHaveClass("destructive");
	});
});
```

### Integration Test Pattern

```typescript
import { render, fireEvent } from "@testing-library/svelte";
import { Dialog } from "$lib/components/shared";

describe("Dialog Wrapper", () => {
	it("opens and closes", async () => {
		let isOpen = false;
		const { component } = render(Dialog, {
			props: {
				open: isOpen,
				title: "Test",
				children: () => "Content"
			}
		});

		// Verify initial state
		expect(screen.queryByText("Content")).not.toBeInTheDocument();

		// Open dialog
		component.$set({ open: true });
		expect(screen.getByText("Content")).toBeInTheDocument();
	});
});
```

---

## Troubleshooting

### Issue: TypeScript Errors on Snippet Type

**Problem**:

```typescript
Property 'children' does not exist on type 'Props'
```

**Solution**:

```typescript
import type { Snippet } from "svelte";

interface Props {
	children: Snippet; // ✅ Correct import
}
```

### Issue: @apply Not Working

**Problem**: Build fails with "Cannot apply unknown utility class"

**Solution**: Move styles to `src/app.css`:

```css
/* src/app.css */
@layer components {
	.component-class {
		@apply flex items-center gap-2;
	}
}
```

### Issue: Z-Index Conflicts

**Problem**: Modal appears behind other elements

**Solution**: Use CSS custom properties from `app.css`:

```css
/* Use var(--z-modal) instead of hardcoded value */
style="z-index: var(--z-modal)"
```

### Issue: Union Types Not Recognized

**Problem**: TypeScript doesn't recognize union type values

**Solution**: Always import from centralized `$types`:

```typescript
// ✅ CORRECT: Import from $types/ui (wrapper types)
import type { ButtonProps, ButtonVariant } from "$types/ui";

// ✅ CORRECT: Import from $types (content types)
import type { ChapterType, ContentType } from "$types";

// ❌ WRONG: Direct import from shadcn components
import type { ButtonVariant } from "$lib/components/ui/button";
```

**Rationale**: All types must reside in `$types` (global directive). Wrapper components in `src/lib/components/shared/` import types from `$types/ui`, not from shadcn components.

---

## Next Steps

**For Task 7-8X Implementers**:

1. **Review Reference Components**:
   - `src/lib/components/shared/Button.svelte` (basic pattern)
   - `src/lib/components/shared/Dialog.svelte` (complex pattern)
   - `src/lib/components/shared/Progress.svelte` (configuration pattern)

2. **Choose Pattern**:
   - Basic: Simple wrappers with union types
   - Complex: SETTINGS integration, z-index hierarchy
   - Configuration: Theme-aware, computed state

3. **Follow Standards**:
   - Svelte 5 runes syntax
   - Union type-first TypeScript
   - Centralized CSS (no @apply in components)
   - SETTINGS integration
   - Mobile-first responsive design

4. **Test Thoroughly**:
   - Unit tests for props and behavior
   - Integration tests for state management
   - Mobile responsiveness (≤390px)
   - Theme switching
   - Accessibility (keyboard, screen readers)

5. **Validate**:
   ```bash
   make check-wip           # Fast validation
   pnpm run test            # Unit tests
   pnpm run format          # Code formatting
   pnpm run lint            # ESLint validation
   pnpm run check           # TypeScript + SvelteKit
   ```

---

## Related Documentation

- **SVELTEKIT-GUIDE.md**: Complete architecture standards and technical requirements
- **PLAN-TODO-FEATURES.md**: Task dependencies and implementation order
- **src/config/settings.ts**: Centralized configuration with type definitions
- **src/app.css**: Centralized CSS architecture with theme system
- **shadcn-svelte docs**: https://www.shadcn-svelte.com/docs/components

---

**Version**: 1.0.0 (Task 6 - shadcn-svelte UI Components)
**Last Updated**: 2025-10-02
**Author**: Cloud-Native Learning Platform Architecture Team
