<script lang="ts">
	import type { PageData } from './$types';
	import {
		isLessonContent,
		isQuizContent,
		isStudyGuideContent,
		isExamContent,
		isProjectContent
	} from '$data/types';

	// Import existing renderers
	import LessonRenderer from '$lib/components/content/LessonRenderer.svelte';
	import QuizRenderer from '$lib/components/content/QuizRenderer.svelte';
	import StudyGuideRenderer from '$lib/components/content/StudyGuideRenderer.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<!-- Dynamic meta tags - must be at top level -->
<svelte:head>
	{#if data.fallback}
		<title>Content Not Found - Learn Cloud</title>
		<meta name="description" content="This content is being prepared. Please check back soon!" />
	{:else if data.content}
		<title>{data.content.title} - Learn Cloud</title>
		<meta name="description" content={data.content.summary} />
		{#if data.metadata}
			<meta name="keywords" content="{data.metadata.contentType}, {data.metadata.unitTitle}" />
		{/if}
	{:else}
		<title>Learn Cloud</title>
		<meta name="description" content="Cloud-native learning platform" />
	{/if}
</svelte:head>

<!-- Fallback UI for missing content -->
{#if data.fallback}
	<div class="fallback-container min-h-screen flex flex-col items-center justify-center p-8">
		<div class="max-w-md text-center">
			<h2 class="text-3xl font-bold mb-4">🔧 Working for you!</h2>
			<img
				src="/it_works_on_my_machine.svg"
				alt="It works on my machine"
				class="w-64 h-auto mx-auto mb-6 rounded-lg shadow-lg"
				loading="lazy"
				onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
			/>
			<p class="text-lg text-gray-600 mb-4">
				This content is being prepared. Please check back soon!
			</p>
			{#if data.error}
				<details class="mt-4 p-4 bg-gray-100 rounded-lg text-left">
					<summary class="cursor-pointer font-semibold">Technical Details</summary>
					<p class="mt-2 text-sm text-gray-700">{data.error}</p>
					{#if data.dataPath}
						<p class="text-xs text-gray-500 mt-1">Expected: {data.dataPath}</p>
					{/if}
					{#if data.originalPath}
						<p class="text-xs text-gray-500 mt-1">URL Path: {data.originalPath}</p>
					{/if}
				</details>
			{/if}

			<!-- Navigation back to main content -->
			<div class="mt-6">
				<a
					href="/book"
					class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					← Back to Book
				</a>
			</div>
		</div>
	</div>
{:else}
	<!-- Breadcrumb navigation -->
	{#if data.metadata}
		<nav class="breadcrumbs p-4 bg-gray-50 border-b" aria-label="Breadcrumb">
			<ol class="flex items-center space-x-2 text-sm">
				<li><a href="/book" class="text-blue-600 hover:underline">Book</a></li>
				<li class="text-gray-500">/</li>
				<li><a href="/book/unit/{data.metadata.unitNumber}" class="text-blue-600 hover:underline">{data.metadata.unitTitle}</a></li>
				<li class="text-gray-500">/</li>
				<li class="text-gray-700" aria-current="page">{data.metadata.chapterTitle}</li>
			</ol>
		</nav>
	{/if}

	<!-- Content rendering with type guards -->
	<main class="content-container">
		{#if data.content && data.content.type}
			{@const content = data.content}
			{#if isLessonContent(content)}
				<LessonRenderer content={content} />
			{:else if isQuizContent(content)}
				<QuizRenderer content={content} />
			{:else if isStudyGuideContent(content)}
				<StudyGuideRenderer content={content} />
			{:else if isExamContent(content)}
				<!-- Placeholder for ExamRenderer - will show fallback for now -->
				<div class="exam-placeholder p-8 border-2 border-dashed border-gray-300 rounded-lg">
					<h2 class="text-2xl font-bold mb-4">📝 Exam Content</h2>
					<p class="text-gray-600 mb-4">
						Exam renderer is being developed. Content loaded successfully:
					</p>
					<div class="bg-gray-100 p-4 rounded-lg">
						<h3 class="font-semibold">{content.title}</h3>
						<p class="text-sm text-gray-700 mt-2">{content.summary}</p>
					</div>
					<p class="text-sm text-gray-500 mt-4">
						Type: {content.type} | Questions: {content.exam?.questions?.length || 'Unknown'}
					</p>
				</div>
			{:else if isProjectContent(content)}
				<!-- Placeholder for ProjectRenderer - will show fallback for now -->
				<div class="project-placeholder p-8 border-2 border-dashed border-gray-300 rounded-lg">
					<h2 class="text-2xl font-bold mb-4">🚀 Project Content</h2>
					<p class="text-gray-600 mb-4">
						Project renderer is being developed. Content loaded successfully:
					</p>
					<div class="bg-gray-100 p-4 rounded-lg">
						<h3 class="font-semibold">{content.title}</h3>
						<p class="text-sm text-gray-700 mt-2">{content.summary}</p>
					</div>
					<p class="text-sm text-gray-500 mt-4">
						Type: {content.type} | Requirements: {content.requirements?.length || 'Unknown'}
					</p>
				</div>
			{/if}

			<!-- Fallback for unknown content types -->
			{#if content && !isLessonContent(content) && !isQuizContent(content) && !isStudyGuideContent(content) && !isExamContent(content) && !isProjectContent(content)}
				<div class="unknown-content-type p-8">
					<h2 class="text-2xl font-bold mb-4">❓ Unknown Content Type</h2>
					<p class="text-gray-600">
						This content type is not yet supported.
					</p>
					<details class="mt-4 p-4 bg-gray-100 rounded">
						<summary class="cursor-pointer">Debug Information</summary>
						<pre class="mt-2 text-xs overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
					</details>
				</div>
			{/if}
		{:else}
			<div class="content-error p-8">
				<h2 class="text-2xl font-bold mb-4">⚠️ Content Loading Error</h2>
				<p class="text-gray-600">
					Content could not be loaded properly.
				</p>
			</div>
		{/if}
	</main>
{/if}