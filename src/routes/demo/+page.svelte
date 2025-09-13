<script lang="ts">
	import { demoContent } from "../../data/demo";
	import LessonRenderer from "$lib/components/content/LessonRenderer.svelte";
	import QuizRenderer from "$lib/components/content/QuizRenderer.svelte";
	import StudyGuideRenderer from "$lib/components/content/StudyGuideRenderer.svelte";
	import { BookOpen, HelpCircle, Brain, Code, Network } from "lucide-svelte";

	let activeTab = $state("lesson");

	const tabs = [
		{
			id: "lesson",
			label: "Lesson",
			icon: BookOpen,
			description: "Interactive lesson with code blocks and diagrams"
		},
		{
			id: "quiz",
			label: "Quiz",
			icon: HelpCircle,
			description: "Interactive quiz with progress tracking"
		},
		{
			id: "study-guide",
			label: "Study Guide",
			icon: Brain,
			description: "Flashcards with flip animations and shuffling"
		}
	];

	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	const features = [
		{
			icon: Code,
			title: "Syntax Highlighting",
			description:
				"Server-side syntax highlighting with Shiki supporting 200+ languages including Dockerfile, YAML, and more."
		},
		{
			icon: Network,
			title: "Interactive Diagrams",
			description: "Mermaid.js integration with fullscreen modal support and responsive scaling."
		},
		{
			icon: Brain,
			title: "Learning Tools",
			description:
				"Interactive quizzes with timer, flashcards with shuffle mode, and progress tracking."
		}
	];
</script>

<svelte:head>
	<title>Component Demo - Learn Cloud</title>
	<meta
		name="description"
		content="Interactive demo showcasing content renderer components including lessons, quizzes, and study guides."
	/>
</svelte:head>

<div class="demo-page">
	<!-- Hero Section -->
	<header class="demo-header">
		<div class="container">
			<h1 class="demo-title">Content Renderer Components</h1>
			<p class="demo-subtitle">
				Interactive demo showcasing the content renderer components built with SvelteKit, TypeScript
				inheritance, and modern web technologies.
			</p>

			<!-- Feature highlights -->
			<div class="features-grid">
				{#each features as feature}
					<div class="feature-card">
						<div class="feature-icon">
							<feature.icon size={24} />
						</div>
						<h3>{feature.title}</h3>
						<p>{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</header>

	<!-- Tab Navigation -->
	<nav class="demo-nav" aria-label="Content type navigation">
		<div class="container">
			<div class="tab-list" role="tablist">
				{#each tabs as tab}
					<button
						class="tab-button"
						class:active={activeTab === tab.id}
						role="tab"
						aria-selected={activeTab === tab.id}
						aria-controls="panel-{tab.id}"
						onclick={() => setActiveTab(tab.id)}
						type="button"
					>
						<tab.icon size={18} />
						<span class="tab-label">{tab.label}</span>
						<span class="tab-description">{tab.description}</span>
					</button>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Content Panels -->
	<main class="demo-content">
		<div class="container">
			<!-- Lesson Panel -->
			{#if activeTab === "lesson"}
				<div id="panel-lesson" class="content-panel" role="tabpanel" aria-labelledby="tab-lesson">
					<LessonRenderer content={demoContent.lesson} />
				</div>
			{/if}

			<!-- Quiz Panel -->
			{#if activeTab === "quiz"}
				<div id="panel-quiz" class="content-panel" role="tabpanel" aria-labelledby="tab-quiz">
					<QuizRenderer content={demoContent.quiz} />
				</div>
			{/if}

			<!-- Study Guide Panel -->
			{#if activeTab === "study-guide"}
				<div
					id="panel-study-guide"
					class="content-panel"
					role="tabpanel"
					aria-labelledby="tab-study-guide"
				>
					<StudyGuideRenderer content={demoContent.studyGuide} />
				</div>
			{/if}
		</div>
	</main>

	<!-- Technical Info Footer -->
	<footer class="demo-footer">
		<div class="container">
			<div class="tech-info">
				<h3>Technical Implementation</h3>
				<div class="tech-grid">
					<div class="tech-item">
						<strong>Frontend:</strong> SvelteKit with TypeScript
					</div>
					<div class="tech-item">
						<strong>Syntax Highlighting:</strong> Shiki (server-side)
					</div>
					<div class="tech-item">
						<strong>Diagrams:</strong> Mermaid.js (client-side)
					</div>
					<div class="tech-item">
						<strong>Styling:</strong> Tailwind CSS with component isolation
					</div>
					<div class="tech-item">
						<strong>Architecture:</strong> TypeScript interface inheritance
					</div>
					<div class="tech-item">
						<strong>Design:</strong> Mobile-first responsive layout
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>

<style lang="postcss">
	.demo-container {
		@apply mx-auto max-w-4xl space-y-8 p-6;
	}
</style>
