/**
 * Type definitions for validation utilities
 *
 * This module contains TypeScript interfaces and types used by the validation
 * system for content generation scripts and testing infrastructure.
 */

/**
 * Configuration options for validation operations
 */
export interface ValidationOptions {
	/** Target files or directories to validate */
	target?: string;
	/** Whether to run format validation (prettier) */
	includeFormat?: boolean;
	/** Whether to run TypeScript check validation */
	includeCheck?: boolean;
	/** Whether to run lint validation (eslint) */
	includeLint?: boolean;
	/** Whether validation should run at all */
	enabled?: boolean;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
	success: boolean;
	command: string;
	output: string;
	error?: string;
}

/**
 * Mermaid Diagram Validation Types
 *
 * These types are used by the Mermaid diagram validator script for
 * AST-based diagram detection and validation workflow.
 */

/**
 * Interface for diagram reference found in TypeScript files
 */
export interface DiagramReference {
	/** File path containing the diagram */
	filePath: string;
	/** Variable name or property path containing the diagram */
	variableName: string;
	/** The diagram definition as a string */
	diagramContent: string;
	/** Line number where the diagram starts */
	lineNumber: number;
	/** Column number where the diagram starts */
	columnNumber: number;
}

/**
 * Interface for validation result of a single Mermaid diagram
 */
export interface MermaidValidationResult {
	/** Reference to the diagram that was validated */
	reference: DiagramReference;
	/** Whether the diagram passed validation */
	isValid: boolean;
	/** Error message if validation failed */
	errorMessage?: string;
	/** Duration of validation in milliseconds */
	duration: number;
}

/**
 * Interface for file processing result during Mermaid validation
 */
export interface FileProcessingResult {
	/** File path that was processed */
	filePath: string;
	/** Number of diagrams found in the file */
	diagramsFound: number;
	/** Validation results for all diagrams in the file */
	results: MermaidValidationResult[];
	/** Processing duration in milliseconds */
	duration: number;
}

/**
 * Interface for overall Mermaid validation statistics
 */
export interface MermaidValidationStats {
	/** Total number of files processed */
	filesProcessed: number;
	/** Total number of diagrams found */
	diagramsFound: number;
	/** Number of diagrams that passed validation */
	validDiagrams: number;
	/** Number of diagrams that failed validation */
	invalidDiagrams: number;
	/** Total processing duration in milliseconds */
	totalDuration: number;
}
