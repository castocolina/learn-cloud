<script lang="ts">
	import { DifficultyBadge } from "$lib/components/demo";
	import { Clock, Users, Target, CheckCircle2 } from "lucide-svelte";
	import type { DemoUnit } from "../../../data/demo/navigation/demo-sidebar-menu.js";

	// Props interface for type safety
	interface Props {
		units: DemoUnit[];
	}

	let { units }: Props = $props();

	// Derived statistics for the welcome page
	const totalLessons = $derived(units.reduce((total, unit) => total + unit.lessons.length, 0));

	const totalEstimatedHours = $derived(
		units.reduce((total, unit) => total + unit.estimatedHours, 0)
	);

	const difficultyDistribution = $derived(() => {
		const distribution = { beginner: 0, intermediate: 0, advanced: 0 };
		units.forEach((unit) => {
			distribution[unit.difficulty]++;
		});
		return distribution;
	});

	/**
	 * Get a color class based on difficulty
	 */
	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case "beginner":
				return "text-green-600";
			case "intermediate":
				return "text-yellow-600";
			case "advanced":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	}
</script>

<svelte:head>
	<title>Welcome - Cloud-Native Learning Platform</title>
	<meta
		name="description"
		content="Comprehensive learning platform for cloud-native technologies with 12 units and 95+ lessons"
	/>
</svelte:head>

<!-- Welcome View Container -->
<div class="welcome-view">
	<!-- Hero Section -->
	<header class="welcome-hero">
		<div class="welcome-hero-content">
			<h1 class="welcome-title">Welcome to Cloud-Native Technologies Mastery Course</h1>
			<p class="welcome-subtitle">
				Comprehensive learning platform for cloud-native development and deployment
			</p>

			<!-- Key Statistics -->
			<div class="welcome-stats">
				<div class="welcome-stat-card">
					<div class="welcome-stat-icon">
						<Users size={24} />
					</div>
					<div class="welcome-stat-content">
						<strong>{units.length}</strong>
						<span>Learning Units</span>
					</div>
				</div>

				<div class="welcome-stat-card">
					<div class="welcome-stat-icon">
						<Target size={24} />
					</div>
					<div class="welcome-stat-content">
						<strong>{totalLessons}</strong>
						<span>Lessons</span>
					</div>
				</div>

				<div class="welcome-stat-card">
					<div class="welcome-stat-icon">
						<Clock size={24} />
					</div>
					<div class="welcome-stat-content">
						<strong>{totalEstimatedHours}h</strong>
						<span>Total Content</span>
					</div>
				</div>
			</div>

			<!-- Difficulty Distribution -->
			<div class="difficulty-overview">
				<h3 class="difficulty-title">Learning Progression</h3>
				<div class="difficulty-stats">
					<div class="difficulty-item">
						<span class="difficulty-label {getDifficultyColor('beginner')}">
							<CheckCircle2 size={16} />
							Beginner
						</span>
						<span class="difficulty-count">{difficultyDistribution().beginner} units</span>
					</div>
					<div class="difficulty-item">
						<span class="difficulty-label {getDifficultyColor('intermediate')}">
							<CheckCircle2 size={16} />
							Intermediate
						</span>
						<span class="difficulty-count">{difficultyDistribution().intermediate} units</span>
					</div>
					<div class="difficulty-item">
						<span class="difficulty-label {getDifficultyColor('advanced')}">
							<CheckCircle2 size={16} />
							Advanced
						</span>
						<span class="difficulty-count">{difficultyDistribution().advanced} units</span>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Units Grid -->
	<section class="units-section">
		<div class="section-header">
			<h2 class="section-title">Course Units</h2>
			<p class="section-description">
				Select a unit from the sidebar or explore the overview below to begin your learning journey.
			</p>
		</div>

		<div class="units-grid">
			{#each units as unit (unit.id)}
				<div class="unit-card">
					<div class="unit-card-header">
						<div class="unit-icon">{unit.icon}</div>
						<div class="unit-header-content">
							<h3 class="unit-card-title">{unit.title}</h3>
							<div class="unit-card-meta">
								<DifficultyBadge difficulty={unit.difficulty} />
								<span class="unit-duration">
									<Clock size={14} />
									{unit.estimatedHours}h
								</span>
								<span class="unit-lesson-count">{unit.lessons.length} lessons</span>
							</div>
						</div>
					</div>

					<p class="unit-card-description">{unit.description}</p>

					<!-- Prerequisites (if available) -->
					{#if unit.prerequisites && unit.prerequisites.length > 0}
						<div class="unit-prerequisites">
							<h4 class="prerequisites-title">Prerequisites</h4>
							<ul class="prerequisites-list">
								{#each unit.prerequisites.slice(0, 2) as prerequisite (prerequisite)}
									<li>{prerequisite}</li>
								{/each}
								{#if unit.prerequisites.length > 2}
									<li class="prerequisites-more">+{unit.prerequisites.length - 2} more</li>
								{/if}
							</ul>
						</div>
					{/if}

					<!-- Learning Objectives (if available) -->
					{#if unit.learningObjectives && unit.learningObjectives.length > 0}
						<div class="unit-objectives">
							<h4 class="objectives-title">Key Learning Outcomes</h4>
							<ul class="objectives-list">
								{#each unit.learningObjectives.slice(0, 2) as objective (objective)}
									<li>{objective}</li>
								{/each}
								{#if unit.learningObjectives.length > 2}
									<li class="objectives-more">
										+{unit.learningObjectives.length - 2} more objectives
									</li>
								{/if}
							</ul>
						</div>
					{/if}

					<!-- Progress Placeholder -->
					<div class="unit-progress">
						<div class="progress-info">
							<span class="progress-text">Ready to start</span>
							<span class="progress-percentage">0%</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill" style="width: 0%"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Getting Started Guide -->
	<section class="getting-started">
		<div class="getting-started-content">
			<h2 class="getting-started-title">Getting Started</h2>
			<div class="getting-started-steps">
				<div class="step-item">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3 class="step-title">Choose Your Path</h3>
						<p class="step-description">
							Select a unit from the sidebar based on your current skill level and interests.
						</p>
					</div>
				</div>

				<div class="step-item">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3 class="step-title">Follow the Structure</h3>
						<p class="step-description">
							Each unit contains multiple lessons designed to build upon each other progressively.
						</p>
					</div>
				</div>

				<div class="step-item">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3 class="step-title">Practice & Apply</h3>
						<p class="step-description">
							Engage with interactive content, code examples, and hands-on exercises throughout your
							journey.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	/* Welcome View Container */
	.welcome-view {
		min-height: 100%;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	/* Hero Section */
	.welcome-hero {
		background: linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--secondary) / 0.05));
		border-bottom: 1px solid hsl(var(--border));
		padding: 3rem 2rem;
	}

	.welcome-hero-content {
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
	}

	.welcome-title {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
		line-height: 1.2;
	}

	.welcome-subtitle {
		font-size: 1.25rem;
		color: hsl(var(--muted-foreground));
		margin: 0 0 3rem 0;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.5;
	}

	/* Statistics Cards */
	.welcome-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.welcome-stat-card {
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

	.welcome-stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px hsl(var(--primary) / 0.1);
	}

	.welcome-stat-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--primary) / 0.1);
		border-radius: 10px;
		color: hsl(var(--primary));
	}

	.welcome-stat-content {
		flex: 1;
		text-align: left;
	}

	.welcome-stat-content strong {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		line-height: 1;
	}

	.welcome-stat-content span {
		font-size: 0.9rem;
		color: hsl(var(--muted-foreground));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Difficulty Overview */
	.difficulty-overview {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		padding: 2rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.difficulty-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		text-align: center;
		color: hsl(var(--foreground));
	}

	.difficulty-stats {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.difficulty-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 8px;
	}

	.difficulty-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.difficulty-count {
		font-size: 0.9rem;
		color: hsl(var(--muted-foreground));
	}

	/* Units Section */
	.units-section {
		padding: 3rem 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.section-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
	}

	.section-description {
		font-size: 1.1rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	/* Units Grid */
	.units-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.unit-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 16px;
		padding: 2rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.unit-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px hsl(var(--primary) / 0.15);
		border-color: hsl(var(--primary) / 0.3);
	}

	.unit-card-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.unit-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.unit-header-content {
		flex: 1;
		min-width: 0;
	}

	.unit-card-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
		line-height: 1.3;
	}

	.unit-card-meta {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.unit-duration,
	.unit-lesson-count {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: hsl(var(--muted-foreground));
	}

	.unit-card-description {
		color: hsl(var(--muted-foreground));
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
		flex: 1;
	}

	/* Prerequisites and Objectives */
	.unit-prerequisites,
	.unit-objectives {
		background: hsl(var(--muted) / 0.3);
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.prerequisites-title,
	.objectives-title {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: hsl(var(--foreground));
	}

	.prerequisites-list,
	.objectives-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.prerequisites-list li,
	.objectives-list li {
		font-size: 0.85rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.5rem;
		padding-left: 1rem;
		position: relative;
	}

	.prerequisites-list li:before,
	.objectives-list li:before {
		content: "•";
		position: absolute;
		left: 0;
		color: hsl(var(--primary));
		font-weight: bold;
	}

	.prerequisites-more,
	.objectives-more {
		font-style: italic;
		color: hsl(var(--muted-foreground)) !important;
		opacity: 0.8;
	}

	/* Progress */
	.unit-progress {
		margin-top: auto;
		padding-top: 1rem;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.progress-text {
		font-size: 0.85rem;
		color: hsl(var(--muted-foreground));
	}

	.progress-percentage {
		font-size: 0.85rem;
		font-weight: 600;
		color: hsl(var(--primary));
	}

	.progress-bar {
		width: 100%;
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

	/* Getting Started */
	.getting-started {
		background: hsl(var(--muted) / 0.3);
		padding: 3rem 2rem;
	}

	.getting-started-content {
		max-width: 1000px;
		margin: 0 auto;
		text-align: center;
	}

	.getting-started-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 3rem 0;
		color: hsl(var(--foreground));
	}

	.getting-started-steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		text-align: left;
	}

	.step-item {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
	}

	.step-number {
		width: 48px;
		height: 48px;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
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

	.step-description {
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
		margin: 0;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.welcome-hero {
			padding: 2rem 1rem;
		}

		.welcome-title {
			font-size: 1.875rem;
		}

		.welcome-subtitle {
			font-size: 1.1rem;
		}

		.welcome-stats {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.welcome-stat-card {
			padding: 1rem;
		}

		.welcome-stat-content strong {
			font-size: 1.5rem;
		}

		.units-section {
			padding: 2rem 1rem;
		}

		.units-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.unit-card {
			padding: 1.5rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.getting-started {
			padding: 2rem 1rem;
		}

		.getting-started-steps {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.step-item {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.welcome-hero {
			padding: 1.5rem 1rem;
		}

		.welcome-title {
			font-size: 1.5rem;
		}

		.welcome-subtitle {
			font-size: 1rem;
		}

		.difficulty-overview {
			padding: 1.5rem;
		}

		.units-grid {
			grid-template-columns: 1fr;
		}

		.unit-card-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
