/**
 * IconGrid Component Type Definitions
 *
 * Type-safe interfaces and union types for the IconGrid shared component.
 * This component provides standardized icon presentation with consistent styling
 * (hover effects, borders, cursor, focus states) used across Dialog, CodeBlock,
 * Diagram, and other components.
 *
 * Architecture:
 * - Flexible positioning: absolute (floating) or inline (flexbox) modes
 * - Full customization: icon size, gap, columns, alignment via props
 * - Tooltip integration: shadcn-svelte Tooltip component for accessibility
 * - Complete interaction feedback: hover, scale, active state, focus ring
 * - Mobile-first: ≥44px touch targets, responsive grid layout
 */

import type { HTMLAttributes } from "svelte/elements";
import type { IconComponent } from "./icon-button.js";

/**
 * Icon positioning strategy within parent component
 *
 * - "absolute": Floats in fixed position within parent (e.g., top-right corner)
 *               Best for action buttons on cards/diagrams
 * - "inline": Flows naturally within component structure via flexbox
 *             Best for toolbar-style controls
 */
export type IconGridPositioning = "absolute" | "inline";

/**
 * Icon grid alignment options
 *
 * Controls how icons are aligned within the grid container.
 */
export type IconGridAlignment = "start" | "center" | "end" | "stretch";

/**
 * Visual variant for icon styling
 *
 * Provides different color schemes for icons based on their purpose.
 * - "default": Alias for "subtle" (default choice - configurable in components)
 * - "subtle": Visible but discrete styling (more contrast than ghost)
 * - "primary": Primary brand color
 * - "destructive": Red/warning color for dangerous actions
 * - "ghost": Transparent background, minimal styling
 */
export type IconVariant = "default" | "subtle" | "primary" | "destructive" | "ghost";

/**
 * Icon state for visual feedback
 *
 * Provides visual indication of icon's current state.
 * - "default": Normal state
 * - "active": Currently active/selected
 * - "success": Action completed successfully (e.g., "Copied!")
 * - "error": Action failed
 */
export type IconState = "default" | "active" | "success" | "error";

/**
 * Individual icon configuration
 *
 * Defines all properties for a single icon within the grid.
 */
export interface IconItem {
	/**
	 * Unique identifier for the icon
	 * Used for state tracking and React keys
	 */
	id: string;

	/**
	 * Lucide icon component to render
	 * Import from "@lucide/svelte" (e.g., Copy, Check, X)
	 *
	 * Accepts both Svelte 4 and Svelte 5 component types via IconComponent union (aligned with IconButton).
	 */
	icon: IconComponent;

	/**
	 * Accessible label for tooltip and screen readers
	 * Displayed in tooltip on hover and read by screen readers
	 */
	label: string;

	/**
	 * Click event handler
	 * Can be async for API calls or state updates
	 * @example onClick: async () => { await copyToClipboard(text); }
	 */
	onClick?: (event?: MouseEvent) => unknown;

	/**
	 * Disabled state (prevents interaction)
	 * When true, icon is grayed out and non-clickable
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Visual variant
	 * Changes color scheme based on icon's purpose
	 * @default "default"
	 */
	variant?: IconVariant;

	/**
	 * Current state (for visual feedback)
	 * Provides dynamic visual indication (e.g., success after copy)
	 * @default "default"
	 */
	state?: IconState;

	/**
	 * Badge text to display on icon (Icon + Text Strategy)
	 * Text is automatically truncated and uppercased
	 * @see IconButtonProps.badge for full documentation
	 * @default undefined (no badge)
	 */
	badge?: string;

	/**
	 * Badge vertical position (overrides SETTINGS)
	 * @see IconButtonProps.badgeVerticalPosition for full documentation
	 * @default undefined (uses SETTINGS value: "bottom")
	 */
	badgeVerticalPosition?: "top" | "center" | "bottom";

	/**
	 * Badge horizontal position (overrides SETTINGS)
	 * @see IconButtonProps.badgeHorizontalPosition for full documentation
	 * @default undefined (uses SETTINGS value: "right")
	 */
	badgeHorizontalPosition?: "left" | "center" | "right";

	/**
	 * Badge background opacity (explicit control)
	 * @see IconButtonProps.badgeBackgroundOpacity for full documentation
	 * @default undefined (uses SETTINGS value: 0.2)
	 */
	badgeBackgroundOpacity?: number;

	/**
	 * Badge background opaque/transparent toggle
	 * @see IconButtonProps.badgeOpaque for full documentation
	 * @default undefined (uses SETTINGS value: 0.2 - transparent)
	 */
	badgeOpaque?: boolean;

	/**
	 * Badge layering strategy - controls z-index rendering order
	 * @see IconButtonProps.badgeLayer for full documentation
	 * @default undefined (uses SETTINGS.ui.iconGrid.badge.layer: "overlay")
	 */
	badgeLayer?: "overlay" | "behind";

	/**
	 * Badge offset from icon edge (controls overlap percentage)
	 * @see IconButtonProps.badgeOffset for full documentation
	 * @default undefined (uses SETTINGS.ui.iconGrid.badge.offset: "10px")
	 */
	badgeOffset?: string;

	/**
	 * Custom CSS classes
	 * Additional Tailwind classes or custom styles
	 */
	class?: string;

	/**
	 * ARIA label override
	 * If different from tooltip label, use this for screen readers
	 */
	ariaLabel?: string;
}

/**
 * Position coordinates for absolute positioning mode
 *
 * Defines where the icon grid should be positioned within parent.
 * All values are CSS position values (e.g., "1rem", "10px", "0").
 */
export interface IconGridPosition {
	/**
	 * Distance from top edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	top?: string;

	/**
	 * Distance from right edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	right?: string;

	/**
	 * Distance from bottom edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	bottom?: string;

	/**
	 * Distance from left edge
	 * @example "0.5rem" | "10px" | "0"
	 */
	left?: string;
}

/**
 * Grid Layout Configuration
 * Only applies when orientation="grid"
 * Provides fine-grained control over CSS Grid 2D layout
 */
export interface IconGridConfig {
	/**
	 * Number of grid columns or auto-fit behavior
	 * @default "auto-fit"
	 * @example 2 - Fixed 2-column grid
	 * @example 3 - Fixed 3-column grid
	 * @example "auto-fit" - Responsive wrapping based on available space
	 */
	columns?: number | "auto-fit" | "auto";

	/**
	 * Number of grid rows (usually auto for natural flow)
	 * @default "auto"
	 * @example 3 - Fixed 3-row grid
	 * @example "auto" - Rows expand as needed
	 */
	rows?: number | "auto";

	/**
	 * CSS grid-auto-flow direction
	 * Controls how auto-placed items fill the grid
	 * @default "row"
	 */
	autoFlow?: "row" | "column" | "dense" | "row dense" | "column dense";
}

/**
 * IconGrid component props
 *
 * Complete configuration interface for the IconGrid component.
 * Extends HTMLAttributes to allow data-testid and other HTML attributes.
 */
export interface IconGridProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
	/**
	 * Array of icon configurations
	 * Each icon is rendered in the grid according to its properties
	 * Supports null items for grid layouts (renders empty cells to maintain structure)
	 * @example [{ id: 'copy', icon: Copy, label: 'Copy', onClick: handleCopy }]
	 * @example [null, panUp, zoomIn] - Grid with empty cell at start
	 */
	icons: (IconItem | null)[];

	/**
	 * Positioning strategy: 'absolute' (top-right) or 'inline' (flexbox)
	 * @default "inline"
	 */
	positioning?: IconGridPositioning;

	/**
	 * Icon size in pixels or CSS unit
	 * @default "20px" (from settings.ts)
	 * @example "24px" | "1.5rem" | 20
	 */
	iconSize?: string | number;

	/**
	 * Gap between icons (CSS gap property)
	 * @default "0.5rem" (from settings.ts)
	 * @example "0.25rem" | "8px"
	 */
	gap?: string;

	/**
	 * Icon layout orientation
	 * Controls layout mode:
	 * - "horizontal": Flex row (single line, left-to-right)
	 * - "vertical": Flex column (single stack, top-to-bottom)
	 * - "grid": CSS Grid 2D layout (rows × columns)
	 * @default "horizontal"
	 */
	orientation?: "horizontal" | "vertical" | "grid";

	/**
	 * Grid layout configuration (only applies when orientation="grid")
	 * Provides fine-grained control over grid dimensions and behavior
	 * @default { columns: "auto-fit", rows: "auto", autoFlow: "row" }
	 * @example { columns: 3, rows: 3 } - Fixed 3×3 grid
	 * @example { columns: 2 } - Fixed 2-column grid with auto rows
	 */
	gridConfig?: IconGridConfig;

	/**
	 * Number of columns (simple alternative to gridConfig.columns)
	 * @default "auto" - icons flow naturally
	 * @example 3 - exactly 3 columns | "auto-fit" - responsive columns
	 */
	columns?: number | "auto" | "auto-fit";

	/**
	 * Grid alignment
	 * @default "center"
	 */
	alignment?: IconGridAlignment;

	/**
	 * Enable tooltip functionality
	 * When true, uses shadcn-svelte Tooltip component
	 * When false, uses native title attribute
	 * @default true (from settings.ts)
	 */
	showTooltips?: boolean;

	/**
	 * Custom CSS classes for grid container
	 * Additional Tailwind classes or custom styles
	 */
	class?: string;

	/**
	 * Absolute positioning coordinates (for absolute mode)
	 * Defines where grid is positioned within parent
	 * @default { top: "0.5rem", right: "0.5rem" }
	 * @example { top: "1rem", right: "1rem" } - top-right with padding
	 * @example { bottom: "0", right: "0" } - bottom-right flush
	 */
	position?: IconGridPosition;
}
