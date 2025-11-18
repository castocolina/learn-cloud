# Hooks Strategy: Skills vs Direct Commands

**Last updated**: 2025-11-18

---

## Design Principle

**Rule**: If a skill exists for domain-specific validation → use skill. Otherwise → use direct command.

### Why?

**Skills provide**:

- ✅ Business rules validation (beyond syntax)
- ✅ Centralized validation logic
- ✅ Structured error reporting
- ✅ Testability
- ✅ Consistency across hooks and manual validation

**Direct commands provide**:

- ✅ Fast syntax-only validation
- ✅ Simplicity when no business rules exist
- ✅ Standard tool output

---

## Current Hook Architecture

| Hook                         | Type           | What it uses                     | Why                                                                   |
| ---------------------------- | -------------- | -------------------------------- | --------------------------------------------------------------------- |
| `post-edit-svelte-check.cjs` | Svelte         | **Skill**: `component-validator` | Validates theme compliance, a11y, mobile-first, props interfaces      |
| `post-edit-json-check.cjs`   | JSON (content) | **Skill**: `content-validator`   | Validates CONTENT-STANDARDS.md (quiz 5q/80%, study guides, lifecycle) |
| `post-edit-ts-quick.cjs`     | TypeScript     | **Skill**: `code-validator`      | Validates code quality (unused code, duplication, complexity)         |
| `post-edit-bash-syntax.cjs`  | Bash           | **Command**: `bash -n`           | Syntax-only validation (no business rules)                            |
| `post-edit-format.cjs`       | All files      | **Command**: `prettier`          | Auto-formatting (no business rules)                                   |

---

## Skills Validation Details

### 1. `component-validator` (Svelte)

**Beyond `svelte-check`**:

- ✅ **Props interface completeness**: Requires TypeScript interfaces for props
- ✅ **Theme compliance**: NO hardcoded hex colors, must use CSS variables
- ✅ **Mobile-first**: Ensures ≤390px viewport considerations
- ✅ **Accessibility**: WCAG 2.1 Level AA compliance
- ✅ **Showcase consistency**: Production vs showcase component parity

**Example violations detected**:

```svelte
<!-- ❌ BLOCKING: Hardcoded hex color -->
<div style="background-color: #ffffff">

<!-- ✅ CORRECT: CSS variable -->
<div class="bg-primary">
```

---

### 2. `content-validator` (JSON content files)

**Beyond `JSON.parse()`**:

- ✅ **TypeScript interface compliance**: Correct imports (`from "$types"`)
- ✅ **Content status lifecycle**: scaffold → draft → final
- ✅ **Interactive standards**:
  - Quizzes: 5 questions minimum, 80% pass threshold
  - Study guides: ≥8 flashcards
  - Code completion: 5+ underscores
- ✅ **Educational quality**: Measurable learning objectives, secure code examples
- ✅ **Metadata completeness**: Required fields present

**Example violations detected**:

```json
{
	"quiz": {
		"questions": [
			/* only 3 questions */
		],
		"passThreshold": 0.8
	}
}
// ❌ BLOCKING: Quiz must have 5+ questions
```

---

### 3. `code-validator` (TypeScript)

**Beyond `tsc --noEmit`**:

- ✅ **Unused code detection**:
  - Variables declared but never read
  - Function parameters not used (except valid callbacks)
  - Imports not referenced
- ✅ **Code duplication detection**: ≥5 lines, ≥25 tokens
- ✅ **Complexity analysis**: Cyclomatic, cognitive, nesting depth

**Example violations detected**:

```typescript
// ❌ ERROR: Unused variable
const unusedVariable = "This is never used";

// ❌ ERROR: Invalid _ prefix usage
function process(data: string, _unusedParam: number) {
	// _unusedParam is not a callback or interface requirement
	return data;
}

// ✅ CORRECT: Valid _ prefix (callback)
array.map((item, _index) => item * 2);
```

---

## Direct Commands (No Skills)

### 1. `bash -n` (Bash syntax check)

**Why no skill?**

- No project-specific business rules for bash scripts
- Syntax validation is sufficient
- Standard bash error messages are clear

---

### 2. `prettier` (Auto-formatting)

**Why no skill?**

- Formatting is universal, no domain-specific rules
- Prettier configuration handles all customization
- No validation needed, just transformation

---

## Testing Hooks

### Manual Testing Process

```bash
# Test Svelte hook
echo '{"tool_input": {"file_path": "test-component.svelte"}}' | node .claude/hooks/post-edit-svelte-check.cjs

# Test JSON hook (content files only)
echo '{"tool_input": {"file_path": "src/data/test-content.json"}}' | node .claude/hooks/post-edit-json-check.cjs

# Test TypeScript hook
echo '{"tool_input": {"file_path": "test-code.ts"}}' | node .claude/hooks/post-edit-ts-quick.cjs

# Test Bash hook
echo '{"tool_input": {"file_path": "test-script.sh"}}' | node .claude/hooks/post-edit-bash-syntax.cjs

# Test format hook (any file type)
echo '{"tool_input": {"file_path": "test.ts"}}' | node .claude/hooks/post-edit-format.cjs
```

### Expected Behavior

All hooks should be **non-blocking**:

- ✅ Show violations with clear error messages
- ✅ Suggest fixes
- ⚠️ Display warnings but **never block** the edit
- ✅ Exit with warning code (not failure)

---

## Creating New Hooks

### Decision Tree

```
Need to validate file after edit?
  ↓
Does a skill exist for this file type?
  ↓ YES → Use skill
    - Example: Svelte → component-validator
    - Example: TypeScript → code-validator
  ↓ NO → Are there project-specific business rules?
      ↓ YES → Create skill first, then use it
      ↓ NO → Use direct command
        - Example: Bash → bash -n
        - Example: Python → python -m py_compile
```

### Template: Skill-based Hook

```javascript
#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

function main(input) {
	const { tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path || !file_path.endsWith(".EXT")) {
		return; // Filter by extension
	}

	if (!fs.existsSync(file_path)) {
		return; // File doesn't exist
	}

	try {
		console.log(`🔍 Validating FILETYPE: ${file_path}`);
		execSync(`npx tsx .claude/skills/SKILL-NAME/scripts/SCRIPT.ts "${file_path}"`, {
			stdio: "inherit"
		});
		console.log(`✅ Validation passed for ${file_path}`);
	} catch {
		// Non-blocking: show error but don't fail
		console.warn(`⚠️  Validation found issues in ${file_path}`);
	}
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
```

### Template: Command-based Hook

```javascript
#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");

function main(input) {
	const { tool_input } = input;
	const { file_path } = tool_input || {};

	if (!file_path || !file_path.endsWith(".EXT")) {
		return;
	}

	if (!fs.existsSync(file_path)) {
		return;
	}

	try {
		console.log(`🔍 Checking FILETYPE syntax: ${file_path}`);
		execSync(`COMMAND "${file_path}"`, { stdio: "inherit" });
		console.log(`✅ Syntax valid for ${file_path}`);
	} catch {
		console.warn(`⚠️  Syntax error in ${file_path}`);
	}
}

const input = JSON.parse(fs.readFileSync(0, "utf-8"));
main(input);
```

---

## Hook Performance

**Skills vs Commands**:

- **Skills**: Slower (~100-500ms) but provide comprehensive validation
- **Commands**: Faster (~10-50ms) but limited to syntax

**Strategy**: Use skills for critical validations (Svelte, TypeScript, content), use commands for simple checks (bash, formatting).

---

## Validation Results Examples

### ✅ Passing Validation

```bash
🔍 Validating TypeScript code quality: src/lib/utils.ts
✅ Code quality validation passed for src/lib/utils.ts
```

### ⚠️ Failing Validation (Non-blocking)

```bash
🔍 Validating Svelte component: src/lib/components/Button.svelte

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 Component Integration Report

📄 File: Button.svelte
  ❌ BLOCKING:
    - Theme Compliance (line 15)
      Found: Hardcoded hex color: #3b82f6
      Fix: Use CSS variable: var(--color-primary) or Tailwind: bg-primary

📊 Summary:
   Total violations: 1
   Blocking issues: 1

❌ BLOCKED: Fix violations before component integration

⚠️  Svelte validation found issues in Button.svelte
```

---

## Troubleshooting

### Hook not triggering

**Check**:

1. Hook has `#!/usr/bin/env node` shebang
2. Hook is executable: `chmod +x .claude/hooks/HOOK.cjs`
3. Hook is registered in `.claude/settings.json`
4. File path matches hook filter (extension, directory)

### Skill not found

**Error**: `Cannot find module '.claude/skills/SKILL-NAME'`

**Solution**:

1. Verify skill exists: `ls -la .claude/skills/SKILL-NAME`
2. Check skill script exists: `ls -la .claude/skills/SKILL-NAME/scripts/`
3. Ensure TypeScript compiles: `npx tsx .claude/skills/SKILL-NAME/scripts/SCRIPT.ts --help`

### Hook blocking edits

**Problem**: Hook should be non-blocking but blocks edits

**Solution**: Ensure hook uses `try/catch` and **never** throws errors:

```javascript
try {
	execSync(command, { stdio: "inherit" });
	console.log("✅ Passed");
} catch {
	// ⚠️ Non-blocking: show warning, don't throw
	console.warn("⚠️ Issues found");
	// NO: throw error
	// NO: process.exit(1)
}
```

---

## See Also

- [Skills Architecture](./.claude/skills/README.md)
- [Validation Strategy](../testing/validation-strategy.md)
- [Development Standards](./standards.md)
