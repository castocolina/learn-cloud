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

	// ============================================================================
	// Props with defaults from settings.ts
	// ============================================================================

	let {
		icon,
		label,
		onClick,
		size = SETTINGS.ui.iconGrid.defaultIconSize,
		variant = "default",
		iconState = "default",
		disabled = false,
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
	 * Icon component derived from props
	 */
	const IconComponent = $derived(icon);

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

<button
	{...restProps}
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
	<IconComponent {size} />
</button>
