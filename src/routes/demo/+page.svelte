<script lang="ts">
	import {
		type DemoUnit,
		type DemoLesson,
		DemoContentType
	} from "../../data/demo/navigation/demo-sidebar-menu.js";
	import { ContentTypeBadge, DifficultyBadge } from "$lib/components/demo";
	import { getContext } from "svelte";

	// Get navigation state from layout context
	const navigationContext = getContext<{
		navigationData: { units: DemoUnit[]; metadata: any } | null;
		selectedUnit: DemoUnit | null;
		selectedLesson: DemoLesson | null;
		isLoading: boolean;
		hasValidSelection: boolean;
	}>("demo-navigation");

	// Extract values from context
	$: ({ navigationData, selectedUnit, selectedLesson, isLoading, hasValidSelection } = navigationContext);

	// Navigation is now handled by the layout component
	// This page just displays content based on the context state

	// Fallback hardcoded data for testing when no selection is active
	const fallbackContentData = {
		sampleLesson: {
			id: "docker-fundamentals",
			title: "Docker Container Fundamentals",
			description: "Learn the basics of containerization with Docker, including images, containers, and basic orchestration.",
			contentType: DemoContentType.INTERACTIVE,
			duration: "45 minutes",
			learningObjectives: [
				"Understand the difference between containers and virtual machines",
				"Create and manage Docker images and containers",
				"Work with Docker volumes and networking",
				"Use Docker Compose for multi-container applications"
			],
			prerequisites: [
				"Basic understanding of Linux command line",
				"Familiarity with web applications",
				"Basic networking concepts"
			]
		},
		sampleUnit: {
			id: "containerization",
			title: "Container Technologies",
			description: "Comprehensive introduction to containerization technologies and orchestration platforms.",
			icon: "🐳",
			difficulty: "intermediate",
			estimatedHours: 8,
			learningObjectives: [
				"Master Docker container fundamentals",
				"Understand container orchestration with Kubernetes",
				"Implement container security best practices",
				"Deploy containerized applications to production"
			],
			prerequisites: [
				"Experience with Linux systems",
				"Understanding of application deployment",
				"Basic DevOps concepts"
			],
			lessonsCount: 6
		}
	};
</script>

<!-- Central content area - layout and navigation handled by +layout.svelte -->
<div class="demo-content">
	{#if hasValidSelection && selectedUnit && selectedLesson}
		<!-- Selected lesson content -->
		<div class="demo-content-lesson">
			<header class="demo-lesson-header">
				<h1 class="demo-lesson-title">{selectedLesson.title}</h1>
				<p class="demo-lesson-description">{selectedLesson.description}</p>

				<div class="demo-lesson-meta">
					<ContentTypeBadge contentType={selectedLesson.contentType} size="md" />
					<DifficultyBadge difficulty={selectedLesson.difficulty} size="md" />
					<span class="demo-lesson-duration">{selectedLesson.duration}</span>
				</div>
			</header>

			<div class="demo-lesson-content">
				<div class="demo-placeholder-content">
					<h3>📝 Lesson Content Placeholder</h3>
					<p>
						This is where the actual lesson content would be rendered based on the content type:
						<strong>{selectedLesson.contentType}</strong>
					</p>

					{#if selectedLesson.learningObjectives && selectedLesson.learningObjectives.length > 0}
						<div class="demo-learning-objectives">
							<h4>🎯 Learning Objectives</h4>
							<ul>
								{#each selectedLesson.learningObjectives as objective, index (objective + index)}
									<li>{objective}</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if selectedLesson.prerequisites && selectedLesson.prerequisites.length > 0}
						<div class="demo-prerequisites">
							<h4>📚 Prerequisites</h4>
							<ul>
								{#each selectedLesson.prerequisites as prerequisite, index (prerequisite + index)}
									<li>{prerequisite}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else if selectedUnit}
		<!-- Selected unit overview -->
		<div class="demo-content-unit">
			<header class="demo-unit-header">
				<h1 class="demo-unit-title">
					<span class="demo-unit-icon">{selectedUnit.icon}</span>
					{selectedUnit.title}
				</h1>
				<p class="demo-unit-description">{selectedUnit.description}</p>

				<div class="demo-unit-meta">
					<DifficultyBadge difficulty={selectedUnit.difficulty} size="md" />
					<span class="demo-unit-duration">{selectedUnit.estimatedHours} hours</span>
					<span class="demo-unit-lessons-count">{selectedUnit.lessons.length} lessons</span>
				</div>
			</header>

			<div class="demo-unit-content">
				{#if selectedUnit.learningObjectives && selectedUnit.learningObjectives.length > 0}
					<section class="demo-unit-objectives">
						<h2>🎯 Learning Objectives</h2>
						<ul>
							{#each selectedUnit.learningObjectives as objective, index (objective + index)}
								<li>{objective}</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if selectedUnit.prerequisites && selectedUnit.prerequisites.length > 0}
					<section class="demo-unit-prerequisites">
						<h2>📚 Prerequisites</h2>
						<ul>
							{#each selectedUnit.prerequisites as prerequisite, index (prerequisite + index)}
								<li>{prerequisite}</li>
							{/each}
						</ul>
					</section>
				{/if}

				<section class="demo-unit-lessons">
					<h2>📖 Lessons ({selectedUnit.lessons.length})</h2>
					<div class="demo-lessons-grid">
						{#each selectedUnit.lessons as lesson (lesson.id)}
							<a href="#{lesson.url}" class="demo-lesson-card">
								<div class="demo-lesson-card-header">
									<span class="demo-lesson-card-icon">{lesson.icon}</span>
									<div class="demo-lesson-card-meta">
										<ContentTypeBadge contentType={lesson.contentType} />
										<span class="demo-lesson-card-duration">{lesson.duration}</span>
									</div>
								</div>
								<h3 class="demo-lesson-card-title">{lesson.title}</h3>
								<p class="demo-lesson-card-description">{lesson.description}</p>
							</a>
						{/each}
					</div>
				</section>
			</div>
		</div>
	{:else}
		<!-- Demo overview/dashboard -->
		<div class="demo-content-overview">
			<header class="demo-overview-header">
				<h1 class="demo-overview-title">
					🚀 {navigationData?.metadata.title || "Demo Platform"}
				</h1>
				<p class="demo-overview-description">
					{navigationData?.metadata.description ||
						"Interactive demo showcasing cloud-native learning platform navigation and content structure."}
				</p>
			</header>

			<div class="demo-overview-stats">
				<div class="demo-stat-card">
					<h3>{navigationData?.metadata.totalUnits || 0}</h3>
					<p>Learning Units</p>
				</div>
				<div class="demo-stat-card">
					<h3>
						{navigationData?.units?.reduce((total: number, unit: DemoUnit) => total + unit.lessons.length, 0) || 0}
					</h3>
					<p>Total Lessons</p>
				</div>
				<div class="demo-stat-card">
					<h3>5</h3>
					<p>Content Types</p>
				</div>
			</div>

			<section class="demo-overview-content-types">
				<h2>📊 Content Distribution</h2>
				<div class="demo-content-type-stats">
					<div class="demo-content-type-item">
						<ContentTypeBadge contentType={DemoContentType.CODE} size="md" />
						<span class="demo-content-type-count">4 lessons</span>
					</div>
					<div class="demo-content-type-item">
						<ContentTypeBadge contentType={DemoContentType.INTERACTIVE} size="md" />
						<span class="demo-content-type-count">3 lessons</span>
					</div>
					<div class="demo-content-type-item">
						<ContentTypeBadge contentType={DemoContentType.DIAGRAM} size="md" />
						<span class="demo-content-type-count">2 lessons</span>
					</div>
					<div class="demo-content-type-item">
						<ContentTypeBadge contentType={DemoContentType.TEXT} size="md" />
						<span class="demo-content-type-count">2 lessons</span>
					</div>
					<div class="demo-content-type-item">
						<ContentTypeBadge contentType={DemoContentType.MIXED} size="md" />
						<span class="demo-content-type-count">1 lesson</span>
					</div>
				</div>
			</section>

			{#if navigationData}
				<section class="demo-overview-units">
					<h2>📚 Available Units</h2>
					<div class="demo-units-grid">
						{#each navigationData.units as unit (unit.id)}
							<a href="#/demo/{unit.id.replace('demo-', '')}" class="demo-unit-card">
								<div class="demo-unit-card-header">
									<span class="demo-unit-card-icon">{unit.icon}</span>
									<DifficultyBadge difficulty={unit.difficulty} />
								</div>
								<h3 class="demo-unit-card-title">{unit.title}</h3>
								<p class="demo-unit-card-description">{unit.description}</p>
								<div class="demo-unit-card-meta">
									<span class="demo-unit-card-duration">{unit.estimatedHours}h</span>
									<span class="demo-unit-card-lessons">{unit.lessons.length} lessons</span>
								</div>
							</a>
						{/each}
					</div>
				</section>

				<!-- Sample Content Preview Section -->
				<section class="demo-content-preview">
					<h2>🎯 Sample Content Preview</h2>
					<p class="demo-preview-description">
						Here's what lesson and unit content looks like when fully loaded:
					</p>

					<!-- Sample Lesson Preview -->
					<div class="demo-sample-lesson">
						<h3>📝 Sample Lesson: {fallbackContentData.sampleLesson.title}</h3>
						<div class="demo-lesson-preview-content">
							<div class="demo-lesson-preview-header">
								<ContentTypeBadge contentType={fallbackContentData.sampleLesson.contentType} size="md" />
								<span class="demo-preview-duration">{fallbackContentData.sampleLesson.duration}</span>
							</div>
							<p class="demo-preview-description">{fallbackContentData.sampleLesson.description}</p>

							<div class="demo-preview-objectives">
								<h4>🎯 Learning Objectives</h4>
								<ul>
									{#each fallbackContentData.sampleLesson.learningObjectives as objective, index (objective + index)}
										<li>{objective}</li>
									{/each}
								</ul>
							</div>

							<div class="demo-preview-prerequisites">
								<h4>📚 Prerequisites</h4>
								<ul>
									{#each fallbackContentData.sampleLesson.prerequisites as prerequisite, index (prerequisite + index)}
										<li>{prerequisite}</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>

					<!-- Sample Unit Preview -->
					<div class="demo-sample-unit">
						<h3>📦 Sample Unit: {fallbackContentData.sampleUnit.icon} {fallbackContentData.sampleUnit.title}</h3>
						<div class="demo-unit-preview-content">
							<div class="demo-unit-preview-header">
								<span class="demo-preview-difficulty demo-difficulty-{fallbackContentData.sampleUnit.difficulty}">
									{fallbackContentData.sampleUnit.difficulty}
								</span>
								<span class="demo-preview-duration">{fallbackContentData.sampleUnit.estimatedHours} hours</span>
								<span class="demo-preview-lessons">{fallbackContentData.sampleUnit.lessonsCount} lessons</span>
							</div>
							<p class="demo-preview-description">{fallbackContentData.sampleUnit.description}</p>

							<div class="demo-preview-objectives">
								<h4>🎯 Unit Learning Objectives</h4>
								<ul>
									{#each fallbackContentData.sampleUnit.learningObjectives as objective, index (objective + index)}
										<li>{objective}</li>
									{/each}
								</ul>
							</div>

							<div class="demo-preview-prerequisites">
								<h4>📚 Unit Prerequisites</h4>
								<ul>
									{#each fallbackContentData.sampleUnit.prerequisites as prerequisite, index (prerequisite + index)}
										<li>{prerequisite}</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Demo content styles - simplified for page content only */
	.demo-content {
		padding: 1rem;
		max-width: 100%;
		overflow-x: hidden;
	}

	/* Content headers */
	.demo-lesson-header,
	.demo-unit-header,
	.demo-overview-header {
		margin-bottom: 2rem;
	}

	.demo-lesson-title,
	.demo-unit-title,
	.demo-overview-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.demo-lesson-description,
	.demo-unit-description,
	.demo-overview-description {
		font-size: 1.1rem;
		line-height: 1.6;
		color: hsl(var(--muted-foreground));
		margin: 0 0 1rem 0;
	}

	.demo-lesson-meta,
	.demo-unit-meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
	}

	/* Stats and grids */
	.demo-overview-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.demo-stat-card {
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		text-align: center;
	}

	.demo-stat-card h3 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--primary));
	}

	.demo-stat-card p {
		margin: 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.demo-content-type-stats {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.demo-content-type-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
	}

	.demo-content-type-count {
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.demo-units-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.demo-lessons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}

	/* Cards */
	.demo-unit-card,
	.demo-lesson-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
	}

	.demo-unit-card:hover,
	.demo-lesson-card:hover {
		border-color: hsl(var(--primary));
		box-shadow: 0 2px 8px hsl(var(--primary) / 0.15);
		transform: translateY(-1px);
	}

	.demo-unit-card-header,
	.demo-lesson-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.demo-unit-card-icon,
	.demo-lesson-card-icon {
		font-size: 1.5rem;
	}

	.demo-unit-card-title,
	.demo-lesson-card-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		color: hsl(var(--foreground));
	}

	.demo-unit-card-description,
	.demo-lesson-card-description {
		font-size: 0.9rem;
		line-height: 1.5;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.demo-unit-card-meta,
	.demo-lesson-card-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.8rem;
		color: hsl(var(--muted-foreground));
	}

	/* Placeholder content */
	.demo-placeholder-content {
		padding: 2rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		text-align: center;
	}

	.demo-learning-objectives,
	.demo-prerequisites,
	.demo-unit-objectives,
	.demo-unit-prerequisites {
		margin-top: 2rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
	}

	.demo-learning-objectives h4,
	.demo-prerequisites h4,
	.demo-unit-objectives h2,
	.demo-unit-prerequisites h2 {
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
	}

	.demo-learning-objectives ul,
	.demo-prerequisites ul,
	.demo-unit-objectives ul,
	.demo-unit-prerequisites ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.demo-learning-objectives li,
	.demo-prerequisites li,
	.demo-unit-objectives li,
	.demo-unit-prerequisites li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	/* Desktop styles */
	@media (min-width: 769px) {
		.demo-content {
			padding: 2rem;
		}

		.demo-content-type-stats {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}
	}

	/* Content Preview Styles */
	.demo-content-preview {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 2px solid hsl(var(--border));
	}

	.demo-preview-description {
		color: hsl(var(--muted-foreground));
		margin-bottom: 2rem;
		text-align: center;
		font-style: italic;
	}

	.demo-sample-lesson,
	.demo-sample-unit {
		margin-bottom: 2rem;
		padding: 2rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		box-shadow: 0 2px 8px hsl(var(--border) / 0.1);
	}

	.demo-sample-lesson h3,
	.demo-sample-unit h3 {
		color: hsl(var(--foreground));
		margin-bottom: 1rem;
		font-size: 1.2rem;
		border-bottom: 1px solid hsl(var(--border));
		padding-bottom: 0.5rem;
	}

	.demo-lesson-preview-content,
	.demo-unit-preview-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.demo-lesson-preview-header,
	.demo-unit-preview-header {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.demo-preview-duration,
	.demo-preview-lessons {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		background: hsl(var(--muted));
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.demo-preview-difficulty {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.demo-difficulty-intermediate {
		background: hsl(var(--chart-4) / 0.1);
		color: hsl(var(--chart-4));
		border: 1px solid hsl(var(--chart-4) / 0.2);
	}

	.demo-preview-objectives,
	.demo-preview-prerequisites {
		background: hsl(var(--muted) / 0.5);
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid hsl(var(--primary));
	}

	.demo-preview-objectives h4,
	.demo-preview-prerequisites h4 {
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
		font-size: 1rem;
	}

	.demo-preview-objectives ul,
	.demo-preview-prerequisites ul {
		margin: 0;
		padding-left: 1.5rem;
		list-style-type: disc;
	}

	.demo-preview-objectives li,
	.demo-preview-prerequisites li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
		color: hsl(var(--foreground));
	}

	/* Large desktop styles */
	@media (min-width: 1200px) {
		.demo-content {
			padding: 3rem;
			max-width: 1200px;
			margin: 0 auto;
		}

		.demo-units-grid {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}

		.demo-lesson-preview-content,
		.demo-unit-preview-content {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 2rem;
		}

		.demo-lesson-preview-header,
		.demo-unit-preview-header {
			grid-column: 1 / -1;
		}
	}
</style>
