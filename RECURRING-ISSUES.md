# Recurring Issues Documentation

This document contains **only recurring bugs and issues** that have appeared multiple times across different development sessions. Issues documented here represent patterns that are likely to reoccur and require systematic prevention.

> **📚 Related Documentation:**
>
> - [CLAUDE.md](CLAUDE.md) - Complete agent implementation guidelines
> - [TECHNICAL-SPECS.md](TECHNICAL-SPECS.md) - Technical architecture standards
> - [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md) - Critical Mermaid diagram standards

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
