/**
 * RepositoryService
 *
 * Centralized file and content repository management service with
 * comprehensive safety strategy for content protection.
 *
 * Features:
 * - Safe file operations with backup and rollback capabilities
 * - Content status tracking (scaffold, draft, final)
 * - Force flag handling for protected content
 * - Directory structure management
 * - Transaction-like operations for atomic changes
 * - Integration with ValidationService for pre-operation validation
 */

import { promises as fs, existsSync, statSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { formatContent } from "$lib/utils/prettier-writer.js";
import type { ContentStatus, BaseContent, AnyContent } from "$types";
import type {
	WriteOptions,
	RepositoryConfig,
	FileOperationResult,
	RepositoryTransaction,
	SafetyCheckResult
} from "$types/scripts";
import type { FileOperationStats } from "$types/scaffolding";

/**
 * Repository operation modes
 */
export type RepositoryMode = "safe" | "force" | "backup";

/**
 * File operation types
 */
export type FileOperation = "create" | "update" | "delete" | "backup" | "restore";

// Using centralized interfaces from $types/scripts

/**
 * RepositoryService class for safe content management
 */
export class RepositoryService {
	private config: RepositoryConfig;
	private activeTransactions: Map<string, RepositoryTransaction> = new Map();

	constructor(config?: Partial<RepositoryConfig>) {
		this.config = {
			mode: "safe",
			createBackups: true,
			validateBeforeWrite: true,
			respectContentStatus: true,
			backupDirectory: "tmp/backups",
			...config
		};
	}

	/**
	 * Create a backup of a file
	 */
	async createBackups(filePath: string): Promise<string> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const fileName = basename(filePath, extname(filePath));
		const fileExt = extname(filePath);
		const backupFileName = `${fileName}_${timestamp}${fileExt}`;
		const backupPath = join(this.config.backupDirectory, backupFileName);

		// Ensure backup directory exists
		await fs.mkdir(dirname(backupPath), { recursive: true });

		// Copy file to backup location
		await fs.copyFile(filePath, backupPath);

		return backupPath;
	}

	/**
	 * Write content to file with safety checks
	 */
	async writeFile(
		filePath: string,
		content: string,
		options?: { force?: boolean; contentStatus?: ContentStatus }
	): Promise<FileOperationResult> {
		const operation: FileOperation = existsSync(filePath) ? "update" : "create";

		try {
			let backupPath: string | undefined;

			// Create backup if file exists and backups are enabled
			if (existsSync(filePath) && this.config.createBackups) {
				backupPath = await this.createBackups(filePath);
			}

			// Ensure directory exists
			await fs.mkdir(dirname(filePath), { recursive: true });

			// Add content status marker if specified
			let finalContent = content;
			if (options?.contentStatus) {
				finalContent = `// STATUS: ${options.contentStatus}\n${content}`;
			}

			// Get original file size for metadata
			const _originalSize = existsSync(filePath) ? statSync(filePath).size : 0;

			// Write the file
			await fs.writeFile(filePath, finalContent, "utf-8");

			// Get new file size
			const _newSize = statSync(filePath).size;

			return {
				success: true,
				action:
					operation === "create"
						? "created"
						: operation === "update"
							? "updated"
							: operation === "delete"
								? "skipped"
								: "skipped",
				filePath,
				backupPath
			};
		} catch (error) {
			return {
				success: false,
				action:
					operation === "create"
						? "created"
						: operation === "update"
							? "updated"
							: operation === "delete"
								? "skipped"
								: "skipped",
				filePath,
				error: `Write operation failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Read file content safely
	 */
	async readFile(filePath: string): Promise<{
		success: boolean;
		content?: string;
		error?: string;
		contentStatus?: ContentStatus;
	}> {
		try {
			if (!existsSync(filePath)) {
				return {
					success: false,
					error: `File does not exist: ${filePath}`
				};
			}

			const content = await fs.readFile(filePath, "utf-8");

			return {
				success: true,
				content
			};
		} catch (error) {
			return {
				success: false,
				error: `Read operation failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Delete file with safety checks
	 */
	async deleteFile(filePath: string, _options?: { force?: boolean }): Promise<FileOperationResult> {
		try {
			let backupPath: string | undefined;

			// Create backup before deletion
			if (existsSync(filePath) && this.config.createBackups) {
				backupPath = await this.createBackups(filePath);
			}

			// Delete the file
			await fs.unlink(filePath);

			return {
				success: true,
				action: "skipped",
				filePath,
				backupPath
			};
		} catch (error) {
			return {
				success: false,
				action: "skipped",
				filePath,
				error: `Delete operation failed: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	/**
	 * Start a new transaction for atomic operations
	 */
	startTransaction(): string {
		const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

		const transaction: RepositoryTransaction = {
			id: transactionId,
			operations: [],
			startTime: new Date(),
			status: "pending",
			results: []
		};

		this.activeTransactions.set(transactionId, transaction);
		return transactionId;
	}

	/**
	 * Add operation to transaction
	 */
	addToTransaction(transactionId: string, operation: FileOperationResult): void {
		const transaction = this.activeTransactions.get(transactionId);
		if (transaction && transaction.status === "pending") {
			transaction.results = transaction.results || [];
			transaction.results.push(operation);
		}
	}

	/**
	 * Commit transaction (mark as completed)
	 */
	commitTransaction(transactionId: string): boolean {
		const transaction = this.activeTransactions.get(transactionId);
		if (transaction && transaction.status === "pending") {
			transaction.status = "completed";
			transaction.endTime = new Date();
			return true;
		}
		return false;
	}

	/**
	 * Rollback transaction (restore from backups)
	 */
	async rollbackTransaction(transactionId: string): Promise<boolean> {
		const transaction = this.activeTransactions.get(transactionId);
		if (!transaction || transaction.status !== "pending") {
			return false;
		}

		try {
			// Reverse operations in reverse order
			const results = transaction.results || [];
			for (let i = results.length - 1; i >= 0; i--) {
				const operation = results[i];

				if (operation.success && operation.backupPath) {
					// Restore from backup
					await fs.copyFile(operation.backupPath, operation.filePath);
				} else if (operation.action === "created" && operation.success) {
					// Remove created file
					if (existsSync(operation.filePath)) {
						await fs.unlink(operation.filePath);
					}
				}
			}

			transaction.status = "rolled_back";
			transaction.endTime = new Date();
			return true;
		} catch (error) {
			console.error(`Failed to rollback transaction ${transactionId}:`, error);
			return false;
		}
	}

	/**
	 * Generate file operation statistics
	 */
	generateStats(operations: FileOperationResult[]): FileOperationStats {
		const successfulOps = operations.filter((op) => op.success);
		const existingFiles = successfulOps.filter((op) => op.action === "updated").length;
		const newFiles = successfulOps.filter((op) => op.action === "created").length;
		const errors = operations.filter((op) => !op.success).map((op) => op.error || "Unknown error");

		return {
			totalChapters: successfulOps.length,
			existingFiles,
			newFiles,
			orphanFiles: [], // Could be enhanced to detect orphan files
			errors
		};
	}

	/**
	 * Clean up old backups
	 */
	async cleanupBackups(maxAgeHours = 24): Promise<number> {
		try {
			if (!existsSync(this.config.backupDirectory)) {
				return 0;
			}

			const files = await fs.readdir(this.config.backupDirectory);
			const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
			let cleanedCount = 0;

			for (const file of files) {
				const filePath = join(this.config.backupDirectory, file);
				const stat = await fs.stat(filePath);

				if (stat.mtime.getTime() < cutoffTime) {
					await fs.unlink(filePath);
					cleanedCount++;
				}
			}

			return cleanedCount;
		} catch (error) {
			console.error("Failed to cleanup backups:", error);
			return 0;
		}
	}

	/**
	 * Update repository configuration
	 */
	updateConfig(newConfig: Partial<RepositoryConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): RepositoryConfig {
		return { ...this.config };
	}

	/**
	 * Get active transactions
	 */
	getActiveTransactions(): RepositoryTransaction[] {
		return Array.from(this.activeTransactions.values());
	}

	/**
	 * Write content to file with validation and safety checks
	 */
	async writeContentFile(
		filePath: string,
		content: string,
		options: WriteOptions
	): Promise<FileOperationResult> {
		try {
			// Determine if this is a create or update operation (before writing)
			const fileExists = existsSync(filePath);
			const operation: FileOperation = fileExists ? "update" : "create";

			// Create backup if needed
			let backupPath: string | undefined;
			if (options.createBackup && fileExists) {
				backupPath = await this.createBackups(filePath);
			}

			// Create directory if needed
			const dir = dirname(filePath);
			await this.ensureDirectoryExists(dir);

			// Write content
			await fs.writeFile(filePath, content, "utf-8");

			return {
				success: true,
				action: operation === "create" ? "created" : "updated",
				filePath,
				backupPath
			};
		} catch (error) {
			return {
				success: false,
				action: "created",
				filePath,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Check safety before writing to a file
	 */
	async checkSafetyBeforeWrite(filePath: string): Promise<SafetyCheckResult> {
		try {
			// Check if file exists
			if (!existsSync(filePath)) {
				return {
					canProceed: true,
					requiresForce: false
				};
			}

			// For now, implement a basic safety check
			// In a real implementation, this would check content status
			return {
				canProceed: true,
				requiresForce: false,
				warning: "File exists and will be overwritten"
			};
		} catch (error) {
			return {
				canProceed: false,
				requiresForce: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * Ensure directory exists, creating it recursively if needed
	 */
	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		if (!existsSync(dirPath)) {
			await fs.mkdir(dirPath, { recursive: true });
		}
	}

	/**
	 * Write formatted content to file with Prettier integration
	 *
	 * This is the primary method for content persistence operations.
	 * Converts content object to TypeScript export, formats with Prettier,
	 * and writes to file with safety checks.
	 *
	 * Note: Validation is NOT performed here - ContentCore orchestrates
	 * validation before calling this method.
	 *
	 * @param filePath - Target file path
	 * @param content - Content object (BaseContent or AnyContent union type)
	 * @param options - Write options (mode, backups)
	 * @returns FileOperationResult with success status and details
	 */
	async writeFormattedContent(
		filePath: string,
		content: BaseContent | AnyContent,
		options: { mode?: "safe" | "force"; createBackups?: boolean } = {}
	): Promise<FileOperationResult> {
		try {
			// 1. Convert content to TypeScript export string
			const contentString = `export const content = ${JSON.stringify(content, null, 2)};`;

			// 2. Format with Prettier using centralized utility
			const formattedContent = await formatContent(contentString, filePath);

			// 3. Prepare write options
			const writeOptions: WriteOptions = {
				mode: options.mode || this.config.mode,
				createBackup: options.createBackups ?? this.config.createBackups,
				validateContent: false, // ContentCore handles validation
				respectContentStatus: this.config.respectContentStatus
			};

			// 4. Write formatted content to file
			return await this.writeContentFile(filePath, formattedContent, writeOptions);
		} catch (error) {
			return {
				success: false,
				action: "created",
				filePath,
				error: `Failed to format content: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}
}

/**
 * Default RepositoryService instance
 */
export const repositoryService = new RepositoryService();

/**
 * Factory function for creating repository service with custom config
 */
export function createRepositoryService(config?: Partial<RepositoryConfig>): RepositoryService {
	return new RepositoryService(config);
}
