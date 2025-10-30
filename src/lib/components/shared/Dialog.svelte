<!--
	Dialog Wrapper Component (TASK 8E - Hybrid Architecture)

	Purpose: Hybrid dialog wrapper supporting BOTH global store AND local state modes
	Pattern Type: COMPLEX - Full-featured wrapper with dual-mode operation

	ARCHITECTURE:
	=============
	This wrapper supports TWO modes of operation:

	MODE 1: Global Store (Imperativ - API calls from anywhere)
	-----------------------------------------------------------
	import { openDialog } from '$lib/stores/dialog';
	import SearchResults from './SearchResults.svelte';

	openDialog({
		title: "Search Results",
		content: SearchResults,
		size: "lg",
		props: { query: "cloud-native" }
	});

	MODE 2: Local State (Declarative - traditional Svelte pattern)
	---------------------------------------------------------------
	<script lang="ts">
		import { Dialog } from "$lib/components/shared";
		let isOpen = $state(false);
	</script>

	<Dialog bind:open={isOpen} size="lg" title="Local Dialog">
		<p>Dialog content here</p>
	</Dialog>

	KEY FEATURES:
	=============
	- Hybrid mode detection (automatic based on props)
	- IconButton close (top-right, ≥44px touch target)
	- Size variants: sm, md, lg, xl, full
	- Mobile-first: full-screen on ≤390px
	- Z-index hierarchy compliance (var(--z-modal))
	- Dynamic component rendering (store mode)
	- shadcn-overrides.css compliance (no glassmorphism)
	- Accessibility: ARIA, keyboard handling, focus management

	CRITICAL ARCHITECTURAL FIX (2025-10-30):
	=========================================
	Fixed mobile full-height issue - dialogs were taking 900px height (100% viewport) instead of
	adjusting to content height on narrow screens (≤639px).

	ROOT CAUSE:
	- Line 158 (old): Was using `h-full sm:h-auto sm:!max-h-[90vh]`
	- `h-full` forced 100% height on mobile regardless of content amount
	- Result: All dialogs appeared as 568x900px at 600px viewport width
- Missing `overflow-y-auto` caused long content to spill outside dialog bounds

	FIX:
	- Changed to: `w-full h-auto max-h-[90vh] overflow-y-auto`
	- `h-auto`: Height adjusts to content at ALL viewport sizes
	- `max-h-[90vh]`: Prevents overflow at ALL viewport sizes
- `overflow-y-auto`: Enables internal scrolling when content exceeds max-height
	- Removed `sm:` prefixes: Universal behavior, not viewport-specific

	RESULT (verified via Playwright at 600px width):
	- Small: 568x132px (was 568x900px) ✅
	- Medium: 568x200px (was 568x900px) ✅
	- Large: 568x378px (was 568x900px) ✅
- Long content: 512x810px with internal scroll (scrollHeight: 3452px) ✅
	- Full width preserved, height now adjusts to content

	TASK 8E COMPLETION:
	===================
	Used by: Search (8M), Flipcards (8H), Diagrams (8G), Code Blocks (8F)

	Related Documentation:
	- docs/WRAPPER-PATTERN-GUIDE.md (wrapper patterns)
	- SVELTEKIT-GUIDE.md (z-index hierarchy, mobile-first design)
	- src/lib/stores/dialog.ts (global dialog store)
	- PLAN-TODO-FEATURES.md (TASK 8E specification)
-->
<script lang="ts">
	import * as DialogPrimitive from "$lib/components/ui/dialog";
	import { dialogStore, closeDialog } from "$lib/stores/dialog";
	import { SETTINGS } from "$config/settings.js";
	import type { DialogProps } from "$types/ui";
	import IconButton from "$lib/components/shared/IconButton.svelte";
	import { X } from "lucide-svelte";

	// Svelte 5 runes syntax: destructure props with defaults
	let {
		open = $bindable(undefined),
		size = "md",
		title,
		description,
		showCloseButton = true,
		closeButton,
		class: className,
		children
	}: DialogProps = $props();

	/**
	 * Hybrid Mode Detection
	 *
	 * MODE 1 (Store): When open prop is undefined → use global dialog store
	 * MODE 2 (Local): When open prop is provided → use local bind:open state
	 *
	 * This allows the same component to work in two ways:
	 * - openDialog() function (imperative, from anywhere)
	 * - bind:open={localState} (declarative, traditional Svelte)
	 */
	const isStoreMode = $derived(open === undefined);

	/**
	 * Actual open state (derives from store OR local state)
	 *
	 * Store mode: uses $dialogStore.isOpen
	 * Local mode: uses open prop
	 */
	const actualOpen = $derived(isStoreMode ? $dialogStore.isOpen : open);

	/**
	 * Effective size (from store in store mode, from props otherwise)
	 */
	const effectiveSize = $derived(isStoreMode ? $dialogStore.size || size : size);

	/**
	 * Effective title (from store in store mode, from props otherwise)
	 */
	const effectiveTitle = $derived(isStoreMode ? $dialogStore.title : title);

	/**
	 * Effective description (from props only - store doesn't manage description)
	 */
	const effectiveDescription = $derived(description);

	/**
	 * Size-based CSS classes using derived state
	 *
	 * MOBILE-FIRST APPROACH (TASK 8E requirement):
	 * - Mobile (≤639px): ALWAYS full-screen for ALL sizes (w-full h-full)
	 * - Tablet-portrait+ (≥640px): Responsive max-width AND max-height based on size variant
	 *
	 * HEIGHT FIX: All size variants now have max-height to prevent content overflow
	 * - sm/md/lg/xl: 90vh max-height (consistent with full-size default)
	 * - full: Uses SETTINGS.ui.mermaid.modalPagePercent for both width and height
	 *
	 * Z-index handled by shadcn Dialog (uses var(--z-modal) internally)
	 * shadcn-overrides.css ensures:
	 * - Overlay: rgba(0,0,0,0.6) - no glassmorphism
	 * - Content: 100% opaque background
	 *
	 * BREAKPOINT FIX (Issue #640-767px gap):
	 * Using sm: (640px) instead of md: (768px) to override shadcn's hardcoded sm:max-w-lg
	 * from the same breakpoint, eliminating the 127px "dead zone" where size variants
	 * were not respected (dialog stuck at 512px regardless of size prop).
	 * Using !important ensures our size variants always take precedence.
	 */
	const sizeClasses = $derived.by(() => {
		// Mobile-first: full WIDTH on mobile (≤639px), size variants on tablet-portrait+ (≥640px)
		// Height is ALWAYS auto to adjust to content, max-height prevents overflow
		// overflow-y-auto enables internal scrolling when content exceeds max-height
		const baseClasses = "w-full h-auto max-h-[90vh] overflow-y-auto";

		switch (effectiveSize) {
			case "sm":
				return `${baseClasses} sm:!max-w-sm`; // ~384px width - compact dialogs
			case "md":
				return `${baseClasses} sm:!max-w-md`; // ~448px width - standard dialogs
			case "lg":
				return `${baseClasses} sm:!max-w-lg`; // ~512px width - large content
			case "xl":
				return `${baseClasses} sm:!max-w-xl`; // ~576px width - extra large
			case "full":
				// For "full", we use inline styles (not classes) to support dynamic SETTINGS
				// Add marker class for CSS targeting
				return `${baseClasses} dialog-full-size`;
			default:
				return `${baseClasses} sm:!max-w-md`;
		}
	});

	/**
	 * Inline styles for "full" size variant
	 *
	 * Uses SETTINGS.ui.mermaid.modalPagePercent to support configuration
	 * Tailwind doesn't support dynamic class interpolation, so we use inline styles
	 *
	 * NOTE: Only applies on tablet-portrait+ (≥640px via @media in CSS)
	 * Mobile (≤639px) is always full-screen via Tailwind classes
	 */
	const fullSizeStyles = $derived.by(() => {
		if (effectiveSize !== "full") return undefined;

		const modalPercent = SETTINGS.ui.mermaid.modalPagePercent;
		// Using CSS custom properties to apply only on desktop
		return {
			"--dialog-max-width": `${modalPercent}vw`,
			"--dialog-max-height": `${modalPercent}vh`
		};
	});

	/**
	 * Combined classes with size variants
	 *
	 * Pattern: Merge size classes with user-provided classes
	 * Mobile (≤639px): rounded-none (full-screen)
	 * Tablet-portrait+ (≥640px): rounded-lg (default shadcn)
	 *
	 * VERTICAL SPACING FIX:
	 * shadcn default gap-4 (16px) creates excessive vertical expansion between header and content.
	 * We override with !gap-0 (no gap) to completely eliminate vertical expansion.
	 * Content can add its own spacing via mt-* classes as needed.
	 */
	const dialogClasses = $derived(
		`${sizeClasses} !gap-0 rounded-none sm:rounded-lg ${className || ""}`
	);

	/**
	 * Handle close button click
	 * Works in both store and local state modes
	 */
	function handleClose(): void {
		if (isStoreMode) {
			closeDialog();
		} else {
			open = false;
		}
	}
</script>

<!--
	Dialog component structure using shadcn-svelte primitives

	HYBRID ARCHITECTURE:
	- Store mode: Uses $dialogStore for state and dynamic component rendering
	- Local mode: Uses bind:open and renders children snippet

	Architecture:
	- DialogPrimitive.Root: Main container with open state
	- DialogPrimitive.Portal: Portal rendering at document level
	- DialogPrimitive.Overlay: Semi-transparent backdrop (via shadcn-overrides.css)
	- DialogPrimitive.Content: Content container with size/styling
	- IconButton: Close button (top-right, ≥44px touch target)
	- DialogPrimitive.Header/Title/Description: Semantic structure

	Z-Index Compliance:
	- shadcn Dialog uses hardcoded z-50 (overridden via shadcn-overrides.css)
	- Overlay: var(--z-overlay) = 200 (overridden with !important)
	- Content: var(--z-modal) = 210 (overridden with !important)
	- Overrides required due to shadcn hardcoded values (SVELTEKIT-GUIDE.md)

	shadcn-overrides.css ensures:
	- Overlay: rgba(0,0,0,0.6) for optimal contrast
	- Content: 100% opaque background (no glassmorphism)
-->
<DialogPrimitive.Root
	open={actualOpen}
	onOpenChange={(newOpen) => {
		if (isStoreMode) {
			if (!newOpen) closeDialog();
		} else {
			open = newOpen;
		}
	}}
>
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay />
		<DialogPrimitive.Content class={dialogClasses} showCloseButton={false} style={fullSizeStyles}>
			<!-- Custom Close Button (IconButton with subtle variant or custom snippet) -->
			{#if showCloseButton}
				<div class="absolute top-4 right-4 z-10">
					{#if closeButton}
						<!-- Custom close button provided by user -->
						{@render closeButton()}
					{:else}
						<!-- Default: IconButton with subtle variant (WCAG 2.1 AA minimum 44x44px touch target) -->
						<IconButton
							icon={X}
							label="Close dialog"
							onClick={handleClose}
							variant="subtle"
							class="min-h-11 min-w-11"
						/>
					{/if}
				</div>
			{/if}

			<!-- Dialog header (title and description) -->
			{#if effectiveTitle || effectiveDescription}
				<DialogPrimitive.Header>
					{#if effectiveTitle}
						<DialogPrimitive.Title>{effectiveTitle}</DialogPrimitive.Title>
					{/if}
					{#if effectiveDescription}
						<DialogPrimitive.Description>{effectiveDescription}</DialogPrimitive.Description>
					{/if}
				</DialogPrimitive.Header>
			{/if}

			<!-- Dialog body content -->
			{#if isStoreMode && $dialogStore.content}
				<!-- Store mode: Dynamic component rendering -->
				{@const ContentComponent = $dialogStore.content}
				<ContentComponent {...$dialogStore.props || {}} />
			{:else}
				<!-- Local mode: Render children snippet -->
				{@render children?.()}
			{/if}
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>

<!--
	Component-specific styles

	CRITICAL: Following SVELTEKIT-GUIDE.md standards:
	- NO @apply usage (Tailwind v4 incompatible)
	- Styles will be moved to src/app.css @layer components
	- This <style> block is temporary for Task 6 demonstration
-->
<style>
	/**
	 * Full-size dialog: Apply SETTINGS-based dimensions on tablet-portrait+ only
	 *
	 * Uses CSS custom properties set via inline styles (--dialog-max-width, --dialog-max-height)
	 * Only applies to dialogs with size="full" (marked with .dialog-full-size class)
	 * Mobile (< 640px): Always full-screen via Tailwind classes
	 * Tablet-portrait+ (≥ 640px): Uses SETTINGS.ui.mermaid.modalPagePercent (default 90%)
	 */
	@media (min-width: 640px) {
		:global([data-slot="dialog-content"].dialog-full-size) {
			max-width: var(--dialog-max-width, 90vw) !important;
			max-height: var(--dialog-max-height, 90vh) !important;
		}
	}
</style>
