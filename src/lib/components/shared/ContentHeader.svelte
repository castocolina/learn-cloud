<script lang="ts">
	/**
	 * Content Header Component (Task 7)
	 *
	 * Provides differentiated headers for each ChapterType with:
	 * - Type-specific icons and color gradients
	 * - Unit-specific accent borders
	 * - Metadata badges (difficulty, estimated time)
	 * - Prerequisites and learning objectives
	 * - Mobile-first responsive design
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Union type-first patterns (ChapterType, TechnologyUnit, ContentDifficulty)
	 * - Centralized CSS in src/styles/components.css
	 *
	 * @component ContentHeader
	 */

	import type { ChapterType, ContentHeaderProps } from "$types";

	let {
		title,
		chapterType,
		unitName,
		estimatedTime,
		difficulty,
		prerequisites,
		learningObjectives,
		summary
	}: ContentHeaderProps = $props();

	/**
	 * Type-specific icon mapping
	 */
	const chapterIcons: Record<ChapterType, string> = {
		overview: "📖",
		lesson: "📚",
		study_guide: "📋",
		quiz: "❓",
		exam: "🎯",
		project: "🛠️"
	};

	/**
	 * Type-specific header class mapping
	 */
	const headerClasses: Record<ChapterType, string> = {
		overview: "content-header-overview",
		lesson: "content-header-lesson",
		study_guide: "content-header-study-guide",
		quiz: "content-header-quiz",
		exam: "content-header-exam",
		project: "content-header-project"
	};

	/**
	 * Computed header classes with unit accent
	 */
	const computedHeaderClasses = $derived.by(() => {
		const baseClass = headerClasses[chapterType];
		const accentClass = unitName ? `${unitName}-accent` : "";
		return `${baseClass} ${accentClass}`.trim();
	});

	/**
	 * Computed icon for current chapter type
	 */
	const icon = $derived(chapterIcons[chapterType]);

	/**
	 * Estimated time display text
	 */
	const timeDisplay = $derived.by(() => {
		if (!estimatedTime) return null;
		if (estimatedTime < 60) return `${estimatedTime} min`;
		const hours = Math.floor(estimatedTime / 60);
		const minutes = estimatedTime % 60;
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	});
</script>

<header class={computedHeaderClasses}>
	<div class="content-header-container">
		<!-- Icon and Title Section -->
		<div class="content-header-title-section">
			<span class="content-header-icon" aria-hidden="true">{icon}</span>
			<div class="content-header-text">
				<h1 class="content-header-title">{title}</h1>
				{#if summary}
					<p class="content-header-summary">{summary}</p>
				{/if}
			</div>
		</div>

		<!-- Metadata Badges Section -->
		{#if difficulty || estimatedTime}
			<div class="content-header-metadata">
				{#if difficulty}
					<span class="content-badge content-badge-difficulty content-badge-{difficulty}">
						{difficulty}
					</span>
				{/if}
				{#if timeDisplay}
					<span class="content-badge content-badge-time">
						⏱️ {timeDisplay}
					</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Prerequisites Section -->
	{#if prerequisites && prerequisites.length > 0}
		<div class="content-header-section">
			<h3 class="content-header-section-title">
				<span class="content-header-section-icon">📌</span>
				Prerequisites
			</h3>
			<ul class="content-header-list">
				{#each prerequisites as prerequisite, index (index)}
					<li class="content-header-list-item">{prerequisite}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Learning Objectives Section -->
	{#if learningObjectives && learningObjectives.length > 0}
		<div class="content-header-section">
			<h3 class="content-header-section-title">
				<span class="content-header-section-icon">🎯</span>
				Learning Objectives
			</h3>
			<ul class="content-header-list">
				{#each learningObjectives as objective, index (index)}
					<li class="content-header-list-item">{objective}</li>
				{/each}
			</ul>
		</div>
	{/if}
</header>
