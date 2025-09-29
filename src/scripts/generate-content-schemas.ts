#!/usr/bin/env tsx

/**
 * Content Generator Schema Generator
 *
 * Genera únicamente los esquemas JSON esenciales para el flujo de trabajo
 * del content-generator. Enfocado solo en las interfaces y clases que
 * se usan durante la generación de contenido.
 */

import { zodToJsonSchema } from "zod-to-json-schema";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { CONTENT_SCHEMAS } from "$lib/schemas/ContentSchemas.js";
import { z } from "zod";

// ============================================================================
// ESQUEMAS ADICIONALES PARA CONTENT-GENERATOR (no duplicados)
// ============================================================================

// UnitIdentification - Schema específico para content-generator
const unitIdentificationSchema = z.object({
	type: z.enum(["numeric", "string"]),
	value: z.union([z.number(), z.string()]),
	unitNumber: z.number().optional(),
	technologyUnit: z.string().optional(),
	isAmbiguous: z.boolean().optional(),
	matchedUnits: z
		.array(
			z.object({
				unitNumber: z.number(),
				title: z.string(),
				technologyUnit: z.string()
			})
		)
		.optional()
});

// ValidatedScaffoldingArgs - Versión con UnitIdentification
const validatedScaffoldingArgsSchema = z.object({
	unit: unitIdentificationSchema.optional(),
	type: z.enum(["lesson", "quiz", "exam", "study_guide", "project"] as const).optional(),
	id: z.string().optional()
});

// GenerationOptions - Opciones de generación específicas
const generationOptionsSchema = z.object({
	dryRun: z.boolean(),
	forceOverwrite: z.boolean().optional(),
	verbose: z.boolean().optional()
});

// ============================================================================
// GENERADOR DE ESQUEMAS
// ============================================================================

const schemas = {
	ScaffoldingArgs: {
		schema: CONTENT_SCHEMAS.ScaffoldingArgs,
		description: "Input arguments for content scaffolding operations"
	},
	ValidatedScaffoldingArgs: {
		schema: validatedScaffoldingArgsSchema,
		description: "Validated scaffolding arguments with normalized unit identification"
	},
	GenerationOptions: {
		schema: generationOptionsSchema,
		description: "Options for controlling content generation behavior"
	},
	ScaffoldingStats: {
		schema: CONTENT_SCHEMAS.ScaffoldingStats,
		description: "Statistics from content scaffolding operations"
	},
	ContentGenerationResult: {
		schema: CONTENT_SCHEMAS.ContentGenerationResult,
		description: "Result of content generation operation"
	}
};

function generateSchemas() {
	const outputDir = "schemas";

	// Crear directorio si no existe
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	console.log("🚀 Generating content-generator schemas...");

	// Generar cada esquema
	for (const [name, { schema }] of Object.entries(schemas)) {
		const jsonSchema = zodToJsonSchema(schema, {
			name
		});

		const outputPath = join(outputDir, `${name}.json`);
		writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));

		console.log(`✅ Generated: ${outputPath}`);
	}

	// Generar índice de esquemas
	const indexSchema = {
		$schema: "http://json-schema.org/draft-07/schema#",
		title: "Content Generator Schemas Index",
		description: "Index of all schemas for the content-generator workflow",
		type: "object",
		properties: {
			schemas: {
				type: "array",
				items: {
					type: "object",
					properties: {
						name: { type: "string" },
						description: { type: "string" },
						file: { type: "string" }
					}
				}
			}
		},
		schemas: Object.entries(schemas).map(([name, { description }]) => ({
			name,
			description,
			file: `${name}.json`
		}))
	};

	const indexPath = join(outputDir, "index.json");
	writeFileSync(indexPath, JSON.stringify(indexSchema, null, 2));
	console.log(`✅ Generated index: ${indexPath}`);

	console.log("🎉 Schema generation completed!");
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
	generateSchemas();
}

export { generateSchemas };
