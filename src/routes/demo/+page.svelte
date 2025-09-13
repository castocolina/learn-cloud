<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { BookOpen, HelpCircle, Settings, Container } from "lucide-svelte";
</script>

<svelte:head>
	<title>Cloud-Native Interactive Demo - Learn Cloud</title>
	<meta
		name="description"
		content="Interactive demo showcasing content renderer components including lessons, quizzes, and study guides."
	/>
</svelte:head>

<div class="demo-overview">
	<!-- Hero Section -->
	<section class="mb-8">
		<div class="mb-8 flex flex-col items-center space-y-4 text-center">
			<Container class="h-16 w-16 text-blue-600" />
			<h1 class="text-4xl font-bold">🚀 Cloud-Native Interactive Demo</h1>
			<p class="max-w-2xl text-lg text-muted-foreground">
				Explore comprehensive examples of lesson content, interactive quizzes, and study guides.
				These components showcase the full learning experience with real cloud-native concepts.
			</p>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="mb-8">
		<div class="grid auto-rows-min gap-4 md:grid-cols-3">
			<Card class="demo-feature-card">
				<CardHeader class="text-center">
					<BookOpen class="mx-auto mb-2 h-12 w-12 text-blue-600" />
					<CardTitle>Interactive Lessons</CardTitle>
				</CardHeader>
				<CardContent class="text-center">
					<p class="mb-4 text-muted-foreground">
						Rich content with code blocks, diagrams, and structured learning paths
					</p>
					<Button href="/demo/lesson" variant="outline" class="w-full">View Lesson Demo</Button>
				</CardContent>
			</Card>

			<Card class="demo-feature-card">
				<CardHeader class="text-center">
					<HelpCircle class="mx-auto mb-2 h-12 w-12 text-green-600" />
					<CardTitle>Dynamic Quizzes</CardTitle>
				</CardHeader>
				<CardContent class="text-center">
					<p class="mb-4 text-muted-foreground">
						Multi-choice questions with detailed explanations and progress tracking
					</p>
					<Button href="/demo/quiz" variant="outline" class="w-full">Try Quiz Demo</Button>
				</CardContent>
			</Card>

			<Card class="demo-feature-card">
				<CardHeader class="text-center">
					<Settings class="mx-auto mb-2 h-12 w-12 text-purple-600" />
					<CardTitle>Study Guides</CardTitle>
				</CardHeader>
				<CardContent class="text-center">
					<p class="mb-4 text-muted-foreground">
						Interactive flashcards with animations and spaced repetition techniques
					</p>
					<Button href="/demo/study-guide" variant="outline" class="w-full">
						Explore Study Guide
					</Button>
				</CardContent>
			</Card>
		</div>
	</section>

	<!-- Technical Information -->
	<section class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>🔧 Technical Implementation</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<h4 class="mb-2 font-semibold">Architecture</h4>
						<ul class="space-y-1 text-sm text-muted-foreground">
							<li>• SvelteKit with TypeScript</li>
							<li>• Tailwind CSS v4 with centralized architecture</li>
							<li>• shadcn-svelte UI components</li>
							<li>• Mermaid.js for diagrams</li>
							<li>• Shiki for syntax highlighting</li>
						</ul>
					</div>
					<div>
						<h4 class="mb-2 font-semibold">Features</h4>
						<ul class="space-y-1 text-sm text-muted-foreground">
							<li>• Interactive content rendering</li>
							<li>• Real-time quiz progress tracking</li>
							<li>• Animated flashcard system</li>
							<li>• Mobile-responsive design</li>
							<li>• Accessibility-compliant components</li>
						</ul>
					</div>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Instructions -->
	<section class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>📖 How to Navigate</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="mb-4 text-muted-foreground">
					Use the sidebar to navigate through different content types. Each component demonstrates
					different aspects of the learning platform:
				</p>
				<ul class="space-y-2 text-sm">
					<li>
						<strong>Lesson:</strong> Structured content with code examples and interactive diagrams
					</li>
					<li>
						<strong>Quiz:</strong> Multiple choice questions with progress tracking and explanations
					</li>
					<li>
						<strong>Study Guide:</strong> Interactive flashcards with shuffle and flip animations
					</li>
				</ul>
			</CardContent>
		</Card>
	</section>
</div>
