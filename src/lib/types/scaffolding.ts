/**
 * Scaffolding Types
 *
 * Reusable type definitions for content scaffolding and generation systems.
 * These types are used across multiple scripts and services for consistency.
 */

import type { ChapterType } from "$types";

/**
 * Validated arguments interface after CLI parsing and validation
 */
export interface ValidatedScaffoldingArgs {
	unit?: UnitIdentification;
	type?: ChapterType;
	id?: string;
}

/**
 * Unit identification interface for flexible matching
 */
export interface UnitIdentification {
	type: "numeric" | "string";
	value: number | string;
	unitNumber?: number;
	technologyUnit?: string;
	isAmbiguous?: boolean;
	matchedUnits?: Array<{
		unitNumber: number;
		title: string;
		technologyUnit: string;
	}>;
}

/**
 * Statistics interface for scaffolding operations
 */
export interface ScaffoldingStats {
	totalChapters: number;
	existingFiles: number;
	newFiles: number;
	orphanFiles: string[];
	errors: string[];
}

/**
 * Content generation result interface
 */
export interface ContentGenerationResult {
	success: boolean;
	filePath?: string;
	stats?: ScaffoldingStats;
	errors?: string[];
}

/**
 * Safety status levels for content protection
 */
export type ContentStatus = "scaffold" | "draft" | "final";

/**
 * Safety operation result
 */
export interface SafetyCheckResult {
	canProceed: boolean;
	requiresForce: boolean;
	warning?: string;
	error?: string;
	currentStatus?: ContentStatus;
}
