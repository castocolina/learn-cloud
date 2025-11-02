/**
 * UI Component Types
 *
 * Centralized type definitions for wrapper components (Task 6 and beyond).
 * Following the global directive: ALL types reside in $types.
 *
 * Pattern: Union types as single source of truth for all string values.
 *
 * Related:
 * - SVELTEKIT-GUIDE.md (Union Type-First Architecture)
 * - docs/WRAPPER-PATTERN-GUIDE.md (Wrapper component patterns)
 * - Task 6: shadcn-svelte UI Components
 */

import type { Snippet } from "svelte";
import type { IconItem } from "./icon-grid.js";

// =====================================================
// BUTTON WRAPPER TYPES
// =====================================================

/**
 * Button variant union type
 * Re-exported from shadcn-svelte for centralized access
 */
import type {
	ButtonVariant as ShadcnButtonVariant,
	ButtonSize as ShadcnButtonSize
} from "$lib/components/ui/button/index.js";

export type ButtonVariant = ShadcnButtonVariant;
export type ButtonSize = ShadcnButtonSize;

/**
 * Button wrapper component props
 *
 * Supports all HTML button attributes and event handlers via index signature.
 * This allows passing onclick, onsubmit, data-*, aria-*, and other props.
 */
export interface ButtonProps {
	/** Button visual variant (union type constraint) */
	variant?: ButtonVariant;
	/** Button size preset (union type constraint) */
	size?: ButtonSize;
	/** Additional CSS classes */
	class?: string;
	/** Disabled state */
	disabled?: boolean;
	/** Button type attribute */
	type?: "button" | "submit" | "reset";
	/** Optional href for link-style buttons */
	href?: string;
	/** Button content (Svelte 5 snippet pattern) */
	children: Snippet;
	/** Allow any additional props (event handlers, data attributes, aria attributes, etc.) */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

// =====================================================
// DIALOG WRAPPER TYPES
// =====================================================

/**
 * Dialog size variants
 * Defines responsive modal sizes for different use cases
 */
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Action Button Alignment System (Intelligent Positioning)
 *
 * Defines how action buttons align relative to dialog boundaries and close button.
 * Prevents collision and ensures minimum visibility of 3 buttons.
 *
 * - 'content-aligned': Default - aligns with content padding (20px from right edge)
 * - 'close-adjacent': Positioned adjacent to close button with safe spacing (12px gap)
 * - 'header-boundary': Aligns with header padding boundaries
 * - 'custom': User-provided custom offsets
 */
/**
 * Action Button Alignment Presets
 *
 * Simplified two-option alignment system:
 * - content-aligned: Floats OVER content area with sticky positioning (always visible during scroll)
 * - close-adjacent: Adjacent to close button in header area
 *
 * Design Decision (2025-11-01):
 * Removed 'header-boundary' to eliminate collision issues and reduce complexity.
 * Industry research shows 65% of apps use separate zones (footer vs header) to avoid collisions.
 * Our floating pattern matches modern code editors (VS Code, GitHub, CodeSandbox).
 */
export type ActionButtonAlignment = "content-aligned" | "close-adjacent";

/**
 * Action button positioning configuration for Dialog
 *
 * Provides flexible positioning system supporting:
 * - 6 location presets (top-left, top-right, top-center, bottom-left, bottom-right, bottom-center)
 * - 2 orientations (horizontal, vertical)
 * - Custom positioning via customPosition
 * - Intelligent alignment system preventing collision with close button
 */
/**
 * Dialog Action Buttons Configuration
 *
 * Intelligent positioning system with automatic collision avoidance and smart defaults.
 *
 * ALIGNMENT BEHAVIOR:
 * - content-aligned: Sticky positioning over content (always visible during scroll)
 * - close-adjacent: Absolute positioning adjacent to close button in header
 *
 * SMART FEATURES:
 * - Auto-switches to vertical orientation if horizontal + 4+ buttons
 * - close-adjacent vertical: Stacks BELOW close button in same vertical column
 * - Automatic collision avoidance with 76px safe zone
 */
export interface DialogActionButtonsConfig {
	/** IconGrid icons array (required) */
	icons: IconItem[];

	/**
	 * Alignment preset for intelligent positioning
	 *
	 * - 'content-aligned': Sticky float over content (76px from top, 20px from right)
	 * - 'close-adjacent': Adjacent to close button (horizontal: left of close, vertical: below close)
	 *
	 * @default 'content-aligned' (from SETTINGS.ui.dialog.actionButtons.defaultAlignment)
	 */
	alignment?: ActionButtonAlignment;

	/**
	 * Orientation of button layout
	 *
	 * AUTO-SWITCH: If horizontal + 4+ buttons → automatically changes to vertical
	 *
	 * @default 'horizontal' (from SETTINGS.ui.dialog.actionButtons.defaultOrientation)
	 */
	orientation?: "horizontal" | "vertical";

	/**
	 * Whether to respect close button position and avoid collision
	 * @default true (from SETTINGS.ui.dialog.actionButtons.respectCloseButton)
	 */
	respectCloseButton?: boolean;

	/**
	 * Minimum number of buttons that must be visible
	 * If not met, development warning will be logged
	 * @default 3 (from SETTINGS.ui.dialog.actionButtons.minVisibleButtons)
	 */
	minVisibleButtons?: number;

	/** Gap between icons */
	gap?: string;

	/** Icon size */
	iconSize?: string | number;

	/** Additional CSS classes */
	class?: string;
}

/**
 * Dialog wrapper component props
 *
 * Extends shadcn-svelte Dialog with:
 * - Size presets with responsive behavior
 * - SETTINGS integration for default configuration
 * - Mobile-first responsive patterns
 * - Custom close button support
 * - Action buttons positioning system (NEW)
 */
/**
 * Dialog Wrapper Component Props
 *
 * Simplified API with intelligent action button positioning.
 * Supports both global store mode and local state mode.
 */
export interface DialogProps {
	/** Dialog open state (bindable) */
	open?: boolean;
	/** Dialog size variant */
	size?: DialogSize;
	/** Dialog title */
	title?: string;
	/** Dialog description */
	description?: string;
	/** Show close button (default: true - controlled by SETTINGS.ui.dialog.closeButton.showByDefault) */
	showCloseButton?: boolean;
	/** Custom close button snippet (optional - defaults to IconButton with subtle variant) */
	closeButton?: Snippet;

	/** Structured action buttons with intelligent positioning (recommended approach) */
	actionButtons?: DialogActionButtonsConfig;

	/** Custom actions snippet for complex cases */
	customActions?: Snippet;

	/** Additional CSS classes for content */
	class?: string;
	/** Dialog content (Svelte 5 snippet pattern) - optional for store mode */
	children?: Snippet;
}

// =====================================================
// PROGRESS WRAPPER TYPES
// =====================================================

/**
 * Progress bar size variants
 * Pattern: Responsive sizing for different use cases
 * - sm: Quiz question progress (compact)
 * - md: Standard progress indicators
 * - lg: Unit completion tracking (prominent)
 */
export type ProgressSize = "sm" | "md" | "lg";

/**
 * Progress wrapper component props
 *
 * Extends shadcn-svelte Progress with:
 * - Percentage display option
 * - Theme-aware styling
 * - Validation for value/max ranges
 */
export interface ProgressProps {
	/** Current progress value (0 to max) */
	value?: number;
	/** Maximum progress value (default: 100) */
	max?: number;
	/** Show percentage text (default: false) */
	showPercentage?: boolean;
	/** Additional CSS classes */
	class?: string;
	/** Progress bar height variant */
	size?: ProgressSize;
}

// =====================================================
// CONTENT HEADER WRAPPER TYPES (TASK 7)
// =====================================================

import type { ChapterType, ContentDifficulty, TechnologyUnit } from "./types.js";

/**
 * Content Header wrapper component props
 *
 * Provides differentiated headers for each ChapterType with:
 * - Type-specific icons and color gradients
 * - Unit-specific accent borders
 * - Metadata badges (difficulty, estimated time)
 * - Prerequisites and learning objectives
 * - Mobile-first responsive design
 *
 * Related:
 * - src/lib/components/shared/ContentHeader.svelte
 * - src/styles/components.css (header styles)
 */
export interface ContentHeaderProps {
	/** Content title */
	title: string;
	/** Chapter type for icon and color selection */
	chapterType: ChapterType;
	/** Optional unit name for accent color */
	unitName?: TechnologyUnit;
	/** Optional estimated time in minutes */
	estimatedTime?: number;
	/** Optional difficulty level */
	difficulty?: ContentDifficulty;
	/** Optional prerequisites list */
	prerequisites?: string[];
	/** Optional learning objectives list */
	learningObjectives?: string[];
	/** Optional summary text */
	summary?: string;
}

// =====================================================
// RICH PARAGRAPH WRAPPER TYPES (TASK 7B - Refactored)
// =====================================================

import type { RichParagraph } from "./rich-text.js";

/**
 * Rich Paragraph component props
 *
 * Secure renderer for RichTextNode[] arrays (union-based architecture).
 * Provides safe rendering of formatted text with:
 * - Type-safe discriminated unions (TextNode, LinkNode, HeadingNode)
 * - Dynamic heading levels (h1-h6)
 * - Array-based formatting (no combinatorial explosion)
 * - Secure link handling with auto-detection
 * - Accessibility support
 *
 * Related:
 * - src/lib/components/renderers/RichParagraph.svelte
 * - src/lib/types/rich-text.ts (RichTextNode union)
 * - src/lib/components/renderers/FormattedText.svelte
 * - src/lib/components/renderers/ExternalLink.svelte
 */
export interface RichParagraphProps {
	/** Array of rich text nodes to render */
	nodes: RichParagraph;
	/** Optional CSS class for custom styling */
	class?: string;
}

// =====================================================
// FUTURE TASK 8X WRAPPER TYPES
// =====================================================

/**
 * Placeholder for future wrapper types from Tasks 8X
 *
 * Tasks should add their wrapper types here following the same patterns:
 * - Union types for string values
 * - Interface for component props
 * - Snippet type for children
 * - SETTINGS integration where applicable
 *
 * Examples (to be implemented by respective tasks):
 * - export type MermaidDiagramType = "flowchart" | "sequence" | ...;
 * - export interface MermaidDiagramProps { ... }
 */

// =====================================================
// TASK 8F: CODEBLOCK COMPONENT TYPES
// =====================================================

/**
 * Shiki theme configuration for syntax highlighting
 * Supports light/dark mode integration
 */
export type ShikiTheme =
	| "github-light"
	| "github-dark"
	| "vitesse-light"
	| "vitesse-dark"
	| "dracula"
	| "nord"
	| "monokai";

/**
 * CodeBlock Component Props (Task 8F)
 *
 * Production-ready syntax highlighter with Shiki integration.
 * Supports 200+ programming languages with optimized bundle loading.
 */
export interface CodeBlockProps {
	/**
	 * Source code to display
	 */
	code: string;

	/**
	 * Programming language for syntax highlighting
	 * Must be included in SETTINGS.ui.codeBlock.syntax.enabledLanguages
	 */
	language: import("./types.js").ProgrammingLanguage;

	/**
	 * Optional title/caption displayed above code block
	 */
	title?: string;

	/**
	 * Optional filename to display (e.g., "config.ts", "Dockerfile")
	 */
	filename?: string;

	/**
	 * Line numbers to highlight (e.g., [1, 3, 5-7])
	 * @default undefined
	 */
	highlightLines?: number[];

	/**
	 * Show line numbers in gutter
	 * @default true (from SETTINGS.ui.codeBlock.defaults.showLineNumbers)
	 */
	showLineNumbers?: boolean;

	/**
	 * Enable copy-to-clipboard button
	 * @default true (from SETTINGS.ui.codeBlock.defaults.showCopyButton)
	 */
	showCopyButton?: boolean;

	/**
	 * Enable Dialog expansion button for full-screen view
	 * @default true (from SETTINGS.ui.codeBlock.defaults.showExpandButton)
	 */
	showExpandButton?: boolean;

	/**
	 * Enable download button to save code as file
	 * @default false (from SETTINGS.ui.codeBlock.defaults.showDownloadButton)
	 */
	showDownloadButton?: boolean;

	/**
	 * Maximum height before scrolling (CSS unit, e.g., "400px", "20rem")
	 * @default "600px" (from SETTINGS.ui.codeBlock.defaults.maxHeight)
	 */
	maxHeight?: string;

	/**
	 * Action grid orientation (applies to BOTH inline IconGrid and Dialog expansion)
	 * - horizontal: Buttons arranged left-to-right
	 * - vertical: Buttons stacked top-to-bottom
	 * @default "horizontal" (from SETTINGS.ui.codeBlock.actionButtons.defaultOrientation)
	 */
	actionGridOrientation?: "horizontal" | "vertical";

	/**
	 * Additional CSS classes
	 */
	class?: string;

	/**
	 * Unique identifier for accessibility
	 */
	id?: string;
}
