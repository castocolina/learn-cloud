# Configuration Management

**Settings management, CRITICAL no-hardcoding rule, and configuration architecture for the Cloud-Native Learning Platform.**

> **📚 Part of [Development Guide](./README.md)**

---

## 🚨 CRITICAL RULE: No Hardcoded Configurations

All configuration values **MUST** be defined in `src/config/settings.ts`. This ensures:

- **Consistency**: Single source of truth for all configuration values
- **Maintainability**: Easy to update configurations without searching through code
- **Testability**: Configurations can be overridden in tests
- **Documentation**: All settings documented in one place
- **Type Safety**: TypeScript interfaces ensure correct usage

---

## Configuration Architecture

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

---

## Usage Examples

### ✅ CORRECT: Using SETTINGS

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

### ❌ INCORRECT: Hardcoded Values

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

---

## Creating New Configuration Categories

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

---

## Type Safety

All settings must have corresponding TypeScript interfaces:

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

---

## When to Use settings.ts

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

---

## Settings Configuration Patterns

### Modern Destructuring Pattern

Extract specific settings sections for cleaner code:

```typescript
// ✅ PREFERRED: Settings destructuring for readability
const { validation: validationSettings } = SETTINGS.scripts;
const { mermaid: mermaidSettings } = validationSettings;

// Use specific settings
const maxFiles = mermaidSettings.maxParallelFiles;
```

### Performance Optimization in Tests

Override global settings for test efficiency:

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

---

## Dynamic Settings for Test Isolation

```typescript
// Generate unique config IDs to prevent race conditions
const configId = generateConfigId(validationPrefix, testSuiteId);
const tempSettings = createTempValidationConfig(configId, testSettings);
```

**See**: [Testing Guide - Test Isolation](../testing/unit-tests.md#test-isolation) for comprehensive test configuration patterns

---

## Quick Reference

### Configuration Checklist

- [ ] All magic numbers extracted to settings.ts
- [ ] All file paths centralized in settings.ts
- [ ] TypeScript interfaces defined for new settings
- [ ] Settings destructuring used for readability
- [ ] Test overrides implemented where needed
- [ ] Documentation updated with new settings

### Common Mistakes

| ❌ Mistake                  | ✅ Solution                                |
| --------------------------- | ------------------------------------------ |
| Hardcoded modal size        | Use `SETTINGS.ui.mermaid.modalPagePercent` |
| Magic number in condition   | Extract to appropriate settings category   |
| Direct path in script       | Use `SETTINGS.scripts.*.paths.*`           |
| Inline timeout value        | Add to performance settings                |
| Component-specific constant | Move to `SETTINGS.ui.*`                    |

---

## Related Documentation

- **[Standards](./standards.md)** - Code quality and development standards
- **[Patterns](./patterns.md)** - Type safety and import patterns
- **[Testing Guide](../testing/README.md)** - Test configuration and isolation
- **[SVELTE-COMPONENTS.md](../SVELTE-COMPONENTS.md)** - Global configuration strategy

---

**Last Updated**: 2025-01-17
