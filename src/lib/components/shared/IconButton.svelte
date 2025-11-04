<!--
IconButton.svelte - Atomic Icon Button Component (Task 8D - DRY Architecture)

Base component for rendering a single interactive icon with consistent styling,
hover effects, focus states, and click handling. This component serves as the
atomic building block used internally by IconGrid.

ARCHITECTURE (DRY Principle):
- IconButton: Contains all interactivity logic (hover, active, focus, disabled)
- IconGrid: Uses IconButton internally for each icon (composition over duplication)
- This ensures zero code duplication - all icon interaction logic lives here

FEATURES:
- Full interactivity: hover, active, focus, disabled states
- Async onClick support for API calls and async operations
- Keyboard navigation: Tab, Enter, Space
- ARIA compliant: proper labels, roles, and attributes
- Touch targets: ≥44px minimum (WCAG 2.1 AA compliance)
- Variant system: default, primary, destructive, ghost
- State system: default, active, success, error
- CSS architecture: Reuses .icon-grid-item classes from components.css

USAGE EXAMPLES:

1. Simple icon button:
   <IconButton icon={Copy} label="Copy" onClick={handleCopy} />

2. With variant and state:
   <IconButton
     icon={Check}
     label="Copied!"
     variant="primary"
     state="success"
   />

3. Disabled state:
   <IconButton icon={Download} label="Download" disabled />

4. Custom size and classes:
   <IconButton
     icon={X}
     label="Close"
     onClick={handleClose}
     size={20}
     class="custom-close-btn"
   />

PROPS:
- icon: Lucide icon component (required)
- label: Accessible label (required)
- onClick: Click handler with async support (optional)
- size: Icon size in pixels or CSS unit (default: 20px)
- variant: Visual variant - default, primary, destructive, ghost (default: default)
- state: State indicator - default, active, success, error (default: default)
- disabled: Disable interaction (default: false)
- class: Additional CSS classes (optional)
- ariaLabel: Custom ARIA label (optional, defaults to label)
-->

<script lang="ts">
	import type { IconButtonProps } from "$types";
	import { cn } from "$lib/utils.js";
	import { SETTINGS } from "$config/settings.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	// ============================================================================
	// Props with defaults from settings.ts
	// ============================================================================

	let {
		icon: Icon,
		label,
		onClick,
		size = SETTINGS.ui.iconGrid.defaultIconSize,
		variant = "default",
		iconState = "default",
		badge,
		badgeVerticalPosition,
		badgeHorizontalPosition,
		badgeBackgroundOpacity,
		badgeOpaque,
		badgeLayer,
		badgeOffset,
		disabled = false,
		showTooltip = false,
		class: className = "",
		ariaLabel,
		...restProps
	}: IconButtonProps = $props();

	// ============================================================================
	// Reactive State (Svelte 5 runes)
	// ============================================================================

	/**
	 * Currently hovered state
	 */
	let isHovered = $state(false);

	/**
	 * Currently active state (during click animation)
	 */
	let isActive = $state(false);

	/**
	 * Filter null values from restProps for Tooltip compatibility
	 * Tooltip.Trigger doesn't accept null for id, only string | undefined
	 */
	const filteredRestProps = $derived(
		Object.fromEntries(Object.entries(restProps).filter(([_, value]) => value !== null))
	);

	// ============================================================================
	// Badge Processing (Icon + Text Strategy)
	// ============================================================================

	/**
	 * Processed badge text: truncated to maxChars and uppercased
	 * Example: "Download" → "DOWN", "svg" → "SVG"
	 */
	const processedBadge = $derived(
		badge ? badge.slice(0, SETTINGS.ui.iconGrid.badge.maxChars).toUpperCase() : undefined
	);

	/**
	 * Calculate badge positioning styles based on vertical and horizontal positions
	 * Supports 9 position combinations (3x3 grid: top/center/bottom × left/center/right)
	 * Uses prop overrides if provided, otherwise falls back to SETTINGS
	 *
	 * SMART POSITIONING (Visual Suggestion Strategy):
	 * When badge is positioned at "center" (vertical or horizontal), the badge
	 * automatically moves further from the icon's visual center to avoid obstruction.
	 * - Edge positions (top/bottom/left/right): Uses standard offset (2px)
	 * - Center positions: No offset needed (centered via transform)
	 *
	 * This "visual suggestion" approach ensures the badge doesn't cover the icon's
	 * critical visual area while maintaining flexibility for edge positioning.
	 */
	const badgePositionStyle = $derived(() => {
		if (!processedBadge) return "";

		// Use prop overrides if provided, otherwise use SETTINGS
		const verticalPosition = badgeVerticalPosition ?? SETTINGS.ui.iconGrid.badge.verticalPosition;
		const horizontalPosition =
			badgeHorizontalPosition ?? SETTINGS.ui.iconGrid.badge.horizontalPosition;
		const baseOffset = badgeOffset ?? SETTINGS.ui.iconGrid.badge.offset;

		// Smart offset: Use larger offset for non-center positions to create clear visual separation
		// Center positions don't need offset (they're positioned via transform centering)
		const verticalOffset = verticalPosition === "center" ? "0" : baseOffset;
		const horizontalOffset = horizontalPosition === "center" ? "0" : baseOffset;

		const styles: string[] = [];

		// Vertical positioning
		switch (verticalPosition) {
			case "top":
				styles.push(`top: -${verticalOffset};`);
				break;
			case "center":
				styles.push("top: 50%; transform: translateY(-50%);");
				break;
			case "bottom":
				styles.push(`bottom: -${verticalOffset};`);
				break;
		}

		// Horizontal positioning
		switch (horizontalPosition) {
			case "left":
				styles.push(`left: -${horizontalOffset};`);
				break;
			case "center":
				styles.push("left: 50%; transform: translateX(-50%);");
				break;
			case "right":
				styles.push(`right: -${horizontalOffset};`);
				break;
		}

		// Handle center-center case (both transforms needed)
		if (verticalPosition === "center" && horizontalPosition === "center") {
			// Replace individual transforms with combined one
			const filtered = styles.filter((s) => !s.includes("transform"));
			filtered.push("top: 50%; left: 50%; transform: translate(-50%, -50%);");
			return filtered.join(" ");
		}

		return styles.join(" ");
	});

	/**
	 * Resolved badge layer (from prop or SETTINGS)
	 */
	const resolvedBadgeLayer = $derived(badgeLayer ?? SETTINGS.ui.iconGrid.badge.layer);

	/**
	 * Badge background color with opacity
	 * Priority system:
	 * 1. badgeBackgroundOpacity prop (explicit numeric control)
	 * 2. badgeOpaque prop (boolean: true=0.9, false=0.0)
	 * 3. Layer-aware SETTINGS default:
	 *    - "behind" mode: SETTINGS.ui.iconGrid.badge.behindOpacity (0.6 - more visible)
	 *    - "overlay" mode: SETTINGS.ui.iconGrid.badge.backgroundOpacity (0.2 - transparent)
	 */
	const badgeBackgroundStyle = $derived(() => {
		let opacity: number;

		// Priority 1: Explicit opacity prop
		if (badgeBackgroundOpacity !== undefined) {
			opacity = badgeBackgroundOpacity;
		}
		// Priority 2: Boolean opaque toggle
		else if (badgeOpaque !== undefined) {
			opacity = badgeOpaque ? 0.9 : 0.0;
		}
		// Priority 3: Layer-aware SETTINGS default
		else {
			opacity =
				resolvedBadgeLayer === "behind"
					? SETTINGS.ui.iconGrid.badge.behindOpacity
					: SETTINGS.ui.iconGrid.badge.backgroundOpacity;
		}

		// Return empty string if fully transparent (no background needed)
		if (opacity === 0.0) {
			return "";
		}

		return `background: hsl(var(--muted) / ${opacity});`;
	});

	// ============================================================================
	// Variant Alias Resolution
	// ============================================================================

	/**
	 * Variant alias mapping - "default" points to the actual variant
	 * Change VARIANT_MAP.default to switch global default (e.g., 'primary', 'ghost')
	 */
	const VARIANT_MAP = {
		default: "subtle",
		subtle: "subtle",
		ghost: "ghost",
		primary: "primary",
		destructive: "destructive"
	} as const;

	/**
	 * Resolve variant alias to actual CSS class
	 */
	const resolvedVariant = $derived(VARIANT_MAP[variant]);

	// ============================================================================
	// Computed CSS Classes (Svelte 5 $derived)
	// ============================================================================

	/**
	 * Generate CSS classes based on iconState and resolved variant
	 * Reuses IconGrid's .icon-grid-item classes for consistency
	 */
	const buttonClasses = $derived(
		cn(
			"icon-grid-item",
			`icon-grid-item--${resolvedVariant}`,
			// Only apply iconState class if it's not "default" (default = no modifier)
			iconState !== "default" && `icon-grid-item--${iconState}`,
			{
				"icon-grid-item--hovered": isHovered,
				"icon-grid-item--active": isActive,
				"icon-grid-item--disabled": disabled
			},
			className
		)
	);

	// ============================================================================
	// Event Handlers
	// ============================================================================

	/**
	 * Handle icon click with async support
	 * Provides visual feedback and calls onClick handler
	 */
	async function handleClick(event?: MouseEvent): Promise<void> {
		if (disabled || !onClick) return;

		// Set active state for visual feedback
		isActive = true;

		try {
			// Execute onClick handler (supports async and passes event)
			await onClick(event);
		} finally {
			// Reset active state after brief delay for animation
			setTimeout(() => {
				isActive = false;
			}, 150);
		}
	}

	/**
	 * Handle keyboard events for accessibility
	 * Supports Enter and Space keys
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	}

	/**
	 * Handle mouse enter for hover state
	 */
	function handleMouseEnter(): void {
		if (!disabled) {
			isHovered = true;
		}
	}

	/**
	 * Handle mouse leave to clear hover state
	 */
	function handleMouseLeave(): void {
		isHovered = false;
	}
</script>

<!-- ============================================================================
     Icon Button Element
     ============================================================================ -->

{#if showTooltip}
	<Tooltip.Root>
		<Tooltip.Trigger
			{...filteredRestProps}
			class={buttonClasses}
			onclick={handleClick}
			onkeydown={handleKeydown}
			onmouseenter={handleMouseEnter}
			onmouseleave={handleMouseLeave}
			{disabled}
			aria-label={ariaLabel || label}
			type="button"
		>
			<div
				style="position: relative; display: inline-flex; align-items: center; justify-content: center;"
			>
				{#if resolvedBadgeLayer === "behind"}
					<!-- Behind Mode: Badge FIRST (z-index: 0), Icon SECOND (z-index: 1) -->
					{#if processedBadge}
						<span
							class="badge-text"
							style="position: absolute; z-index: 0; {badgePositionStyle()} {badgeBackgroundStyle()} border: 1px solid hsl(var(--border)); border-radius: 2px; padding: 0 2px; pointer-events: none;"
							aria-hidden="true"
						>
							{processedBadge}
						</span>
					{/if}
					<Icon {size} style="position: relative; z-index: 1;" />
				{:else}
					<!-- Overlay Mode (default): Icon FIRST (z-index: 0), Badge SECOND (z-index: 1) -->
					<Icon {size} />
					{#if processedBadge}
						<span
							class="badge-text"
							style="position: absolute; {badgePositionStyle()} {badgeBackgroundStyle()} border: 1px solid hsl(var(--border)); border-radius: 2px; padding: 0 2px; pointer-events: none;"
							aria-hidden="true"
						>
							{processedBadge}
						</span>
					{/if}
				{/if}
			</div>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{label}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<button
		{...filteredRestProps}
		class={buttonClasses}
		onclick={handleClick}
		onkeydown={handleKeydown}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		{disabled}
		aria-label={ariaLabel || label}
		title={label}
		type="button"
	>
		<div
			style="position: relative; display: inline-flex; align-items: center; justify-content: center;"
		>
			{#if resolvedBadgeLayer === "behind"}
				<!-- Behind Mode: Badge FIRST (z-index: 0), Icon SECOND (z-index: 1) -->
				{#if processedBadge}
					<span
						class="badge-text"
						style="position: absolute; z-index: 0; {badgePositionStyle()} {badgeBackgroundStyle()} border: 1px solid hsl(var(--border)); border-radius: 2px; padding: 0 2px; pointer-events: none;"
						aria-hidden="true"
					>
						{processedBadge}
					</span>
				{/if}
				<Icon {size} style="position: relative; z-index: 1;" />
			{:else}
				<!-- Overlay Mode (default): Icon FIRST (z-index: 0), Badge SECOND (z-index: 1) -->
				<Icon {size} />
				{#if processedBadge}
					<span
						class="badge-text"
						style="position: absolute; {badgePositionStyle()} {badgeBackgroundStyle()} border: 1px solid hsl(var(--border)); border-radius: 2px; padding: 0 2px; pointer-events: none;"
						aria-hidden="true"
					>
						{processedBadge}
					</span>
				{/if}
			{/if}
		</div>
	</button>
{/if}
