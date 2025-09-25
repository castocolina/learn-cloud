# Auto-Fix and Advanced Validation Proposal

## Current Limitations of `svelte-check`

### **1. Limited Auto-Fix Capabilities**

```bash
# ❌ svelte-check CANNOT perform auto-fix:
svelte-check --fix              # This option does NOT exist
svelte-check --auto-fix         # This option does NOT exist

# ✅ Can only report errors:
svelte-check --tsconfig tsconfig.json    # Diagnostic only
```

**Difference with other tools:**

- **ESLint**: `eslint --fix` (auto-fixes many issues)
- **Prettier**: `prettier --write` (auto-formats)
- **svelte-check**: Only reports, does not fix

### **2. Common Problematic Cases**

**Unused Variables and Types:**

```typescript
// In types/interfaces:
export interface NavigationItem {
    id: string;
    title: string;
    unused?: string;  // svelte-check will complain if not used
}

// In union types:
export type ContentType = 'lesson' | 'quiz' | 'unused-type';  // Error if unused-type not used

// In Svelte components:
<script lang="ts">
    import type { ComponentProps } from 'svelte';
    // svelte-check might complain if ComponentProps not explicitly used
</script>
```

## Solution Strategies

### **1. Flexible TypeScript Configuration**

```json
// In tsconfig.json:
{
	"compilerOptions": {
		"noUnusedLocals": false, // Allow unused local variables
		"noUnusedParameters": false, // Allow unused parameters
		"exactOptionalPropertyTypes": false // Flexibility with optional properties
	}
}
```

### **2. TypeScript Suppression Comments**

```typescript
// For variables intentionally not used:
export interface NavigationItem {
	id: string;
	title: string;
	// @ts-expect-error - Prepared for future use
	futureProperty?: string;
}

// For type imports:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ComponentProps } from "svelte";
```

### **3. Conventional Naming with `@future-use`**

```typescript
// Using @future-use comment for items prepared for future use:
export interface NavigationItem {
	id: string;
	title: string;
	// @future-use - Navigation metadata support
	metadata?: Record<string, unknown>;
}

export type ContentType =
	| "lesson"
	| "quiz"
	// @future-use - Assessment system expansion
	| "assessment"
	// @future-use - Interactive labs
	| "lab";
```

### **4. Enhanced Future-Use Warning System**

**Automated Detection and Warnings:**

```typescript
// Configuration for monitoring @future-use items
scripts: {
    validation: {
        futureUse: {
            maxItemsThreshold: 5,        // Warning when > 5 @future-use items
            reportingEnabled: true,       // Enable @future-use reporting
            warningLevel: "warn",         // "warn" | "error" | "info"
            excludePatterns: [            // Exclude certain files from counting
                "*/types/experimental/*",
                "*/prototypes/*"
            ]
        }
    }
}
```

**Implementation of Warning System:**

```typescript
/**
 * Check for excessive @future-use items in codebase
 */
export async function checkFutureUseItems(): Promise<{
	count: number;
	items: Array<{ file: string; line: number; context: string }>;
	shouldWarn: boolean;
}> {
	const config = SETTINGS.scripts.validation.futureUse;

	// Search for @future-use comments across codebase
	const futureUseItems = await searchForFutureUseComments();

	return {
		count: futureUseItems.length,
		items: futureUseItems,
		shouldWarn: futureUseItems.length > config.maxItemsThreshold
	};
}
```

**Warning Output Example:**

```bash
⚠️  WARNING: Found 7 @future-use items (threshold: 5)
📋 Consider reviewing and implementing or removing:
   src/types/content.ts:45 - Navigation metadata support
   src/types/content.ts:52 - Assessment system expansion
   src/types/ui.ts:23 - Theme customization options
   src/lib/utils/validation.ts:78 - Advanced validation rules
   src/components/Quiz.svelte:12 - Drag-drop question type
   src/data/types.ts:34 - Multi-language support
   src/config/settings.ts:67 - Performance monitoring
```

### **5. Underscore Prefix Convention**

```typescript
// Using underscore for items clearly marked as future:
export interface NavigationItem {
	id: string;
	title: string;
	_futureProperty?: string; // Clearly marked as future
}

export type ContentType = "lesson" | "quiz" | "_reserved"; // Reserved
```

### **6. Enhanced ESLint Rules**

```javascript
// In .eslintrc.js:
{
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",           // Ignore parameters starting with _
        "varsIgnorePattern": "^_",           // Ignore variables starting with _
        "typesIgnorePattern": "^_",          // Ignore types starting with _
        "ignoreRestSiblings": true           // Ignore in destructuring
      }
    ]
  }
}
```

## Optimized Validation Workflow

### **Critical Execution Order:**

```bash
# 1. Prettier (formatting) - No conflicts
pnpm prettier --write

# 2. ESLint (linting + auto-fix) - Fixes what it can
pnpm eslint --fix --no-warn-ignored

# 3. svelte-check (TypeScript + Svelte) - Only reports, no fixes
pnpm svelte-check --tsconfig config.json
```

### **Why This Order is Fundamental:**

1. **Prettier first**: Formats code without style conflicts
2. **ESLint second**: Auto-fixes linting issues it can solve
3. **svelte-check last**: Reports errors requiring manual intervention

## Recommended Settings Configuration

### **1. Validation Profiles by Context**

```typescript
scripts: {
    validation: {
        profiles: {
            types: {                    // For type files
                allowUnusedExports: true,
                strictness: "relaxed"
            },
            components: {               // For Svelte components
                allowUnusedImports: false,
                strictness: "strict"
            },
            generated: {                // For generated files
                allowUnusedEverything: true,
                strictness: "minimal"
            }
        }
    }
}
```

### **2. Flexible TypeScript Configuration**

```typescript
scripts: {
    validation: {
        typescript: {
            strictness: {
                allowUnusedLocals: true,      // More flexible for development
                allowUnusedParameters: true,  // Useful for future interfaces
                allowUnusedTypes: true        // Important for preparatory union types
            },
            suppressionPatterns: {
                unusedPrefix: "_",            // Variables with _ ignored
                typePrefix: "_",              // Types with _ ignored
                futureUseComment: "// @future-use"  // Special comment
            }
        }
    }
}
```

### **3. Coordinated ESLint Configuration**

```typescript
scripts: {
    validation: {
        eslint: {
            autoFix: true,
            ignoreWarnings: true,
            unusedVarPattern: "^_",           // Ignore variables starting with _
            rules: {
                "@typescript-eslint/no-unused-vars": [
                    "warn",
                    {
                        "argsIgnorePattern": "^_",
                        "varsIgnorePattern": "^_",
                        "typesIgnorePattern": "^_"
                    }
                ]
            }
        }
    }
}
```

### **4. Conditional Validation**

```typescript
scripts: {
	validation: {
		conditional: {
			skipUnusedChecksForPatterns: [
				"*/types/*", // Skip unused in types folder
				"*/interfaces/*", // Skip unused in interfaces
				"*generated*" // Skip unused in generated files
			];
		}
	}
}
```

### **5. Future-Use Monitoring Configuration**

```typescript
scripts: {
    validation: {
        futureUse: {
            enabled: true,                    // Enable future-use monitoring
            maxItemsThreshold: 5,             // Warn when > 5 items
            reportingLevel: "warn",           // "info" | "warn" | "error"
            includeContextLines: 2,           // Show context around @future-use
            excludePatterns: [
                "*/experimental/*",           // Exclude experimental folders
                "*/prototypes/*",             // Exclude prototype folders
                "*test*"                      // Exclude test files
            ],
            reviewReminderDays: 30,           // Suggest review every 30 days
            autoCleanupSuggestions: true      // Suggest cleanup actions
        }
    }
}
```

## Specific Use Cases

### **1. Type/Interface Development**

```typescript
// Use underscore convention for preparatory elements:
export interface BaseContentItem {
	id: string;
	title: string;
	// @future-use - Content versioning system
	_metadata?: Record<string, unknown>; // Prepared for future expansion
	// @future-use - Multi-tenant support
	_version?: number; // Prepared for versioning
}
```

### **2. Extensible Union Types**

```typescript
// Keep preparatory types clearly marked:
export type ValidationLevel =
	| "strict"
	| "relaxed"
	| "minimal"
	// @future-use - Machine learning validation
	| "_experimental" // Clearly marked as experimental
	// @future-use - Legacy compatibility mode
	| "_deprecated"; // Marked for future removal
```

### **3. Components with Optional Props**

```typescript
// In Svelte components, use well-defined interfaces:
interface Props {
	required: string;
	optional?: string;
	// @future-use - Advanced theming support
	_futureFeature?: boolean; // Prepared for future functionality
}

let { required, optional, _futureFeature }: Props = $props();
```

## Implementation Roadmap

### **Phase 1: Base Configuration**

1. Update TypeScript config for controlled flexibility
2. Configure ESLint rules to ignore `_*` patterns
3. Establish naming conventions

### **Phase 2: Advanced Tooling**

1. Implement validation profiles by context
2. Conditional validation scripts
3. Differentiated reporting by error type

### **Phase 3: Future-Use Monitoring**

1. Implement `@future-use` comment detection system
2. Automated reporting with threshold warnings
3. Cleanup suggestions and review reminders

### **Phase 4: Automation**

1. Pre-commit hooks respecting configurations
2. CI/CD understanding different strictness levels
3. Refactoring tools maintaining conventions

## Fundamental Principles

1. **Convention over Configuration**: Use `_prefix` for preparatory elements
2. **Controlled Flexibility**: Different strictness levels by context
3. **Execution Order**: Always format → lint → check
4. **Clear Documentation**: Explanatory comments for intentionally unused elements
5. **Gradual Evolution**: Allow preparatory elements without validation noise
6. **Proactive Monitoring**: Track `@future-use` items to prevent accumulation
7. **Actionable Warnings**: Provide clear next steps when thresholds exceeded

## Benefits of This Strategy

### **Development Efficiency**

- Reduced noise from validation tools during active development
- Clear conventions for preparatory code elements
- Automated monitoring prevents technical debt accumulation

### **Code Quality**

- Maintains high standards while allowing controlled flexibility
- Clear distinction between intentional and accidental unused code
- Regular prompts for review and cleanup of preparatory items

### **Team Collaboration**

- Consistent conventions across team members
- Clear communication of future intentions through `@future-use` comments
- Automated reporting helps with sprint planning and technical debt management

This strategy provides a balance between technical rigor and development agility, especially important in projects with interfaces and types in constant evolution.
