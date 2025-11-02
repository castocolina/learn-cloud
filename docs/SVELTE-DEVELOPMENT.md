# SvelteKit Development Patterns & Standards Guide

**Modern development practices, testing strategies, dependency management, and quality standards for the Cloud-Native Learning Platform.**

> **📚 Navigation:**
>
> - [← Back to Index](./SVELTEKIT-INDEX.md)
> - [← Previous: Components](./SVELTE-COMPONENTS.md) | [Next: Troubleshooting & UX →](./SVELTE-TROUBLESHOOTING-UX.md)

---

## DEVELOPMENT STANDARDS

### Component Development Rules

- **TypeScript Interfaces**: All component props must use TypeScript interfaces
- **shadcn-svelte Priority**: Check component library before building custom components
- **Mobile-First Development**: Always design and test mobile experience first
- **CSS Architecture**: Follow modular CSS patterns defined in [SVELTE-STYLING.md](./SVELTE-STYLING.md)
- **Theme System Compliance**: When creating new components, ensure compliance with theme architecture:
  - ✅ Use CSS custom properties from `src/app.css` (semantic variables like `--primary`, `--background`)
  - ✅ Use z-index hierarchy via CSS variables (`var(--z-modal)`, `var(--z-dropdown)`, etc.)
  - ❌ NEVER use hardcoded z-index values
  - ❌ NEVER use `@apply` in component `<style>` blocks (Tailwind v4 incompatible)
  - ⚠️ Avoid properties that create stacking contexts on navigation elements (`transform`, `opacity`, `filter`)
  - 🔍 Run `make validate-theme` or `make validate-quality` to verify compliance

### Code Quality Standards

- **Three-Tiered Validation Strategy**: Performance-optimized approach for efficient development workflow:
  - **Tier 1 (Fast WIP Check ~5-15s):** `make check-wip` or `pnpm run check:wip` - validates only modified/untracked files with prettier and eslint
  - **Tier 2 (Quality Checks ~30-90s):** `make validate-quality` - theme architecture validation + unit tests (validates theme system compliance, z-index hierarchy, stacking contexts, and CSS architecture)
  - **Tier 3 (Comprehensive ~1-3m):** `pnpm run format` + `pnpm run lint` + `pnpm run check` - complete project formatting, linting, and TypeScript/SvelteKit validation
- **Zero Tolerance Policy**:
  - **NO TypeScript errors** - All code must pass TypeScript validation
  - **NO TypeScript warnings** - Address all compiler warnings before completion
  - **NO unused variables** - Remove unused imports/variables unless explicitly requested by user or required by ShadCN components
  - **NO deprecated components** - Avoid deprecated Lucide icons and other library components
- **Error Handling**: Implement comprehensive error boundaries and fallbacks
- **Performance**: Optimize bundle size and runtime performance
- **Accessibility**: Ensure WCAG compliance and keyboard navigation

### Security Considerations

- **Secure by Default**: All code and architectural patterns designed with security first
- **No Exposed Secrets**: Never commit or log sensitive information
- **Production Ready**: All examples must be robust and production-ready

---

## MODERN DEVELOPMENT PATTERNS & STANDARDS

This section documents the established modern development patterns used throughout the project. These patterns ensure consistency, performance, and maintainability across all scripts and components.

### Prettier Integration Patterns

**Central Formatting Utility**: All file writing operations use the centralized `writeFormattedFile()` utility:

```typescript
// ✅ PREFERRED: Use writeFormattedFile utility
import { writeFormattedFile } from "$lib/utils/prettier-writer";

await writeFormattedFile(outputPath, JSON.stringify(contentObject), {
	compress: false // Use standard formatting for readability
});
```

**Configuration Resolution**: The utility automatically resolves `.prettierrc` configuration:

```typescript
// Automatic .prettierrc integration
const config = await prettier.resolveConfig(process.cwd());
const formatted = await prettier.format(content, {
	...config,
	filepath: filePath // Ensures correct parser selection
});
```

**Anti-Patterns to Avoid**:

```typescript
// ❌ DEPRECATED: Manual formatting with hardcoded indentation
writeFileSync(path, JSON.stringify(obj, null, 2));

// ❌ DEPRECATED: Custom formatting functions
const formatted = formatTypeScriptValue(content);
```

**Production vs Development Modes**:

```typescript
// Debug mode: compressed output for performance
await writeFormattedFile(path, content, { compress: true });

// Development mode: readable formatting (default)
await writeFormattedFile(path, content);
```

### Configuration Management

**🚨 CRITICAL RULE: No Hardcoded Configurations in Development**

All configuration values **MUST** be defined in `src/config/settings.ts`. This ensures:

- **Consistency**: Single source of truth for all configuration values
- **Maintainability**: Easy to update configurations without searching through code
- **Testability**: Configurations can be overridden in tests
- **Documentation**: All settings documented in one place
- **Type Safety**: TypeScript interfaces ensure correct usage

**Configuration Architecture**:

```typescript
// src/config/settings.ts
export const SETTINGS: AppSettings = {
	ui: {
		// UI component configurations
		mermaid: {
			debug: true,
			modalPagePercent: 90
		},
		flipCard: {
			modalPagePercent: 90
		},
		sidebar: {
			collapsible: true,
			defaultCollapsed: false
		}
	},
	scripts: {
		// Script and tooling configurations
		validation: {
			generated: {
				runAfterGeneration: true,
				includeCheck: true,
				includeLint: true
			}
		},
		schemas: {
			paths: {
				sourceFile: "src/lib/schemas/ContentSchemas.ts",
				outputFile: "src/data/generated/content-schemas.json"
			},
			generation: {
				target: "draft-7",
				validateOutput: true
			}
		}
	}
};
```

**✅ CORRECT: Using SETTINGS**

```typescript
// Component using UI settings
import { SETTINGS } from "$config/settings";

const { mermaid: mermaidSettings } = SETTINGS.ui;
const modalSize = mermaidSettings.modalPagePercent; // ✅ From settings.ts

// Script using configuration
import { SETTINGS } from "$config/settings";

const { schemas: schemasSettings } = SETTINGS.scripts;
const outputPath = schemasSettings.paths.outputFile; // ✅ From settings.ts
```

**❌ INCORRECT: Hardcoded Values**

```typescript
// ❌ WRONG: Hardcoded modal size in component
const modalSize = 90; // Should be SETTINGS.ui.mermaid.modalPagePercent

// ❌ WRONG: Hardcoded path in script
const outputPath = "src/data/generated/content-schemas.json"; // Should be SETTINGS.scripts.schemas.paths.outputFile

// ❌ WRONG: Magic numbers in logic
if (files.length > 4) {
	// Should be SETTINGS.scripts.validation.mermaid.maxParallelFiles
}
```

**Creating New Configuration Categories**:

When adding new features that require configuration, create appropriate subcategories:

```typescript
// Example: Adding API configuration
export const SETTINGS: AppSettings = {
	ui: {
		/* existing UI configs */
	},
	scripts: {
		/* existing script configs */
	},
	api: {
		// New category for API configurations
		baseUrl: "https://api.example.com",
		timeout: 5000,
		retries: 3
	},
	database: {
		// New category for database configurations
		connectionPool: {
			min: 2,
			max: 10
		}
	}
};
```

**Type Safety**: All settings must have corresponding TypeScript interfaces:

```typescript
// src/lib/types/config.ts (centralized type system)
export interface AppSettings {
	ui: UISettings;
	scripts: ScriptsSettings;
	api?: APISettings; // Optional new categories
	database?: DatabaseSettings;
}

export interface UISettings {
	mermaid: MermaidUISettings;
	flipCard: FlipCardSettings;
	sidebar: SidebarSettings;
}

export interface ScriptsSettings {
	validation: ValidationSettings;
	schemas: SchemasSettings;
	/* ... other script settings ... */
}
```

**When to Use settings.ts**:

| Configuration Type         | Use settings.ts? | Example                                     |
| -------------------------- | ---------------- | ------------------------------------------- |
| UI component defaults      | ✅ Yes           | Modal sizes, animation durations            |
| File paths                 | ✅ Yes           | Input/output paths for scripts              |
| Build/generation options   | ✅ Yes           | Schema target format, validation flags      |
| Performance tuning         | ✅ Yes           | Max parallel files, timeout values          |
| Feature flags              | ✅ Yes           | Enable/disable features                     |
| Magic numbers              | ✅ Yes           | Any numeric constant with business logic    |
| Content-specific data      | ❌ No            | Actual content belongs in `src/data/`       |
| Component internal state   | ❌ No            | Transient state managed by Svelte runes     |
| User preferences (runtime) | ❌ No            | Store in localStorage/cookies, not settings |
| Secrets/credentials        | ❌ No            | Use `.env` files (never commit secrets!)    |

### Settings Configuration Patterns

**Modern Destructuring Pattern**: Extract specific settings sections for cleaner code:

```typescript
// ✅ PREFERRED: Settings destructuring for readability
const { validation: validationSettings } = SETTINGS.scripts;
const { mermaid: mermaidSettings } = validationSettings;

// Use specific settings
const maxFiles = mermaidSettings.maxParallelFiles;
```

**Performance Optimization in Tests**: Override global settings for test efficiency:

```typescript
// Global setting (src/config/settings.ts): enabled for manual execution
scripts: {
	validation: {
		generated: {
			runAfterGeneration: true; // Global default
		}
	}
}

// Test override: disabled for performance
const testSettings = {
	...SETTINGS,
	scripts: {
		...SETTINGS.scripts,
		validation: {
			...SETTINGS.scripts.validation,
			generated: {
				...SETTINGS.scripts.validation.generated,
				enabled: false // Test-specific override
			}
		}
	}
};
```

**Dynamic Settings for Test Isolation**:

```typescript
// Generate unique config IDs to prevent race conditions
const configId = generateConfigId(validationPrefix, testSuiteId);
const tempSettings = createTempValidationConfig(configId, testSettings);
```

### Test Isolation & TestSetup Patterns

**TestSetup Class Architecture**: Standardized test isolation pattern used across all test suites:

```typescript
class TestSetup {
	public tempDir: string;
	public configId: string;
	public readonly testSuiteId: string;

	constructor(testSuiteId: string = "main") {
		const timestamp = Date.now();
		const uniqueId = `${testSuiteId}-${timestamp}`;

		// Unique temporary directory
		this.tempDir = join(process.cwd(), "tmp", `test-${uniqueId}`);

		// Unique config ID for validation settings
		this.configId = generateConfigId("test-prefix", testSuiteId);

		this.testSuiteId = testSuiteId;
	}

	async setup(): Promise<void> {
		// Create isolated test environment
		await ensureDir(this.tempDir);
		await this.createTestFiles();
	}

	async cleanup(): Promise<void> {
		// Clean up temporary resources
		await remove(this.tempDir);
		await cleanupTempValidationConfig(this.configId);
	}
}
```

**Usage Pattern in Tests**:

```typescript
describe("Script Tests", () => {
	let testSetup: TestSetup;

	beforeEach(async () => {
		testSetup = new TestSetup("unique-suite-id");
		await testSetup.setup();
	});

	afterEach(async () => {
		await testSetup.cleanup();
	});

	it("should execute with isolation", async () => {
		// Test uses testSetup.tempDir and testSetup.configId
		// No interference with other parallel tests
	});
});
```

**Race Condition Prevention**: Unique identifiers prevent parallel test conflicts:

```typescript
// Each test gets unique resources
const timestamp = Date.now();
const randomId = Math.random().toString(36).substring(7);
const uniqueId = `${testSuiteId}-${timestamp}-${randomId}`;
```

**🚨 CRITICAL RULE: NO HARDCODED PATHS IN TESTS**

All test files **MUST** use TestSetup pattern with temporary directories. Never use hardcoded paths to production files.

```typescript
// ❌ INCORRECT: Hardcoded path to production file
describe("Schema Tests", () => {
	const schemaPath = "src/data/generated/content-schemas.json"; // ❌ WRONG!

	beforeAll(() => {
		// Reads from production directory
		const schema = readFileSync(schemaPath, "utf-8");
	});
});

// ✅ CORRECT: TestSetup with temporary directory
describe("Schema Tests", () => {
	let testSetup: TestSetup;

	beforeAll(async () => {
		testSetup = new TestSetup("schema-validation");
		testSetup.setup();

		// Generate test schema in isolated directory
		await generateTestSchema(testSetup.schemaPath);
		const schema = readFileSync(testSetup.schemaPath, "utf-8");
	});

	afterAll(() => {
		testSetup.cleanup(); // Always cleanup
	});
});
```

**Why This Matters**:

- **Test Isolation**: Tests don't interfere with production files
- **Parallel Execution**: Multiple tests can run safely in parallel
- **CI/CD Safety**: Tests work in clean environments without pre-existing files
- **Cleanup**: Temporary files are automatically removed after tests

**🧹 MANDATORY: Cleanup Temporary Directories**

All TestSetup implementations **MUST** include proper cleanup in `afterAll()` or `afterEach()` hooks:

```typescript
describe("Test Suite", () => {
	let testSetup: TestSetup;

	beforeAll(async () => {
		testSetup = new TestSetup("suite-id");
		await testSetup.setup();
	});

	// ✅ CRITICAL: Always cleanup temporary resources
	afterAll(() => {
		testSetup.cleanup(); // Removes tmp/test-suite-id-* directories
	});

	// Alternative for per-test cleanup
	afterEach(() => {
		testSetup.cleanup(); // Use if each test needs fresh state
	});
});
```

**Cleanup Implementation Pattern**:

```typescript
class TestSetup {
	cleanup(): void {
		// Remove temporary directory and all contents
		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, {
				recursive: true, // Remove all nested files/folders
				force: true // Ignore errors if already deleted
			});
		}

		// Additional cleanup (config files, database connections, etc.)
		// ... cleanup other resources
	}
}
```

**Why Cleanup Matters**:

- **Disk Space**: Prevents accumulation of temporary files
- **Test Reliability**: Ensures clean state between test runs
- **CI/CD Performance**: Keeps build environments clean
- **Local Development**: Prevents tmp/ directory bloat (use `make clean` to remove all)

### Type Safety & Import Patterns

**Centralized Type Imports**: Use `$types` alias for consistent type imports:

```typescript
// ✅ PREFERRED: Centralized type imports
import type { ContentType, LessonContent, QuizContent, NavigationItem } from "$types";

// ✅ ALTERNATIVE: Direct lib import (also valid)
import type { ContentType } from "$lib/types";

// ❌ DEPRECATED: Direct file imports
import type { ContentType } from "$lib/types/types.js";
```

**Content Data Imports**: Use `$data` alias for content structure:

```typescript
// ✅ PREFERRED: Content data imports
import { demoContent } from "$data/demo/content";
import { navigationMenu } from "$data/demo/navigation/demo-sidebar-menu";

// Path resolution in configuration
const dataPath = "$data/book"; // Resolves to src/data/book
```

**Union Type Consistency**: Maintain type safety across the application:

```typescript
// Consistent union types from centralized definitions
type ChapterType = "lesson" | "quiz" | "exam" | "project" | "study-guide";
type ContentStatus = "scaffold" | "draft" | "final";
```

### Service Layer Architecture Patterns

**Separation of Concerns**: Clear boundaries between CLI, services, and utilities:

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

**Shared Service Integration**: Services used by both automation and manual flows:

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

### Error Prevention & Path Resolution Patterns

**Path Duplication Prevention**: Always check for absolute paths before joining:

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

**Safe File Operations**: Comprehensive error handling with recovery:

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

**Validation Pipeline Patterns**: Structured error collection and reporting:

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

### Dependency Evaluation & Installation Process

**🚨 MANDATORY: Research Before Installing Dependencies**

Before installing any npm package or external library, agents **MUST** perform due diligence research to avoid compatibility issues and technical debt.

**Step-by-Step Evaluation Process:**

**1. Version Compatibility Research:**

```bash
# Check current project dependencies
cat package.json | grep "dependency-name"

# Research latest stable version
npm info package-name version
npm info package-name versions --json | tail -10

# Check peer dependencies for compatibility
npm info package-name peerDependencies
```

**2. Community Support & Maintenance:**

- **Weekly Downloads**: Minimum 10k+ weekly downloads (verify on npmjs.com)
- **Last Published**: Updated within last 6 months
- **GitHub Activity**: Active issues/PRs, responsive maintainers
- **TypeScript Support**: Native TypeScript or high-quality @types package

**3. Alternative Research:**

```bash
# Use WebSearch to find alternatives
WebSearch: "alternative to [package-name] 2025 typescript"
WebSearch: "[technology] best libraries 2025"
WebSearch: "[package-name] vs [alternative] comparison"
```

**4. Framework Compatibility:**

- **Zod**: Verify library supports Zod v4.x (not just v3.x)
- **SvelteKit/Svelte 5**: Check for Svelte 5 runes compatibility
- **Tailwind v4**: Ensure CSS framework compatibility
- **Node.js**: Verify compatibility with project's Node version

**5. Native Solutions First (Critical Priority):**

- Always check if the framework provides native functionality
- Example: Zod v4 has native `z.toJSONSchema()` - no need for external converter
- Built-in solutions guarantee compatibility and better long-term maintenance

**Decision Matrix:**

| Criterion                    | Weight       | Minimum Threshold                 | Notes                           |
| ---------------------------- | ------------ | --------------------------------- | ------------------------------- |
| Native Alternative Available | **BLOCKER**  | Use native if exists              | External library not needed     |
| Version Compatibility        | **Critical** | Must match project major versions | Breaking changes cause failures |
| Weekly Downloads             | High         | 10k+ weekly                       | Indicates active usage          |
| Last Update                  | High         | Within 6 months                   | Maintained project              |
| TypeScript Support           | High         | Native or @types                  | Type safety required            |
| Framework Support            | **Critical** | Explicit compatibility            | Must work with our stack        |
| Security                     | **Critical** | No known vulnerabilities          | Run `npm audit`                 |

**Real-World Example - Zod to JSON Schema:**

```typescript
// ❌ INCORRECT EVALUATION: zod-to-json-schema
// Investigation revealed:
// - Peer dependency: zod@^3.24.1 (incompatible with our Zod v4.1.11)
// - Result: Broken conversion, oversimplified schemas losing validation constraints
// - Wasted development time debugging compatibility issues

// ✅ CORRECT EVALUATION: Zod v4 native z.toJSONSchema()
// Research found:
// - Built-in to Zod v4 (no external dependency needed)
// - Full compatibility guaranteed (same library)
// - Better maintenance (maintained by Zod team)
// - Comprehensive documentation in Zod docs
// - Zero additional bundle size
```

**Documentation Requirements:**

When adding a dependency, document the evaluation in commit message or PR:

```markdown
## Dependency Addition: [package-name]

**Evaluation Summary:**

- Native alternative: [Yes/No - explain why not used]
- Version compatibility: [Verified against package.json]
- Community support: [X downloads/week, last update YYYY-MM-DD]
- Alternatives considered: [list with reasons for rejection]
- Framework compatibility: [SvelteKit/Svelte 5/etc verified]

**Decision Rationale:**
[Why this package was chosen over alternatives]
```

**Anti-Pattern to Avoid:**

```bash
# ❌ WRONG: Installing without research
pnpm add some-library
# (Later discovers incompatibility, wasted time debugging)

# ✅ CORRECT: Research first, then install
# 1. Check framework native solutions
# 2. Verify version compatibility
# 3. Compare alternatives
# 4. Document decision
pnpm add verified-library
```

### Integration Guidelines

**Consistent Pattern Application**: All new scripts and components should follow these patterns:

1. **Use `writeFormattedFile()` for all output formatting**
2. **Implement TestSetup class for test isolation**
3. **Use settings destructuring for configuration access**
4. **Import types from `$types` alias for consistency**
5. **Implement proper error handling with path resolution checks**
6. **Follow service layer architecture for business logic separation**

**Migration from Legacy Patterns**: When updating existing code:

1. Replace manual `JSON.stringify()` with `writeFormattedFile()`
2. Extract hardcoded paths to settings configuration
3. Add TestSetup pattern to existing test suites
4. Update type imports to use centralized aliases
5. Implement proper error recovery patterns

These patterns ensure maintainability, testability, and consistency across the entire codebase while leveraging modern TypeScript and tooling capabilities.

---

## Related Guides

- **Previous**: [SVELTE-COMPONENTS.md](./SVELTE-COMPONENTS.md) - Component development and TypeScript architecture
- **Next**: [SVELTE-TROUBLESHOOTING-UX.md](./SVELTE-TROUBLESHOOTING-UX.md) - Troubleshooting and UX standards
- **Also See**: [SVELTE-ARCHITECTURE.md](./SVELTE-ARCHITECTURE.md) - Critical testing requirements

---

**[← Back to Index](./SVELTEKIT-INDEX.md)**
