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
		orientation = "horizontal",
		gridConfig = { columns: "auto-fit", rows: "auto", autoFlow: "row" },
		columns = "auto",
		alignment = "center",
		showTooltips = SETTINGS.ui.iconGrid.showTooltips,
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
		// Base CSS custom properties
		const base: Record<string, string | number> = {
			"--icon-size": typeof iconSize === "number" ? `${iconSize}px` : iconSize,
			"--icon-gap": gap,
			"--icon-alignment": alignment
		};

		// Grid-specific configuration (only for orientation="grid")
		if (orientation === "grid") {
			// Use gridConfig.columns or fallback to deprecated columns prop
			const effectiveColumns = gridConfig.columns ?? columns;
			const effectiveRows = gridConfig.rows ?? "auto";
			const effectiveAutoFlow = gridConfig.autoFlow ?? "row";

			// Resolve columns to grid-template-columns value
			let gridColumns: string;
			if (typeof effectiveColumns === "number") {
				gridColumns = `repeat(${effectiveColumns}, 1fr)`;
			} else if (effectiveColumns === "auto-fit" || effectiveColumns === "auto") {
				gridColumns = "repeat(auto-fit, minmax(44px, 1fr))";
			} else {
				gridColumns = effectiveColumns;
			}

			// Resolve rows to grid-template-rows value
			let gridRows: string;
			if (typeof effectiveRows === "number") {
				gridRows = `repeat(${effectiveRows}, 1fr)`;
			} else {
				gridRows = "auto";
			}

			base["--icon-columns"] = gridColumns;
			base["--icon-rows"] = gridRows;
			base["grid-auto-flow"] = effectiveAutoFlow;
		} else {
			// Legacy: For horizontal/vertical flex layouts (backward compatibility)
			let gridColumns: string;
			if (typeof columns === "number") {
				gridColumns = `repeat(${columns}, 1fr)`;
			} else if (columns === "auto" || columns === "auto-fit") {
				gridColumns = "repeat(auto-fit, minmax(44px, 1fr))";
			} else {
				gridColumns = columns;
			}
			base["--icon-columns"] = gridColumns;
		}

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
	class="icon-grid icon-grid--{positioning} icon-grid--{orientation} {className}"
	style={styleString}
	role="toolbar"
	aria-label="Actions"
>
	<!--
		Icon Button Iteration

		Each IconItem is passed directly to IconButton component via spread operator.
		IconButton handles all interactivity (hover, active, click, keyboard, ARIA).
		IconGrid only provides the grid layout structure.

		For grid orientation: null items render as empty divs to maintain grid structure
	-->
	{#each icons as item, index (item?.id || `empty-${index}`)}
		{#if item}
			<IconButton
				icon={item.icon}
				label={item.label}
				onClick={item.onClick}
				size={iconSize}
				variant={item.variant}
				iconState={item.state}
				badge={item.badge}
				badgeVerticalPosition={item.badgeVerticalPosition}
				badgeHorizontalPosition={item.badgeHorizontalPosition}
				badgeBackgroundOpacity={item.badgeBackgroundOpacity}
				badgeOpaque={item.badgeOpaque}
				badgeLayer={item.badgeLayer}
				badgeOffset={item.badgeOffset}
				disabled={item.disabled}
				showTooltip={showTooltips}
				class="icon-grid-item {item.class || ''}"
				ariaLabel={item.ariaLabel}
			/>
		{:else if orientation === "grid"}
			<!-- Empty grid cell (maintains grid structure) -->
			<div class="icon-grid-empty" aria-hidden="true"></div>
		{/if}
	{/each}
</div>
