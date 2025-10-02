<!--
	Dialog Wrapper Component (Complex Pattern Example)

	Purpose: Demonstrates complex wrapper pattern with SETTINGS integration
	Pattern Type: COMPLEX - Full-featured wrapper with configuration, z-index, mobile-first

	Key Patterns Demonstrated:
	- Svelte 5 runes syntax with derived state
	- SETTINGS integration for configuration
	- Z-index hierarchy compliance (var(--z-modal))
	- Mobile-first responsive behavior
	- Type-safe size variants using union types

	Usage Example:
	<script lang="ts">
		import { Dialog } from "$lib/components/shared";

		let isOpen = $state(false);
	</script>

	<Dialog bind:open={isOpen} size="lg" title="Example Dialog">
		<p>Dialog content here</p>
	</Dialog>

	Related Documentation:
	- docs/WRAPPER-PATTERN-GUIDE.md (complex wrapper patterns)
	- SVELTEKIT-GUIDE.md (z-index hierarchy, mobile-first design)
	- src/config/settings.ts (SETTINGS.ui.mermaid for modal configuration)

	Note for Task 8E (DialogManager):
	This component serves as the foundation pattern. Task 8E should EXTEND this
	pattern to create a global dialog manager with store-based state management.
-->
<script lang="ts">
	import * as DialogPrimitive from "$lib/components/ui/dialog";
	import { SETTINGS } from "$config/settings.js";
	import type { DialogProps } from "$types/ui";

	// Svelte 5 runes syntax: destructure props with defaults
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
	 *
	 * Mobile-first approach:
	 * - Mobile (≤390px): Full screen for all sizes except "sm"
	 * - Tablet/Desktop: Responsive max-width based on size variant
	 *
	 * Z-index handled by shadcn Dialog (uses var(--z-modal) internally)
	 */
	const sizeClasses = $derived.by(() => {
		const baseClasses = "w-full";

		switch (size) {
			case "sm":
				return `${baseClasses} max-w-sm`; // ~384px - compact dialogs
			case "md":
				return `${baseClasses} max-w-md`; // ~448px - standard dialogs
			case "lg":
				return `${baseClasses} max-w-lg`; // ~512px - large content
			case "xl":
				return `${baseClasses} max-w-xl`; // ~576px - extra large
			case "full": {
				// Use SETTINGS configuration for full-screen percentage
				const modalPercent = SETTINGS.ui.mermaid.modalPagePercent;
				return `${baseClasses} max-w-[${modalPercent}vw] max-h-[${modalPercent}vh]`;
			}
			default:
				return `${baseClasses} max-w-md`;
		}
	});

	/**
	 * Combined classes with size variants
	 *
	 * Pattern: Merge size classes with user-provided classes
	 */
	const dialogClasses = $derived(`${sizeClasses} ${className || ""}`);
</script>

<!--
	Dialog component structure using shadcn-svelte primitives

	Architecture:
	- DialogPrimitive.Root: Main container with open state
	- DialogPrimitive.Content: Content container with size/styling
	- DialogPrimitive.Header/Title/Description: Semantic structure

	Z-Index Compliance:
	- shadcn Dialog internally uses var(--z-modal) from app.css
	- No hardcoded z-index values (SVELTEKIT-GUIDE.md requirement)
-->
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

		<!-- Dialog body content -->
		<div class="dialog-body">
			{@render children()}
		</div>
	</DialogPrimitive.Content>
</DialogPrimitive.Root>

<!--
	Component-specific styles

	CRITICAL: Following SVELTEKIT-GUIDE.md standards:
	- NO @apply usage (Tailwind v4 incompatible)
	- Styles will be moved to src/app.css @layer components
	- This <style> block is temporary for Task 6 demonstration
-->
<style>
	.dialog-body {
		/* Temporary inline styles - will move to app.css in next step */
		padding: 1rem 0;
	}
</style>
