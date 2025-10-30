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
 * Dialog wrapper component props
 *
 * Extends shadcn-svelte Dialog with:
 * - Size presets with responsive behavior
 * - SETTINGS integration for default configuration
 * - Mobile-first responsive patterns
 * - Custom close button support
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
	/** Show close button (default: true) */
	showCloseButton?: boolean;
	/** Custom close button snippet (optional - defaults to IconButton with subtle variant) */
	closeButton?: Snippet;
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

import type { RichParagraph, RichTextFragment } from "./rich-text.js";

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
	/** Array of rich text nodes to render (supports both legacy and new formats) */
	nodes: RichParagraph | RichTextFragment[];
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
 * - export type CodeBlockLanguage = "typescript" | "javascript" | ...;
 * - export interface CodeBlockProps { ... }
 * - export type MermaidDiagramType = "flowchart" | "sequence" | ...;
 * - export interface MermaidDiagramProps { ... }
 */
