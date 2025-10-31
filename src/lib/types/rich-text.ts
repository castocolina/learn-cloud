/**
 * Rich Text Data Structures for Secure Content Display (TASK 7B Refactored)
 *
 * Union-based architecture with separated concerns:
 * - Formatting (styles array) vs Semantics (heading) vs Navigation (link)
 * - Base interface for shared properties
 * - Type-safe discriminated unions prevent invalid combinations
 * - Array of styles eliminates if/else combinatoria
 *
 * Benefits:
 * - TypeScript prevents heading+link combinations at compile time
 * - Clean component implementation without nested conditionals
 * - Extensible for future node types (Image, Code, etc.)
 */

/**
 * Text formatting styles as union type
 * Applied as array to avoid combinatorial explosion in components
 */
export type TextStyle = "bold" | "italic" | "code" | "strikethrough";

/**
 * Link target types
 */
export type LinkTarget = "_blank" | "_self" | "_parent" | "_top";

/**
 * Base interface for all rich text nodes
 * Contains shared properties across all node types
 */
export interface BaseRichTextNode {
	/** Text content of the node */
	content: string;

	/** Array of text formatting styles */
	styles?: TextStyle[];

	/** Text color (CSS color value) */
	color?: string;

	/** Background highlight color (CSS color value) */
	highlight?: string;

	/** Additional CSS classes for custom styling */
	className?: string;

	/** Accessibility label for screen readers */
	ariaLabel?: string;
}

/**
 * Text Node - Plain or formatted text
 */
export interface TextNode extends BaseRichTextNode {
	type: "text";
}

/**
 * Link Node - Hyperlink with automatic external/internal detection
 */
export interface LinkNode extends BaseRichTextNode {
	type: "link";
	/** Link URL (external or internal path) */
	href: string;
	/** Link target attribute (auto-detected if not specified) */
	target?: LinkTarget;
}

/**
 * Heading Node - Semantic heading with level
 */
export interface HeadingNode extends BaseRichTextNode {
	type: "heading";
	/** Heading level (h1-h6) */
	level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Rich Text Node - Discriminated union of all node types
 * TypeScript enforces type safety and prevents invalid combinations
 */
export type RichTextNode = TextNode | LinkNode | HeadingNode;

/**
 * Rich Paragraph - Array of rich text nodes
 * Replaces old RichTextFragment[] approach
 */
export type RichParagraph = RichTextNode[];

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
