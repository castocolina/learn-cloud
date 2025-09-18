import type { CodeExample, Language, Complexity } from "./code-examples";
import { codeExamples } from "./code-examples";

/**
 * Get a random code example from the collection
 */
export function getRandomCodeExample(): CodeExample {
	const randomIndex = Math.floor(Math.random() * codeExamples.length);
	return codeExamples[randomIndex];
}

/**
 * Get random code examples by language
 */
export function getRandomCodeExampleByLanguage(language: Language): CodeExample | null {
	const languageExamples = codeExamples.filter(
		(example: CodeExample) => example.language === language
	);
	if (languageExamples.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * languageExamples.length);
	return languageExamples[randomIndex];
}

/**
 * Get random code examples by complexity
 */
export function getRandomCodeExampleByComplexity(complexity: Complexity): CodeExample | null {
	const complexityExamples = codeExamples.filter(
		(example: CodeExample) => example.complexity === complexity
	);
	if (complexityExamples.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * complexityExamples.length);
	return complexityExamples[randomIndex];
}

/**
 * Get multiple random code examples
 */
export function getMultipleRandomCodeExamples(count: number): CodeExample[] {
	const shuffled = [...codeExamples].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, codeExamples.length));
}

/**
 * Get random code example excluding specific languages
 */
export function getRandomCodeExampleExcluding(excludeLanguages: Language[]): CodeExample | null {
	const filtered = codeExamples.filter(
		(example: CodeExample) => !excludeLanguages.includes(example.language)
	);
	if (filtered.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * filtered.length);
	return filtered[randomIndex];
}

/**
 * Get statistics about the code examples
 */
export function getCodeExamplesStats() {
	const languages = [...new Set(codeExamples.map((ex: CodeExample) => ex.language))];
	const complexities = [...new Set(codeExamples.map((ex: CodeExample) => ex.complexity))];

	const byLanguage: Record<string, number> = {};
	const byComplexity: Record<string, number> = {};

	codeExamples.forEach((example: CodeExample) => {
		byLanguage[example.language] = (byLanguage[example.language] || 0) + 1;
		byComplexity[example.complexity] = (byComplexity[example.complexity] || 0) + 1;
	});

	return {
		total: codeExamples.length,
		languages: languages.length,
		complexities: complexities.length,
		byLanguage,
		byComplexity
	};
}
