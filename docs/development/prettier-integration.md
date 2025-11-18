# Prettier Integration Patterns

**Central formatting utility, configuration resolution, and best practices for consistent code formatting across the Cloud-Native Learning Platform.**

> **📚 Part of [Development Guide](./README.md)**

---

## Central Formatting Utility

All file writing operations use the centralized `writeFormattedFile()` utility:

```typescript
// ✅ PREFERRED: Use writeFormattedFile utility
import { writeFormattedFile } from "$lib/utils/prettier-writer";

await writeFormattedFile(outputPath, JSON.stringify(contentObject), {
	compress: false // Use standard formatting for readability
});
```

### Benefits

- **Consistency**: All formatted files use project's `.prettierrc` configuration
- **Automation**: No manual formatting needed - automatic on write
- **Parser Detection**: Automatically selects correct parser based on file extension
- **Compression Support**: Optional minification for production builds
- **Error Handling**: Graceful fallback if formatting fails

---

## Configuration Resolution

The utility automatically resolves `.prettierrc` configuration:

```typescript
// Automatic .prettierrc integration
const config = await prettier.resolveConfig(process.cwd());
const formatted = await prettier.format(content, {
	...config,
	filepath: filePath // Ensures correct parser selection
});
```

### Parser Selection

Prettier automatically selects the appropriate parser based on file extension:

- `.ts`, `.tsx` → TypeScript parser
- `.js`, `.jsx` → JavaScript parser
- `.json` → JSON parser
- `.md` → Markdown parser
- `.css` → CSS parser
- `.html`, `.svelte` → HTML parser

---

## Anti-Patterns to Avoid

### ❌ Deprecated Manual Formatting

```typescript
// ❌ WRONG: Manual formatting with hardcoded indentation
writeFileSync(path, JSON.stringify(obj, null, 2));

// ❌ WRONG: Custom formatting functions
const formatted = formatTypeScriptValue(content);

// ❌ WRONG: Direct fs.writeFile without formatting
fs.writeFileSync(outputPath, content);
```

### ✅ Correct Usage

```typescript
// ✅ CORRECT: Use writeFormattedFile for all file writes
import { writeFormattedFile } from "$lib/utils/prettier-writer";

await writeFormattedFile(outputPath, content);
```

---

## Production vs Development Modes

### Compressed Output (Production)

Use compressed output for performance-critical scenarios:

```typescript
// Debug mode: compressed output for performance
await writeFormattedFile(path, content, { compress: true });
```

- **Use case**: Production builds, minimized assets
- **Benefits**: Smaller file size, faster parsing
- **Trade-off**: Less human-readable

### Standard Formatting (Development)

Default mode uses readable formatting:

```typescript
// Development mode: readable formatting (default)
await writeFormattedFile(path, content);

// Explicitly specify standard formatting
await writeFormattedFile(path, content, { compress: false });
```

- **Use case**: Development, debugging, version control
- **Benefits**: Readable diffs, easier debugging
- **Trade-off**: Larger file size

---

## Common Use Cases

### JSON Output

```typescript
// Generate JSON with proper formatting
const dataObject = { items: [...], metadata: {...} };
await writeFormattedFile(
	"src/data/generated/output.json",
	JSON.stringify(dataObject)
);
```

### TypeScript Code Generation

```typescript
// Generate TypeScript file with imports and exports
const tsContent = `
import type { ContentType } from "$types";

export const generatedContent: ContentType[] = [
	${items.map((item) => JSON.stringify(item)).join(",\n\t")}
];
`;

await writeFormattedFile("src/data/generated/content.ts", tsContent);
```

### Schema Generation

```typescript
// Generate JSON schema with validation
const schema = zodSchema.toJSONSchema();
await writeFormattedFile(schemasSettings.paths.outputFile, JSON.stringify(schema));
```

---

## Error Handling

The utility includes graceful error handling:

```typescript
try {
	await writeFormattedFile(outputPath, content);
	console.log("✓ File written and formatted successfully");
} catch (error) {
	// Utility already logs formatting errors
	// File is written even if formatting fails
	console.error("File written but formatting failed:", error.message);
}
```

### Fallback Behavior

- **Formatting succeeds**: File written with proper formatting
- **Formatting fails**: File written as-is, error logged to console
- **Write fails**: Error thrown, no file created

---

## Integration Checklist

### Migrating from Manual Formatting

- [ ] Replace `JSON.stringify(obj, null, 2)` with `writeFormattedFile()`
- [ ] Remove custom formatting functions
- [ ] Update imports to use `$lib/utils/prettier-writer`
- [ ] Remove direct `fs.writeFile()` calls
- [ ] Verify `.prettierrc` configuration is present
- [ ] Test formatting with `pnpm run format`

### Adding to New Scripts

- [ ] Import `writeFormattedFile` utility
- [ ] Use for all file write operations
- [ ] Choose appropriate compression setting
- [ ] Add error handling if needed
- [ ] Document formatting mode choice

---

## Related Documentation

- **[Standards](./standards.md)** - Code quality and formatting standards
- **[Patterns](./patterns.md)** - Service architecture and utility patterns
- **[Testing Guide](../testing/unit-tests.md)** - Testing formatted output

---

**Last Updated**: 2025-01-17
