# Development Patterns

**Type safety, import patterns, service architecture, error prevention, and integration guidelines for the Cloud-Native Learning Platform.**

> **📚 Part of [Development Guide](./README.md)**

---

## Type Safety & Import Patterns

### Centralized Type Imports

Use `$types` alias for consistent type imports:

```typescript
// ✅ PREFERRED: Centralized type imports
import type { ContentType, LessonContent, QuizContent, NavigationItem } from "$types";

// ✅ ALTERNATIVE: Direct lib import (also valid)
import type { ContentType } from "$lib/types";

// ❌ DEPRECATED: Direct file imports
import type { ContentType } from "$lib/types/types.js";
```

### Content Data Imports

Use `$data` alias for content structure:

```typescript
// ✅ PREFERRED: Content data imports
import { demoContent } from "$data/demo/content";
import { navigationMenu } from "$data/demo/navigation/demo-sidebar-menu";

// Path resolution in configuration
const dataPath = "$data/book"; // Resolves to src/data/book
```

### Union Type Consistency

Maintain type safety across the application:

```typescript
// Consistent union types from centralized definitions
type ChapterType = "lesson" | "quiz" | "exam" | "project" | "study-guide";
type ContentStatus = "scaffold" | "draft" | "final";
```

---

## Service Layer Architecture Patterns

### Separation of Concerns

Clear boundaries between CLI, services, and utilities:

```typescript
// CLI Layer: Orchestration only
class ContentCreatorCLI {
	constructor(
		private validationService: ValidationService,
		private repositoryService: RepositoryService
	) {}

	async createContent(options: CreateOptions): Promise<void> {
		const content = await this.acquireContent(options);
		const validation = await this.validationService.validate(content);

		if (validation.success) {
			await this.repositoryService.writeFile(options.path, content);
		}
	}
}

// Service Layer: Business logic
class ValidationService {
	async validate(content: ContentObject): Promise<ValidationResult> {
		// 1. Zod schema validation
		// 2. Business rules validation
		// 3. Content-specific validation (Mermaid, etc.)
		return { success: boolean, errors: string[] };
	}
}

// Utility Layer: Pure functions
export function validateMermaidSyntax(definition: string): MermaidValidationResult {
	// Pure function with no side effects
	return { isValid: boolean, error?: string };
}
```

### Shared Service Integration

Services used by both automation and manual flows:

```typescript
// Scaffold flow uses shared services
const scaffoldContent = generatePlaceholderContent();
const validation = await validationService.validate(scaffoldContent);
await repositoryService.writeFile(path, scaffoldContent);

// CRUD flow uses same services
const userContent = parseUserInput(input);
const validation = await validationService.validate(userContent);
await repositoryService.writeFile(path, userContent);
```

---

## Error Prevention & Path Resolution Patterns

### Path Duplication Prevention

Always check for absolute paths before joining:

```typescript
// ✅ CORRECT: Prevent path duplication
constructor(inputFile?: string) {
	this.projectRoot = process.cwd();
	const inputPath = inputFile || defaultPath;

	// Critical: Check if path is already absolute
	this.inputPath = isAbsolute(inputPath)
		? inputPath
		: join(this.projectRoot, inputPath);
}

// ❌ INCORRECT: Creates /home/user/.../home/user/... paths
this.inputPath = join(this.projectRoot, inputFile);
```

### Safe File Operations

Comprehensive error handling with recovery:

```typescript
async function safeFileOperation(path: string, operation: () => Promise<void>): Promise<void> {
	try {
		await ensureDir(dirname(path));
		await operation();
	} catch (error) {
		console.error(`Failed to process ${path}:`, error.message);

		// Attempt recovery
		if (error.code === "ENOENT") {
			await ensureDir(dirname(path));
			await operation(); // Retry once
		} else {
			throw error; // Re-throw if not recoverable
		}
	}
}
```

### Validation Pipeline Patterns

Structured error collection and reporting:

```typescript
interface ValidationResult {
	success: boolean;
	errors: string[];
	warnings?: string[];
}

async function validateContent(content: ContentObject): Promise<ValidationResult> {
	const errors: string[] = [];

	// Schema validation
	const schemaResult = validateSchema(content);
	if (!schemaResult.success) {
		errors.push(...schemaResult.errors);
	}

	// Content-specific validation
	if (content.diagrams) {
		for (const diagram of content.diagrams) {
			const mermaidResult = validateMermaidSyntax(diagram.definition);
			if (!mermaidResult.isValid) {
				errors.push(`Invalid Mermaid syntax: ${mermaidResult.error}`);
			}
		}
	}

	return { success: errors.length === 0, errors };
}
```

---

## Integration Guidelines

### Consistent Pattern Application

All new scripts and components should follow these patterns:

1. **Use `writeFormattedFile()` for all output formatting**
   - See: [prettier-integration.md](./prettier-integration.md)
2. **Implement TestSetup class for test isolation**
   - See: [Testing Guide - Unit Tests](../testing/unit-tests.md)
3. **Use settings destructuring for configuration access**
   - See: [configuration.md](./configuration.md)
4. **Import types from `$types` alias for consistency**
   - See: [Type Safety & Import Patterns](#type-safety--import-patterns)
5. **Implement proper error handling with path resolution checks**
   - See: [Error Prevention & Path Resolution Patterns](#error-prevention--path-resolution-patterns)
6. **Follow service layer architecture for business logic separation**
   - See: [Service Layer Architecture Patterns](#service-layer-architecture-patterns)

### Migration from Legacy Patterns

When updating existing code:

1. **Replace manual `JSON.stringify()` with `writeFormattedFile()`**

   ```typescript
   // ❌ Old
   writeFileSync(path, JSON.stringify(obj, null, 2));

   // ✅ New
   await writeFormattedFile(path, JSON.stringify(obj));
   ```

2. **Extract hardcoded paths to settings configuration**

   ```typescript
   // ❌ Old
   const outputPath = "src/data/generated/output.json";

   // ✅ New
   import { SETTINGS } from "$config/settings";
   const outputPath = SETTINGS.scripts.schemas.paths.outputFile;
   ```

3. **Add TestSetup pattern to existing test suites**

   ```typescript
   // ✅ New pattern
   import { ExtendedTestSetup } from "../helpers/test-setup.js";

   let testSetup: ExtendedTestSetup;
   beforeEach(() => {
   	testSetup = new ExtendedTestSetup("category", "test-name");
   	testSetup.setup();
   });
   ```

4. **Update type imports to use centralized aliases**

   ```typescript
   // ❌ Old
   import type { ContentType } from "$lib/types/types.js";

   // ✅ New
   import type { ContentType } from "$types";
   ```

5. **Implement proper error recovery patterns**
   ```typescript
   // ✅ Add error handling with recovery
   try {
   	await operation();
   } catch (error) {
   	if (error.code === "ENOENT") {
   		await ensureDir(dirname(path));
   		await operation(); // Retry once
   	} else {
   		throw error;
   	}
   }
   ```

---

## Pattern Checklist

### For New Development

- [ ] Types imported from `$types` alias
- [ ] Content data imported from `$data` alias
- [ ] Configuration from `SETTINGS` (no hardcoding)
- [ ] `writeFormattedFile()` used for all file writes
- [ ] TestSetup pattern for tests
- [ ] Service layer architecture followed
- [ ] Path duplication checks implemented
- [ ] Error handling with recovery
- [ ] Validation pipeline structured

### For Code Review

- [ ] No hardcoded configuration values
- [ ] No direct file imports (use aliases)
- [ ] Proper separation of concerns (CLI/Service/Utility)
- [ ] Absolute path checks before join operations
- [ ] Comprehensive error handling
- [ ] Consistent with existing patterns

---

## Related Documentation

- **[Standards](./standards.md)** - Development standards and code quality
- **[Configuration](./configuration.md)** - Settings management patterns
- **[Prettier Integration](./prettier-integration.md)** - Formatting utility usage
- **[Testing Guide](../testing/README.md)** - TestSetup patterns and test isolation
- **[SVELTE-COMPONENTS.md](../SVELTE-COMPONENTS.md)** - Component patterns and type system

---

**Last Updated**: 2025-01-17
