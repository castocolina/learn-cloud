/**
 * Scripts and CLI Types
 *
 * Centralized type definitions for all script-specific interfaces and types.
 * These types are used by various scripts in src/scripts/ and their corresponding utilities.
 *
 * Consolidates previously scattered type definitions to maintain consistency
 * and prevent duplication across the codebase.
 */

import type { ChapterType, ContentStatus, SupportedFormat } from "./types.js";

// ============================================================================
// CONTENT MENU GENERATOR TYPES
// ============================================================================

/**
 * Result interface for parsing content from CONTENT.md
 * Used by MarkdownContentGenerator for structured content parsing
 */
export interface ContentParseResult {
	content_type: ChapterType | null;
	chapter_num: string | null;
	unit_num: string | null;
	title: string | null;
	icon_name: string | null;
	emoji?: string | null;
	estimated_time?: number | null;
	difficulty?: string | null;
	prerequisites?: string[] | null;
	learning_objectives?: string[] | null;
}

// ============================================================================
// CONTENT SCAFFOLDING TYPES
// ============================================================================

/**
 * Internal scaffolding arguments interface
 * Used by content-creator.ts for scaffold command argument parsing
 */
export interface ScaffoldingArgs {
	unit?: string;
	type?: ChapterType;
	id?: string;
	help?: boolean;
	"list-units"?: boolean;
	"list-chapters"?: boolean;
}

// ============================================================================
// MERMAID VALIDATOR TYPES
// ============================================================================

/**
 * Enhanced Mermaid validation statistics with error categorization
 * Extends base MermaidValidationStats with additional diagnostic information
 */
export interface EnhancedMermaidValidationStats {
	filesProcessed: number;
	diagramsFound: number;
	validDiagrams: number;
	invalidDiagrams: number;
	totalDuration: number;
	commonErrors: Map<string, number>;
	errorsByCategory: Map<string, number>;
}

/**
 * Enhanced Mermaid validation result with additional error analysis
 * Extends base MermaidValidationResult with error categorization
 */
export interface EnhancedMermaidValidationResult {
	reference: {
		filePath: string;
		variableName: string;
		diagramContent: string;
		lineNumber: number;
		columnNumber: number;
	};
	isValid: boolean;
	errorMessage?: string;
	errorCategory?: string;
	duration: number;
}

// ============================================================================
// TEMPLATE GENERATOR TYPES
// ============================================================================

/**
 * Service configuration interface for template generation
 * Used by TemplateGenerator utility for service-related templates
 */
export interface ServiceConfig {
	name: string;
	port: number;
	replicas: number;
	resources: {
		requests: {
			memory: string;
			cpu: string;
		};
		limits: {
			memory: string;
			cpu: string;
		};
	};
}

/**
 * Server struct type for Go-style configuration templates
 * Used in template generation for backend service examples
 */
export type ServerStruct = {
	Host: string;
	Port: number;
	Database: {
		Driver: string;
		Host: string;
		Port: number;
		Name: string;
	};
	Cache: {
		Driver: string;
		TTL: number;
	};
};

// ============================================================================
// CLI COMMAND TYPES
// ============================================================================

/**
 * Common CLI configuration options
 * Shared across multiple script interfaces
 */
export interface CliOptions {
	help?: boolean;
	verbose?: boolean;
	dryRun?: boolean;
	force?: boolean;
}

/**
 * CLI command execution result
 * Standard result interface for script commands
 */
export interface CliExecutionResult {
	success: boolean;
	message?: string;
	data?: unknown;
	error?: string;
	warnings?: string[];
}

// ============================================================================
// CONTENT SCAFFOLDING GENERATOR TYPES
// ============================================================================

/**
 * Generation options for content scaffolding operations
 */
export interface GenerationOptions {
	dryRun: boolean;
	forceOverwrite?: boolean;
	verbose?: boolean;
}

/**
 * Unit information for content scaffolding
 */
export interface UnitInfo {
	id: string;
	title: string;
	technology?: string;
	description?: string;
}

/**
 * Chapter information for content scaffolding
 */
export interface ChapterInfo {
	id: string;
	title: string;
	type: ChapterType;
	difficulty?: string;
	estimatedTime?: number;
}

// ============================================================================
// SCHEMA GENERATION TYPES
// ============================================================================

/**
 * Options for schema generation operations
 */
export interface SchemaGenerationOptions {
	outputDirectory: string;
	format: "json-schema" | "openapi";
	includeReferences: boolean;
	validateOutput: boolean;
	dryRun: boolean;
}

/**
 * Result of schema generation operation
 */
export interface SchemaGenerationResult {
	success: boolean;
	schemasGenerated: number;
	outputDirectory: string;
	errors: string[];
	warnings: string[];
}

/**
 * Schema definition structure
 */
export interface SchemaDefinition {
	name: string;
	schema: unknown; // Zod schema or similar
	description?: string;
	category?: string;
}

// ============================================================================
// VALIDATION SERVICE TYPES
// ============================================================================

/**
 * Configuration interface for ValidationService
 */
export interface ValidationConfig {
	enableMermaidValidation: boolean;
	enableBusinessRules: boolean;
	enableTypeValidation: boolean;
	skipValidationInTests: boolean;
}

/**
 * Result of schema validation operation (Zod, etc.)
 */
export interface SchemaValidationResult {
	success: boolean;
	errors: string[];
	warnings: string[];
	validatedData?: unknown;
}

// ============================================================================
// REPOSITORY SERVICE TYPES
// ============================================================================

/**
 * Safety check result for content protection operations
 * Used by RepositoryService to determine if file operations can proceed
 */
export interface SafetyCheckResult {
	canProceed: boolean;
	requiresForce: boolean;
	warning?: string;
	error?: string;
	currentStatus?: ContentStatus;
}

/**
 * Write operation options for RepositoryService
 */
export interface WriteOptions {
	forceOverwrite?: boolean;
	createBackup?: boolean;
	validateContent?: boolean;
	respectContentStatus?: boolean;
	mode?: "safe" | "force" | "backup";
}

/**
 * Repository configuration interface
 */
export interface RepositoryConfig {
	mode: "safe" | "force" | "backup";
	createBackups: boolean;
	validateBeforeWrite: boolean;
	respectContentStatus: boolean;
	backupDirectory: string;
}

/**
 * Result of file operation
 */
export interface FileOperationResult {
	success: boolean;
	filePath: string;
	action: "created" | "updated" | "skipped" | "backed_up";
	backupPath?: string;
	error?: string;
	warnings?: string[];
	validationResults?: SchemaValidationResult;
}

/**
 * Transaction interface for batch operations
 */
export interface RepositoryTransaction {
	id: string;
	operations: Array<{
		filePath: string;
		content: string;
		options?: WriteOptions;
	}>;
	status: "pending" | "in_progress" | "completed" | "failed" | "rolled_back";
	results?: FileOperationResult[];
	startTime?: Date;
	endTime?: Date;
	error?: string;
}

// ============================================================================
// SCRIPT VALIDATION TYPES
// ============================================================================

/**
 * Script validation configuration
 * Common validation settings across scripts
 */
export interface ScriptValidationConfig {
	enableTypeValidation: boolean;
	enableBusinessRules: boolean;
	enableMermaidValidation: boolean;
	skipValidationInTests: boolean;
}

/**
 * File processing progress information
 * Used by scripts that process multiple files
 */
export interface FileProcessingProgress {
	current: number;
	total: number;
	currentFile: string;
	percentComplete: number;
	estimatedTimeRemaining?: number;
}

/**
 * File processing result for individual files
 * Used by file validation and processing scripts
 */
export interface FileProcessingResult {
	filePath: string;
	success: boolean;
	error?: string;
	warnings?: string[];
	processingTime: number;
	fileSize?: number;
	diagramsFound?: number;
	validDiagrams?: number;
	invalidDiagrams?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for ContentParseResult
 */
export function isContentParseResult(obj: unknown): obj is ContentParseResult {
	return typeof obj === "object" && obj !== null && ("content_type" in obj || "title" in obj);
}

/**
 * Type guard for ScaffoldingArgs
 */
export function isScaffoldingArgs(obj: unknown): obj is ScaffoldingArgs {
	return (
		typeof obj === "object" &&
		obj !== null &&
		Object.keys(obj).some((key) => ["unit", "type", "id", "help"].includes(key))
	);
}

/**
 * Type guard for CliExecutionResult
 */
export function isCliExecutionResult(obj: unknown): obj is CliExecutionResult {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"success" in obj &&
		typeof (obj as { success: unknown }).success === "boolean"
	);
}

// ============================================================================
// CONTENT CREATOR CLI TYPES
// ============================================================================

/**
 * Content inventory item for enhanced list command
 * Represents content status and filesystem comparison
 */
export interface ContentInventoryItem {
	unit: string;
	chapter: string;
	chapterNumber?: string;
	type: string;
	id: string;
	title: string;
	status: ContentStatus;
	fileExists: boolean;
	filePath: string;
	estimatedTime?: number;
	difficulty?: string;
}

/**
 * Inventory statistics for content management reporting
 * Provides breakdown by status for content lifecycle tracking
 */
export interface InventoryStats {
	total: number;
	existing: number;
	missing: number;
	byStatus: {
		expected: number;
		scaffold: number;
		draft: number;
		review: number;
		final: number;
		orphan: number;
	};
}

/**
 * Format options supporting both unified and granular format control
 * Default behaviors:
 * - list: plain (table output)
 * - view: json
 * - others: json
 */
export interface FormatOptions {
	/** Unified format for both input and output */
	format?: SupportedFormat;
	/** Specific input format (overrides unified format) */
	inputFormat?: SupportedFormat;
	/** Specific output format (overrides unified format) */
	outputFormat?: SupportedFormat;
}

/**
 * Extended command options with format support
 */
export interface ExtendedCommandOptions extends FormatOptions {
	dryRun?: boolean;
	forceOverwrite?: boolean;
	verbose?: boolean;
}

/**
 * Content Creator CLI command options with format support
 */
export interface ContentCreatorOptions extends ExtendedCommandOptions {
	unit?: string;
	type?: ChapterType;
	id?: string;
	file?: string;
	backup?: boolean;
	show?: boolean;
	set?: string;
	data?: string;
}

// ============================================================================
// FORMAT PROCESSOR TYPES
// ============================================================================

/**
 * Format processor result for input/output transformations
 */
export interface FormatProcessorResult<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	format: SupportedFormat;
}

/**
 * Format processor interface for extensible format handling
 */
export interface FormatProcessor {
	/** Parse input data from specified format */
	parse<T = unknown>(input: string, format: SupportedFormat): FormatProcessorResult<T>;
	/** Format output data to specified format */
	format<T = unknown>(data: T, format: SupportedFormat): FormatProcessorResult<string>;
	/** Get default format for specific command */
	getDefaultOutputFormat(command: string): SupportedFormat;
	/** Validate format compatibility */
	isFormatSupported(format: string): format is SupportedFormat;
}
