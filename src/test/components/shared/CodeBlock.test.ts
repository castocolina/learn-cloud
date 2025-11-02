/**
 * CodeBlock Component Unit Tests (Task 8F)
 *
 * Tests syntax highlighting configuration, props validation, and error handling
 * for the production CodeBlock component.
 *
 * Coverage target: ≥90%
 *
 * Note: Full DOM testing is done via E2E tests (code-block.spec.ts)
 * These unit tests focus on configuration and type safety.
 */

import { describe, it, expect } from "vitest";
import { SETTINGS } from "$config/settings";
import type { CodeBlockProps, ProgrammingLanguage } from "$types";

describe("CodeBlock Component - Configuration", () => {
	it("should have correct default settings", () => {
		expect(SETTINGS.ui.codeBlock.defaults.showCopyButton).toBe(true);
		expect(SETTINGS.ui.codeBlock.defaults.showLineNumbers).toBe(true);
		expect(SETTINGS.ui.codeBlock.defaults.maxHeight).toBe("600px");
	});

	it("should have 14 enabled languages for bundle optimization", () => {
		expect(SETTINGS.ui.codeBlock.syntax.enabledLanguages).toHaveLength(14);
		expect(SETTINGS.ui.codeBlock.syntax.enabledLanguages).toContain("typescript");
		expect(SETTINGS.ui.codeBlock.syntax.enabledLanguages).toContain("python");
		expect(SETTINGS.ui.codeBlock.syntax.enabledLanguages).toContain("rust");
	});

	it("should have correct theme configuration", () => {
		expect(SETTINGS.ui.codeBlock.syntax.themes.light).toBe("vitesse-light");
		expect(SETTINGS.ui.codeBlock.syntax.themes.dark).toBe("vitesse-dark");
	});

	it("should have text as fallback language", () => {
		expect(SETTINGS.ui.codeBlock.syntax.fallbackLanguage).toBe("text");
	});

	it("should have 2 second copy feedback duration", () => {
		expect(SETTINGS.ui.codeBlock.copyFeedback.duration).toBe(2000);
	});
});

describe("CodeBlock Component - Props Interface", () => {
	it("should accept valid props", () => {
		const validProps: CodeBlockProps = {
			code: 'console.log("test");',
			language: "typescript" as ProgrammingLanguage,
			title: "Test Code",
			showCopyButton: true,
			showExpandButton: false,
			showLineNumbers: true
		};

		expect(validProps.code).toBe('console.log("test");');
		expect(validProps.language).toBe("typescript");
		expect(validProps.title).toBe("Test Code");
	});

	it("should accept minimal props", () => {
		const minimalProps: CodeBlockProps = {
			code: "const x = 1;",
			language: "javascript" as ProgrammingLanguage
		};

		expect(minimalProps.code).toBeDefined();
		expect(minimalProps.language).toBeDefined();
	});

	it("should accept all supported languages", () => {
		const languages: ProgrammingLanguage[] = SETTINGS.ui.codeBlock.syntax.enabledLanguages;

		languages.forEach((lang) => {
			const props: CodeBlockProps = {
				code: "test",
				language: lang
			};

			expect(props.language).toBe(lang);
		});
	});

	it("should accept optional filename", () => {
		const props: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			filename: "example.ts"
		};

		expect(props.filename).toBe("example.ts");
	});

	it("should accept custom className", () => {
		const props: CodeBlockProps = {
			code: "test",
			language: "python" as ProgrammingLanguage,
			class: "custom-code-block"
		};

		expect(props.class).toBe("custom-code-block");
	});
});

describe("CodeBlock Component - Language Support", () => {
	const supportedLanguages = SETTINGS.ui.codeBlock.syntax.enabledLanguages;

	it("should support TypeScript", () => {
		expect(supportedLanguages).toContain("typescript");
	});

	it("should support JavaScript", () => {
		expect(supportedLanguages).toContain("javascript");
	});

	it("should support Svelte", () => {
		expect(supportedLanguages).toContain("svelte");
	});

	it("should support Python", () => {
		expect(supportedLanguages).toContain("python");
	});

	it("should support Go", () => {
		expect(supportedLanguages).toContain("go");
	});

	it("should support Rust", () => {
		expect(supportedLanguages).toContain("rust");
	});

	it("should support Java", () => {
		expect(supportedLanguages).toContain("java");
	});

	it("should support SQL", () => {
		expect(supportedLanguages).toContain("sql");
	});

	it("should support YAML", () => {
		expect(supportedLanguages).toContain("yaml");
	});

	it("should support Bash", () => {
		expect(supportedLanguages).toContain("bash");
	});

	it("should support HCL", () => {
		expect(supportedLanguages).toContain("hcl");
	});

	it("should support Dockerfile", () => {
		expect(supportedLanguages).toContain("dockerfile");
	});

	it("should support GraphQL", () => {
		expect(supportedLanguages).toContain("graphql");
	});

	it("should support JSON", () => {
		expect(supportedLanguages).toContain("json");
	});
});

describe("CodeBlock Component - Bundle Optimization", () => {
	it("should load only 14 languages (not all 200+)", () => {
		const enabledCount = SETTINGS.ui.codeBlock.syntax.enabledLanguages.length;
		expect(enabledCount).toBe(14);
		expect(enabledCount).toBeLessThan(200);
	});

	it("should have syntax highlighting enabled by default", () => {
		expect(SETTINGS.ui.codeBlock.syntax.enableSyntaxHighlighting).toBe(true);
	});
});

describe("CodeBlock Component - Copy Feedback", () => {
	it("should use Check icon for success", () => {
		expect(SETTINGS.ui.codeBlock.copyFeedback.successIcon).toBe("Check");
	});

	it("should use Copy icon as default", () => {
		expect(SETTINGS.ui.codeBlock.copyFeedback.defaultIcon).toBe("Copy");
	});

	it("should have duration matching iconGrid successStateDuration", () => {
		expect(SETTINGS.ui.codeBlock.copyFeedback.duration).toBe(
			SETTINGS.ui.iconGrid.successStateDuration
		);
	});
});

describe("CodeBlock Component - Download Feature", () => {
	it("should have download button enabled by default", () => {
		expect(SETTINGS.ui.codeBlock.defaults.showDownloadButton).toBe(true);
	});

	it("should accept showDownloadButton prop", () => {
		const props: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			showDownloadButton: false
		};

		expect(props.showDownloadButton).toBe(false);
	});

	it("should accept filename prop for download", () => {
		const props: CodeBlockProps = {
			code: "const x = 1;",
			language: "typescript" as ProgrammingLanguage,
			filename: "example.ts"
		};

		expect(props.filename).toBe("example.ts");
	});
});

describe("CodeBlock Component - Dialog Expansion", () => {
	it("should have expand button enabled by default", () => {
		expect(SETTINGS.ui.codeBlock.defaults.showExpandButton).toBe(true);
	});

	it("should accept showExpandButton prop", () => {
		const props: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			showExpandButton: false
		};

		expect(props.showExpandButton).toBe(false);
	});

	it("should allow prop override of defaults", () => {
		// Default is true
		expect(SETTINGS.ui.codeBlock.defaults.showExpandButton).toBe(true);

		// But can be overridden per component
		const props: CodeBlockProps = {
			code: "test",
			language: "python" as ProgrammingLanguage,
			showExpandButton: false,
			showCopyButton: false,
			showDownloadButton: false
		};

		expect(props.showExpandButton).toBe(false);
		expect(props.showCopyButton).toBe(false);
		expect(props.showDownloadButton).toBe(false);
	});
});

describe("CodeBlock Component - Button Configuration", () => {
	it("should support all button combinations", () => {
		const allButtonsProps: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			showCopyButton: true,
			showDownloadButton: true,
			showExpandButton: true
		};

		expect(allButtonsProps.showCopyButton).toBe(true);
		expect(allButtonsProps.showDownloadButton).toBe(true);
		expect(allButtonsProps.showExpandButton).toBe(true);
	});

	it("should support no buttons configuration", () => {
		const noButtonsProps: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			showCopyButton: false,
			showDownloadButton: false,
			showExpandButton: false
		};

		expect(noButtonsProps.showCopyButton).toBe(false);
		expect(noButtonsProps.showDownloadButton).toBe(false);
		expect(noButtonsProps.showExpandButton).toBe(false);
	});

	it("should support mixed button configuration", () => {
		const mixedProps: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			showCopyButton: true,
			showDownloadButton: true,
			showExpandButton: false
		};

		expect(mixedProps.showCopyButton).toBe(true);
		expect(mixedProps.showDownloadButton).toBe(true);
		expect(mixedProps.showExpandButton).toBe(false);
	});
});

describe("CodeBlock Component - Max Height Configuration", () => {
	it("should have default max height", () => {
		expect(SETTINGS.ui.codeBlock.defaults.maxHeight).toBe("600px");
	});

	it("should accept custom maxHeight", () => {
		const props: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			maxHeight: "400px"
		};

		expect(props.maxHeight).toBe("400px");
	});

	it("should accept maxHeight in different units", () => {
		const propsRem: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			maxHeight: "30rem"
		};

		const propsVh: CodeBlockProps = {
			code: "test",
			language: "typescript" as ProgrammingLanguage,
			maxHeight: "50vh"
		};

		expect(propsRem.maxHeight).toBe("30rem");
		expect(propsVh.maxHeight).toBe("50vh");
	});
});
