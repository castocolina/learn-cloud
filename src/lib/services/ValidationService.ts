/**
 * ValidationService
 *
 * Comprehensive validation service that integrates Zod schema validation
 * with Mermaid diagram validation and business rule enforcement.
 *
 * Features:
 * - Type-safe validation using Zod schemas
 * - Integration with existing Mermaid validator
 * - Business rule enforcement for content generation
 * - Performance optimization with selective validation
 * - Centralized validation logic for all content types
 */

import { z } from "zod";
import type { ValidatedScaffoldingArgs } from "$types/scaffolding";
import type { ValidationConfig, ValidationResult } from "$types/scripts";
import { CONTENT_SCHEMAS } from "$lib/schemas/ContentSchemas.js";
import { SETTINGS } from "../../config/settings.js";
import { MermaidValidator } from "$lib/utils/mermaid-validator.js";

/**
 * Comprehensive ValidationService class
 */
export class ValidationService {
	private config: ValidationConfig;
	private schemas: Map<string, z.ZodType> = new Map();
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

		this.initializeSchemas();
	}

	/**
	 * Initialize Zod schemas using centralized CONTENT_SCHEMAS
	 */
	private initializeSchemas(): void {
		// Register centralized schemas
		this.schemas.set("scaffoldingArgs", CONTENT_SCHEMAS.ScaffoldingArgs);
		this.schemas.set("safetyCheck", CONTENT_SCHEMAS.SafetyCheckResult);
		this.schemas.set("contentGeneration", CONTENT_SCHEMAS.ContentGenerationResult);
		this.schemas.set("validationConfig", CONTENT_SCHEMAS.ValidationConfig);
		this.schemas.set("repositoryConfig", CONTENT_SCHEMAS.RepositoryConfig);
	}

	/**
	 * Validate scaffolding arguments
	 */
	async validateScaffoldingArgs(args: unknown): Promise<ValidationResult> {
		return this.validateWithSchema("scaffoldingArgs", args);
	}

	/**
	 * Validate content generation result
	 */
	async validateContentGeneration(result: unknown): Promise<ValidationResult> {
		return this.validateWithSchema("contentGeneration", result);
	}

	/**
	 * Validate safety check result
	 */
	async validateSafetyCheck(result: unknown): Promise<ValidationResult> {
		return this.validateWithSchema("safetyCheck", result);
	}

	/**
	 * Validate Mermaid diagrams in content using centralized MermaidValidator
	 */
	async validateMermaidContent(content: string): Promise<ValidationResult> {
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

	// validateSingleMermaidDiagram method removed - now using centralized MermaidValidator utility

	/**
	 * Validate business rules for content generation
	 */
	async validateBusinessRules(args: ValidatedScaffoldingArgs): Promise<ValidationResult> {
		if (!this.config.enableBusinessRules) {
			return { success: true, errors: [], warnings: [] };
		}

		const errors: string[] = [];
		const warnings: string[] = [];

		try {
			// Validate against configuration requirements
			const scaffoldingConfig = SETTINGS.scripts.scaffolding;

			// Check if the content type has specific requirements
			switch (args.type) {
				case "lesson":
					if (scaffoldingConfig.lessons.sections < 1) {
						warnings.push("Lesson configuration specifies no sections");
					}
					if (scaffoldingConfig.lessons.codeBlocks < 1) {
						warnings.push("Lesson configuration specifies no code blocks");
					}
					break;

				case "quiz":
					if (scaffoldingConfig.quizzes.questions < 1) {
						errors.push("Quiz configuration specifies no questions");
					}
					break;

				case "exam":
					if (scaffoldingConfig.exams.questions < 1) {
						errors.push("Exam configuration specifies no questions");
					}
					break;

				case "study_guide":
					if (scaffoldingConfig.studyGuides.flashcards < 1) {
						warnings.push("Study guide configuration specifies no flashcards");
					}
					break;

				case "project":
					if (scaffoldingConfig.projects.sections < 1) {
						warnings.push("Project configuration specifies no sections");
					}
					break;
			}

			// Validate unit and ID format
			if (args.unit) {
				const unitValue =
					args.unit.type === "numeric" ? args.unit.value.toString() : args.unit.value;
				if (typeof unitValue === "string" && !/^[\w-]+$/.test(unitValue)) {
					errors.push(
						"Unit name must contain only alphanumeric characters, hyphens, and underscores"
					);
				}
			}

			if (args.id && !/^[\w-]+$/.test(args.id)) {
				errors.push("ID must contain only alphanumeric characters, hyphens, and underscores");
			}

			return {
				success: errors.length === 0,
				errors,
				warnings
			};
		} catch (error) {
			return {
				success: false,
				errors: [
					`Business rule validation failed: ${error instanceof Error ? error.message : String(error)}`
				],
				warnings
			};
		}
	}

	/**
	 * Comprehensive validation combining all validation types
	 */
	async validateComprehensive(
		args: ValidatedScaffoldingArgs,
		content?: string
	): Promise<ValidationResult> {
		const results: ValidationResult[] = [];

		// Type validation
		if (this.config.enableTypeValidation) {
			results.push(await this.validateScaffoldingArgs(args));
		}

		// Business rules validation
		if (this.config.enableBusinessRules) {
			results.push(await this.validateBusinessRules(args));
		}

		// Mermaid validation (if content provided)
		if (content && this.config.enableMermaidValidation) {
			results.push(await this.validateMermaidContent(content));
		}

		// Combine results
		const combinedErrors: string[] = [];
		const combinedWarnings: string[] = [];
		let overallSuccess = true;

		for (const result of results) {
			if (!result.success) {
				overallSuccess = false;
			}
			combinedErrors.push(...result.errors);
			combinedWarnings.push(...result.warnings);
		}

		return {
			success: overallSuccess,
			errors: combinedErrors,
			warnings: combinedWarnings,
			validatedData: args
		};
	}

	/**
	 * Validate using a specific schema
	 */
	private async validateWithSchema(schemaName: string, data: unknown): Promise<ValidationResult> {
		const schema = this.schemas.get(schemaName);
		if (!schema) {
			return {
				success: false,
				errors: [`Schema '${schemaName}' not found`],
				warnings: []
			};
		}

		try {
			const validatedData = schema.parse(data);
			return {
				success: true,
				errors: [],
				warnings: [],
				validatedData
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					success: false,
					errors: error.issues.map((err) => `${err.path.join(".")}: ${err.message}`),
					warnings: []
				};
			}

			return {
				success: false,
				errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
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

	/**
	 * Register a custom schema
	 */
	registerSchema(name: string, schema: z.ZodType): void {
		this.schemas.set(name, schema);
	}

	/**
	 * Performance-optimized validation for testing
	 */
	async validateForTesting(args: ValidatedScaffoldingArgs): Promise<ValidationResult> {
		if (this.config.skipValidationInTests) {
			return {
				success: true,
				errors: [],
				warnings: ["Validation skipped in test environment"],
				validatedData: args
			};
		}

		// Run only essential validations for testing
		return this.validateWithSchema("scaffoldingArgs", args);
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
