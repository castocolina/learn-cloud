<script lang="ts">
	import { DifficultyBadge, ContentTypeBadge } from "$lib/components/demo";
	import { Clock, Target, BookOpen, CheckCircle2, Users, ArrowRight } from "lucide-svelte";
	import type { DemoUnit } from "$data/demo/navigation/demo-sidebar-menu.js";

	// Props interface for type safety
	interface Props {
		unit: DemoUnit;
	}

	let { unit }: Props = $props();

	/**
	 * Get estimated reading time for description
	 */
	function getEstimatedReadTime(text: string): number {
		const wordsPerMinute = 200;
		const wordCount = text.split(" ").length;
		return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
	}
</script>

<svelte:head>
	<title>Unit: {unit.title} - Cloud-Native Learning Platform</title>
	<meta name="description" content={unit.description} />
</svelte:head>

<!-- Unit View Container -->
<div class="unit-view">
	<!-- Unit Header -->
	<header class="unit-header">
		<div class="unit-header-content">
			<div class="unit-hero">
				<div class="unit-icon-large">{unit.icon}</div>
				<div class="unit-hero-text">
					<h1 class="unit-title">{unit.title}</h1>
					<p class="unit-description">{unit.description}</p>

					<!-- Unit Metadata -->
					<div class="unit-metadata">
						<div class="metadata-item">
							<DifficultyBadge difficulty={unit.difficulty} />
						</div>
						<div class="metadata-item">
							<Clock size={16} />
							<span>{unit.estimatedHours} hours</span>
						</div>
						<div class="metadata-item">
							<BookOpen size={16} />
							<span>{unit.lessons.length} lessons</span>
						</div>
						<div class="metadata-item">
							<Target size={16} />
							<span>~{getEstimatedReadTime(unit.description)} min read</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Unit Statistics -->
			<div class="unit-stats">
				<div class="stat-card">
					<div class="stat-icon">
						<Users size={20} />
					</div>
					<div class="stat-content">
						<strong>{unit.lessons.length}</strong>
						<span>Lessons</span>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">
						<Clock size={20} />
					</div>
					<div class="stat-content">
						<strong>{unit.estimatedHours}h</strong>
						<span>Duration</span>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">
						<Target size={20} />
					</div>
					<div class="stat-content">
						<strong>0%</strong>
						<span>Complete</span>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Unit Content -->
	<main class="unit-content">
		<div class="unit-content-inner">
			<!-- Prerequisites Section -->
			{#if unit.prerequisites && unit.prerequisites.length > 0}
				<section class="unit-section prerequisites-section">
					<div class="section-header">
						<h2 class="section-title">
							<BookOpen size={20} />
							Prerequisites
						</h2>
						<p class="section-description">
							Make sure you're familiar with these concepts before starting this unit.
						</p>
					</div>

					<div class="prerequisites-grid">
						{#each unit.prerequisites as prerequisite (prerequisite)}
							<div class="prerequisite-item">
								<CheckCircle2 size={16} class="prerequisite-icon" />
								<span class="prerequisite-text">{prerequisite}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Learning Objectives Section -->
			{#if unit.learningObjectives && unit.learningObjectives.length > 0}
				<section class="unit-section objectives-section">
					<div class="section-header">
						<h2 class="section-title">
							<Target size={20} />
							Learning Objectives
						</h2>
						<p class="section-description">
							By the end of this unit, you will be able to accomplish the following goals.
						</p>
					</div>

					<div class="objectives-list">
						{#each unit.learningObjectives as objective (objective)}
							<div class="objective-item">
								<div class="objective-number">{unit.learningObjectives.indexOf(objective) + 1}</div>
								<div class="objective-content">
									<p class="objective-text">{objective}</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Lessons Overview Section -->
			<section class="unit-section lessons-section">
				<div class="section-header">
					<h2 class="section-title">
						<BookOpen size={20} />
						Lessons in this Unit
					</h2>
					<p class="section-description">
						Click on any lesson from the sidebar to start learning, or explore the overview below.
					</p>
				</div>

				<div class="lessons-grid">
					{#each unit.lessons as lesson, index (lesson.id)}
						<div class="lesson-card">
							<div class="lesson-card-header">
								<div class="lesson-number">{index + 1}</div>
								<div class="lesson-icon">{lesson.icon}</div>
								<div class="lesson-header-content">
									<h3 class="lesson-title">{lesson.title}</h3>
									<div class="lesson-meta">
										<ContentTypeBadge contentType={lesson.contentType} />
										<span class="lesson-duration">{lesson.duration}</span>
									</div>
								</div>
								<div class="lesson-status">
									<ArrowRight size={16} class="lesson-arrow" />
								</div>
							</div>

							<p class="lesson-description">{lesson.description}</p>

							{#if lesson.prerequisites && lesson.prerequisites.length > 0}
								<div class="lesson-prerequisites">
									<h4 class="lesson-prereq-title">Prerequisites:</h4>
									<div class="lesson-prereq-list">
										{#each lesson.prerequisites.slice(0, 2) as prereq (prereq)}
											<span class="lesson-prereq-item">{prereq}</span>
										{/each}
										{#if lesson.prerequisites.length > 2}
											<span class="lesson-prereq-more">+{lesson.prerequisites.length - 2} more</span
											>
										{/if}
									</div>
								</div>
							{/if}

							{#if lesson.learningObjectives && lesson.learningObjectives.length > 0}
								<div class="lesson-objectives">
									<h4 class="lesson-objectives-title">Key Outcomes:</h4>
									<ul class="lesson-objectives-list">
										{#each lesson.learningObjectives.slice(0, 2) as objective (objective)}
											<li class="lesson-objective-item">{objective}</li>
										{/each}
										{#if lesson.learningObjectives.length > 2}
											<li class="lesson-objectives-more">
												+{lesson.learningObjectives.length - 2} more outcomes
											</li>
										{/if}
									</ul>
								</div>
							{/if}

							<div class="lesson-progress">
								<div class="progress-bar">
									<div class="progress-fill" style="width: 0%"></div>
								</div>
								<span class="progress-text">Not started</span>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Getting Started Guide -->
			<section class="unit-section getting-started-section">
				<div class="section-header">
					<h2 class="section-title">
						<Target size={20} />
						Getting Started
					</h2>
					<p class="section-description">
						Ready to begin? Here's how to make the most of this unit.
					</p>
				</div>

				<div class="getting-started-content">
					<div class="getting-started-steps">
						<div class="step-item">
							<div class="step-icon">1</div>
							<div class="step-content">
								<h3 class="step-title">Review Prerequisites</h3>
								<p class="step-text">
									Ensure you have the necessary background knowledge before starting the first
									lesson.
								</p>
							</div>
						</div>

						<div class="step-item">
							<div class="step-icon">2</div>
							<div class="step-content">
								<h3 class="step-title">Follow the Sequence</h3>
								<p class="step-text">
									Lessons are designed to build upon each other, so follow them in order for the
									best experience.
								</p>
							</div>
						</div>

						<div class="step-item">
							<div class="step-icon">3</div>
							<div class="step-content">
								<h3 class="step-title">Practice & Apply</h3>
								<p class="step-text">
									Engage with exercises and examples to reinforce your understanding of key
									concepts.
								</p>
							</div>
						</div>
					</div>

					<div class="start-learning-cta">
						<h3 class="cta-title">Ready to Start?</h3>
						<p class="cta-text">
							Select the first lesson from the sidebar to begin your learning journey.
						</p>
						<div class="cta-highlight">
							<ArrowRight size={16} />
							<span>Click "{unit.lessons[0]?.title}" in the sidebar</span>
						</div>
					</div>
				</div>
			</section>
		</div>
	</main>
</div>

<style>
	/* Unit View Container */
	.unit-view {
		min-height: 100%;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	/* Unit Header */
	.unit-header {
		background: linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05));
		border-bottom: 1px solid hsl(var(--border));
		padding: 3rem 2rem;
	}

	.unit-header-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.unit-hero {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.unit-icon-large {
		font-size: 4rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.unit-hero-text {
		flex: 1;
		min-width: 0;
	}

	.unit-title {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
		line-height: 1.2;
	}

	.unit-description {
		font-size: 1.25rem;
		color: hsl(var(--muted-foreground));
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.unit-metadata {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.metadata-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: hsl(var(--muted-foreground));
	}

	/* Unit Statistics */
	.unit-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		max-width: 800px;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px hsl(var(--primary) / 0.1);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--primary) / 0.1);
		border-radius: 10px;
		color: hsl(var(--primary));
		flex-shrink: 0;
	}

	.stat-content {
		text-align: left;
		flex: 1;
	}

	.stat-content strong {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		line-height: 1;
	}

	.stat-content span {
		font-size: 0.85rem;
		color: hsl(var(--muted-foreground));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Unit Content */
	.unit-content {
		padding: 3rem 2rem;
	}

	.unit-content-inner {
		max-width: 1200px;
		margin: 0 auto;
	}

	.unit-section {
		margin-bottom: 4rem;
	}

	.section-header {
		margin-bottom: 2rem;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.75rem 0;
		color: hsl(var(--foreground));
	}

	.section-description {
		font-size: 1.1rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
		line-height: 1.6;
	}

	/* Prerequisites */
	.prerequisites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.prerequisite-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 8px;
		border-left: 4px solid hsl(var(--primary));
	}

	.prerequisite-text {
		color: hsl(var(--foreground));
		font-weight: 500;
	}

	/* Learning Objectives */
	.objectives-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.objective-item {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
	}

	.objective-number {
		width: 40px;
		height: 40px;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		flex-shrink: 0;
	}

	.objective-content {
		flex: 1;
	}

	.objective-text {
		font-size: 1rem;
		color: hsl(var(--foreground));
		line-height: 1.6;
		margin: 0;
	}

	/* Lessons Grid */
	.lessons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
	}

	.lesson-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		padding: 2rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
	}

	.lesson-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px hsl(var(--primary) / 0.1);
		border-color: hsl(var(--primary) / 0.3);
	}

	.lesson-card-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.lesson-number {
		width: 32px;
		height: 32px;
		background: hsl(var(--muted) / 0.5);
		color: hsl(var(--muted-foreground));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	.lesson-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.lesson-header-content {
		flex: 1;
		min-width: 0;
	}

	.lesson-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: hsl(var(--foreground));
		line-height: 1.3;
	}

	.lesson-meta {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.lesson-duration {
		font-size: 0.85rem;
		color: hsl(var(--muted-foreground));
	}

	.lesson-status {
		flex-shrink: 0;
	}

	.lesson-description {
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
		margin: 0;
		flex: 1;
	}

	.lesson-prerequisites,
	.lesson-objectives {
		background: hsl(var(--muted) / 0.2);
		border-radius: 8px;
		padding: 1rem;
	}

	.lesson-prereq-title,
	.lesson-objectives-title {
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.lesson-prereq-list {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.lesson-prereq-item,
	.lesson-prereq-more {
		font-size: 0.75rem;
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.lesson-prereq-more {
		background: hsl(var(--muted) / 0.5);
		color: hsl(var(--muted-foreground));
		font-style: italic;
	}

	.lesson-objectives-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.lesson-objective-item,
	.lesson-objectives-more {
		font-size: 0.8rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.25rem;
		padding-left: 1rem;
		position: relative;
	}

	.lesson-objective-item:before {
		content: "•";
		position: absolute;
		left: 0;
		color: hsl(var(--primary));
		font-weight: bold;
	}

	.lesson-objectives-more {
		font-style: italic;
		opacity: 0.8;
	}

	.lesson-progress {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: auto;
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: hsl(var(--muted) / 0.3);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)) / 0.8);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.8rem;
		color: hsl(var(--muted-foreground));
		flex-shrink: 0;
	}

	/* Getting Started */
	.getting-started-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 3rem;
	}

	.getting-started-steps {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.step-item {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
	}

	.step-icon {
		width: 40px;
		height: 40px;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-content {
		flex: 1;
	}

	.step-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: hsl(var(--foreground));
	}

	.step-text {
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
		margin: 0;
	}

	.start-learning-cta {
		padding: 2rem;
		background: hsl(var(--primary) / 0.05);
		border: 1px solid hsl(var(--primary) / 0.2);
		border-radius: 12px;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
	}

	.cta-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: hsl(var(--foreground));
	}

	.cta-text {
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
		margin: 0;
	}

	.cta-highlight {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: hsl(var(--primary) / 0.1);
		border-radius: 8px;
		color: hsl(var(--primary));
		font-weight: 600;
		border: 1px solid hsl(var(--primary) / 0.3);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.unit-header {
			padding: 2rem 1rem;
		}

		.unit-hero {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 1.5rem;
		}

		.unit-title {
			font-size: 1.875rem;
		}

		.unit-description {
			font-size: 1.1rem;
		}

		.unit-metadata {
			justify-content: center;
			gap: 1rem;
		}

		.unit-stats {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.unit-content {
			padding: 2rem 1rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.lessons-grid {
			grid-template-columns: 1fr;
		}

		.getting-started-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.prerequisites-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.unit-hero {
			gap: 1rem;
		}

		.unit-icon-large {
			font-size: 3rem;
		}

		.unit-title {
			font-size: 1.5rem;
		}

		.unit-description {
			font-size: 1rem;
		}

		.lesson-card {
			padding: 1.5rem;
		}

		.lesson-card-header {
			flex-wrap: wrap;
		}

		.lesson-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
