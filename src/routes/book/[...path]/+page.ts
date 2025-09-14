import type { PageLoad } from './$types';
import type { ContentData } from '$data/types';
import { contentMenu } from '$data/content-menu';

export const load: PageLoad = async ({ params }) => {
	const pathSegments = params.path?.split('/') || [];

	// Validate URL structure: ["unit", "1", "1_1_lesson_...html"]
	if (pathSegments.length !== 3 || pathSegments[0] !== 'unit') {
		console.warn('Invalid URL structure:', params.path);
		return {
			fallback: true,
			content: null,
			metadata: null,
			error: 'Invalid URL structure',
			originalPath: params.path
		};
	}

	const [, unitNumber, filename] = pathSegments;

	// Validate unit number is numeric
	if (!/^\d+$/.test(unitNumber)) {
		return {
			fallback: true,
			content: null,
			metadata: null,
			error: 'Invalid unit number',
			originalPath: params.path
		};
	}

	// Construct data path: book/unit1/1_1_lesson_...ts
	const dataPath = `book/unit${unitNumber}/${filename.replace('.html', '.ts')}`;

	try {
		// Direct dynamic import - O(1) operation
		const contentModule = await import(`../../../../${dataPath}`);
		const content: ContentData = contentModule.default || contentModule.content;

		// Validate content structure
		if (!content || !content.type || !content.title) {
			throw new Error('Invalid content structure');
		}

		// Find metadata by searching for matching chapter_link
		const metadata = findMetadataByPath(params.path);

		return {
			fallback: false,
			content,
			metadata,
			dataPath, // for debugging
			originalPath: params.path
		};

	} catch (importError) {
		console.warn(`Content not found: ${dataPath}`, importError);
		return {
			fallback: true,
			content: null,
			metadata: null,
			error: `Content file not found: ${dataPath}`,
			dataPath,
			originalPath: params.path
		};
	}
};

// Helper function to find metadata in content menu
function findMetadataByPath(urlPath: string) {
	const targetLink = `book/${urlPath}`;

	for (const unit of contentMenu.units) {
		for (const chapter of unit.chapters) {
			if (chapter.chapter_link === targetLink) {
				return {
					id: `${unit.title.toLowerCase().replace(/\s+/g, '-')}-${chapter.title.toLowerCase().replace(/\s+/g, '-')}`,
					unitTitle: unit.title,
					chapterTitle: chapter.title,
					contentType: chapter.type,
					icon: chapter.icon,
					unitIcon: unit.icon,
					unitNumber: unit.title.match(/Unit (\d+)/)?.[1] || '1'
				};
			}
		}
	}

	return null;
}