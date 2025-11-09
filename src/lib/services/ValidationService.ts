/**
 * ValidationService
 *
 * Generic validation service that validates content using Zod schemas
 * and Mermaid diagram validation.
 *
 * Features:
 * - Runtime content validation using Zod discriminated unions
 * - Integration with MermaidValidator for diagram validation
 * - Business rules encoded in Zod schemas (no hardcoded logic)
 * - Centralized validation logic for all content types
 */

import type { ValidationConfig, SchemaValidationResult } from "$types/scripts";
import { MermaidValidator } from "$lib/utils/mermaid-validator.js";
import { CONTENT_SCHEMAS } from "$lib/schemas/ContentSchemas.js";

/**
 * Comprehensive ValidationService class
 */
export class ValidationService {
	private config: ValidationConfig;
	private mermaidValidator: MermaidValidator;

	constructor(config?: Partial<ValidationConfig>) {
		this.config = {
			enableMermaidValidation: true,
			enableBusinessRules: true,
			enableTypeValidation: true,
			skipValidationInTests: process.env.NODE_ENV === "test",
			...config
		};

		// Initialize MermaidValidator with appropriate configuration
		this.mermaidValidator = new MermaidValidator({
			verbose: false,
			maxParallelFiles: 5,
			validationTimeout: 30000,
			enableErrorCategorization: true
		});
	}

	/**
	 * Primary validation method using Zod schemas + Mermaid validation
	 *
	 * This is the main entry point for content validation. It:
	 * 1. Validates content structure using Zod discriminated union (CONTENT_SCHEMAS.AnyContent)
	 * 2. Validates Mermaid diagrams within the content (if any)
	 * 3. Returns combined validation result
	 *
	 * Business rules are enforced via Zod schemas (e.g., .min(10) for quiz questions)
	 *
	 * @param content - Unknown content object to validate
	 * @returns ValidationResult with success flag, errors, warnings, and validated data
	 */
	async validate(content: unknown): Promise<SchemaValidationResult> {
		try {
			// 1. Validate content structure and business rules with Zod
			const schemaResult = CONTENT_SCHEMAS.AnyContent.safeParse(content);

			if (!schemaResult.success) {
				const errors = schemaResult.error.issues.map((err) => {
					const path = err.path.length > 0 ? `${err.path.join(".")}: ` : "";
					return `${path}${err.message}`;
				});

				return {
					success: false,
					errors,
					warnings: []
				};
			}

			// 2. Validate Mermaid diagrams (if content has diagrams)
			const mermaidResult = await this.validateMermaidContent(JSON.stringify(schemaResult.data));

			// 3. Combine results
			return {
				success: mermaidResult.success,
				errors: mermaidResult.errors,
				warnings: mermaidResult.warnings,
				validatedData: schemaResult.data
			};
		} catch (error) {
			return {
				success: false,
				errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
				warnings: []
			};
		}
	}

	/**
	 * Validate Mermaid diagrams in content using centralized MermaidValidator
	 *
	 * This is an internal method used by validate(). It extracts Mermaid diagrams
	 * from content and validates their syntax.
	 */
	async validateMermaidContent(content: string): Promise<SchemaValidationResult> {
		if (!this.config.enableMermaidValidation) {
			return { success: true, errors: [], warnings: [] };
		}

		try {
			// Extract Mermaid diagrams from content
			const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
			const diagrams: Array<{ content: string; id: string }> = [];
			let match;
			let diagramIndex = 1;

			while ((match = mermaidRegex.exec(content)) !== null) {
				diagrams.push({
					content: match[1],
					id: `diagram-${diagramIndex++}`
				});
			}

			if (diagrams.length === 0) {
				return { success: true, errors: [], warnings: [] };
			}

			// Use centralized MermaidValidator for batch validation
			const validationResults = await this.mermaidValidator.validateDiagramBatch(diagrams);

			const errors: string[] = [];
			const warnings: string[] = [];

			for (const result of validationResults) {
				if (!result.isValid) {
					const errorMsg = `Mermaid ${result.id}: ${result.errorMessage}`;
					if (result.errorCategory) {
						errors.push(`${errorMsg} (${result.errorCategory})`);
					} else {
						errors.push(errorMsg);
					}
				}
			}

			return {
				success: errors.length === 0,
				errors,
				warnings:
					warnings.length > 0
						? warnings
						: [`Found ${diagrams.length} Mermaid diagram(s) to validate`]
			};
		} catch (error) {
			return {
				success: false,
				errors: [
					`Mermaid validation failed: ${error instanceof Error ? error.message : String(error)}`
				],
				warnings: []
			};
		}
	}

	/**
	 * Update validation configuration
	 */
	updateConfig(newConfig: Partial<ValidationConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	/**
	 * Get current validation configuration
	 */
	getConfig(): ValidationConfig {
		return { ...this.config };
	}
}

/**
 * Default ValidationService instance
 */
export const validationService = new ValidationService();

/**
 * Factory function for creating validation service with custom config
 */
export function createValidationService(config?: Partial<ValidationConfig>): ValidationService {
	return new ValidationService(config);
}
