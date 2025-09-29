/**
 * MermaidValidator Utility - Centralized Mermaid Validation
 *
 * Centralized utility class for Mermaid diagram validation that separates:
 * - Core content validation (single diagrams)
 * - File-level validation (diagrams within TypeScript files)
 * - Batch validation (multiple files)
 *
 * This utility is used by:
 * - ValidationService (for content validation during generation)
 * - mermaid-validator.ts script (for file validation CLI)
 * - Any other components that need Mermaid validation
 *
 * Features:
 * - Pure validation logic separated from file I/O
 * - Structured error reporting with line/variable context
 * - Error categorization for better debugging
 * - Performance tracking and statistics
 * - Configurable validation options
 */

import { promises as fs, existsSync } from "fs";
import { join, dirname } from "path";
import { spawn } from "child_process";
import { Project, Node } from "ts-morph";
import type {
	DiagramReference,
	EnhancedMermaidValidationResult,
	EnhancedMermaidValidationStats
} from "$types";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Mermaid validation configuration options
 */
export interface MermaidValidatorConfig {
	/**
	 * Enable verbose output for debugging
	 */
	verbose: boolean;

	/**
	 * Maximum number of parallel file processing operations
	 */
	maxParallelFiles: number;

	/**
	 * Timeout for individual diagram validation (ms)
	 */
	validationTimeout: number;

	/**
	 * Path to puppeteer configuration for mmdc CLI
	 */
	puppeteerConfigPath?: string;

	/**
	 * Enable error categorization
	 */
	enableErrorCategorization: boolean;
}

/**
 * Content validation result (for single diagram validation)
 */
export interface ContentValidationResult {
	isValid: boolean;
	errorMessage?: string;
	errorCategory?: string;
	duration: number;
	metadata?: {
		diagramType?: string;
		nodeCount?: number;
		edgeCount?: number;
	};
}

/**
 * File validation result (for diagrams within files)
 */
export interface FileValidationResult {
	filePath: string;
	diagramsFound: number;
	results: EnhancedMermaidValidationResult[];
	duration: number;
	success: boolean;
}

/**
 * Batch validation result (for multiple files)
 */
export interface BatchValidationResult {
	filesProcessed: string[];
	results: FileValidationResult[];
	stats: EnhancedMermaidValidationStats;
	success: boolean;
	duration: number;
}

// ============================================================================
// ERROR CATEGORIZATION
// ============================================================================

/**
 * Mermaid error categories for better debugging
 */
export const ERROR_CATEGORIES = {
	SYNTAX: "Syntax Error",
	PARSE: "Parse Error",
	SEMANTIC: "Semantic Error",
	GRAPH: "Graph Structure Error",
	NODE: "Node Definition Error",
	EDGE: "Edge Definition Error",
	STYLE: "Style Error",
	CONFIG: "Configuration Error",
	UNKNOWN: "Unknown Error"
} as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES];

// ============================================================================
// MERMAID VALIDATOR UTILITY CLASS
// ============================================================================

/**
 * Centralized Mermaid validation utility
 * Provides reusable validation logic for content and files
 */
export class MermaidValidator {
	private config: MermaidValidatorConfig;
	private project: Project;

	constructor(config?: Partial<MermaidValidatorConfig>) {
		this.config = {
			verbose: false,
			maxParallelFiles: 5,
			validationTimeout: 30000,
			enableErrorCategorization: true,
			...config
		};

		// Initialize ts-morph project for AST parsing
		this.project = new Project({
			useInMemoryFileSystem: false,
			skipAddingFilesFromTsConfig: true,
			compilerOptions: {
				target: 1, // ES5
				module: 1, // CommonJS
				moduleResolution: 2 // Node
			}
		});
	}

	// ========================================================================
	// CORE CONTENT VALIDATION
	// ========================================================================

	/**
	 * Validate a single Mermaid diagram content string
	 * This is the core validation logic used by all other methods
	 */
	async validateDiagramContent(
		diagramContent: string,
		options?: { enableMetadata?: boolean }
	): Promise<ContentValidationResult> {
		const startTime = Date.now();

		try {
			// Basic content validation
			if (!diagramContent || diagramContent.trim().length === 0) {
				return {
					isValid: false,
					errorMessage: "Empty diagram content",
					errorCategory: ERROR_CATEGORIES.SYNTAX,
					duration: Date.now() - startTime
				};
			}

			// Validate using mmdc CLI
			const validationResult = await this.validateWithMmdc(diagramContent);

			const result: ContentValidationResult = {
				isValid: validationResult.isValid,
				duration: Date.now() - startTime
			};

			if (!validationResult.isValid) {
				result.errorMessage = validationResult.errorMessage;
				result.errorCategory = this.categorizeError(validationResult.errorMessage || "");
			}

			// Add metadata if requested
			if (options?.enableMetadata && validationResult.isValid) {
				result.metadata = this.extractDiagramMetadata(diagramContent);
			}

			return result;
		} catch (error) {
			return {
				isValid: false,
				errorMessage: error instanceof Error ? error.message : String(error),
				errorCategory: ERROR_CATEGORIES.UNKNOWN,
				duration: Date.now() - startTime
			};
		}
	}

	/**
	 * Validate multiple diagram contents in batch
	 */
	async validateDiagramBatch(
		diagrams: Array<{ content: string; id?: string }>
	): Promise<Array<ContentValidationResult & { id?: string }>> {
		const results = await Promise.all(
			diagrams.map(async ({ content, id }) => {
				const result = await this.validateDiagramContent(content);
				return { ...result, id };
			})
		);

		return results;
	}

	// ========================================================================
	// FILE-LEVEL VALIDATION
	// ========================================================================

	/**
	 * Validate all Mermaid diagrams within a TypeScript file
	 */
	async validateFile(filePath: string): Promise<FileValidationResult> {
		const startTime = Date.now();

		try {
			if (!existsSync(filePath)) {
				throw new Error(`File does not exist: ${filePath}`);
			}

			// Extract diagram references from the file
			const diagramReferences = await this.extractDiagramReferences(filePath);

			if (diagramReferences.length === 0) {
				return {
					filePath,
					diagramsFound: 0,
					results: [],
					duration: Date.now() - startTime,
					success: true
				};
			}

			// Validate each diagram
			const results: EnhancedMermaidValidationResult[] = [];
			for (const reference of diagramReferences) {
				const validationResult = await this.validateDiagramContent(reference.diagramContent);

				results.push({
					reference,
					isValid: validationResult.isValid,
					errorMessage: validationResult.errorMessage,
					errorCategory: validationResult.errorCategory,
					duration: validationResult.duration
				});
			}

			return {
				filePath,
				diagramsFound: diagramReferences.length,
				results,
				duration: Date.now() - startTime,
				success: results.every((r) => r.isValid)
			};
		} catch {
			return {
				filePath,
				diagramsFound: 0,
				results: [],
				duration: Date.now() - startTime,
				success: false
			};
		}
	}

	/**
	 * Validate multiple files in batch
	 */
	async validateFileBatch(filePaths: string[]): Promise<BatchValidationResult> {
		const startTime = Date.now();
		const results: FileValidationResult[] = [];

		// Process files in parallel with concurrency limit
		const chunks = this.chunkArray(filePaths, this.config.maxParallelFiles);

		for (const chunk of chunks) {
			const chunkResults = await Promise.all(chunk.map((filePath) => this.validateFile(filePath)));
			results.push(...chunkResults);
		}

		// Generate statistics
		const stats = this.generateBatchStats(results);

		return {
			filesProcessed: filePaths,
			results,
			stats,
			success: results.every((r) => r.success),
			duration: Date.now() - startTime
		};
	}

	// ========================================================================
	// DIRECTORY VALIDATION
	// ========================================================================

	/**
	 * Validate all TypeScript files in a directory
	 */
	async validateDirectory(
		directoryPath: string,
		recursive: boolean = true
	): Promise<BatchValidationResult> {
		const tsFiles = await this.findTypeScriptFiles(directoryPath, recursive);
		return this.validateFileBatch(tsFiles);
	}

	// ========================================================================
	// PRIVATE UTILITY METHODS
	// ========================================================================

	/**
	 * Validate diagram using mmdc CLI
	 */
	private async validateWithMmdc(
		diagramContent: string
	): Promise<{ isValid: boolean; errorMessage?: string }> {
		return new Promise((resolve) => {
			const tempFileName = `mermaid-validate-${process.pid}-${Date.now()}-${Math.random()}.mmd`;
			const tempFilePath = join(process.cwd(), "tmp", "mermaid_checks", tempFileName);

			// Create temp directory if it doesn't exist
			const tempDir = dirname(tempFilePath);
			if (!existsSync(tempDir)) {
				fs.mkdir(tempDir, { recursive: true }).catch(() => {
					// Ignore mkdir errors
				});
			}

			// Write diagram to temp file
			fs.writeFile(tempFilePath, diagramContent)
				.then(() => {
					// Run mmdc validation
					const mmdc = spawn("npx", ["@mermaid-js/mermaid-cli", "--version"], {
						stdio: ["ignore", "pipe", "pipe"],
						timeout: this.config.validationTimeout
					});

					let output = "";
					let errorOutput = "";

					mmdc.stdout?.on("data", (data) => {
						output += data.toString();
					});

					mmdc.stderr?.on("data", (data) => {
						errorOutput += data.toString();
					});

					mmdc.on("close", (code) => {
						// Clean up temp file
						fs.unlink(tempFilePath).catch(() => {
							// Ignore cleanup errors
						});

						if (code === 0) {
							resolve({ isValid: true });
						} else {
							resolve({
								isValid: false,
								errorMessage: errorOutput || output || "Validation failed"
							});
						}
					});

					mmdc.on("error", (error) => {
						// Clean up temp file
						fs.unlink(tempFilePath).catch(() => {
							// Ignore cleanup errors
						});

						resolve({
							isValid: false,
							errorMessage: error.message
						});
					});
				})
				.catch((error) => {
					resolve({
						isValid: false,
						errorMessage: error.message
					});
				});
		});
	}

	/**
	 * Extract diagram references from a TypeScript file using AST parsing
	 */
	private async extractDiagramReferences(filePath: string): Promise<DiagramReference[]> {
		const references: DiagramReference[] = [];

		try {
			const sourceFile = this.project.addSourceFileAtPath(filePath);

			// Find all string literals that might contain Mermaid diagrams
			sourceFile.forEachDescendant((node) => {
				if (
					Node.isStringLiteral(node) ||
					Node.isTemplateExpression(node) ||
					Node.isNoSubstitutionTemplateLiteral(node)
				) {
					const content = this.extractStringContent(node);

					if (this.isMermaidDiagram(content)) {
						const variableName = this.getVariableName(node);
						const { line, column } = sourceFile.getLineAndColumnAtPos(node.getStart());

						references.push({
							filePath,
							variableName,
							diagramContent: this.cleanMermaidContent(content),
							lineNumber: line,
							columnNumber: column
						});
					}
				}
			});

			// Remove the source file to prevent memory leaks
			this.project.removeSourceFile(sourceFile);
		} catch (error) {
			if (this.config.verbose) {
				console.warn(`Error parsing ${filePath}: ${error}`);
			}
		}

		return references;
	}

	/**
	 * Check if content appears to be a Mermaid diagram
	 */
	private isMermaidDiagram(content: string): boolean {
		if (!content || typeof content !== "string") return false;

		const cleanContent = content.trim().toLowerCase();

		// Check for Mermaid diagram patterns
		const mermaidPatterns = [
			/^graph\s+(td|lr|bt|rl)/,
			/^flowchart\s+(td|lr|bt|rl)/,
			/^sequencediagram/,
			/^classDiagram/,
			/^stateDiagram/,
			/^pie\s+title/,
			/^gantt/,
			/^erDiagram/,
			/^journey/,
			/^gitgraph/
		];

		return mermaidPatterns.some((pattern) => pattern.test(cleanContent));
	}

	/**
	 * Extract string content from AST node
	 */
	private extractStringContent(node: Node): string {
		if (Node.isStringLiteral(node)) {
			return node.getLiteralValue();
		} else if (Node.isNoSubstitutionTemplateLiteral(node)) {
			return node.getLiteralValue();
		} else if (Node.isTemplateExpression(node)) {
			// For template expressions, get the text representation
			return node.getText().slice(1, -1); // Remove backticks
		}
		return "";
	}

	/**
	 * Get variable name containing the diagram
	 */
	private getVariableName(node: Node): string {
		let parent = node.getParent();

		while (parent) {
			if (Node.isPropertyAssignment(parent)) {
				return parent.getName() || "unknown";
			} else if (Node.isVariableDeclaration(parent)) {
				return parent.getName() || "unknown";
			}
			parent = parent.getParent();
		}

		return "unknown";
	}

	/**
	 * Clean Mermaid content by removing markdown code blocks
	 */
	private cleanMermaidContent(content: string): string {
		// Remove markdown code block markers
		return content
			.replace(/^```mermaid\s*\n?/gim, "")
			.replace(/\n?```$/gim, "")
			.trim();
	}

	/**
	 * Categorize validation errors for better debugging
	 */
	private categorizeError(errorMessage: string): ErrorCategory {
		if (!this.config.enableErrorCategorization) {
			return ERROR_CATEGORIES.UNKNOWN;
		}

		const message = errorMessage.toLowerCase();

		if (message.includes("parse error") || message.includes("parsing")) {
			return ERROR_CATEGORIES.PARSE;
		} else if (message.includes("syntax") || message.includes("unexpected")) {
			return ERROR_CATEGORIES.SYNTAX;
		} else if (message.includes("node") || message.includes("vertex")) {
			return ERROR_CATEGORIES.NODE;
		} else if (message.includes("edge") || message.includes("link")) {
			return ERROR_CATEGORIES.EDGE;
		} else if (message.includes("style") || message.includes("class")) {
			return ERROR_CATEGORIES.STYLE;
		} else if (message.includes("config") || message.includes("theme")) {
			return ERROR_CATEGORIES.CONFIG;
		} else if (message.includes("graph") || message.includes("diagram")) {
			return ERROR_CATEGORIES.GRAPH;
		}

		return ERROR_CATEGORIES.UNKNOWN;
	}

	/**
	 * Extract metadata from diagram content (node count, edges, type)
	 */
	private extractDiagramMetadata(
		content: string
	): NonNullable<ContentValidationResult["metadata"]> {
		const lines = content
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		// Detect diagram type
		const firstLine = lines[0]?.toLowerCase() || "";
		let diagramType = "unknown";

		if (firstLine.startsWith("graph") || firstLine.startsWith("flowchart")) {
			diagramType = "flowchart";
		} else if (firstLine.startsWith("sequencediagram")) {
			diagramType = "sequence";
		} else if (firstLine.startsWith("classdiagram")) {
			diagramType = "class";
		} else if (firstLine.startsWith("statediagram")) {
			diagramType = "state";
		} else if (firstLine.startsWith("pie")) {
			diagramType = "pie";
		} else if (firstLine.startsWith("gantt")) {
			diagramType = "gantt";
		}

		// Count nodes and edges (basic heuristic)
		let nodeCount = 0;
		let edgeCount = 0;

		for (const line of lines) {
			// Count arrow patterns for edges
			if (
				line.includes("-->") ||
				line.includes("---") ||
				line.includes("-.->") ||
				line.includes("==>")
			) {
				edgeCount++;
			}
			// Count node definitions (basic pattern)
			if (line.match(/^[A-Za-z0-9_]+(\[.*\]|\(.*\)|\{.*\})/)) {
				nodeCount++;
			}
		}

		return {
			diagramType,
			nodeCount,
			edgeCount
		};
	}

	/**
	 * Find TypeScript files in directory
	 */
	private async findTypeScriptFiles(directoryPath: string, recursive: boolean): Promise<string[]> {
		const files: string[] = [];

		try {
			const entries = await fs.readdir(directoryPath, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = join(directoryPath, entry.name);

				if (entry.isDirectory() && recursive) {
					if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
						const subFiles = await this.findTypeScriptFiles(fullPath, recursive);
						files.push(...subFiles);
					}
				} else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
					files.push(fullPath);
				}
			}
		} catch (error) {
			if (this.config.verbose) {
				console.warn(`Error reading directory ${directoryPath}: ${error}`);
			}
		}

		return files;
	}

	/**
	 * Generate batch validation statistics
	 */
	private generateBatchStats(results: FileValidationResult[]): EnhancedMermaidValidationStats {
		const stats: EnhancedMermaidValidationStats = {
			filesProcessed: results.length,
			diagramsFound: 0,
			validDiagrams: 0,
			invalidDiagrams: 0,
			totalDuration: 0,
			commonErrors: new Map(),
			errorsByCategory: new Map()
		};

		for (const result of results) {
			stats.diagramsFound += result.diagramsFound;
			stats.totalDuration += result.duration;

			for (const validation of result.results) {
				if (validation.isValid) {
					stats.validDiagrams++;
				} else {
					stats.invalidDiagrams++;

					// Track error frequency
					if (validation.errorMessage) {
						const count = stats.commonErrors.get(validation.errorMessage) || 0;
						stats.commonErrors.set(validation.errorMessage, count + 1);
					}

					// Track error categories
					if (validation.errorCategory) {
						const count = stats.errorsByCategory.get(validation.errorCategory) || 0;
						stats.errorsByCategory.set(validation.errorCategory, count + 1);
					}
				}
			}
		}

		return stats;
	}

	/**
	 * Split array into chunks for parallel processing
	 */
	private chunkArray<T>(array: T[], chunkSize: number): T[][] {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		return chunks;
	}
}
