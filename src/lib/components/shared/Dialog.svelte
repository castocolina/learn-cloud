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
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { dialogStore, closeDialog } from "$lib/stores/dialog";
	import { SETTINGS } from "$config/settings.js";
	import type { DialogProps } from "$types/ui";
	import IconButton from "$lib/components/shared/IconButton.svelte";
	import IconGrid from "$lib/components/shared/IconGrid.svelte";
	import { X } from "lucide-svelte";

	// Svelte 5 runes syntax: destructure props with defaults
	let {
		open = $bindable(undefined),
		size = "md",
		title,
		description,
		showCloseButton = SETTINGS.ui.dialog.closeButton.showByDefault,
		closeButton,
		actionButtons,
		topActionButtons,
		bottomActionButtons,
		customActions,
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
	 * Effective action buttons (from store in store mode, from props otherwise)
	 * Enables Dialog store to pass action buttons for CodeBlock full-view (Task 8F)
	 */
	const effectiveActionButtons = $derived(isStoreMode ? $dialogStore.actionButtons : actionButtons);

	/**
	 * Effective top action buttons (dual-group mode support - NEW for MermaidDiagram)
	 * Example: Download button positioned at top-right
	 */
	const effectiveTopActionButtons = $derived(
		isStoreMode ? $dialogStore.topActionButtons : topActionButtons
	);

	/**
	 * Effective bottom action buttons (dual-group mode support - NEW for MermaidDiagram)
	 * Example: 3×3 navigation grid positioned at bottom-right
	 */
	const effectiveBottomActionButtons = $derived(
		isStoreMode ? $dialogStore.bottomActionButtons : bottomActionButtons
	);

	/**
	 * Button mode detection
	 * - dualGroupMode: topActionButtons OR bottomActionButtons defined
	 * - singleGroupMode: actionButtons defined (legacy mode)
	 */
	const isDualGroupMode = $derived(!!(effectiveTopActionButtons || effectiveBottomActionButtons));
	const isSingleGroupMode = $derived(!!effectiveActionButtons && !isDualGroupMode);

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
		// Using flex flex-col for proper header/content separation
		//
		// SCROLL ARCHITECTURE FIX (2025-11-01):
		// Removed overflow-y-auto from DialogPrimitive.Content (moved to internal wrapper)
		// This enables sticky header that remains visible during content scroll
		// Scroll is now in .dialog-content-scroll-wrapper (see lines 652-660)
		// NOTE: CSS custom properties are applied via inline styles (fullSizeStyles), not Tailwind classes
		const baseClasses = "w-full max-h-[90vh] flex flex-col";

		switch (effectiveSize) {
			case "sm":
				return `${baseClasses} sm:!max-w-sm`; // ~384px width - compact dialogs
			case "md":
				return `${baseClasses} sm:!max-w-md`; // ~448px width - standard dialogs
			case "lg":
				return `${baseClasses} sm:!max-w-lg`; // ~512px width - large content
			case "xl":
				return `${baseClasses} sm:!max-w-xl`; // ~576px width - extra large
			case "2xl":
				return `${baseClasses} sm:!max-w-2xl`; // ~672px width - extra large content
			case "3xl":
				return `${baseClasses} sm:!max-w-3xl`; // ~768px width - full detailed views
			case "full":
				// For "full", we use inline styles (not Tailwind classes) to support dynamic SETTINGS
				// maxWidth and maxHeight are applied via fullSizeStyles (see lines 206-221)
				// Using marker class dialog-full-size for CSS targeting
				return `${baseClasses} dialog-full-size`;
			default:
				return `${baseClasses} sm:!max-w-md`;
		}
	});

	/**
	 * Inline styles for "full" size variant
	 *
	 * Uses SETTINGS.ui.mermaid.modalPagePercent to support dynamic configuration
	 * Tailwind arbitrary values don't support CSS custom properties, so we use inline styles
	 *
	 * IMPORTANT: maxWidth/maxHeight are applied directly as inline styles
	 * This ensures size="full" respects SETTINGS.ui.mermaid.modalPagePercent
	 *
	 * Mobile (≤639px): Always full-screen via Tailwind classes (w-full, max-h-[90vh])
	 * Tablet+ (≥640px): Uses configured modalPagePercent (default 90vw/90vh)
	 */
	const fullSizeStyles = $derived.by(() => {
		if (effectiveSize !== "full") return undefined;

		const modalPercent = SETTINGS.ui.mermaid.modalPagePercent;
		// FORCE width and height to modalPagePercent (not just limit with max-)
		// This ensures size="full" ALWAYS uses configured viewport percentage
		// Result: Dialog is ALWAYS 90vw × 90vh (not adaptive to content)
		return {
			width: `min(100vw, ${modalPercent}vw)`, // Force width (90vw on tablet+)
			height: `min(100vh, ${modalPercent}vh)`, // Force height (90vh on tablet+)
			maxWidth: `${modalPercent}vw`, // Safety fallback
			maxHeight: `${modalPercent}vh` // Safety fallback
		};
	});

	/**
	 * Combined classes with size variants
	 *
	 * Pattern: Merge size classes with user-provided classes
	 * Mobile (≤639px): rounded-none (full-screen)
	 * Tablet-portrait+ (≥640px): rounded-lg (default shadcn)
	 *
	 * SPACING SYSTEM:
	 * - !gap-0: Eliminate shadcn default gap-4 between header and content
	 * - !p-2: Reduce shadcn default p-6 (24px) to p-2 (8px) for breathing room
	 *   This creates harmonious spacing without excessive gaps
	 * - Header and content manage their own internal padding (20px each)
	 */
	const dialogClasses = $derived(
		`${sizeClasses} !gap-0 !p-2 rounded-none sm:rounded-lg ${className || ""}`
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

	/**
	 * Action Buttons Orientation (with Auto-Vertical Switching)
	 *
	 * SMART FEATURE: Auto-switches to vertical if horizontal + 4+ buttons
	 *
	 * Determines button layout orientation from actionButtons prop or SETTINGS default.
	 * Automatically switches to vertical if horizontal orientation has 4+ buttons
	 * to prevent horizontal overflow and improve UX.
	 */
	const effectiveActionButtonsOrientation = $derived.by(() => {
		if (!effectiveActionButtons) {
			return SETTINGS.ui.dialog.actionButtons.defaultOrientation;
		}

		const requestedOrientation =
			effectiveActionButtons.orientation || SETTINGS.ui.dialog.actionButtons.defaultOrientation;
		const iconCount = effectiveActionButtons.icons.length;

		// Auto-switch to vertical if horizontal + 4+ buttons
		if (requestedOrientation === "horizontal" && iconCount >= 4) {
			console.warn(
				`[Dialog] Auto-switched to vertical orientation (${iconCount} buttons). Horizontal supports 1-3 buttons for optimal UX.`
			);
			return "vertical";
		}

		return requestedOrientation;
	});

	/**
	 * Action Button Positioning Calculator (Reusable Function)
	 *
	 * ARCHITECTURE: Single source of truth for positioning logic
	 * Used by legacy single-group AND new dual-group modes
	 *
	 * POSITIONING BEHAVIOR:
	 * - content-aligned: Sticky float over content (76px from top, 20px from right)
	 * - close-adjacent: Adjacent to close button in header (respects safe zone)
	 *
	 * @param config - DialogActionButtonsConfig (effectiveActionButtons, effectiveTopActionButtons, etc.)
	 * @param orientation - Current orientation (after auto-vertical switching)
	 * @returns Position object with top/right/bottom/left CSS values
	 */
	function calculateActionButtonPosition(
		config: typeof effectiveActionButtons,
		orientation: "horizontal" | "vertical" | "grid"
	) {
		// Early return if no config
		if (!config) {
			return {
				top: "1.25rem",
				right: "1.25rem",
				bottom: "",
				left: "",
				alignment: SETTINGS.ui.dialog.actionButtons.defaultAlignment,
				closeButtonSafeZone: 76
			};
		}

		// Get alignment preference or fall back to SETTINGS default
		const alignment = config.alignment || SETTINGS.ui.dialog.actionButtons.defaultAlignment;
		const respectClose = config.respectCloseButton ?? true;

		// Close button safe zone calculation (from SETTINGS)
		const closeButtonWidth = parseInt(SETTINGS.ui.dialog.closeButton.size); // 44px (WCAG 2.1 min touch target)
		const closeButtonOffset = parseFloat(SETTINGS.ui.dialog.closeButton.offset.right) * 16; // Convert rem to px (1.25rem = 20px)
		const safeGap = parseInt(SETTINGS.ui.dialog.actionButtons.safeGap); // 12px minimum spacing
		const closeButtonSafeZone = closeButtonWidth + closeButtonOffset + safeGap; // 76px

		// Calculate position based on alignment AND orientation (using SETTINGS for all offsets)
		let top = SETTINGS.ui.dialog.closeButton.offset.top; // Default: align with close button (1.25rem)
		let right = "";
		let bottom = "";
		let left = "";

		switch (alignment) {
			case "content-aligned":
				// STICKY float OVER content area (always visible during scroll)
				// Positioned AFTER header, aligned with content padding
				right = SETTINGS.ui.dialog.actionButtons.alignmentOffsets.contentAligned; // 1.25rem (20px)
				top = SETTINGS.ui.dialog.actionButtons.alignmentOffsets.closeAdjacent; // 76px (after header)
				break;

			case "close-adjacent":
				// ABSOLUTE positioning adjacent to close button in header
				if (orientation === "horizontal") {
					// Horizontal: To the LEFT of close button with safe spacing
					right = SETTINGS.ui.dialog.actionButtons.alignmentOffsets.closeAdjacent; // 76px
					top = SETTINGS.ui.dialog.closeButton.offset.top; // 1.25rem (in header, aligned with close)
				} else {
					// Vertical/Grid: BELOW close button, SAME vertical column
					right = SETTINGS.ui.dialog.closeButton.offset.right; // 1.25rem (SAME as close button)
					top = SETTINGS.ui.dialog.actionButtons.alignmentOffsets.closeAdjacent; // 76px (below close button)
				}
				break;

			default:
				// Fallback: content-aligned behavior
				right = SETTINGS.ui.dialog.actionButtons.alignmentOffsets.contentAligned; // 1.25rem
				top = SETTINGS.ui.dialog.actionButtons.alignmentOffsets.closeAdjacent; // 76px
				console.warn(`[Dialog] Unknown alignment "${alignment}". Using default: content-aligned`);
		}

		// Safety check: Only enforce safe zone for close-adjacent alignment
		if (respectClose && alignment === "close-adjacent" && !bottom && !left && right) {
			const rightValue = parseInt(right);
			if (!isNaN(rightValue) && rightValue < closeButtonSafeZone) {
				// Adjust to safe zone to avoid collision
				right = `${closeButtonSafeZone}px`;
				console.warn(
					`[Dialog] Action buttons right offset adjusted from ${rightValue}px to ${closeButtonSafeZone}px to avoid close button collision`
				);
			}
		}

		return { top, right, bottom, left, alignment, closeButtonSafeZone };
	}

	/**
	 * Legacy Single-Group Positioning (backward compatible)
	 * Alias using shared calculation logic
	 */
	const actionButtonPositioning = $derived.by(() => {
		return calculateActionButtonPosition(effectiveActionButtons, effectiveActionButtonsOrientation);
	});

	/**
	 * Top Action Buttons Positioning (Dual-Group Mode)
	 * Alias using shared calculation logic
	 */
	const topActionButtonPositioning = $derived.by(() => {
		const orientation =
			effectiveTopActionButtons?.orientation || SETTINGS.ui.dialog.actionButtons.defaultOrientation;
		return calculateActionButtonPosition(effectiveTopActionButtons, orientation);
	});

	/**
	 * Bottom Action Buttons Positioning (Dual-Group Mode)
	 * Alias using shared calculation logic, with bottom positioning override
	 */
	const bottomActionButtonPositioning = $derived.by(() => {
		const orientation =
			effectiveBottomActionButtons?.orientation ||
			SETTINGS.ui.dialog.actionButtons.defaultOrientation;
		const pos = calculateActionButtonPosition(effectiveBottomActionButtons, orientation);

		// Override: Use bottom positioning instead of top for bottom group
		// Maintains same offset distance but anchors to bottom edge
		return {
			...pos,
			top: "", // Clear top
			bottom: pos.top || "1.25rem" // Use top value as bottom offset
		};
	});

	/**
	 * Position styles for action buttons container (Legacy Single-Group)
	 *
	 * ARCHITECTURE DECISION: Use inline styles instead of Tailwind classes
	 * - Tailwind v4 cannot detect dynamically generated arbitrary values like top-[${var}]
	 * - Inline styles work reliably for dynamic positioning from SETTINGS
	 * - Static classes for base styling (absolute, z-index), inline styles for positioning
	 */
	const positionStyles = $derived.by(() => {
		const pos = actionButtonPositioning;
		return {
			top: pos.top || undefined,
			right: pos.right || undefined,
			bottom: pos.bottom || undefined,
			left: pos.left || undefined
		};
	});

	/**
	 * Position styles for top action buttons (Dual-Group Mode)
	 * Alias using shared styling logic
	 */
	const topPositionStyles = $derived.by(() => {
		const pos = topActionButtonPositioning;
		return {
			top: pos.top || undefined,
			right: pos.right || undefined,
			bottom: pos.bottom || undefined,
			left: pos.left || undefined
		};
	});

	/**
	 * Position styles for bottom action buttons (Dual-Group Mode)
	 * Alias using shared styling logic
	 */
	const bottomPositionStyles = $derived.by(() => {
		const pos = bottomActionButtonPositioning;
		return {
			top: pos.top || undefined,
			right: pos.right || undefined,
			bottom: pos.bottom || undefined,
			left: pos.left || undefined
		};
	});

	/**
	 * Base position classes for action buttons container
	 *
	 * POSITIONING STRATEGY (RESTORED 2025-11-01):
	 * - Simplified to absolute positioning only (no sticky/fixed complexity)
	 * - Positioned relative to DialogPrimitive.Content
	 * - Removed visual chrome (background, border, shadow) that caused width issues
	 *
	 * LAYOUT FIX:
	 * - Added flex layout to wrapper div to ensure IconGrid aligns correctly
	 * - IconGrid uses flex-row or flex-col internally
	 * - Without wrapper flex layout, IconGrid doesn't align to right edge
	 *
	 * Z-INDEX HIERARCHY (updated 2025-11-01 for sticky header):
	 * - Close button: z-[230] (highest, must be clickable above all elements)
	 * - Action buttons: z-[225] (above sticky header, visible on surface)
	 * - Sticky header: z-[220] (above content, remains visible during scroll)
	 * - Dialog content: z-[210]
	 * - Dialog overlay: z-[200]
	 */
	const actionButtonsClasses = $derived("absolute z-[225] flex items-start justify-end");

	/**
	 * Visibility Validation (DEV mode only)
	 *
	 * Validates that at least the minimum number of action buttons are visible.
	 * Logs development warnings if insufficient space detected.
	 *
	 * VALIDATION CRITERIA:
	 * - Minimum visible buttons: 3 (configurable via effectiveActionButtons.minVisibleButtons)
	 * - Only applies when effectiveActionButtons.icons is provided
	 * - Only runs in DEV mode (import.meta.env.DEV)
	 */
	/*
	 * TEMPORARILY DISABLED: Action Button Visibility Validation
	 * Reason: Requires $app/environment and $app/state imports (currently broken)
	 * TODO: Re-enable when SvelteKit environment imports are fixed
	 */
	/*
	$effect(() => {
		// Only validate in DEV mode
		if (!import.meta.env.DEV) return;

		// Only validate if we have structured action buttons
		if (!effectiveActionButtons?.icons) return;

		// Get minimum visible buttons requirement
		const minVisible =
			effectiveActionButtons.minVisibleButtons ?? SETTINGS.ui.dialog.actionButtons.minVisibleButtons;

		const totalButtons = effectiveActionButtons.icons.length;

		// Check if we have enough buttons
		if (totalButtons < minVisible) {
			console.warn(
				`[Dialog] Visibility validation: Only ${totalButtons} action button(s) provided, but minimum of ${minVisible} recommended for optimal UX.`
			);
		}

		// Additional check: warn if using content-aligned with many buttons
		const alignment = effectiveActionButtons.alignment || SETTINGS.ui.dialog.actionButtons.defaultAlignment;
		const orientation =
			effectiveActionButtons.orientation || SETTINGS.ui.dialog.actionButtons.defaultOrientation;

		if (alignment === "content-aligned" && orientation === "horizontal" && totalButtons > 5) {
			console.warn(
				`[Dialog] Visibility validation: ${totalButtons} horizontal buttons at 'content-aligned' may overflow on narrow screens. Consider using 'vertical' orientation or 'close-adjacent' alignment.`
			);
		}
	});
	*/

	/**
	 * Debug Mode Detection
	 *
	 * TEMPORARILY DISABLED: Requires $app/state and $app/environment
	 * TODO: Re-enable when SvelteKit environment imports are fixed
	 */
	// const showDebugOverlay = $derived(dev && page.url.searchParams.get("debug") === "true");
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
			<!-- Tooltip.Provider wrapper for action button tooltips -->
			<Tooltip.Provider delayDuration={0}>
				<!-- Custom Close Button (IconButton with subtle variant or custom snippet) -->
				{#if showCloseButton}
					<div
						class="absolute z-[230]"
						style:top={SETTINGS.ui.dialog.closeButton.offset.top}
						style:right={SETTINGS.ui.dialog.closeButton.offset.right}
					>
						{#if closeButton}
							<!-- Custom close button provided by user -->
							{@render closeButton()}
						{:else}
							<!-- Default: IconButton (WCAG 2.1 AA minimum 44x44px touch target) -->
							<!-- Variant and size controlled by SETTINGS -->
							<IconButton
								icon={X}
								label="Close dialog"
								onClick={handleClose}
								variant={SETTINGS.ui.dialog.closeButton.variant}
								class="min-h-11 min-w-11"
							/>
						{/if}
					</div>
				{/if}

				<!-- Legacy Single-Group Action Buttons (backward compatible) -->
				{#if isSingleGroupMode}
					<div
						class={actionButtonsClasses}
						style:top={positionStyles.top}
						style:right={positionStyles.right}
						style:bottom={positionStyles.bottom}
						style:left={positionStyles.left}
					>
						{#if effectiveActionButtons}
							<!-- Structured action buttons using IconGrid -->
							<IconGrid
								icons={effectiveActionButtons.icons}
								orientation={effectiveActionButtonsOrientation}
								gap={effectiveActionButtons.gap}
								iconSize={effectiveActionButtons.iconSize}
								showTooltips={effectiveActionButtons.showTooltips ?? false}
								class={effectiveActionButtons.class}
							/>
						{:else if customActions}
							<!-- Custom actions snippet for complex cases -->
							{@render customActions()}
						{/if}
					</div>
				{/if}

				<!-- NEW: Dual-Group Action Buttons (top + bottom) -->
				{#if isDualGroupMode}
					<!-- Top Action Buttons (e.g., Download button) -->
					{#if effectiveTopActionButtons}
						<div
							class={actionButtonsClasses}
							style:top={topPositionStyles.top}
							style:right={topPositionStyles.right}
							style:bottom={topPositionStyles.bottom}
							style:left={topPositionStyles.left}
						>
							<IconGrid
								icons={effectiveTopActionButtons.icons}
								orientation={effectiveTopActionButtons.orientation || "horizontal"}
								gridConfig={effectiveTopActionButtons.gridConfig}
								gap={effectiveTopActionButtons.gap}
								iconSize={effectiveTopActionButtons.iconSize}
								showTooltips={effectiveTopActionButtons.showTooltips ?? false}
								class={effectiveTopActionButtons.class}
							/>
						</div>
					{/if}

					<!-- Bottom Action Buttons (e.g., 3×3 navigation grid) -->
					{#if effectiveBottomActionButtons}
						<div
							class={actionButtonsClasses}
							style:top={bottomPositionStyles.top}
							style:right={bottomPositionStyles.right}
							style:bottom={bottomPositionStyles.bottom}
							style:left={bottomPositionStyles.left}
						>
							<IconGrid
								icons={effectiveBottomActionButtons.icons}
								orientation={effectiveBottomActionButtons.orientation || "grid"}
								gridConfig={effectiveBottomActionButtons.gridConfig}
								gap={effectiveBottomActionButtons.gap}
								iconSize={effectiveBottomActionButtons.iconSize}
								showTooltips={effectiveBottomActionButtons.showTooltips ?? false}
								class={effectiveBottomActionButtons.class}
							/>
						</div>
					{/if}
				{/if}

				<!-- Debug Visualization Overlay (TEMPORARILY DISABLED - requires showDebugOverlay) -->
				{#if false}
					{@const pos = actionButtonPositioning}
					<div class="debug-overlay pointer-events-none absolute inset-0 z-50">
						<!-- Close Button Bounding Box (Red) -->
						<!-- eslint-disable-next-line svelte/no-inline-styles -- Debug overlay uses inline styles for dynamic values -->
						<div
							class="absolute border-2 border-red-500 bg-red-500/10"
							style="top: 1.25rem; right: 1.25rem; width: 44px; height: 44px;"
						>
							<div class="absolute right-0 -bottom-6 rounded bg-red-500 px-1 text-xs text-white">
								Close: 44x44px @ (20px, 20px)
							</div>
						</div>

						<!-- Safe Zone Visualization (Yellow) -->
						<!-- eslint-disable-next-line svelte/no-inline-styles -- Debug overlay uses inline styles for dynamic values -->
						<div
							class="absolute border-2 border-dashed border-yellow-500 bg-yellow-500/10"
							style="top: 1.25rem; right: 1.25rem; width: {pos.closeButtonSafeZone}px; height: 44px;"
						>
							<div
								class="absolute -bottom-6 left-0 rounded bg-yellow-500 px-1 text-xs whitespace-nowrap text-black"
							>
								Safe Zone: {pos.closeButtonSafeZone}px (44px + 20px + 12px)
							</div>
						</div>

						<!-- Action Buttons Position Indicator (Blue) -->
						{#if actionButtons}
							<!-- eslint-disable-next-line svelte/no-inline-styles -- Debug overlay uses inline styles for dynamic values -->
							<div
								class="absolute border-2 border-blue-500 bg-blue-500/10"
								style="top: {pos.top}; right: {pos.right}; min-width: 44px; min-height: 44px;"
							>
								<div
									class="absolute -top-6 right-0 rounded bg-blue-500 px-1 text-xs whitespace-nowrap text-white"
								>
									Alignment: {pos.alignment} | Right: {pos.right}
								</div>
							</div>
						{/if}

						<!-- Debug Info Panel -->
						<div
							class="absolute bottom-2 left-2 max-w-xs rounded-lg border border-gray-500 bg-black/90 p-3 text-xs text-white"
						>
							<div class="mb-2 font-bold">Dialog Debug Info</div>
							<div class="space-y-1">
								<div>
									<span class="text-gray-400">Alignment:</span>
									{pos.alignment}
								</div>
								<div>
									<span class="text-gray-400">Position:</span> Top: {pos.top}, Right: {pos.right}
								</div>
								<div>
									<span class="text-gray-400">Close Safe Zone:</span>
									{pos.closeButtonSafeZone}px
								</div>
								{#if actionButtons}
									<div>
										<span class="text-gray-400">Button Count:</span>
										{effectiveActionButtons?.icons.length ?? 0}
									</div>
									<div>
										<span class="text-gray-400">Orientation:</span>
										{effectiveActionButtonsOrientation}
									</div>
									<div>
										<span class="text-gray-400">Respect Close:</span>
										{effectiveActionButtons?.respectCloseButton ?? true}
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Dialog header - Sticky (remains visible during content scroll) -->
				{#if effectiveTitle || effectiveDescription}
					<DialogPrimitive.Header
						class="dialog-header-sophisticated sticky top-0 z-[220] flex-shrink-0 bg-background"
					>
						{#if effectiveTitle}
							<DialogPrimitive.Title>{effectiveTitle}</DialogPrimitive.Title>
						{/if}
						{#if effectiveDescription}
							<DialogPrimitive.Description>{effectiveDescription}</DialogPrimitive.Description>
						{/if}
					</DialogPrimitive.Header>
				{/if}

				<!-- Dialog body content - Scrollable wrapper (follows shadcn-svelte best practice) -->
				<div class="dialog-content-scroll-wrapper flex-1 overflow-y-auto">
					{#if isStoreMode && $dialogStore.content}
						<!-- Store mode: Dynamic component rendering -->
						{@const ContentComponent = $dialogStore.content}
						<ContentComponent {...$dialogStore.props || {}} />
					{:else}
						<!-- Local mode: Render children snippet -->
						{@render children?.()}
					{/if}
				</div>
			</Tooltip.Provider>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>

<style>
	/**
	 *
	 * JUSTIFICATION FOR COMPONENT-SCOPED CSS:
	 * These styles MUST remain in the component due to CSS precedence issues.
	 * Even with !important flags in components.css, shadcn Dialog base styles
	 * override @layer components. Component-scoped styles have higher specificity.
	 *
	 * TECHNICAL NECESSITY: Precedence override required for:
	 * - Multi-layer radial gradients (background-image)
	 * - Material Design 3 shadows (box-shadow)
	 * - Mask-image fade effects (mask-image, -webkit-mask-image)
	 * - Border radius asymmetric design
	 */
	:global([data-slot="dialog-header"].dialog-header-sophisticated) {
		/* Base styling */
		background-color: hsl(var(--background));

		/* Multi-layer radial gradients */
		background-image:
			radial-gradient(circle at 20% 35%, hsl(var(--primary) / 0.08) 0%, transparent 40%),
			radial-gradient(circle at 75% 70%, hsl(var(--foreground) / 0.06) 0%, transparent 30%),
			linear-gradient(135deg, hsl(var(--muted) / 0.5), hsl(var(--muted) / 0.2));

		/* Borders & corners */
		border: none !important;
		border-top-left-radius: 0.5rem;
		border-top-right-radius: 0.5rem;
		border-bottom-left-radius: 0.5rem;

		/* Material Design 3 shadows */
		box-shadow:
			0 4px 20px -2px rgba(0, 0, 0, 0.15),
			0 2px 12px -1px rgba(0, 0, 0, 0.1),
			0 1px 4px 0px rgba(0, 0, 0, 0.06),
			inset 0px -10px 16px -8px rgba(0, 0, 0, 0.1),
			inset 10px 0px 16px -8px rgba(0, 0, 0, 0.08);

		/* Dissolving edge effect */
		mask-image:
			linear-gradient(to right, black 0%, black 75%, transparent 100%),
			linear-gradient(to bottom, black 0%, black 92%, transparent 100%);
		-webkit-mask-image:
			linear-gradient(to right, black 0%, black 75%, transparent 100%),
			linear-gradient(to bottom, black 0%, black 92%, transparent 100%);
		mask-composite: intersect;
		-webkit-mask-composite: destination-in;

		/* Spacing */
		padding: 1.25rem !important;
		margin-bottom: 0 !important;
		position: relative;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		:global([data-slot="dialog-header"].dialog-header-sophisticated) {
			background-image:
				radial-gradient(circle at 20% 35%, hsl(var(--primary) / 0.05) 0%, transparent 40%),
				linear-gradient(135deg, hsl(var(--muted) / 0.4), hsl(var(--muted) / 0.15));
			padding: 1.25rem !important;
			border-radius: 0;
		}
	}
</style>
