<script lang="ts">
	import type { LessonContent } from "$data/types";
	import ContentSection from "./shared/ContentSection.svelte";
	import { Clock, BookOpen, Target } from "lucide-svelte";

	interface Props {
		content: LessonContent;
		class?: string;
	}

	let { content, class: className = "" }: Props = $props();
</script>

<article class="lesson-content {className}">
	<!-- Lesson header -->
	<header class="lesson-header" aria-label="Header">
		<h1 class="lesson-title">{content.title}</h1>
		<p class="lesson-summary">{content.summary}</p>

		<!-- Lesson metadata -->
		{#if content.estimatedTime || content.prerequisites?.length || content.learningObjectives?.length}
			<div class="lesson-metadata">
				{#if content.estimatedTime}
					<div class="metadata-item">
						<Clock size={16} />
						<span>{content.estimatedTime} minutes</span>
					</div>
				{/if}

				{#if content.prerequisites?.length}
					<div class="metadata-item">
						<BookOpen size={16} />
						<div class="metadata-content">
							<span class="metadata-label">Prerequisites:</span>
							<ul class="prerequisites-list">
								{#each content.prerequisites as prerequisite}
									<li>{prerequisite}</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}

				{#if content.learningObjectives?.length}
					<div class="metadata-item">
						<Target size={16} />
						<div class="metadata-content">
							<span class="metadata-label">Learning Objectives:</span>
							<ul class="objectives-list">
								{#each content.learningObjectives as objective}
									<li>{objective}</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<!-- Lesson content sections -->
	<main class="lesson-content">
		{#each content.sections as section}
			<ContentSection {section} />
		{/each}
	</main>

	<!-- Lesson footer -->
	<footer class="lesson-footer">
		<div class="lesson-navigation-hint">
			<p class="text-sm text-gray-600">
				Continue to the study guide and quiz to reinforce your learning.
			</p>
		</div>
	</footer>
</article>

