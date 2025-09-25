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
