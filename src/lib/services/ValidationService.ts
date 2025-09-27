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
import { SETTINGS } from "../../config/settings.js";
import { spawn } from "child_process";
import { join } from "path";

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
 * Validation result interface
 */
export interface ValidationResult {
	success: boolean;
	errors: string[];
	warnings: string[];
	validatedData?: unknown;
}

/**
 * Comprehensive ValidationService class
 */
export class ValidationService {
	private config: ValidationConfig;
	private schemas: Map<string, z.ZodSchema> = new Map();

	constructor(config?: Partial<ValidationConfig>) {
		this.config = {
			enableMermaidValidation: true,
			enableBusinessRules: true,
			enableTypeValidation: true,
			skipValidationInTests: process.env.NODE_ENV === "test",
			...config
		};

		this.initializeSchemas();
	}

	/**
	 * Initialize Zod schemas for different content types
	 */
	private initializeSchemas(): void {
		// Scaffolding arguments schema
		const scaffoldingArgsSchema = z.object({
			unit: z.string().min(1, "Unit name is required"),
			type: z.enum(["lesson", "quiz", "exam", "study_guide", "project"] as const),
			id: z.string().min(1, "ID is required")
		});

		// Content status schema
		const contentStatusSchema = z.enum(["scaffold", "draft", "final"]);

		// Safety check result schema
		const safetyCheckSchema = z.object({
			canProceed: z.boolean(),
			requiresForce: z.boolean(),
			warning: z.string().optional(),
			error: z.string().optional(),
			currentStatus: contentStatusSchema.optional()
		});

		// Content generation result schema
		const contentGenerationSchema = z.object({
			success: z.boolean(),
			filePath: z.string().optional(),
			stats: z
				.object({
					totalChapters: z.number().int().min(0),
					existingFiles: z.number().int().min(0),
					newFiles: z.number().int().min(0),
					orphanFiles: z.array(z.string()),
					errors: z.array(z.string())
				})
				.optional(),
			errors: z.array(z.string()).optional()
		});

		// Register schemas
		this.schemas.set("scaffoldingArgs", scaffoldingArgsSchema);
		this.schemas.set("contentStatus", contentStatusSchema);
		this.schemas.set("safetyCheck", safetyCheckSchema);
		this.schemas.set("contentGeneration", contentGenerationSchema);
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
	 * Validate Mermaid diagrams in content
	 */
	async validateMermaidContent(content: string): Promise<ValidationResult> {
		if (!this.config.enableMermaidValidation) {
			return { success: true, errors: [], warnings: [] };
		}

		try {
			// Extract Mermaid diagrams from content
			const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
			const diagrams: string[] = [];
			let match;

			while ((match = mermaidRegex.exec(content)) !== null) {
				diagrams.push(match[1]);
			}

			if (diagrams.length === 0) {
				return { success: true, errors: [], warnings: [] };
			}

			// Validate each diagram using mmdc CLI
			const errors: string[] = [];
			const warnings: string[] = [];

			for (let i = 0; i < diagrams.length; i++) {
				try {
					await this.validateSingleMermaidDiagram(diagrams[i]);
				} catch (error) {
					errors.push(
						`Mermaid diagram ${i + 1}: ${error instanceof Error ? error.message : String(error)}`
					);
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
	 * Validate a single Mermaid diagram using mmdc CLI
	 */
	private async validateSingleMermaidDiagram(diagramContent: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const mmdcProcess = spawn(
				"mmdc",
				[
					"--input",
					"-", // Read from stdin
					"--output",
					"/dev/null", // Don't write output
					"--puppeteerConfig",
					join(process.cwd(), "src/config/puppeteer-config.json")
				],
				{
					stdio: ["pipe", "pipe", "pipe"],
					timeout: 10000 // 10 second timeout
				}
			);

			let stderr = "";

			mmdcProcess.stdin.write(diagramContent);
			mmdcProcess.stdin.end();

			mmdcProcess.stderr.on("data", (data) => {
				stderr += data.toString();
			});

			mmdcProcess.on("close", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Mermaid validation failed: ${stderr.trim() || "Unknown error"}`));
				}
			});

			mmdcProcess.on("error", (error) => {
				reject(new Error(`Failed to execute mmdc: ${error.message}`));
			});
		});
	}

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
			if (!/^[\w-]+$/.test(args.unit)) {
				errors.push(
					"Unit name must contain only alphanumeric characters, hyphens, and underscores"
				);
			}

			if (!/^[\w-]+$/.test(args.id)) {
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
	registerSchema(name: string, schema: z.ZodSchema): void {
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
