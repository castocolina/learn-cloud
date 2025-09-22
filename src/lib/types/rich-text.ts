/**
 * Rich Text Data Structures for Secure Content Display
 *
 * This module provides a structured system for rich text content representation,
 * replacing simple string properties and preventing raw HTML injection.
 *
 * The system enables secure content rendering without {@html} usage while
 * maintaining formatting flexibility and type safety.
 *
 * Implementation as defined in TASK 2B: Define Rich Text Data Structures
 */

/**
 * Core rich text fragment interface with formatting properties
 *
 * Represents a single formatted text segment with optional styling attributes.
 * All formatting is applied through TypeScript properties rather than HTML markup.
 */
export interface RichTextFragment {
	/** The text content of this fragment */
	text: string;

	/** Bold text formatting */
	bold?: boolean;

	/** Italic text formatting */
	italic?: boolean;

	/** Strikethrough text formatting */
	strikethrough?: boolean;

	/** Inline code formatting */
	code?: boolean;

	/** Text color (CSS color value) */
	color?: string;

	/** Background highlight color (CSS color value) */
	highlight?: string;

	/** Heading level for semantic structure */
	headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

	/** Link URL for hyperlinks */
	href?: string;

	/** Link target attribute */
	target?: "_blank" | "_self" | "_parent" | "_top";

	/** Additional CSS classes for custom styling */
	className?: string;

	/** Accessibility label for screen readers */
	ariaLabel?: string;
}

/**
 * Rich paragraph type representing an array of formatted text fragments
 *
 * A paragraph is composed of multiple fragments that can have different
 * formatting applied. This allows for complex inline formatting while
 * maintaining security and type safety.
 */
export type RichParagraph = RichTextFragment[];

/**
 * Rich text section for larger content blocks
 *
 * Represents a section containing multiple paragraphs with optional metadata.
 * Used for organizing content into logical sections with titles and descriptions.
 */
export interface RichTextSection {
	/** Optional section title */
	title?: string;

	/** Optional section description or subtitle */
	description?: string;

	/** Array of rich paragraphs in this section */
	content: RichParagraph[];

	/** Section identifier for navigation and linking */
	id?: string;

	/** Section type for styling and behavior */
	type?: "introduction" | "main" | "conclusion" | "sidebar" | "callout";

	/** Accessibility level for heading hierarchy */
	headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Rich text document for complete content representation
 *
 * Top-level container for rich text content, providing structure
 * and metadata for entire documents or content pieces.
 */
export interface RichTextDocument {
	/** Document title */
	title: string;

	/** Optional document summary or description */
	summary?: string;

	/** Array of rich text sections */
	sections: RichTextSection[];

	/** Document metadata */
	metadata?: {
		/** Author information */
		author?: string;

		/** Creation date */
		created?: Date;

		/** Last modified date */
		modified?: Date;

		/** Content version */
		version?: string;

		/** Document language */
		language?: string;

		/** Keywords for search and categorization */
		keywords?: string[];
	};
}

/**
 * Utility type for simple rich text content
 *
 * For content that only needs basic paragraph-level formatting
 * without the complexity of full document structure.
 */
export type SimpleRichText = RichParagraph;

/**
 * Rich text validation interface
 *
 * Provides structure for validating rich text content during
 * content creation and migration processes.
 */
export interface RichTextValidation {
	/** Whether the content is valid */
	isValid: boolean;

	/** Array of validation errors if any */
	errors: string[];

	/** Array of validation warnings */
	warnings: string[];

	/** Suggested improvements */
	suggestions: string[];
}
