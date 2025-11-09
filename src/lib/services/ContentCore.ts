/**
 * ContentCore Service
 *
 * Implements the orchestration layer from PLAN-CONTENT-GENERATION.md Phase 3.
 * This service coordinates between ContentSafetyService, ValidationService,
 * and RepositoryService to provide a high-level API for content operations.
 *
 * Architecture (Single Entry Point):
 * - ContentCore → ContentSafetyService (safety checks)
 * - ContentCore → ValidationService (full validation)
 * - ContentCore → RepositoryService (file operations)
 *
 * Key Methods:
 * - processGeneratedContent(): Main entry point with safety + validation
 * - validateContent(): Validation-only workflow (full Zod + Mermaid)
 * - checkSafety(): Safety checks before operations
 * - updateContent(): Update existing content with merge capability
 * - deleteContent(): Delete content with safety checks
 */

import { readFileSync } from "fs";
import { ValidationService } from "./ValidationService.js";
import { RepositoryService } from "./RepositoryService.js";
import { ContentSafetyService } from "./ContentSafetyService.js";
import { parseJsonSafely } from "$lib/utils/validation-utils.js";
import type { BaseContent } from "$types";
import { SETTINGS } from "$config/settings.js";

/**
 * ContentCore - Orchestration layer for content operations
 *
 * Implements Phase 3 architecture from PLAN-CONTENT-GENERATION.md
 */
export class ContentCore {
	private validationService: ValidationService;
	private repositoryService: RepositoryService;
	private config = SETTINGS.scripts.contentCreator;
	private commonConfig = SETTINGS.scripts.common;

	constructor() {
		this.validationService = new ValidationService({
			enableMermaidValidation: true,
			enableBusinessRules: true,
			enableTypeValidation: true,
			skipValidationInTests: false
		});
		this.repositoryService = new RepositoryService({
			mode: "safe",
			createBackups: true,
			validateBeforeWrite: true,
			respectContentStatus: true,
			backupDirectory: this.config.repository.backupDirectory
		});
	}

	/**
	 * Process generated content from external sources (e.g., scaffold-generator)
	 * This is the main entry point for the content state machine
	 */
	async processGeneratedContent(
		filePath: string,
		content: Record<string, unknown>,
		options: {
			mode?: "safe" | "force";
			createBackups?: boolean;
		} = {}
	): Promise<{ success: boolean; error?: string }> {
		try {
			// 1. Safety check FIRST (use "create" for new content generation)
			const safetyResult = ContentSafetyService.checkOperation("create", filePath, {
				forceOverwrite: options.mode === "force"
			});

			if (!safetyResult.canProceed) {
				return {
					success: false,
					error: safetyResult.error || "Safety check failed"
				};
			}

			// Display warnings if present
			if (safetyResult.warning) {
				console.warn(safetyResult.warning);
			}

			// 2. Full validation (Zod schema + Mermaid)
			const validationResult = await this.validationService.validate(content);

			if (!validationResult.success) {
				return {
					success: false,
					error: `Content validation failed: ${validationResult.errors.join("; ")}`
				};
			}

			// 3. Write content using RepositoryService
			const writeResult = await this.repositoryService.writeFormattedContent(
				filePath,
				content as unknown as BaseContent,
				{
					mode: options.mode || "safe",
					createBackups: options.createBackups ?? true
				}
			);

			return writeResult;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Validate content without writing (used by validate command)
	 */
	async validateContent(content: Record<string, unknown>): Promise<{
		success: boolean;
		errors: string[];
		warnings?: string[];
	}> {
		return await this.validationService.validate(content);
	}

	/**
	 * Check safety before write/delete operations
	 */
	checkSafety(
		filePath: string,
		operation: "create" | "update" | "delete",
		options: { forceOverwrite?: boolean } = {}
	): {
		canProceed: boolean;
		error?: string;
		requiresForce?: boolean;
		warning?: string;
		currentStatus?: string;
	} {
		return ContentSafetyService.checkOperation(operation, filePath, options);
	}

	/**
	 * Update existing content with merge capability
	 */
	async updateContent(
		filePath: string,
		updateData: Record<string, unknown>,
		options: {
			mode?: "safe" | "force";
			createBackups?: boolean;
		} = {}
	): Promise<{ success: boolean; error?: string }> {
		try {
			// Read existing content
			const existingContent = this.readContentFromFile(filePath);

			// Merge content
			const mergedContent = { ...existingContent, ...updateData };

			// Process merged content
			return await this.processGeneratedContent(filePath, mergedContent, options);
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Delete content with safety checks
	 */
	async deleteContent(
		filePath: string,
		options: {
			mode?: "safe" | "force";
		} = {}
	): Promise<{ success: boolean; error?: string }> {
		try {
			// Safety check FIRST
			const safetyResult = ContentSafetyService.checkOperation("delete", filePath, {
				forceOverwrite: options.mode === "force"
			});

			if (!safetyResult.canProceed) {
				return {
					success: false,
					error: safetyResult.error || "Safety check failed"
				};
			}

			// Display warnings if present
			if (safetyResult.warning) {
				console.warn(safetyResult.warning);
			}

			// Delegate to RepositoryService
			return await this.repositoryService.deleteFile(filePath, {
				force: options.mode === "force"
			});
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Read content from file path
	 */
	private readContentFromFile(filePath: string): Record<string, unknown> {
		try {
			const content = readFileSync(filePath, "utf-8");
			const result = parseJsonSafely<Record<string, unknown>>(content);
			if (!result.isValid) {
				throw new Error(`Invalid JSON content: ${result.error}`);
			}
			return result.data!;
		} catch (error) {
			throw new Error(
				`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}
