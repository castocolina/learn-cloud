/**
 * Flat Navigation Generator Script
 *
 * Generates a flat sequence map (flatnav) for sequential content navigation
 * throughout the learning platform. Converts hierarchical content menu
 * structure into a linear sequence with bidirectional navigation support.
 *
 * Features:
 * - Sequential mapping respecting existing content order from content-menu.ts
 * - Cross-unit navigation for seamless learning experience
 * - Hash-based URL generation using navigation-paths.ts utility
 * - Bidirectional previous/next references
 * - Optimized lookup tables for performance
 * - Integration with existing validation infrastructure
 * - Dependency injection for improved testability
 *
 * Usage:
 *   npx tsx src/scripts/flatnav-generator.ts
 *   pnpm run generate-flatnav
 */

import { writeFormattedFile } from "../lib/utils/prettier-writer.js";
import { runGeneratedFileValidation } from "../lib/utils/validation-utils.js";
import { serializeNavigationUrl } from "../lib/utils/navigation-paths.js";
import { SETTINGS } from "$config/settings.js";
import type {
	MenuStructure,
	MenuUnit,
	MenuChapter,
	FlatNavEntry,
	FlatNavStructure,
	UnifiedPathConfig,
	AppSettings
} from "$types";

/**
 * Flat Navigation Generator Class
 *
 * Handles the conversion of hierarchical content menu structure to
 * a flat sequential navigation map optimized for previous/next navigation.
 */
export class FlatNavGenerator {
	private inputPath: string;
	private outputPath: string;
	private settings: AppSettings;
	private contentMenu: MenuStructure | null = null;
	private flatEntries: FlatNavEntry[] = [];

	constructor(inputPath?: string, outputPath?: string, settings?: AppSettings) {
		this.settings = settings || SETTINGS;
		this.inputPath = inputPath || this.settings.scripts.flatNav.paths.inputFile;
		this.outputPath = outputPath || this.settings.scripts.flatNav.paths.outputFile;
	}

	/**
	 * Generate the flat navigation structure
	 */
	async generate(): Promise<boolean> {
		try {
			console.log("🗺️ Generating flat navigation structure...");

			// Load content menu using dynamic import
			await this.loadContentMenu();
			if (!this.contentMenu) {
				throw new Error("Failed to load content menu");
			}

			// Generate flat navigation entries (respecting existing order)
			this.generateFlatEntries();

			// Create bidirectional links
			this.establishBidirectionalLinks();

			// Generate and write TypeScript output
			await this.writeOutput();

			// Run validation using existing infrastructure
			await this.runValidation();

			console.log(`✅ Flat navigation generated successfully: ${this.outputPath}`);
			return true;
		} catch (error) {
			console.error("❌ Error generating flat navigation:", error);
			return false;
		}
	}

	/**
	 * Load content menu using dynamic import (more reliable than file parsing)
	 */
	private async loadContentMenu(): Promise<void> {
		console.log(`📖 Loading content menu from: ${this.inputPath}`);

		try {
			// Convert to absolute path and then to file URL for dynamic import
			const { resolve } = await import("path");
			const absolutePath = resolve(this.inputPath);
			// Add cache-busting parameter to avoid import caching issues in tests
			const fileUrl = `file://${absolutePath}?t=${Date.now()}`;

			// Use dynamic import to load the content menu
			const module = await import(fileUrl);
			this.contentMenu = module.contentMenu as MenuStructure;

			console.log(
				`📊 Loaded ${this.contentMenu.units.length} units with ${this.contentMenu.metadata.totalChapters} total chapters`
			);
		} catch (error) {
			throw new Error(`Failed to load content menu: ${error}`);
		}
	}

	/**
	 * Generate flat navigation entries from hierarchical structure
	 * Respects the existing order in content-menu.ts (no re-sorting needed)
	 */
	private generateFlatEntries(): void {
		if (!this.contentMenu) {
			throw new Error("Content menu not loaded");
		}

		console.log("🔄 Converting hierarchical structure to flat navigation...");

		let globalIndex = 0;
		this.flatEntries = [];

		// Process units in their existing order (they're already sorted in content-menu.ts)
		for (const unit of this.contentMenu.units) {
			if (this.settings.scripts.flatNav.navigation.skipEmptyUnits && unit.chapters.length === 0) {
				console.log(`⏭️  Skipping empty unit: ${unit.title}`);
				continue;
			}

			const unitEntries = this.processUnit(unit, globalIndex);
			this.flatEntries.push(...unitEntries);
			globalIndex += unitEntries.length;
		}

		console.log(`📋 Generated ${this.flatEntries.length} navigation entries`);
	}

	/**
	 * Process a single unit and return its flat navigation entries
	 * Uses existing chapter order from content-menu.ts
	 */
	private processUnit(unit: MenuUnit, startingGlobalIndex: number): FlatNavEntry[] {
		const unitEntries: FlatNavEntry[] = [];
		let chapterIndex = 0;

		// Use chapters in their existing order (already properly sorted in content-menu.ts)
		for (const chapter of unit.chapters) {
			const entry = this.createFlatNavEntry(
				unit,
				chapter,
				chapterIndex,
				startingGlobalIndex + chapterIndex
			);
			unitEntries.push(entry);
			chapterIndex++;
		}

		return unitEntries;
	}

	/**
	 * Create a flat navigation entry from unit and chapter data
	 * Uses navigation-paths.ts utility for consistent URL generation
	 */
	private createFlatNavEntry(
		unit: MenuUnit,
		chapter: MenuChapter,
		chapterIndex: number,
		globalIndex: number
	): FlatNavEntry {
		// Create unified path config
		const pathConfig: UnifiedPathConfig = {
			contentType: chapter.type,
			unitNum: unit.unitNumber.toString(),
			chapterNum: chapter.type === "overview" ? undefined : chapter.chapterNumber,
			titleSlug: chapter.title
		};

		// Generate URL using consistent serialization function
		const url = serializeNavigationUrl(pathConfig);

		return {
			id: chapter.id,
			title: chapter.title,
			url,
			unitId: unit.id,
			unitTitle: unit.title,
			chapterType: chapter.type,
			chapterIndex,
			globalIndex,
			technologyUnit: unit.technologyUnit,
			progress: chapter.progress,
			estimatedTime: chapter.estimatedTime,
			// These will be set in establishBidirectionalLinks()
			previousEntry: null,
			nextEntry: null
		};
	}

	/**
	 * Establish bidirectional links between adjacent entries
	 */
	private establishBidirectionalLinks(): void {
		console.log("🔗 Establishing bidirectional navigation links...");

		for (let i = 0; i < this.flatEntries.length; i++) {
			const currentEntry = this.flatEntries[i];

			// Set previous entry (if not first)
			if (i > 0) {
				currentEntry.previousEntry = this.flatEntries[i - 1];
			}

			// Set next entry (if not last)
			if (i < this.flatEntries.length - 1) {
				currentEntry.nextEntry = this.flatEntries[i + 1];
			}
		}

		console.log("✅ Bidirectional links established");
	}

	/**
	 * Generate and write TypeScript output file
	 */
	private async writeOutput(): Promise<void> {
		console.log(`📝 Generating TypeScript output...`);

		// Create output directory if it doesn't exist
		const { dirname } = await import("path");
		const { mkdirSync, existsSync } = await import("fs");
		const outputDir = dirname(this.outputPath);
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
		}

		// Generate the complete FlatNavStructure implementation
		const flatNavStructure = this.createFlatNavStructure();
		const typeScriptContent = this.generateTypeScriptCode(flatNavStructure);

		await writeFormattedFile(this.outputPath, typeScriptContent);

		console.log(`💾 Output written to: ${this.outputPath}`);
	}

	/**
	 * Create the complete FlatNavStructure implementation
	 */
	private createFlatNavStructure(): FlatNavStructure {
		// Create lookup map for O(1) access
		const sequenceMap = new Map<string, FlatNavEntry>();
		this.flatEntries.forEach((entry) => {
			sequenceMap.set(entry.id, entry);
		});

		return {
			entries: this.flatEntries,
			totalCount: this.flatEntries.length,
			sequenceMap,

			// Utility methods
			getNextEntry: (currentId: string): FlatNavEntry | null => {
				const current = sequenceMap.get(currentId);
				return current?.nextEntry || null;
			},

			getPreviousEntry: (currentId: string): FlatNavEntry | null => {
				const current = sequenceMap.get(currentId);
				return current?.previousEntry || null;
			},

			getEntryByIndex: (index: number): FlatNavEntry | null => {
				return index >= 0 && index < this.flatEntries.length ? this.flatEntries[index] : null;
			},

			getEntriesByUnit: (unitId: string): FlatNavEntry[] => {
				return this.flatEntries.filter((entry) => entry.unitId === unitId);
			},

			calculateProgress: (completedIds: string[]): number => {
				if (this.flatEntries.length === 0) return 0;
				const completedCount = completedIds.filter((id) => sequenceMap.has(id)).length;
				return Math.round((completedCount / this.flatEntries.length) * 100);
			}
		};
	}

	/**
	 * Generate TypeScript code for the flat navigation structure
	 */
	private generateTypeScriptCode(flatNavStructure: FlatNavStructure): string {
		// Create a serializable version without circular references
		const serializableEntries = flatNavStructure.entries.map((entry) => ({
			id: entry.id,
			title: entry.title,
			url: entry.url,
			unitId: entry.unitId,
			unitTitle: entry.unitTitle,
			chapterType: entry.chapterType,
			chapterIndex: entry.chapterIndex,
			globalIndex: entry.globalIndex,
			technologyUnit: entry.technologyUnit,
			progress: entry.progress,
			estimatedTime: entry.estimatedTime,
			// Exclude previousEntry and nextEntry to avoid circular references
			previousEntry: null,
			nextEntry: null
		}));

		const serializableData = {
			entries: serializableEntries,
			totalCount: flatNavStructure.totalCount,
			// Note: Map is serialized as an array of key-value pairs
			sequenceMapEntries: Array.from(flatNavStructure.sequenceMap.entries()).map(([key, value]) => [
				key,
				{
					id: value.id,
					title: value.title,
					url: value.url,
					unitId: value.unitId,
					unitTitle: value.unitTitle,
					chapterType: value.chapterType,
					chapterIndex: value.chapterIndex,
					globalIndex: value.globalIndex,
					technologyUnit: value.technologyUnit,
					progress: value.progress,
					estimatedTime: value.estimatedTime,
					previousEntry: null,
					nextEntry: null
				}
			])
		};

		return `/**
 * Generated Flat Navigation Structure
 *
 * Auto-generated file providing sequential navigation mapping for the entire
 * learning platform. Enables seamless previous/next navigation across all
 * units and chapters with optimized lookup performance.
 *
 * Generated on: ${new Date().toISOString()}
 * Total entries: ${flatNavStructure.totalCount}
 * Home URL: ${this.settings.scripts.flatNav.navigation.homeUrl}
 *
 * DO NOT EDIT THIS FILE MANUALLY
 * Regenerate using: pnpm run generate-flatnav
 */

import type { FlatNavEntry, FlatNavStructure } from "$types";

// Flat navigation entries in sequential order
const flatNavEntries: FlatNavEntry[] = ${JSON.stringify(serializableData.entries, null, 2)};

// Create lookup map for O(1) access
const sequenceMap = new Map<string, FlatNavEntry>(${JSON.stringify(serializableData.sequenceMapEntries)});

// Establish bidirectional links (runtime reconstruction)
flatNavEntries.forEach((entry, index) => {
	entry.previousEntry = index > 0 ? flatNavEntries[index - 1] : null;
	entry.nextEntry = index < flatNavEntries.length - 1 ? flatNavEntries[index + 1] : null;
});

// Export the complete flat navigation structure
export const flatNavigation: FlatNavStructure = {
	entries: flatNavEntries,
	totalCount: ${flatNavStructure.totalCount},
	sequenceMap,

	// Utility methods for navigation
	getNextEntry: (currentId: string): FlatNavEntry | null => {
		const current = sequenceMap.get(currentId);
		return current?.nextEntry || null;
	},

	getPreviousEntry: (currentId: string): FlatNavEntry | null => {
		const current = sequenceMap.get(currentId);
		return current?.previousEntry || null;
	},

	getEntryByIndex: (index: number): FlatNavEntry | null => {
		return index >= 0 && index < flatNavEntries.length ? flatNavEntries[index] : null;
	},

	getEntriesByUnit: (unitId: string): FlatNavEntry[] => {
		return flatNavEntries.filter((entry) => entry.unitId === unitId);
	},

	calculateProgress: (completedIds: string[]): number => {
		if (flatNavEntries.length === 0) return 0;
		const completedCount = completedIds.filter((id) => sequenceMap.has(id)).length;
		return Math.round((completedCount / flatNavEntries.length) * 100);
	}
};

// Export home URL for navigation root
export const homeUrl = "${this.settings.scripts.flatNav.navigation.homeUrl}";

// Compatibility exports for backward compatibility
export const flatNav = flatNavigation;
export const getFlatNavigation = (): FlatNavStructure => flatNavigation;
export const getNextEntry = flatNavigation.getNextEntry;
export const getPreviousEntry = flatNavigation.getPreviousEntry;
`;
	}

	/**
	 * Run validation using existing infrastructure
	 */
	private async runValidation(): Promise<void> {
		console.log("🔍 Running validation...");

		// Check if validation is enabled in settings
		if (!this.settings.scripts.validation.generated.runAfterGeneration) {
			console.log("⏭️  Validation disabled by settings");
			return;
		}

		try {
			// Generate config ID for validation
			const configId = `${this.settings.scripts.flatNav.validationPrefix}`;
			await runGeneratedFileValidation(this.outputPath, configId);
		} catch (error) {
			console.warn("⚠️  Validation warning:", error);
			// Don't fail the generation if validation has issues
		}
	}
}

/**
 * CLI execution when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
	const generator = new FlatNavGenerator();
	const success = await generator.generate();
	process.exit(success ? 0 : 1);
}

export default FlatNavGenerator;
