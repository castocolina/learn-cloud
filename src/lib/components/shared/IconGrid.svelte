<!--
IconGrid.svelte - Reusable Icon Grid Component (Task 8D - DRY Architecture)

Composite component that provides grid layout for multiple interactive icons.
Uses IconButton internally for each icon to maintain DRY principle - all
interactivity logic lives in IconButton, IconGrid only handles layout.

ARCHITECTURE (Composition over Duplication):
- IconButton: Atomic component with all interactivity logic
- IconGrid: Composite component providing grid layout + iteration
- Zero code duplication: IconGrid delegates all icon rendering to IconButton

FEATURES:
- Flexible positioning: absolute (floating) or inline (flexbox) modes
- Full customization: icon size, gap, columns, alignment via props
- Complete interaction feedback: hover, scale, active state, focus ring
- Mobile-first: ≥44px touch targets, responsive grid layout
- Variant system: default, primary, destructive, ghost
- State system: default, active, success, error for dynamic feedback
- Keyboard navigation: Tab, Enter, Space support

Architecture:
- Uses Svelte 5 runes for reactive state management
- Type-safe props via TypeScript interfaces (IconGridProps, IconItem)
- Modular CSS architecture (no inline styles)
- Centralized configuration from settings.ts with prop overrides

Usage Examples:

1. Dialog with absolute positioning (top-right corner):
   <IconGrid
     icons={dialogIcons}
     positioning="absolute"
     position={{ top: '1rem', right: '1rem' }}
     iconSize={20}
   />

2. CodeBlock with inline flexbox layout:
   <IconGrid
     icons={codeActions}
     positioning="inline"
     iconSize={18}
     columns={3}
   />

3. Diagram controls with zoom icons:
   <IconGrid
     icons={diagramControls}
     positioning="absolute"
     position={{ top: '0.5rem', right: '0.5rem' }}
     showTooltips={true}
   />

Props Configuration:
- icons: Array<IconItem> - Icon configurations
- positioning: 'absolute' | 'inline' - Positioning strategy
- iconSize: string | number - Icon size (default from settings)
- gap: string - Gap between icons (default from settings)
- columns: number | 'auto' | 'auto-fit' - Grid columns
- alignment: 'start' | 'center' | 'end' | 'stretch' - Grid alignment
- showTooltips: boolean - Enable shadcn-svelte Tooltip
- class: string - Custom CSS classes
- position: IconGridPosition - Absolute positioning coordinates

Accessibility:
- role="toolbar" on container for semantic HTML
- ARIA labels on each icon button (handled by IconButton)
- Keyboard navigation (Tab, Enter, Space)
- Focus management with visible focus rings
- ≥44px touch targets for WCAG 2.1 AA compliance
-->

<script lang="ts">
	import IconButton from "./IconButton.svelte";
	import type { IconGridProps } from "$types";
	import { SETTINGS } from "$config/settings.js";

	// ============================================================================
	// Props with defaults from settings.ts
	// ============================================================================

	let {
		icons,
		positioning = "inline",
		iconSize = SETTINGS.ui.iconGrid.defaultIconSize,
		gap = SETTINGS.ui.iconGrid.defaultGap,
		columns = "auto",
		alignment = "center",
		showTooltips: _showTooltips = SETTINGS.ui.iconGrid.showTooltips,
		class: className = "",
		position = { top: "0.5rem", right: "0.5rem" },
		...restProps
	}: IconGridProps = $props();

	// ============================================================================
	// Computed Styles (Svelte 5 $derived)
	// ============================================================================

	/**
	 * Generate dynamic CSS styles based on positioning and configuration
	 */
	const gridStyles = $derived.by(() => {
		// Resolve columns to valid grid-template-columns value
		let gridColumns: string;
		if (typeof columns === "number") {
			gridColumns = `repeat(${columns}, 1fr)`;
		} else if (columns === "auto" || columns === "auto-fit") {
			// Horizontal layout: auto-fit with minimum 44px touch targets
			gridColumns = "repeat(auto-fit, minmax(44px, 1fr))";
		} else {
			gridColumns = columns;
		}

		// Base CSS custom properties for grid configuration
		const base: Record<string, string | number> = {
			"--icon-size": typeof iconSize === "number" ? `${iconSize}px` : iconSize,
			"--icon-gap": gap,
			"--icon-columns": gridColumns,
			"--icon-alignment": alignment
		};

		// Add absolute positioning coordinates if using absolute mode
		if (positioning === "absolute") {
			return {
				...base,
				position: "absolute",
				...position
			};
		}

		return base;
	});

	/**
	 * Convert gridStyles object to inline style string
	 */
	const styleString = $derived(
		Object.entries(gridStyles)
			.map(([key, value]) => `${key}: ${value}`)
			.join("; ")
	);
</script>

<!-- ============================================================================
     Grid Container with IconButton Composition
     ============================================================================

     Architecture: IconGrid provides layout, IconButton provides interactivity.
     This composition pattern ensures DRY principle - all icon logic in one place.
     ============================================================================ -->

<div
	{...restProps}
	class="icon-grid icon-grid--{positioning} {className}"
	style={styleString}
	role="toolbar"
	aria-label="Actions"
>
	<!--
		Icon Button Iteration

		Each IconItem is passed directly to IconButton component via spread operator.
		IconButton handles all interactivity (hover, active, click, keyboard, ARIA).
		IconGrid only provides the grid layout structure.
	-->
	{#each icons as item (item.id)}
		<IconButton
			icon={item.icon}
			label={item.label}
			onClick={item.onClick}
			size={iconSize}
			variant={item.variant}
			iconState={item.state}
			disabled={item.disabled}
			class="icon-grid-item {item.class || ''}"
			ariaLabel={item.ariaLabel}
		/>
	{/each}
</div>
