# Recurring Issues Documentation

This document contains **only recurring bugs and issues** that have appeared multiple times across different development sessions. Issues documented here represent patterns that are likely to reoccur and require systematic prevention.

> **📚 Related Documentation:**
>
> - [CLAUDE.md](CLAUDE.md) - Complete agent implementation guidelines
> - [TECHNICAL-SPECS.md](TECHNICAL-SPECS.md) - Technical architecture standards
> - [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md) - Critical Mermaid diagram standards

---

## CRITICAL UI/UX ISSUES RESOLVED

### Issue: Z-Index Hierarchy Violations (Resolved 2025-09-17)

**Root Cause**: Sticky header components not following global z-index hierarchy standards.

**Pattern**: Components using hardcoded z-index values instead of CSS custom properties.

**Symptoms**:

- Modal dialogs appearing behind sticky headers
- Overlay components not respecting stacking context
- Inconsistent layering across different components

**Resolution**:

```css
/* ❌ INCORRECT: Hardcoded z-index */
.demo-header-sticky {
	z-index: 50;
}

/* ✅ CORRECT: Use global hierarchy */
.demo-header-sticky {
	z-index: var(--z-header);
}
```

**Prevention**: Always use CSS custom properties from `:root` for z-index values. Global hierarchy: base(1) → dropdown(10) → sticky(50) → sidebar(90) → header(100) → overlay(200) → modal(210) → popover(300) → toast(400).

### Issue: Mermaid Diagram Initial Render Failures

**Root Cause**: Race conditions between DOM element availability and Mermaid initialization.

**Pattern**: `$effect` reactive statements executing before DOM elements are ready.

**Symptoms**:

- Blank diagram containers on initial page load
- Diagrams only appearing after user interaction
- Inconsistent rendering across different components

**Resolution**:

```typescript
// ❌ INCORRECT: Race condition prone
$effect(() => {
	if (diagram && diagramElement) {
		renderDiagram();
	}
});

// ✅ CORRECT: Check rendering state
$effect(() => {
	if (diagram && diagramElement && !isRendering) {
		renderDiagram();
	}
});
```

**Prevention**: Always check `isRendering` state in reactive statements to prevent concurrent rendering attempts.

### Issue: Mermaid Global Rendering Failure Due to Incorrect State Initialization (Resolved 2025-09-17)

**Root Cause**: `isRendering` state variable initialized to `true` instead of `false`, creating a deadlock in Svelte 5 reactive patterns.

**Pattern**: All Mermaid diagrams globally stuck showing loading spinner, never progressing to actual rendering.

**Symptoms**:

- Loading spinner stuck on all Mermaid diagrams across the application
- No error messages in console (silent failure)
- `$effect` reactive statements never triggering due to incorrect state
- Diagrams never progressing beyond loading state

**Technical Analysis**:

```typescript
// ❌ INCORRECT: Creates deadlock
let isRendering = $state(true); // Initialized to true

// Effect never triggers because isRendering is always true
$effect(() => {
	if (diagram && diagramElement && !isRendering) {
		renderDiagram(); // Never executes
	}
});
```

**Resolution**:

```typescript
// ✅ CORRECT: Allow reactive effects to trigger
let isRendering = $state(false); // Initialize to false

// Effect can now trigger properly
$effect(() => {
	if (diagram && diagramElement && !isRendering) {
		renderDiagram(); // Executes correctly
	}
});
```

**Architectural Fix**: Corrected state initialization pattern in `MermaidDiagram.svelte` component to follow proper Svelte 5 reactive patterns.

**Prevention**:

- Always initialize loading/rendering states to `false` in Svelte 5 components
- Ensure `$effect` conditions can be satisfied during component lifecycle
- Test component mounting and rendering cycles during development
- Never assume rendering states should start as `true` unless explicitly needed

**Recurrence Count**: 1st occurrence
**Last Seen**: Global Mermaid diagram failure across MermaidShowcase and LessonView components

### Issue: Orphaned Mermaid DOM Elements from Failed Renders (Resolved 2025-09-18)

**Root Cause**: When `mermaid.render()` fails due to syntax errors, it creates DOM elements with generated IDs but doesn't clean them up, leaving visible empty `div` elements at the bottom of pages.

**Pattern**: Empty `div` elements with IDs matching pattern `#dmermaid-diagram-xxxxxxxx` or `#mermaid-diagram-xxxxxxxx` appearing in DOM after Mermaid parsing failures.

**Symptoms**:

- Visible empty `div` elements at bottom of pages containing Mermaid diagrams
- Elements have dynamic IDs like `dmermaid-diagram-1737187200000`
- Elements are empty but visible, creating visual artifacts
- No content or styling, just orphaned DOM containers
- Occurs when diagram syntax has errors but error handling doesn't clean up

**Technical Analysis**:

```typescript
// ❌ PROBLEMATIC: Mermaid creates DOM element even when render fails
const mermaidElementId = `${idPrefix}-${Date.now()}`;
try {
	const { svg } = await mermaid.render(mermaidElementId, diagram);
	// Successful render
} catch (error) {
	// ERROR: mermaid.render() already created DOM element with mermaidElementId
	// but it's not cleaned up in error path
	handleMermaidError(error);
}
```

**Resolution**:

```typescript
// ✅ CORRECT: Clean up orphaned elements in error path
const mermaidElementId = `${idPrefix}-${Date.now()}`;
try {
	const { svg } = await mermaid.render(mermaidElementId, diagram);
	// Successful render
} catch (error) {
	// CRITICAL FIX: Clean up orphaned element created by failed render
	cleanupOrphanedMermaidElement(mermaidElementId);
	handleMermaidError(error);
}

function cleanupOrphanedMermaidElement(elementId: string) {
	// Remove specific element and any variants
	const orphanedElement = document.getElementById(elementId);
	if (orphanedElement) orphanedElement.remove();

	// Remove similar pattern elements not in component containers
	const orphanedElements = document.querySelectorAll(
		`[id*="${elementId}"], [id*="mermaid-diagram"], [id*="dmermaid-diagram"]`
	);
	orphanedElements.forEach((element) => {
		const parentContainer = element.closest(".mermaid-diagram-container");
		if (!parentContainer) element.remove();
	});
}
```

**Architectural Fix**: Enhanced error handling in `MermaidDiagram.svelte` to capture generated element IDs and clean up orphaned DOM elements when rendering fails.

**Prevention**:

- Always capture element IDs before calling `mermaid.render()`
- Implement cleanup in error handling paths for Mermaid operations
- Use element removal with container validation to avoid removing valid elements
- Test diagram rendering with invalid syntax to verify cleanup
- Include orphaned element cleanup in component destruction lifecycle

**Recurrence Count**: 1st occurrence
**Last Seen**: MermaidShowcase and LessonView components with syntax error diagrams

### Issue: Mermaid "Cannot read properties of null (reading 'firstChild')" Error (Resolved 2025-09-18)

**Root Cause**: Direct DOM manipulation of connected elements causing race conditions in Mermaid's internal rendering process when element state changes during render operations.

**Pattern**: `mermaid.render()` or `mermaid.init()` attempting to access DOM nodes that are in inconsistent states due to concurrent rendering operations or rapid DOM changes.

**Symptoms**:

- Client-side error: "Cannot read properties of null (reading 'firstChild')"
- Error occurs during Mermaid rendering process
- Diagrams fail to render but no visible parse errors
- Error persists even with enhanced DOM validation

**Technical Analysis**:

```typescript
// ❌ PROBLEMATIC: Direct manipulation of connected DOM elements
const { svg } = await mermaid.render(mermaidElementId, diagram);
element.innerHTML = svg; // Race condition prone

// ❌ ALSO PROBLEMATIC: mermaid.init() on connected elements
await mermaid.init(undefined, element); // firstChild access can fail
```

**Resolution**:

```typescript
// ✅ CORRECT: Isolated container rendering approach
const isolatedContainer = document.createElement("div");
isolatedContainer.id = mermaidElementId;
isolatedContainer.innerHTML = processedDiagram;

// Render in isolated, hidden container
isolatedContainer.style.visibility = "hidden";
isolatedContainer.style.position = "absolute";
isolatedContainer.style.top = "-9999px";

try {
	document.body.appendChild(isolatedContainer);
	await new Promise((resolve) => setTimeout(resolve, 10)); // DOM stability
	await mermaid.init(undefined, isolatedContainer);

	// Extract and inject SVG safely
	const svgElement = isolatedContainer.querySelector("svg");
	if (svgElement) {
		element.innerHTML = svgElement.outerHTML;
	}
} finally {
	// Always cleanup isolated container
	if (isolatedContainer.parentNode) {
		isolatedContainer.parentNode.removeChild(isolatedContainer);
	}
}
```

**Architectural Fix**: Implemented isolated container rendering in `MermaidDiagram.svelte` to prevent direct DOM manipulation of connected elements during Mermaid operations.

**Prevention**:

- Never call `mermaid.init()` or `mermaid.render()` directly on connected DOM elements in component containers
- Use isolated, hidden DOM containers for Mermaid operations
- Always include DOM stability delays before Mermaid operations
- Extract generated SVG content and inject safely into target elements
- Implement proper cleanup of isolated containers in all code paths

**Resolution Update 2025-09-18**: Implemented `mermaid.render()` API approach with `suppressErrors: true` configuration to replace isolated container method. The new approach avoids direct DOM manipulation by Mermaid's internal processes.

```typescript
// ✅ FINAL APPROACH: Use mermaid.render() API
const { svg } = await mermaid.render(mermaidElementId, processedDiagram);
element.innerHTML = svg; // Safe string injection

// With suppressErrors configuration
mermaid.initialize({
	suppressErrors: true // Critical for preventing DOM access errors
	// ... other config
});
```

**Recurrence Count**: 1st occurrence
**Last Seen**: MermaidDiagram components with persistent DOM access errors during rendering
**Status**: Testing new approach with mermaid.render() API

### Issue: Stacking Context Issues with Custom Modal/Tooltip Components (Resolved 2025-09-17)

**Root Cause**: Custom modal/tooltip implementations using hardcoded z-index values combined with transform properties on active navigation items creating new stacking contexts.

**Pattern**: Custom tooltip/modal components appearing behind active sidebar navigation items due to stacking context violations.

**Symptoms**:

- Dialog/modal/tooltip components appearing behind active navigation items
- Reset Progress dialog not visible when sidebar unit is marked as active
- Custom tooltip implementations using arbitrary z-index values
- Transform properties on active elements creating isolated stacking contexts

**Technical Analysis**:

```css
/* ❌ INCORRECT: Creates stacking context + arbitrary z-index */
.demo-nav-unit-header--active {
	transform: translateX(4px); /* Creates new stacking context */
}
.demo-reset-tooltip {
	z-index: 9999; /* Arbitrary value, ignores global hierarchy */
}
```

**Resolution**:

```css
/* ✅ CORRECT: No stacking context + proper hierarchy */
.demo-nav-unit-header--active {
  margin-left: 4px; /* Visual shift without transform */
}
/* Use shadcn Dialog with proper z-index hierarchy */
style="z-index: var(--z-modal);" /* Follows global hierarchy */
```

**Architectural Fix**: Replace custom tooltip implementations with shadcn-svelte Dialog components that use proper z-index hierarchy and portal rendering.

**Prevention**:

- Always use shadcn-svelte Dialog components for modal/popup content per TECHNICAL-SPECS.md
- Never use hardcoded z-index values - always use CSS custom properties from global hierarchy
- Avoid `transform`, `opacity < 1`, `filter`, or `position: relative` with z-index on navigation items
- Use `margin` instead of `transform` for visual positioning when possible

**Recurrence Count**: 1st occurrence
**Last Seen**: Sidebar navigation with Reset Progress dialog

---

## DOCUMENTATION CRITERIA

### What Belongs Here

✅ **Include these types of issues:**

- Bugs that have occurred 2+ times across different sessions
- Systematic problems with root causes that tend to reappear
- Configuration issues that repeatedly surface
- Architectural patterns that consistently cause problems
- Build/deployment issues that recur despite fixes

### What Does NOT Belong Here

❌ **Do NOT include:**

- One-time bugs that were fixed and never reoccurred
- User-specific environment issues
- Temporary external service outages
- Issues specific to a single development session
- Obsolete problems that no longer apply to current architecture

---

## SVELTEKIT & COMPONENT ISSUES

### Issue: Tailwind CSS v4 + Svelte Style Conflicts

**Pattern:** Build failures when using `@apply` in Svelte component `<style>` blocks with Tailwind CSS v4.

**Root Cause:** Tailwind CSS v4 incompatibility with Svelte's CSS processing when `@apply` is used in component-scoped styles.

**Solution Pattern:**

```css
/* ❌ INCORRECT: In Svelte component <style> block */
<style lang="postcss" > .local-class {
	@apply flex items-center; /* Causes build failure */
}
</style>

/* ✅ CORRECT: In src/app.css using @layer components */
@layer components {
	.global-class {
		@apply flex items-center; /* Works correctly */
	}
}
```

**Prevention:**

- All custom styles MUST be in `src/app.css` using `@layer components`
- Never use `@apply` in Svelte component `<style>` blocks
- Use Tailwind classes directly in component templates

**Recurrence Count:** 3+ times
**Last Seen:** Multiple development sessions

---

### Issue: Missing TypeScript Interfaces for Component Props

**Pattern:** Runtime errors and poor DX when components lack proper TypeScript interfaces.

**Root Cause:** Svelte 5 runes syntax requires explicit TypeScript interfaces for proper type safety.

**Solution Pattern:**

```typescript
// ✅ CORRECT: Proper TypeScript interface
interface Props {
	title: string;
	items?: string[];
	onItemClick?: (item: string) => void;
}

let { title, items = [], onItemClick }: Props = $props();
```

**Prevention:**

- Always define TypeScript interfaces for component props
- Use proper Svelte 5 runes syntax: `let { } = $props()`
- Validate props with TypeScript before runtime

**Recurrence Count:** 2+ times
**Last Seen:** Multiple development sessions

---

## MERMAID DIAGRAM ISSUES

### Issue: Mermaid Rendering Failures Due to Missing Quotes

**Pattern:** Diagrams fail to render with cryptic errors in browser console.

**Root Cause:** Missing double quotes around node text and link labels breaks Mermaid parsing.

**Solution Pattern:**

```mermaid
<!-- ❌ INCORRECT: Missing quotes -->
graph TD
    A[User Login] --> B{Valid?}
    B -->|Yes| C[Dashboard]

<!-- ✅ CORRECT: All text in quotes -->
graph TD
    A["User Login"] --> B{"Valid?"}
    B -->|"Yes"| C["Dashboard"]
```

**Prevention:**

- ALL text in Mermaid diagrams must be in double quotes
- Refer to [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md) for complete rules
- Implement debug mode in all Mermaid components

**Recurrence Count:** Multiple times across different content creation sessions
**Last Seen:** Content generation workflows

---

## BUILD & DEPLOYMENT ISSUES

### Issue: Development Server Crashes on File Watch

**Pattern:** `pnpm run dev` crashes when certain file types are modified during development.

**Root Cause:** File watcher conflicts with temporary files or rapid file changes.

**Solution Pattern:**

```bash
# Clear any temporary files
rm -rf .svelte-kit/
rm -rf node_modules/.cache/

# Restart development server
pnpm install
pnpm run dev
```

**Prevention:**

- Avoid editing multiple files simultaneously during hot reload
- Clear cache when development server becomes unstable
- Use proper file modification scope to prevent conflicts

**Recurrence Count:** 2+ times
**Last Seen:** Development workflow issues

---

## MOBILE-FIRST DESIGN ISSUES

### Issue: Components Breaking on Mobile Viewports

**Pattern:** Components work on desktop but break on mobile (≤390px) due to insufficient testing.

**Root Cause:** Desktop-first development approach ignoring mobile constraints.

**Solution Pattern:**

```css
/* ✅ CORRECT: Mobile-first approach */
.responsive-component {
	/* Mobile styles first */
	padding: 1rem;
	font-size: 0.875rem;
}

@media (min-width: 768px) {
	.responsive-component {
		/* Desktop enhancements */
		padding: 2rem;
		font-size: 1rem;
	}
}
```

**Prevention:**

- ALWAYS test mobile experience (≤390px) BEFORE desktop
- Use mobile-first CSS approach
- Implement responsive design from the start, not as an afterthought

**Recurrence Count:** Multiple times
**Last Seen:** Component development sessions

---

## PREVENTION WORKFLOW

### Systematic Issue Prevention

1. **Pre-Development Checklist:**
   - [ ] Review this document before starting new features
   - [ ] Verify mobile-first approach is planned
   - [ ] Confirm TypeScript interfaces are designed
   - [ ] Check Mermaid diagram syntax if applicable

2. **During Development:**
   - [ ] Test mobile viewport continuously (≤390px)
   - [ ] Validate TypeScript compilation: `pnpm run check`
   - [ ] Run linting: `pnpm run lint`
   - [ ] Verify build success: `pnpm run build`

3. **Pre-Commit Validation:**
   - [ ] All tests pass: `pnpm run test`
   - [ ] Mobile experience validated
   - [ ] No new recurring patterns introduced

### Issue Documentation Process

**When to Add New Issues Here:**

1. Issue occurs for the **second time** in different sessions
2. Pattern shows systematic root cause
3. Fix is non-trivial and worth documenting
4. Likely to affect other developers

**Documentation Template:**

```markdown
### Issue: [Descriptive Title]

**Pattern:** [What repeatedly happens]

**Root Cause:** [Why it keeps happening]

**Solution Pattern:** [Code example of fix]

**Prevention:** [How to avoid in future]

**Recurrence Count:** [Number of times seen]
**Last Seen:** [Context/timeframe]
```

---

**💡 Remember:** This document is a living reference for **patterns that repeat**. Keep it focused on truly recurring issues, not one-time problems. When an issue stops recurring for 6+ months, consider moving it to archived documentation.
